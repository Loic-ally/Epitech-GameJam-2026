import { Room, Client, CloseCode } from "colyseus";
import { MapSchema } from "@colyseus/schema";
import { BattleArenaState } from "./schema/BattleArenaState.js";

const MAX_DRAW_CARDS = 10;
const MAX_HAND_CARDS = 5;

const fillCards = (playerCards: MapSchema<number>) => {
  let newCardIdx = playerCards.size;
  let newCardValue = Math.floor(Math.random() * MAX_DRAW_CARDS);

  while (playerCards.has(newCardValue.toString()) || playerCards.size >= MAX_HAND_CARDS) {
    if (playerCards.has(newCardValue.toString()))
      continue;
    playerCards.set(newCardIdx.toString(), newCardValue);
    newCardIdx += 1;
    newCardValue = Math.floor(Math.random() * MAX_DRAW_CARDS);
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

      this.state.currentTurn.set(1);
      this.state.currentPlayer.set(Math.random() < 0.5 ? 0 : 1);

      this.state.playerCards.clear();

      fillCards(this.state.playerCards[0]);
      fillCards(this.state.playerCards[1]);

      console.log(`Battle started, player to start: `, this.state.currentPlayer);
    });

    this.onMessage('newTurn', (client, message) => {
      this.state.currentTurn.set(this.state.currentTurn + 1);
      this.state.currentPlayer.set(this.state.currentPlayer === 0 ? 1 : 0);

      fillCards(this.state.playerCards[this.state.currentPlayer]);

      console.log(`New turn started, player: `, this.state.currentPlayer);
    });

    this.onMessage('playCard', (client, message) => {
      this.state.playerCards[this.state.currentPlayer].delete(message.cardId);

      console.log(`Card ${message.cardId} played by player ${this.state.currentPlayer}`);
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
