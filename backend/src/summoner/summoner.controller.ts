import { Request, Response } from "express";
import { summonerService } from "./summoner.service.js";

export const getSummonerController = (req: Request, res: Response) => {
  const { userId } = req.params;
  const summoner = summonerService.getByUser(userId);
  if (!summoner) {
    return res.status(404).json({ error: "Summoner not found" });
  }
  res.json(summoner);
};

export const createSummonerController = (req: Request, res: Response) => {
  const { userId } = req.params;
  const { name } = req.body || {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "name is required" });
  }
  const summoner = summonerService.create(userId, name);
  res.status(201).json(summoner);
};

export const renameSummonerController = (req: Request, res: Response) => {
  const { userId } = req.params;
  const { name } = req.body || {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "name is required" });
  }
  try {
    const summoner = summonerService.rename(userId, name);
    res.json(summoner);
  } catch (err: any) {
    res.status(404).json({ error: err?.message ?? "Summoner not found" });
  }
};
