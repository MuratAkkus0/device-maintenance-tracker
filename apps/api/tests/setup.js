// Loaded before any test file. Provides just enough env for config/env.js's
// fail-fast validation to pass without needing a real database or secrets -
// unit tests mock the Prisma client and never open a real connection.
process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.JWT_ACCESS_SECRET ??= "test-only-access-secret-not-a-real-secret";
process.env.JWT_REFRESH_SECRET ??= "test-only-refresh-secret-not-a-real-secret";
process.env.CORS_ORIGIN ??= "http://localhost:5173";
