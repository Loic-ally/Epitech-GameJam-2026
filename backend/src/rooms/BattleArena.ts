import { Room, type Client, type CloseCode } from "colyseus";
import { 
  BattleArenaState, 
  BattleUnit, 
  Summoner, 
  HandCard, 
  UnitStats, 
  LeaderSkill, 
  LeaderSkillStat 
} from "./schema/BattleArenaState.js";
import { 
  loadAllUnitCards, 
  loadAllInvocatorCards, 
  generateHandCardDeck, 
  drawRandomCards, 
  getRandomUnits, 
  getRandomInvocator,
  type HandCardData
} from "../utils/cardLoader.js";
import type { UnitCardData, InvocatorCardData } from "../utils/cardLoader.js";
import { DeckService } from "../modules/deck/deck.service.js";
import { InventoryService } from "../modules/inventory/inventory.service.js";

const MAX_UNITS = 6;
const STARTING_HAND_SIZE = 5;
type AttackEvent = {
  attackerIndex: number;
  attackerPosition: number;
  defenderIndex: number;
  defenderPosition: number;
  damage: number;
};

export class BattleArena extends Room<BattleArenaState> {
  maxClients = 2;
  private handCardDeck: HandCardData[] = [];
  private playerUserIds = new Map<string, string>();
  private deckService = new DeckService();
  private inventoryService = new InventoryService();

  onCreate (options: Record<string, unknown>) {
    this.state = new BattleArenaState();
    console.log(`BattleArena created with options:`, options);

    this.state.currentTurn = 0;
    this.state.phase = "waiting";
    this.handCardDeck = generateHandCardDeck();

    this.onMessage('startGame', async (_client, _message) => {
      console.log(`[BattleArena] startGame received. Players: ${this.state.playerIds.size}`);
      
      if (this.state.playerIds.size !== 2) {
        console.warn(`Can't start game with ${this.state.playerIds.size} players`);
        return;
      }
      if (this.state.phase !== 'waiting') {
        console.warn(`Battle already started (phase: ${this.state.phase})`);
        return;
      }

      try {
        await this.initializeBattle();
      } catch (err) {
        console.error('Failed to initialize battle', err);
      }
      console.log(`Battle started, player to start: ${this.state.currentPlayer}`);
    });

    this.onMessage('playCard', (client, message) => {
      const playerIndex = this.getPlayerIndex(client.sessionId);
      if (playerIndex !== this.state.currentPlayer || this.state.phase !== 'play') {
        console.warn('Not your turn or wrong phase');
        return;
      }

      const { cardIndex, targetPosition } = message;
      this.handlePlayCard(playerIndex, cardIndex, targetPosition);
    });

    this.onMessage('endTurn', (client, _message) => {
      const playerIndex = this.getPlayerIndex(client.sessionId);
      if (playerIndex !== this.state.currentPlayer) {
        console.warn('Not your turn');
        return;
      }

      // Can't end turn without playing a card
      console.warn('Must play a card before ending turn');
    });
  }

  private getPlayerIndex(sessionId: string): number {
    const playerIds = Array.from(this.state.playerIds.values());
    return playerIds.indexOf(sessionId);
  }

