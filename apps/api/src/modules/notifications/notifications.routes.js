import { Router } from "express";
import rateLimit from "express-rate-limit";
import { ROLES } from "@wartungstermine/shared";
import authMiddleware from "../../middleware/auth.middleware.js";
import requireRole from "../../middleware/requireRole.middleware.js";
import * as notificationsController from "./notifications.controller.js";

const router = Router();

// Sending mail is the one action worth limiting harder than the global
// rate limit: it's the fix for the old completely-open mail relay.
const notifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many notification requests, please try again later." },
});

router.use(authMiddleware, notifyLimiter);

// Manual re-run of the full due/overdue sweep, e.g. for verifying delivery
// without waiting for the cron schedule. Admin-only: it can email every
// technician in the system at once.
router.post("/run", requireRole(ROLES.ADMIN), notificationsController.runSweep);

export default router;
