import cron from "node-cron";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { runDueNotificationSweep } from "../modules/notifications/notifications.service.js";

// Runs the due/overdue notification sweep on NOTIFICATION_CRON_SCHEDULE
// (default: daily at 07:00). Safe to run more than once for the same day -
// runDueNotificationSweep is idempotent per (device, calendar day) via the
// NotificationLog unique constraint.
export function startNotificationScheduler() {
  const task = cron.schedule(env.NOTIFICATION_CRON_SCHEDULE, async () => {
    try {
      const summary = await runDueNotificationSweep();
      logger.info(summary, "Notification sweep completed");
    } catch (err) {
      logger.error({ err }, "Notification sweep failed");
    }
  });

  return () => task.stop();
}
