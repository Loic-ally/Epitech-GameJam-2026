import { Schema, type, MapSchema } from "@colyseus/schema";
import { Player } from "../../types/Player.js";

export class MyRoomState extends Schema {

  @type("string") mySynchronizedProperty: string = "Hello world";
  @type({ map: Player }) players = new MapSchema<Player>();

}
