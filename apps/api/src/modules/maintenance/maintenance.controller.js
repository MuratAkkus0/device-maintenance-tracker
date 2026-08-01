import * as maintenanceService from "./maintenance.service.js";

export async function list(req, res, next) {
  try {
    res.json(await maintenanceService.listMaintenanceHistory(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const result = await maintenanceService.logMaintenance(
      Number(req.params.id),
      req.body,
      req.user.id
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
