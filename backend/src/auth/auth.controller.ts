import { Request, Response } from "express";
import { authService } from "./auth.service.js";

export const registerController = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body || {};
  try {
    const result = await authService.register(email, password, firstName, lastName);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err?.message ?? "Registration failed" });
  }
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  try {
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err?.message ?? "Login failed" });
  }
};
