import { Request, Response } from "express";
import { cardsService } from "./cards.service.js";

export const getInventoryController = (req: Request, res: Response) => {
  const { userId } = req.params;
  res.json({ userId, items: cardsService.getInventory(userId) });
};

export const updateInventoryController = (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const cards = cardsService.validatePayload(req.body);
    res.json({ userId, items: cardsService.setInventory(userId, cards) });
  } catch (err: any) {
    res.status(400).json({ error: err?.message ?? "Invalid payload" });
  }
};
