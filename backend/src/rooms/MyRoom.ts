import { Room, Client, CloseCode } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState.js";
import { Player } from "../types/Player.js";

export class MyRoom extends Room {
  maxClients = Infinity;

  messages = {
    yourMessageType: (client: Client, message: any) => {
      /**
       * Handle "yourMessageType" message.
       */
      console.log(client.sessionId, "sent a message:", message);
    }
  }

  onCreate (options: any) {
    this.state = new MyRoomState();
    console.log(`MyRoom created with options:`, options);
  }

  onJoin (client: Client, options: any) {
    /**
     * Called when a client joins the room.
     */
    console.log(`client ${client.sessionId} joined with options:`, options);

    const player = new Player();
    player.id = client.sessionId;
    player.x = options.x || 0;
    player.y = options.y || 0;

    this.state.players.set(client.sessionId, player);
  }

  onLeave (client: Client, code: CloseCode) {
    /**
     * Called when a client leaves the room.
     */
    console.log(client.sessionId, "left!", code);

    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    /**
     * Called when the room is disposed.
     */
    console.log("room", this.roomId, "disposing...");
  }

}