  private async initializeBattle() {
    console.log('[BattleArena] Initializing battle...');
    
    // Load card data
    const allUnits = loadAllUnitCards();
    const allInvocators = loadAllInvocatorCards();
    
    console.log(`[BattleArena] Loaded ${allUnits.length} units and ${allInvocators.length} invocators`);

    const playerIds = Array.from(this.state.playerIds.values());

    // Initialize both players
    for (let playerIndex = 0; playerIndex < 2; playerIndex++) {
      const sessionId = playerIds[playerIndex];
      const userId = sessionId ? this.playerUserIds.get(sessionId) : undefined;
      const { invocatorData, unitDataList } = await this.getPlayerLoadout(
        userId,
        allInvocators,
        allUnits
      );

      // Assign summoner
      const summoner = new Summoner();
      summoner.id = invocatorData.id;
      summoner.name = invocatorData.name;
      summoner.image = invocatorData.image;
      summoner.rarity = invocatorData.rarity;
      summoner.promo = invocatorData.promo;
      
      // Leader skill
      const leaderSkill = new LeaderSkill();
      leaderSkill.skillType = invocatorData.leader_skill.type;
      leaderSkill.target = invocatorData.leader_skill.target || '';
      if (invocatorData.leader_skill.stats) {
        for (const stat of invocatorData.leader_skill.stats) {
          const skillStat = new LeaderSkillStat();
          skillStat.stat = stat.stat;
          skillStat.value = stat.value;
          skillStat.unit = stat.unit;
          leaderSkill.stats.push(skillStat);
        }
      }
      summoner.leaderSkill = leaderSkill;
      this.state.summoners.set(`${playerIndex}`, summoner);

      // Assign units
      for (let i = 0; i < unitDataList.length; i++) {
        const unitData = unitDataList[i];
        const unit = new BattleUnit();
        unit.id = unitData.id;
        unit.name = unitData.name;
        unit.image = unitData.image;
        unit.rarity = unitData.rarity;
        unit.category = unitData.category;
        
        const stats = new UnitStats();
        stats.HP = unitData.stats.HP || 80;
        stats.ATK = unitData.stats.ATK || 20;
        stats.DEF = unitData.stats.DEF || 15;
        stats.Esquive = unitData.stats.Esquive || 10;
        stats.Critique = unitData.stats.Critique || 5;
        unit.stats = stats;
        
        // Apply leader skill buffs
        const buffedHP = this.applyLeaderBuff(stats.HP, 'HP', invocatorData.leader_skill);
        const buffedATK = this.applyLeaderBuff(stats.ATK, 'ATK', invocatorData.leader_skill);
        const buffedDEF = this.applyLeaderBuff(stats.DEF, 'DEF', invocatorData.leader_skill);
        
        unit.maxHP = buffedHP;
        unit.currentHP = buffedHP;
        unit.stats.ATK = buffedATK;
        unit.stats.DEF = buffedDEF;
        unit.isAlive = true;
        unit.position = i;
        
        this.state.units.set(`${playerIndex}_${i}`, unit);
      }

      // Deal starting hand
      this.drawCards(playerIndex, STARTING_HAND_SIZE);
    }

    // Set starting player randomly
    this.state.currentPlayer = Math.floor(Math.random() * 2);
    this.state.currentTurn = 1;
    this.state.phase = 'play';
    
    console.log(`[BattleArena] Battle initialized! Phase: ${this.state.phase}, Turn: ${this.state.currentTurn}, Starting player: ${this.state.currentPlayer}`);
  }

  private applyLeaderBuff(baseStat: number, statName: string, leaderSkill: { type: string; target?: string; stats?: Array<{ stat: string; value: number; unit: string }> }): number {
    if (leaderSkill.type === 'stat_boost' && leaderSkill.target === 'all' && leaderSkill.stats) {
      for (const stat of leaderSkill.stats) {
        if (stat.stat === statName) {
          if (stat.unit === 'percent') {
            return Math.floor(baseStat * (1 + stat.value / 100));
          } else {
            return baseStat + stat.value;
          }
        }
      }
    }
    return baseStat;
  }

  private drawCards(playerIndex: number, count: number) {
    const newCards = drawRandomCards(this.handCardDeck, count);
    newCards.forEach((cardData, idx) => {
      const card = new HandCard();
      card.id = Date.now() + idx + playerIndex * 1000; // Unique ID
      card.name = cardData.name;
      card.cardType = cardData.type;
      card.value = cardData.value;
      card.description = cardData.description;
      
      // Find next available slot
      let slot = 0;
      while (this.state.handCards.has(`${playerIndex}_${slot}`)) {
        slot++;
      }
      this.state.handCards.set(`${playerIndex}_${slot}`, card);
    });
  }

  private flattenIds(value: unknown): number[] {
    if (Array.isArray(value)) {
      return value.flat(Infinity).filter((v) => typeof v === 'number') as number[];
    }
    if (typeof value === 'number') return [value];
    return [];
  }

