import { createHash, randomUUID } from "node:crypto";

// Refresh tokens are never stored raw: only this hash is persisted, so a
// database leak alone cannot be replayed as a valid session.
export function hashToken(rawToken) {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function newTokenId() {
  return randomUUID();
}
