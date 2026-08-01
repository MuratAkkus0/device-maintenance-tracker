import { z } from "zod";

// Fail fast at boot if required configuration is missing, instead of
// discovering a misconfigured secret the first time a request needs it.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string({ error: "DATABASE_URL is required." }).min(1),
  JWT_ACCESS_SECRET: z
    .string({ error: "JWT_ACCESS_SECRET is required." })
    .min(16, "JWT_ACCESS_SECRET must be at least 16 characters."),
  JWT_REFRESH_SECRET: z
    .string({ error: "JWT_REFRESH_SECRET is required." })
    .min(16, "JWT_REFRESH_SECRET must be at least 16 characters."),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  CORS_ORIGIN: z.string().default(""),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().default("Nordlicht IT Services <no-reply@nordlicht-it.example>"),
  NOTIFICATION_CRON_SCHEDULE: z.string().default("0 7 * * *"),
  NOTIFICATION_DUE_SOON_DAYS: z.coerce.number().int().positive().default(14),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  // Throwing (rather than process.exit) still fails the process at startup
  // for a real server, but stays catchable/testable in-process.
  throw new Error(`Invalid environment configuration:\n${details}`);
}

export const env = parsed.data;

export const allowedOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
