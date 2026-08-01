import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./db/prismaClient.js";
import { startNotificationScheduler } from "./jobs/notificationScheduler.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`API listening on port ${env.PORT}`);
});

const stopScheduler = startNotificationScheduler();

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down`);
  stopScheduler();
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
