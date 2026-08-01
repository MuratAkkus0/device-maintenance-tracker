import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { allowedOrigins } from "./config/env.js";
import { logger } from "./lib/logger.js";
import errorHandler from "./middleware/error.middleware.js";
import notFoundRoute from "./middleware/notFoundRoute.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import staffRoutes from "./modules/staff/staff.routes.js";
import roomsRoutes from "./modules/rooms/rooms.routes.js";
import devicesRoutes from "./modules/devices/devices.routes.js";
import notificationsRoutes from "./modules/notifications/notifications.routes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());

  // Cross-origin requests are denied by default (fixes the previous
  // `Access-Control-Allow-Origin: *` on top of an open cors()). Set
  // CORS_ORIGIN to a comma-separated allowlist to enable the web app.
  app.use(
    cors({
      origin: allowedOrigins.length > 0 ? allowedOrigins : false,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    })
  );

  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use(pinoHttp({ logger, redact: ["req.headers.authorization", "req.headers.cookie"] }));

  // Coarse global limiter; individual sensitive routes (auth, mail-sending)
  // layer a stricter limiter of their own on top of this.
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get("/health", (req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/staff", staffRoutes);
  app.use("/api/rooms", roomsRoutes);
  app.use("/api/devices", devicesRoutes);
  app.use("/api/notifications", notificationsRoutes);

  app.use(notFoundRoute);
  app.use(errorHandler);

  return app;
}
