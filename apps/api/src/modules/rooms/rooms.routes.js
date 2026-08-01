import { Router } from "express";
import { ROLES, createRoomSchema, updateRoomSchema } from "@wartungstermine/shared";
import authMiddleware from "../../middleware/auth.middleware.js";
import requireRole from "../../middleware/requireRole.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import * as roomsController from "./rooms.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", roomsController.list);
router.get("/:id", roomsController.getOne);
router.post("/", requireRole(ROLES.ADMIN), validate(createRoomSchema), roomsController.create);
router.put("/:id", requireRole(ROLES.ADMIN), validate(updateRoomSchema), roomsController.update);
router.delete("/:id", requireRole(ROLES.ADMIN), roomsController.remove);

export default router;
