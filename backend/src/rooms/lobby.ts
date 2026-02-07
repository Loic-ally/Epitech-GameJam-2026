import { Room, Client, CloseCode } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState.js";
import { Player } from "../types/Player.js";

export class Lobby extends Room {
  maxClients = Infinity;

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
  }

  onLeave (client: Client, code: CloseCode) {
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
