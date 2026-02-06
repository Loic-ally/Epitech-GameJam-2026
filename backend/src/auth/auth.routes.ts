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
    return authService.register(email, password, firstName, lastName);
  }),
  auth_login: createEndpoint("/api/auth/login", { method: "POST" }, async (ctx) => {
    const { email, password } = ctx.request.body || {};
    return authService.login(email, password);
  }),
};

export { router as authRouter };
