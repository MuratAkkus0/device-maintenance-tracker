import { Router } from "express";
import { createMaintenanceRecordSchema } from "@wartungstermine/shared";
import validate from "../../middleware/validate.middleware.js";
import * as maintenanceController from "./maintenance.controller.js";

// mergeParams: mounted under /api/devices/:id/maintenance-records in
// devices.routes.js, needs the parent :id.
const router = Router({ mergeParams: true });

// Both roles may log/view completed maintenance - it's the technician's
// core job, and admins may log on their behalf. Only device create/delete
// is admin-only (enforced in devices.routes.js).
router.get("/", maintenanceController.list);
router.post("/", validate(createMaintenanceRecordSchema), maintenanceController.create);

export default router;