  private async getPlayerLoadout(
    userId: string | undefined,
    allInvocators: InvocatorCardData[],
    allUnits: UnitCardData[]
  ): Promise<{ invocatorData: InvocatorCardData; unitDataList: UnitCardData[] }> {
    const invocatorById = new Map(allInvocators.map((card) => [card.id, card]));
    const unitById = new Map(allUnits.map((card) => [card.id, card]));

    let deck: { summonerCards?: number; unitCards?: number[][]; activeCards?: number[][] } | null = null;
    let inventory: { summonerCards?: number[]; unitCards?: number[][]; activeCards?: number[][] } | null = null;

    if (userId) {
      deck = await this.deckService.getDeck(userId);
      inventory = await this.inventoryService.getInventory(userId);
    }

    const deckSummonerId = typeof deck?.summonerCards === 'number' ? deck.summonerCards : undefined;
    const deckUnitIds = this.flattenIds(deck?.unitCards);

    const invSummonerIds = this.flattenIds(inventory?.summonerCards);
    const invUnitIds = this.flattenIds(inventory?.unitCards);
    const summonerPool = invSummonerIds;

    const finalSummonerId = (() => {
      if (deckSummonerId && (invSummonerIds.length === 0 || invSummonerIds.includes(deckSummonerId))) {
        return deckSummonerId;
      }
      if (summonerPool.length > 0) {
        return summonerPool[Math.floor(Math.random() * summonerPool.length)];
      }
      return undefined;
    })();

    let finalUnitIds = deckUnitIds;
    if (invUnitIds.length > 0) {
      finalUnitIds = finalUnitIds.filter((id) => invUnitIds.includes(id));
    }
    if (finalUnitIds.length === 0 && invUnitIds.length > 0) {
      finalUnitIds = [...invUnitIds];
    }

    const pickedUnits: UnitCardData[] = finalUnitIds
      .map((id) => unitById.get(id))
      .filter(Boolean) as UnitCardData[];

    const availableUnits = allUnits.filter((u) => !pickedUnits.some((p) => p.id === u.id));
    while (pickedUnits.length < MAX_UNITS && availableUnits.length > 0) {
      const idx = Math.floor(Math.random() * availableUnits.length);
      pickedUnits.push(availableUnits.splice(idx, 1)[0]);
    }

    const unitDataList = pickedUnits.length > 0
      ? pickedUnits.slice(0, MAX_UNITS)
      : getRandomUnits(allUnits, MAX_UNITS);

    const invocatorData = finalSummonerId && invocatorById.get(finalSummonerId)
      ? (invocatorById.get(finalSummonerId) as InvocatorCardData)
      : getRandomInvocator(allInvocators);

    return { invocatorData, unitDataList };
  }

  private handlePlayCard(playerIndex: number, cardIndex: number, targetPosition?: number) {
    const cardKey = `${playerIndex}_${cardIndex}`;
    const card = this.state.handCards.get(cardKey);
    
    if (!card) {
      console.warn('Card not found');
      return;
    }

    this.state.lastCardPlayed = card.id;
    this.state.lastAction = `Player ${playerIndex} played ${card.name}`;

    // Apply card effect
    this.applyCardEffect(playerIndex, card, targetPosition);

    // Remove card from hand
    this.state.handCards.delete(cardKey);

    // Execute attack phase
    const attackSequence = this.executeAttack(playerIndex);
    if (attackSequence.length > 0) {
      const totalDamage = attackSequence.reduce((sum, event) => sum + event.damage, 0);
      this.state.lastAction += ` | ${attackSequence.length} attacks (${totalDamage} dmg)`;
      this.broadcast('attackSequence', { sequence: attackSequence });
    }

    // Check for game over
    if (this.checkGameOver()) {
      return;
    }

    // Switch to next player's turn
    this.state.currentPlayer = 1 - playerIndex;
    this.state.currentTurn++;
    
    // Draw a card for the new player
    this.drawCards(this.state.currentPlayer, 1);
    
    console.log(`Turn ${this.state.currentTurn}: Player ${this.state.currentPlayer}'s turn`);
  }

  private applyCardEffect(playerIndex: number, card: HandCard, targetPosition?: number) {
    const enemyIndex = 1 - playerIndex;

    switch (card.cardType) {
      case 'buff_ATK':
        if (targetPosition !== undefined) {
          const unit = this.state.units.get(`${playerIndex}_${targetPosition}`);
          if (unit?.isAlive) {
            unit.stats.ATK += card.value;
            this.state.lastAction += ` (+${card.value} ATK to position ${targetPosition})`;
          }
        }
        break;

      case 'buff_DEF':
        if (targetPosition !== undefined) {
          const unit = this.state.units.get(`${playerIndex}_${targetPosition}`);
          if (unit?.isAlive) {
            unit.stats.DEF += card.value;
            this.state.lastAction += ` (+${card.value} DEF to position ${targetPosition})`;
          }
        }
        break;

      case 'heal':
        if (targetPosition !== undefined) {
          const unit = this.state.units.get(`${playerIndex}_${targetPosition}`);
          if (unit?.isAlive) {
            unit.currentHP = Math.min(unit.currentHP + card.value, unit.maxHP);
            this.state.lastAction += ` (+${card.value} HP to position ${targetPosition})`;
          }
        }
        break;

      case 'damage':
        if (targetPosition !== undefined) {
          const enemyUnit = this.state.units.get(`${enemyIndex}_${targetPosition}`);
          if (enemyUnit?.isAlive) {
            enemyUnit.currentHP = Math.max(0, enemyUnit.currentHP - card.value);
            if (enemyUnit.currentHP <= 0) {
              enemyUnit.isAlive = false;
            }
            this.state.lastAction += ` (${card.value} damage to enemy position ${targetPosition})`;
          }
        }
        break;

      case 'special':
        // Life drain: damage + heal
        if (targetPosition !== undefined) {
          const enemyUnit = this.state.units.get(`${enemyIndex}_${targetPosition}`);
          if (enemyUnit?.isAlive) {
            enemyUnit.currentHP = Math.max(0, enemyUnit.currentHP - card.value);
            if (enemyUnit.currentHP <= 0) {
              enemyUnit.isAlive = false;
            }
            
            // Heal a random alive unit
            for (let i = 0; i < MAX_UNITS; i++) {
              const unit = this.state.units.get(`${playerIndex}_${i}`);
              if (unit?.isAlive && unit.currentHP < unit.maxHP) {
                unit.currentHP = Math.min(unit.currentHP + Math.floor(card.value / 2), unit.maxHP);
                break;
              }
            }
            this.state.lastAction += ` (Special effect)`;
          }
        }
        break;
    }
  }

