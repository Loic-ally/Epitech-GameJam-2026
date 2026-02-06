import { Router } from "express";
import { createEndpoint } from "colyseus";
import { createSummonerController, getSummonerController, renameSummonerController } from "./summoner.controller.js";
import { summonerService } from "./summoner.service.js";

const router = Router();

router.get("/:userId", getSummonerController);
router.post("/:userId", createSummonerController);
router.patch("/:userId/name", renameSummonerController);

export const summonerApiEndpoints = {
  summoner_get: createEndpoint("/api/summoner/:userId", { method: "GET" }, async (ctx) => {
    const userId = ctx.params.userId as string;
    const summoner = summonerService.getByUser(userId);
    if (!summoner) {
      ctx.status = 404;
      return { error: "Summoner not found" };
    }
    return summoner;
  }),
  summoner_create: createEndpoint("/api/summoner/:userId", { method: "POST" }, async (ctx) => {
    const userId = ctx.params.userId as string;
    const { name } = ctx.request.body || {};
    if (!name || typeof name !== "string") {
      ctx.status = 400;
      return { error: "name is required" };
    }
    return summonerService.create(userId, name);
  }),
  summoner_rename: createEndpoint("/api/summoner/:userId/name", { method: "PATCH" }, async (ctx) => {
    const userId = ctx.params.userId as string;
    const { name } = ctx.request.body || {};
    if (!name || typeof name !== "string") {
      ctx.status = 400;
      return { error: "name is required" };
    }
    try {
      return summonerService.rename(userId, name);
    } catch (err: any) {
      ctx.status = 404;
      return { error: err?.message ?? "Summoner not found" };
    }
  })
};

export { router as summonerRouter };
