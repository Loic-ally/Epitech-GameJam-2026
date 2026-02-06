import { Router } from "express";
import { createEndpoint } from "colyseus";
import { cardsService } from "./cards.service.js";

const router = Router();

router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  res.json({ userId, items: cardsService.getInventory(userId) });
});

router.post("/:userId", (req, res) => {
  const { userId } = req.params;
  try {
    const cards = cardsService.validatePayload(req.body);
    res.json({ userId, items: cardsService.setInventory(userId, cards) });
  } catch (err: any) {
    res.status(400).json({ error: err?.message ?? "Invalid payload" });
  }
});

export const cardsApiEndpoints = {
  inventory_get: createEndpoint("/api/inventory/:userId", { method: "GET" }, async (ctx) => {
    const userId = ctx.params.userId as string;
    return { userId, items: cardsService.getInventory(userId) };
  }),
  inventory_update: createEndpoint("/api/inventory/:userId", { method: "POST" }, async (ctx) => {
    const userId = ctx.params.userId as string;
    const cards = cardsService.validatePayload(ctx.request.body);
    return { userId, items: cardsService.setInventory(userId, cards) };
  })
};

export { router as cardsRouter };
