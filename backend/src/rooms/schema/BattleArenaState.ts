import { Schema, type, MapSchema } from "@colyseus/schema";

export class BattleArenaState extends Schema {

  @type({ map: "string" }) playerIds = new MapSchema<string>();
  @type("number") currentTurn = 0;
  @type("number") currentPlayer = 0;
  @type({ map: { map: "number" } }) playerCards = new MapSchema<MapSchema<number>>();

}
