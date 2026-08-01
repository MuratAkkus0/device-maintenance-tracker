import { Router } from "express";
import rateLimit from "express-rate-limit";
import validate from "../../middleware/validate.middleware.js";
import { loginSchema, registerSchema } from "@wartungstermine/shared";
import * as authController from "./auth.controller.js";

const router = Router();

// Slows down credential stuffing / brute force against login and mass
// account creation against register.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

router.use(authLimiter);

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;
