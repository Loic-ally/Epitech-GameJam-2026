import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Client, type Room } from '@colyseus/sdk';
import SummonerCard from './battle/SummonerCard';
import ChampionCardComponent from './battle/ChampionCard';
import HandCardComponent from './battle/HandCardComponent';
import { useRoom } from '../hooks/useRoom';
import type {
  BattlePhase,
  ChampionInBattle,
  HandCard,
  InvocatorCard,
} from '../types/battle.type';
import './BattleArena.css';

interface BattleArenaGameProps {
  battleRoomId: string;
  onLeave: () => void;
  wsEndpoint: string;
  displayName: string;
  userId?: string;
}

const BattleArenaGame: React.FC<BattleArenaGameProps> = ({
  battleRoomId,
  onLeave,
  wsEndpoint,
  displayName,
  userId,
}) => {
  const { room: lobbyRoom } = useRoom();
  // ─── State ──────────────────────────────────────────────
  const [battleRoom, setBattleRoom] = useState<Room | null>(null);
  const [phase, setPhase] = useState<BattlePhase>('waiting');
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(false);

  const [playerSummoner, setPlayerSummoner] = useState<InvocatorCard | null>(null);
  const [enemySummoner, setEnemySummoner] = useState<InvocatorCard | null>(null);
  const [playerChampions, setPlayerChampions] = useState<ChampionInBattle[]>([]);
  const [enemyChampions, setEnemyChampions] = useState<ChampionInBattle[]>([]);

  type BattleHandCard = HandCard & { slot: number };
  const [handCards, setHandCards] = useState<BattleHandCard[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [selectedTargetPosition, setSelectedTargetPosition] = useState<number | null>(null);

  const [showVsSplash, setShowVsSplash] = useState(true);
  const [gameOver, setGameOver] = useState<'victory' | 'defeat' | null>(null);
  const [damagedCards, setDamagedCards] = useState<Set<string>>(new Set());
  const [lastAction, setLastAction] = useState<string>('');
  const [attackingUnit, setAttackingUnit] = useState<string | null>(null);
  const [activeAttack, setActiveAttack] = useState<{ attackerKey: string; defenderKey: string } | null>(null);
  const [attackBeam, setAttackBeam] = useState<{ x: number; y: number; angle: number; length: number } | null>(null);
  const [attackImpact, setAttackImpact] = useState<{ x: number; y: number } | null>(null);
  const [attackFxId, setAttackFxId] = useState(0);

  const client = useMemo(() => new Client(wsEndpoint), [wsEndpoint]);
  const assetBaseUrl = useMemo(() => {
    if (!wsEndpoint) return '';
    return wsEndpoint.replace(/^ws(s?):\/\//, 'http$1://');
  }, [wsEndpoint]);
  const battlefieldRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const myIndexRef = useRef<number>(-1);
  const attackTokenRef = useRef(0);

  // Keep a stable ref for onLeave so the join effect never re-runs because of it
  const onLeaveRef = useRef(onLeave);
  useEffect(() => { onLeaveRef.current = onLeave; }, [onLeave]);

  // ─── Join Battle Room ───────────────────────────────────
  useEffect(() => {
    let mounted = true;
    let joinedRoom: Room | null = null;

    const joinBattle = async () => {
      try {
        joinedRoom = await client.joinById(battleRoomId, {
          displayName,
          userId,
        });

        if (!mounted) {
          joinedRoom.leave();
          return;
        }

        setBattleRoom(joinedRoom);
        if (lobbyRoom) {
          lobbyRoom.send('duelJoined', { battleRoomId });
        }

        // Listen for state changes
        joinedRoom.onStateChange((state: {
          currentTurn?: number;
          phase?: string;
          lastAction?: string;
          playerIds?: Map<string, string>;
          currentPlayer?: number;
          summoners?: Map<string, unknown>;
          units?: Map<string, unknown>;
          handCards?: Map<string, unknown>;
          winner?: string;
        }) => {
          if (!mounted) return;

          setCurrentTurn(state.currentTurn || 0);
          setPhase((state.phase as BattlePhase) || 'waiting');
          setLastAction(state.lastAction || '');

          // Determine player index
          const playerIds = Array.from(state.playerIds?.entries() || []);
          const myIndex = playerIds.findIndex(([_, sid]: [string, string]) => sid === joinedRoom?.sessionId);
          if (myIndex >= 0) {
            myIndexRef.current = myIndex;
            setIsMyTurn(state.currentPlayer === myIndex);
          }

          const enemyIndex = myIndex === 0 ? 1 : 0;

          // Sync summoners
          if (state.summoners) {
            const mySummoner = state.summoners.get(`${myIndex}`) as {
              id: number;
              name: string;
              image: string;
              rarity: string;
              promo: string;
              leaderSkill?: {
                skillType: string;
                target: string;
                stats?: Array<{ stat: string; value: number; unit: string }>;
              };
            } | undefined;
            const enemySummData = state.summoners.get(`${enemyIndex}`) as {
              id: number;
              name: string;
              image: string;
              rarity: string;
              promo: string;
              leaderSkill?: {
                skillType: string;
                target: string;
                stats?: Array<{ stat: string; value: number; unit: string }>;
              };
            } | undefined;
            
            if (mySummoner) {
              setPlayerSummoner({
                id: mySummoner.id,
                name: mySummoner.name,
                rarity: mySummoner.rarity,
                promo: mySummoner.promo,
                image: mySummoner.image,
                leader_skill: {
                  type: mySummoner.leaderSkill?.skillType || '',
                  target: mySummoner.leaderSkill?.target || '',
                  stats: mySummoner.leaderSkill?.stats?.map((s: { stat: string; value: number; unit: string }) => ({
                    stat: s.stat,
                    value: s.value,
                    unit: s.unit,
                  })) || [],
                },
              });
            }
            
            if (enemySummData) {
              setEnemySummoner({
                id: enemySummData.id,
                name: enemySummData.name,
                rarity: enemySummData.rarity,
                promo: enemySummData.promo,
                image: enemySummData.image,
                leader_skill: {
                  type: enemySummData.leaderSkill?.skillType || '',
                  target: enemySummData.leaderSkill?.target || '',
                  stats: enemySummData.leaderSkill?.stats?.map((s: { stat: string; value: number; unit: string }) => ({
                    stat: s.stat,
                    value: s.value,
                    unit: s.unit,
                  })) || [],
                },
              });
            }
          }

          // Sync units
          if (state.units) {
            const myUnits: ChampionInBattle[] = [];
            const enemyUnits: ChampionInBattle[] = [];

            for (let i = 0; i < 6; i++) {
              const myUnit = state.units.get(`${myIndex}_${i}`) as {
                id: number;
                name: string;
                image: string;
                rarity: string;
                category: string;
                stats: { HP: number; ATK: number; DEF: number; Esquive: number; Critique: number };
                currentHP: number;
                maxHP: number;
                isAlive: boolean;
                position: number;
              } | undefined;
              if (myUnit) {
                const wasLower = playerChampions[i]?.currentHP > myUnit.currentHP;
                if (wasLower) {
                  // Trigger attack animation from enemy
                  const firstAliveEnemy = enemyChampions.findIndex(c => c.isAlive);
                  if (firstAliveEnemy >= 0) {
                    setAttackingUnit(`enemy-${firstAliveEnemy}`);
                    setTimeout(() => setAttackingUnit(null), 800);
                  }
                  
                  setDamagedCards(prev => new Set(prev).add(`player-${i}`));
                  setTimeout(() => {
                    setDamagedCards(prev => {
                      const next = new Set(prev);
                      next.delete(`player-${i}`);
                      return next;
                    });
                  }, 800);
                }
                
                myUnits.push({
                  card: {
                    id: myUnit.id,
                    name: myUnit.name,
                    image: myUnit.image,
                    rarity: myUnit.rarity,
                    type: 'Technique',
                    category: myUnit.category,
                    bio: '',
                    attributes: [],
                    stats: {
                      HP: myUnit.stats.HP,
                      ATK: myUnit.stats.ATK,
                      DEF: myUnit.stats.DEF,
                      Esquive: myUnit.stats.Esquive,
                      Critique: myUnit.stats.Critique,
                    },
                  },
                  currentHP: myUnit.currentHP,
                  maxHP: myUnit.maxHP,
                  isAlive: myUnit.isAlive,
                  position: myUnit.position,
                });
              }

              const enemyUnit = state.units.get(`${enemyIndex}_${i}`) as {
                id: number;
                name: string;
                image: string;
                rarity: string;
                category: string;
                stats: { HP: number; ATK: number; DEF: number; Esquive: number; Critique: number };
                currentHP: number;
                maxHP: number;
                isAlive: boolean;
                position: number;
              } | undefined;
              if (enemyUnit) {
                const wasLower = enemyChampions[i]?.currentHP > enemyUnit.currentHP;
                if (wasLower) {
                  // Trigger attack animation from player
                  const firstAlivePlayer = playerChampions.findIndex(c => c.isAlive);
                  if (firstAlivePlayer >= 0) {
                    setAttackingUnit(`player-${firstAlivePlayer}`);
                    setTimeout(() => setAttackingUnit(null), 800);
                  }
                  
                  setDamagedCards(prev => new Set(prev).add(`enemy-${i}`));
                  setTimeout(() => {
                    setDamagedCards(prev => {
                      const next = new Set(prev);
                      next.delete(`enemy-${i}`);
                      return next;
                    });
                  }, 800);
                }
                
                enemyUnits.push({
                  card: {
                    id: enemyUnit.id,
                    name: enemyUnit.name,
                    image: enemyUnit.image,
                    rarity: enemyUnit.rarity,
                    type: 'Technique',
                    category: enemyUnit.category,
                    bio: '',
                    attributes: [],
                    stats: {
                      HP: enemyUnit.stats.HP,
                      ATK: enemyUnit.stats.ATK,
                      DEF: enemyUnit.stats.DEF,
                      Esquive: enemyUnit.stats.Esquive,
                      Critique: enemyUnit.stats.Critique,
                    },
                  },
                  currentHP: enemyUnit.currentHP,
                  maxHP: enemyUnit.maxHP,
                  isAlive: enemyUnit.isAlive,
                  position: enemyUnit.position,
                });
              }
            }

            setPlayerChampions(myUnits);
            setEnemyChampions(enemyUnits);

            // Check game over
            if (state.winner) {
              if (state.winner === `player${myIndex}`) {
                setGameOver('victory');
              } else {
                setGameOver('defeat');
              }
            }
          }

          // Sync hand cards
          if (state.handCards) {
            const myCards: BattleHandCard[] = [];
            for (let slot = 0; slot < 10; slot++) {
              const card = state.handCards.get(`${myIndex}_${slot}`) as {
                id: number;
                name: string;
                cardType: string;
                value: number;
                description: string;
              } | undefined;
              if (card) {
                myCards.push({
                  id: card.id,
                  name: card.name,
                  type: card.cardType as 'buff_ATK' | 'buff_DEF' | 'heal' | 'damage' | 'special',
                  value: card.value,
                  description: card.description,
                  slot,
                });
              }
            }
            setHandCards(myCards);
          }
        });

        joinedRoom.onMessage('attackSequence', (payload: {
          sequence?: Array<{
            attackerIndex: number;
            attackerPosition: number;
            defenderIndex: number;
            defenderPosition: number;
            damage: number;
          }>;
        }) => {
          const sequence = payload?.sequence || [];
          if (sequence.length === 0 || myIndexRef.current < 0) return;

          const token = ++attackTokenRef.current;
          const totalDuration = 4000;
          const stepDuration = Math.max(450, Math.floor(totalDuration / sequence.length));

          const getKeyForIndex = (playerIndex: number, position: number) => {
            return playerIndex === myIndexRef.current ? `player-${position}` : `enemy-${position}`;
          };

          let stepIndex = 0;
          const runStep = () => {
            if (attackTokenRef.current !== token) return;
            const step = sequence[stepIndex];
            if (!step) {
              setActiveAttack(null);
              setAttackBeam(null);
              setAttackImpact(null);
              return;
            }

            const attackerKey = getKeyForIndex(step.attackerIndex, step.attackerPosition);
            const defenderKey = getKeyForIndex(step.defenderIndex, step.defenderPosition);
            setActiveAttack({ attackerKey, defenderKey });
            setAttackFxId(prev => prev + 1);

            if (battlefieldRef.current) {
              const attackerEl = cardRefs.current[attackerKey];
              const defenderEl = cardRefs.current[defenderKey];
              const bfRect = battlefieldRef.current.getBoundingClientRect();

              if (attackerEl && defenderEl) {
                const aRect = attackerEl.getBoundingClientRect();
                const dRect = defenderEl.getBoundingClientRect();
                const ax = aRect.left + aRect.width / 2 - bfRect.left;
                const ay = aRect.top + aRect.height / 2 - bfRect.top;
                const dx = dRect.left + dRect.width / 2 - bfRect.left;
                const dy = dRect.top + dRect.height / 2 - bfRect.top;
                const len = Math.hypot(dx - ax, dy - ay);
                const angle = Math.atan2(dy - ay, dx - ax) * 180 / Math.PI;

                setAttackBeam({ x: ax, y: ay, angle, length: len });
                setAttackImpact({ x: dx, y: dy });
              } else {
                setAttackBeam(null);
                setAttackImpact(null);
              }
            }

            stepIndex += 1;
            setTimeout(() => {
              if (attackTokenRef.current !== token) return;
              runStep();
            }, stepDuration);
          };

          runStep();

          setTimeout(() => {
            if (attackTokenRef.current !== token) return;
            setActiveAttack(null);
            setAttackBeam(null);
            setAttackImpact(null);
          }, totalDuration + 60);
        });

        joinedRoom.onMessage('*', (messageType: string | number, payload: unknown) => {
          console.log('[BattleArena] Message:', messageType, payload);
        });

        // Start splash, then auto-start game after delay
        setTimeout(() => {
          if (mounted) setShowVsSplash(false);
        }, 3000);

        // Wait for 2nd player then start
        let startGameSent = false;
        const startInterval = setInterval(() => {
          if (joinedRoom && !startGameSent) {
            const playerCount = joinedRoom.state?.playerIds?.size || 0;
            console.log('[BattleArena] Waiting for players:', playerCount, '/ 2');
            
            if (playerCount === 2) {
              console.log('[BattleArena] Both players connected, starting game...');
              joinedRoom.send('startGame', {});
              startGameSent = true;
              clearInterval(startInterval);
            }
          }
        }, 500);

        // Cleanup interval on unmount
        return () => {
          mounted = false;
          clearInterval(startInterval);
          joinedRoom?.leave();
        };
      } catch (err) {
        console.error('Failed to join battle arena:', err);
        if (lobbyRoom) {
          lobbyRoom.send('duelJoinFailed', { battleRoomId });
        }
        if (mounted) onLeaveRef.current();
      }
    };

    joinBattle();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, battleRoomId, displayName]);

  // ─── Actions ────────────────────────────────────────────
  const handlePlayCard = useCallback((cardIndex: number) => {
    if (!battleRoom || !isMyTurn || phase !== 'play') return;
    
    setSelectedCardIndex(cardIndex);
    setSelectedTargetPosition(null);
    // Now wait for target selection
  }, [battleRoom, isMyTurn, phase]);

  const handleTargetSelect = useCallback((position: number, isEnemy: boolean) => {
    if (selectedCardIndex === null || !battleRoom) return;

    const card = handCards[selectedCardIndex];
    if (!card) return;
    const cardSlot = card.slot;

    // Determine if card needs a target
    const needsPlayerTarget = card.type === 'buff_ATK' || card.type === 'buff_DEF' || card.type === 'heal';
    const needsEnemyTarget = card.type === 'damage' || card.type === 'special';

    if ((needsPlayerTarget && !isEnemy) || (needsEnemyTarget && isEnemy)) {
      setSelectedTargetPosition(position);
      battleRoom.send('playCard', { cardIndex: cardSlot, targetPosition: position });
      setSelectedCardIndex(null);
      setSelectedTargetPosition(null);
    }
  }, [selectedCardIndex, handCards, battleRoom]);

  const handleLeave = useCallback(() => {
    battleRoom?.leave();
    onLeave();
  }, [battleRoom, onLeave]);

  // ─── Render ─────────────────────────────────────────────
  const turnLabel = isMyTurn ? 'Your Turn' : "Enemy's Turn";
  const turnClass = isMyTurn ? 'your-turn' : 'enemy-turn';

  const selectedCard = selectedCardIndex !== null ? handCards[selectedCardIndex] : null;

  return (
    <div className="battle-arena">
      {/* ── VS Splash ─────────────────────────────────── */}
      {showVsSplash && (
        <div className="vs-splash">
          <div className="vs-splash-content">
            <div className="vs-player">
              <div className="vs-player-avatar"></div>
              <div className="vs-player-name">{displayName}</div>
            </div>
            <div className="vs-text">VS</div>
            <div className="vs-player">
              <div className="vs-player-avatar"></div>
              <div className="vs-player-name">Opponent</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Waiting ───────────────────────────────────── */}
      {phase === 'waiting' && !showVsSplash && (
        <div className="battle-waiting">
          <div className="waiting-spinner" />
          <div className="waiting-text">Waiting for opponent...</div>
        </div>
      )}

      {/* ── Game Over ─────────────────────────────────── */}
      {gameOver && (
        <div className="game-over-overlay">
          <div className={`game-over-text ${gameOver}`}>
            {gameOver === 'victory' ? 'Victory!' : 'Defeat'}
          </div>
          <button type="button" className="game-over-btn" onClick={handleLeave}>
            Return to Lobby
          </button>
        </div>
      )}

      {/* ── Top Bar ───────────────────────────────────── */}
      <div className="battle-top-bar">
        <div className={`battle-turn-info ${turnClass}`}>
          Turn {currentTurn} — {turnLabel}
        </div>
        <button type="button" className="battle-leave-btn" onClick={handleLeave}>
          Leave Battle
        </button>
      </div>

      {lastAction && (
        <div className="battle-action-log">{lastAction}</div>
      )}

      {selectedCard && (
        <div className="card-target-prompt">
          Select target for: {selectedCard.name}
        </div>
      )}

      {/* ── Battlefield ───────────────────────────────── */}
      <div className="battlefield" ref={battlefieldRef}>
        {attackBeam && (
          <div
            key={`beam-${attackFxId}`}
            className="attack-beam"
            style={{
              left: attackBeam.x,
              top: attackBeam.y,
              width: attackBeam.length,
              transform: `translateY(-50%) rotate(${attackBeam.angle}deg)`,
            }}
          />
        )}
        {attackImpact && (
          <div
            key={`impact-${attackFxId}`}
            className="attack-impact"
            style={{
              left: attackImpact.x,
              top: attackImpact.y,
            }}
          />
        )}
        {/* Enemy Side */}
        <div className="player-side enemy">
          {enemySummoner && <SummonerCard invocator={enemySummoner} isEnemy assetBaseUrl={assetBaseUrl} />}
          <div className="champions-area">
            {enemyChampions.map((champ, i) => {
              const key = `enemy-${i}`;
              const isActiveAttacker = activeAttack?.attackerKey === key;
              const isActiveDefender = activeAttack?.defenderKey === key;
              return (
                <ChampionCardComponent
                  key={`enemy-${champ.card.id}-${i}`}
                  champion={champ}
                  isEnemy
                  isAttacking={isActiveAttacker || attackingUnit === `enemy-${i}`}
                  isTargetable={selectedCard?.type === 'damage' || selectedCard?.type === 'special'}
                  showDamage={damagedCards.has(`enemy-${i}`)}
                  assetBaseUrl={assetBaseUrl}
                  isHit={isActiveDefender}
                  cardRef={(el) => { cardRefs.current[key] = el; }}
                  onClick={() => handleTargetSelect(i, true)}
                />
              );
            })}
          </div>
        </div>

        {/* Middle Divider */}
        <div className="battle-middle">
          <div className="phase-indicator">
            {phase === 'waiting' ? 'Waiting' :
             phase === 'play' ? 'Battle Phase' :
             phase === 'ended' ? 'Ended' : 'Fight!'}
          </div>
        </div>

        {/* Player Side */}
        <div className="player-side self">
          {playerSummoner && <SummonerCard invocator={playerSummoner} assetBaseUrl={assetBaseUrl} />}
          <div className="champions-area">
            {playerChampions.map((champ, i) => {
              const key = `player-${i}`;
              const isActiveAttacker = activeAttack?.attackerKey === key;
              const isActiveDefender = activeAttack?.defenderKey === key;
              return (
                <ChampionCardComponent
                  key={`self-${champ.card.id}-${i}`}
                  champion={champ}
                  isAttacking={isActiveAttacker || attackingUnit === `player-${i}`}
                  isSelected={selectedTargetPosition === i}
                  isTargetable={selectedCard?.type === 'buff_ATK' || selectedCard?.type === 'buff_DEF' || selectedCard?.type === 'heal'}
                  showDamage={damagedCards.has(`player-${i}`)}
                  assetBaseUrl={assetBaseUrl}
                  isHit={isActiveDefender}
                  cardRef={(el) => { cardRefs.current[key] = el; }}
                  onClick={() => handleTargetSelect(i, false)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Hand & Actions ────────────────────────────── */}
      <div className="hand-area">
        <div className="hand-label">Your Hand</div>
        <div className="hand-cards">
          {handCards.map((card, idx) => (
            <HandCardComponent
              key={card.id}
              card={card}
              disabled={!isMyTurn || phase !== 'play'}
              isSelected={selectedCardIndex === idx}
              onClick={() => handlePlayCard(idx)}
            />
          ))}
          {handCards.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
              No cards in hand
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleArenaGame;
