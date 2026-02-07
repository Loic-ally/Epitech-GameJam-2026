import { Room, Client, CloseCode } from "colyseus";
import { MapSchema } from "@colyseus/schema";
import { BattleArenaState } from "./schema/BattleArenaState.js";

const MAX_DRAW_CARDS = 10;
const MAX_HAND_CARDS = 5;
const MAX_SUMMONERS = 6;

const fillCards = (playerCards: MapSchema<number>) => {
  while (playerCards.size < MAX_HAND_CARDS) {
    const newCardValue = Math.floor(Math.random() * MAX_DRAW_CARDS);
    if (!playerCards.has(newCardValue.toString())) {
      playerCards.set(playerCards.size.toString(), newCardValue);
    }
  }
};

export class BattleArena extends Room<BattleArenaState> {
  maxClients = 2;

  onCreate (options: any) {
    this.state = new BattleArenaState();
    console.log(`BattleArena created with options:`, options);

    this.state.currentTurn = 0;

    this.onMessage('startGame', (client, message) => {
      if (this.state.playerIds.size !== 2) {
        console.warn(`Can't start game with ${this.state.playerIds.size} players`);
        return;
      }

      this.state.currentTurn = 1;
      this.state.currentPlayer = Math.random() < 0.5 ? 0 : 1;

      this.state.playerCards.set("0", new MapSchema<number>());
      this.state.playerCards.set("1", new MapSchema<number>());

      for (let i = 0; i < 2; i++) {
        this.state.summonersHealth.set(i.toString(), new MapSchema<number>());
        for (let j = 0; j < MAX_SUMMONERS; j++) {
          this.state.summonersHealth.get(i.toString())!.set(j.toString(), 100); // Health at 100 for now (should be fetched with backend)
        }
      }

      fillCards(this.state.playerCards.get("0")!);
      fillCards(this.state.playerCards.get("1")!);

      console.log(`Battle started, player to start: `, this.state.currentPlayer);
    });

    this.onMessage('newTurn', (client, message) => {
      this.state.currentTurn = this.state.currentTurn + 1;
      this.state.currentPlayer = this.state.currentPlayer === 0 ? 1 : 0;

      fillCards(this.state.playerCards.get(this.state.currentPlayer.toString())!);

      console.log(`New turn started, player: `, this.state.currentPlayer);
    });

    this.onMessage('playCard', (client, message) => {
      this.state.playerCards.get(this.state.currentPlayer.toString())!.delete(message.cardId);

      console.log(`Card ${message.cardId} played by player ${this.state.currentPlayer}`);
    });

    this.onMessage('attack', (client, message) => {
      for (let i = 0; i < MAX_SUMMONERS; i++) {
        if (this.state.summonersHealth.get(this.state.currentPlayer.toString())!.get(i.toString())! <= 0)
          continue;
        for (let j = 0; j < MAX_SUMMONERS; j++) {
          if (this.state.summonersHealth.get((1 - this.state.currentPlayer).toString())!.get(j.toString())! <= 0)
            continue;
          const newHealth =
            this.state.summonersHealth.get((1 - this.state.currentPlayer).toString())!.get(j.toString())! - 20; // Damage at 20 for now (should be fetched with backend)
          this.state.summonersHealth.get((1 - this.state.currentPlayer).toString())!.set(j.toString(), newHealth);
          break;
        }
      }

      console.log(`Player ${this.state.currentPlayer} attacked player ${1 - this.state.currentPlayer} (${20} damage)`);
    });
  }

  onJoin (client: Client, options: any) {
    this.state.playerIds.set(client.sessionId, client.sessionId);
  }

  onLeave (client: Client, code: CloseCode) {
    this.state.playerIds.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.state.playerIds.clear();
  }

}
