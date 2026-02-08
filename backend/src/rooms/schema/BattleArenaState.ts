import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export class UnitStats extends Schema {
  @type("number") HP = 0;
  @type("number") ATK = 0;
  @type("number") DEF = 0;
  @type("number") Esquive = 0;
  @type("number") Critique = 0;
}

export class BattleUnit extends Schema {
  @type("number") id = 0;
  @type("string") name = "";
  @type("string") image = "";
  @type("string") rarity = "";
  @type("string") category = "";
  @type(UnitStats) stats = new UnitStats();
  @type("number") currentHP = 0;
  @type("number") maxHP = 0;
  @type("boolean") isAlive = true;
  @type("number") position = 0;
}

export class LeaderSkillStat extends Schema {
  @type("string") stat = "";
  @type("number") value = 0;
  @type("string") unit = "";
}

export class LeaderSkill extends Schema {
  @type("string") skillType = "";
  @type("string") target = "";
  @type([LeaderSkillStat]) stats = new ArraySchema<LeaderSkillStat>();
}

export class Summoner extends Schema {
  @type("number") id = 0;
  @type("string") name = "";
  @type("string") image = "";
  @type("string") rarity = "";
  @type("string") promo = "";
  @type(LeaderSkill) leaderSkill = new LeaderSkill();
}

export class HandCard extends Schema {
  @type("number") id = 0;
  @type("string") name = "";
  @type("string") cardType = "";
  @type("number") value = 0;
  @type("string") description = "";
}

export class BattleArenaState extends Schema {
  @type({ map: "string" }) playerIds = new MapSchema<string>();
  @type("number") currentTurn = 0;
  @type("number") currentPlayer = 0;
  @type("string") phase = "waiting"; // waiting, play, attack, ended
  
  // Player summoners: key is "playerIndex"
  @type({ map: Summoner }) summoners = new MapSchema<Summoner>();
  
  // Battle units: key is "playerIndex_position" (0-5)
  @type({ map: BattleUnit }) units = new MapSchema<BattleUnit>();
  
  // Hand cards: key is "playerIndex_cardIndex"
  @type({ map: HandCard }) handCards = new MapSchema<HandCard>();
  
  @type("string") winner = "";
  @type("number") lastCardPlayed = -1;
  @type("string") lastAction = "";
}
