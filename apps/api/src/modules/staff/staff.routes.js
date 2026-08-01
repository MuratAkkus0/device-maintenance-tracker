import { Router } from "express";
import { ROLES, createStaffSchema, updateStaffSchema } from "@wartungstermine/shared";
import authMiddleware from "../../middleware/auth.middleware.js";
import requireRole from "../../middleware/requireRole.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import * as staffController from "./staff.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", staffController.list);
router.get("/:id", staffController.getOne);
router.post("/", requireRole(ROLES.ADMIN), validate(createStaffSchema), staffController.create);
router.put("/:id", requireRole(ROLES.ADMIN), validate(updateStaffSchema), staffController.update);
router.delete("/:id", requireRole(ROLES.ADMIN), staffController.remove);

export default router;
