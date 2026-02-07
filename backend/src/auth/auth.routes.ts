import { Router } from "express";
import { createEndpoint } from "colyseus";
import { loginController, registerController } from "./auth.controller.js";
import { authService } from "./auth.service.js";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);

export const authApiEndpoints = {
  auth_register: createEndpoint("/api/auth/register", { method: "POST" }, async (ctx) => {
    const { email, password, firstName, lastName } = ctx.request.body || {};
    try {
      return await authService.register(email, password, firstName, lastName);
    } catch (err: any) {
      ctx.status = 400;
      return { error: err?.message ?? "Registration failed" };
    }
  }),
  auth_login: createEndpoint("/api/auth/login", { method: "POST" }, async (ctx) => {
    const { email, password } = ctx.request.body || {};
    try {
      return await authService.login(email, password);
    } catch (err: any) {
      ctx.status = 401;
      return { error: err?.message ?? "Login failed" };
    }
  }),
};

export { router as authRouter };
