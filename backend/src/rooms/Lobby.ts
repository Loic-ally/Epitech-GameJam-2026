import { Room, Client, CloseCode, matchMaker } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState.js";
import { Player } from "../types/Player.js";
import { DeckService } from "../modules/deck/deck.service.js";

export class Lobby extends Room {
  maxClients = Infinity;
  private playerUserIds = new Map<string, string>();
  private deckService = new DeckService();
  private pendingDuels = new Map<string, { roomId: string; expiresAt: number; participants: [string, string]; acks: Set<string> }>();

  private makePairKey(a: string, b: string) {
    return [a, b].sort().join('|');
  }

  private cleanupPendingDuels() {
    const now = Date.now();
    for (const [key, value] of this.pendingDuels.entries()) {
      const [a, b] = value.participants;
      const hasA = this.clients.some((c) => c.sessionId === a);
      const hasB = this.clients.some((c) => c.sessionId === b);
      if (value.expiresAt <= now || !hasA || !hasB) {
        this.pendingDuels.delete(key);
      }
    }
  }

  onCreate (options: any) {
    this.state = new MyRoomState();

    this.onMessage('move', (client, message) => {
      const player = this.state.players.get(client.sessionId);

      player.x = message.x;
      player.y = message.y;
      player.z = message.z;
      player.rotationY = message.rotationY;
      player.rotationX = message.rotationX;

      this.state.players.set(client.sessionId, player);
    });

    this.onMessage('duelJoined', (client, message: { battleRoomId?: string }) => {
      if (!message?.battleRoomId) return;
      for (const [key, value] of this.pendingDuels.entries()) {
        if (value.roomId !== message.battleRoomId) continue;
        if (!value.participants.includes(client.sessionId as any)) continue;
        value.acks.add(client.sessionId);
        if (value.acks.size >= 2) {
          this.pendingDuels.delete(key);
        }
      }
    });

    this.onMessage('duelJoinFailed', (_client, message: { battleRoomId?: string }) => {
      if (!message?.battleRoomId) return;
      for (const [key, value] of this.pendingDuels.entries()) {
        if (value.roomId === message.battleRoomId) {
          this.pendingDuels.delete(key);
        }
      }
    });

    // Player presses E near another player — instantly start a duel (no validation)
    this.onMessage('duelChallenge', async (client, message: { targetId: string }) => {
      this.cleanupPendingDuels();
      const challenger = this.state.players.get(client.sessionId);
      const target = this.state.players.get(message.targetId);
      if (!challenger || !target) return;

      // Check distance between players (must be close enough)
      const dx = challenger.x - target.x;
      const dy = challenger.y - target.y;
      const dz = challenger.z - target.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist > 5) {
        client.send('duelError', { message: 'Too far from target player' });
        return;
      }

      const challengerUserId = this.playerUserIds.get(client.sessionId);
      const targetUserId = this.playerUserIds.get(message.targetId);
      if (!challengerUserId || !targetUserId) {
        client.send('duelError', { message: 'Deck not linked to user' });
        return;
      }

      const isDeckReady = (deck: any) => {
        if (!deck || typeof deck.summonerCards !== 'number') return false;
        const units = Array.isArray(deck.unitCards) ? deck.unitCards.flat(Infinity).filter((v: any) => typeof v === 'number') : [];
        return units.length > 0;
      };

      const [challengerDeck, targetDeck] = await Promise.all([
        this.deckService.getDeck(challengerUserId),
        this.deckService.getDeck(targetUserId),
      ]);

      if (!isDeckReady(challengerDeck) || !isDeckReady(targetDeck)) {
        const msg = 'Both players must equip a deck before dueling';
        client.send('duelError', { message: msg });
        const targetClient = this.clients.find(c => c.sessionId === message.targetId);
        if (targetClient) {
          targetClient.send('duelError', { message: msg });
        }
        return;
      }

      const targetClient = this.clients.find(c => c.sessionId === message.targetId);
      if (!targetClient) {
        client.send('duelError', { message: 'Target player disconnected' });
        return;
      }

      const pairKey = this.makePairKey(client.sessionId, message.targetId);
      const existing = this.pendingDuels.get(pairKey);
      if (existing) {
        const localRoom = (matchMaker as any).getLocalRoomById?.(existing.roomId);
        if (localRoom) {
          client.send('duelStart', { battleRoomId: existing.roomId });
          targetClient.send('duelStart', { battleRoomId: existing.roomId });
          return;
        }
        this.pendingDuels.delete(pairKey);
      }

      // Immediately start the battle for both players
      try {
        const battleRoom = await matchMaker.createRoom("battle_arena", {
          challengerId: client.sessionId,
          targetId: message.targetId,
        });
        const battleRoomId = battleRoom.roomId;
        this.pendingDuels.set(pairKey, {
          roomId: battleRoomId,
          expiresAt: Date.now() + 15000,
          participants: [client.sessionId, message.targetId],
          acks: new Set<string>(),
        });

        client.send('duelStart', { battleRoomId });
        targetClient.send('duelStart', { battleRoomId });
      } catch (err) {
        console.error('Failed to create battle room', err);
        client.send('duelError', { message: 'Failed to start duel' });
        targetClient.send('duelError', { message: 'Failed to start duel' });
      }
    });
  }

  onJoin (client: Client, options: any) {
    const player = new Player();

    player.id = client.sessionId;
    player.displayName = options.displayName || "Anonymous";
    player.x = options.x || 0;
    player.y = options.y || 5;
    player.z = options.z || 0;
    player.rotationY = 0;
    player.rotationX = 0;

    this.state.players.set(client.sessionId, player);
    if (typeof options?.userId === 'string') {
      this.playerUserIds.set(client.sessionId, options.userId);
    }
  }

  onLeave (client: Client, code: CloseCode) {
    this.state.players.delete(client.sessionId);
    this.playerUserIds.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.playerUserIds.clear();
  }

}