  private executeAttack(attackerIndex: number): AttackEvent[] {
    const defenderIndex = 1 - attackerIndex;
    const sequence: AttackEvent[] = [];

    // Each alive attacker focuses the first alive defender (front to back)
    let defenderUnit = this.findFirstAliveUnit(defenderIndex);
    if (!defenderUnit) {
      console.log('No alive defenders');
      return sequence;
    }

    for (let i = 0; i < MAX_UNITS; i++) {
      const attackerUnit = this.state.units.get(`${attackerIndex}_${i}`);
      if (!attackerUnit?.isAlive) continue;

      const attackPower = attackerUnit.stats.ATK;
      const defense = defenderUnit.stats.DEF;
      const damage = Math.max(1, attackPower - Math.floor(defense / 2));

      defenderUnit.currentHP = Math.max(0, defenderUnit.currentHP - damage);
      if (defenderUnit.currentHP <= 0) {
        defenderUnit.isAlive = false;
      }

      console.log(`${attackerUnit.name} attacked ${defenderUnit.name} for ${damage} damage`);
      sequence.push({
        attackerIndex,
        attackerPosition: attackerUnit.position,
        defenderIndex,
        defenderPosition: defenderUnit.position,
        damage,
      });

      if (!defenderUnit.isAlive) {
        defenderUnit = this.findFirstAliveUnit(defenderIndex);
        if (!defenderUnit) {
          break;
        }
      }
    }

    return sequence;
  }

  private findFirstAliveUnit(playerIndex: number): BattleUnit | undefined {
    for (let i = 0; i < MAX_UNITS; i++) {
      const unit = this.state.units.get(`${playerIndex}_${i}`);
      if (unit?.isAlive) return unit;
    }
    return undefined;
  }

  private checkGameOver(): boolean {
    for (let playerIndex = 0; playerIndex < 2; playerIndex++) {
      let aliveCount = 0;
      for (let i = 0; i < MAX_UNITS; i++) {
        const unit = this.state.units.get(`${playerIndex}_${i}`);
        if (unit?.isAlive) {
          aliveCount++;
        }
      }

      if (aliveCount === 0) {
        this.state.phase = 'ended';
        const winnerIndex = playerIndex === 0 ? 1 : 0;
        this.state.winner = winnerIndex === 0 ? 'player0' : 'player1';
        this.awardVictoryTickets(winnerIndex);
        console.log(`Game Over! Winner: ${this.state.winner}`);
        return true;
      }
    }
    return false;
  }

  private awardVictoryTickets(winnerIndex: number) {
    const playerIds = Array.from(this.state.playerIds.values());
    const winnerSessionId = playerIds[winnerIndex];
    const userId = winnerSessionId ? this.playerUserIds.get(winnerSessionId) : undefined;
    if (!userId) return;
    this.inventoryService.addTickets(userId, 10).catch((err) => {
      console.error('Failed to award tickets', err);
    });
  }

  onJoin (client: Client, _options: Record<string, unknown>) {
    const userId = typeof _options?.userId === 'string' ? _options.userId : undefined;
    if (userId) {
      this.playerUserIds.set(client.sessionId, userId);
    }
    this.state.playerIds.set(client.sessionId, client.sessionId);
    console.log(`[BattleArena] Player joined: ${client.sessionId}. Total players: ${this.state.playerIds.size}`);
    
    // Lock room once we have 2 players
    if (this.state.playerIds.size >= 2) {
      this.lock();
      console.log('[BattleArena] Room locked - no more players can join');
    }
  }

  onLeave (client: Client, _code: CloseCode) {
    this.state.playerIds.delete(client.sessionId);
    this.playerUserIds.delete(client.sessionId);
    console.log(`[BattleArena] Player left: ${client.sessionId}. Total players: ${this.state.playerIds.size}`);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.state?.playerIds?.clear();
    this.playerUserIds.clear();
  }

}
