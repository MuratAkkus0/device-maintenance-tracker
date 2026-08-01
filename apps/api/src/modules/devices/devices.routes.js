import { Router } from "express";
import rateLimit from "express-rate-limit";
import { ROLES, createDeviceSchema, updateDeviceSchema } from "@wartungstermine/shared";
import authMiddleware from "../../middleware/auth.middleware.js";
import requireRole from "../../middleware/requireRole.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import * as devicesController from "./devices.controller.js";
import maintenanceRoutes from "../maintenance/maintenance.routes.js";
import * as notificationsController from "../notifications/notifications.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", devicesController.list);
router.get("/:id", devicesController.getOne);
router.post("/", requireRole(ROLES.ADMIN), validate(createDeviceSchema), devicesController.create);
router.put("/:id", requireRole(ROLES.ADMIN), validate(updateDeviceSchema), devicesController.update);
// A technician must not be able to delete devices - only ADMIN may.
router.delete("/:id", requireRole(ROLES.ADMIN), devicesController.remove);

router.use("/:id/maintenance-records", maintenanceRoutes);

// Manual "send reminder now" (replaces the old open POST /send_mail):
// authenticated, allowlisted to the device's on-file technician, and rate
// limited separately from the rest of the API.
const notifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many notification requests, please try again later." },
});
router.post("/:id/notify", notifyLimiter, notificationsController.notifyDevice);

export default router;
