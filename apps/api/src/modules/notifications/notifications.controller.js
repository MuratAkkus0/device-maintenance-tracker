import * as notificationsService from "./notifications.service.js";

export async function runSweep(req, res, next) {
  try {
    res.json(await notificationsService.runDueNotificationSweep());
  } catch (err) {
    next(err);
  }
}

export async function notifyDevice(req, res, next) {
  try {
    res.json(await notificationsService.notifyDeviceNow(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}
