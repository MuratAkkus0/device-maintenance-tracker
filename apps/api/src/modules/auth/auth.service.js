import bcrypt from "bcryptjs";
import { ROLES } from "@wartungstermine/shared";
import { env } from "../../config/env.js";
import { conflict, unauthorized } from "../../lib/httpError.js";
import { hashToken, newTokenId } from "../../lib/crypto.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../lib/jwt.js";
import * as authRepository from "./auth.repository.js";

const SALT_ROUNDS = 10;

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

async function issueSession(user) {
  const accessToken = signAccessToken(user);

  const jti = newTokenId();
  const refreshToken = signRefreshToken({ sub: user.id, jti });
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  return { accessToken, refreshToken };
}

// New accounts are always created as TECHNICIAN (least privilege). ADMIN
// accounts are provisioned out-of-band (seed script), never through public
// self-registration, so an attacker who finds /auth/register cannot mint
// themselves administrative access.
export async function register({ name, email, password }) {
  const existing = await authRepository.findUserByEmail(email);
  if (existing) {
    throw conflict("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await authRepository.createUser({
    name,
    email,
    passwordHash,
    role: ROLES.TECHNICIAN,
  });

  const session = await issueSession(user);
  return { user: toPublicUser(user), ...session };
}

export async function login({ email, password }) {
  const user = await authRepository.findUserByEmail(email);
  const isPasswordValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  // Same generic error whether the account doesn't exist or the password is
  // wrong, so the endpoint cannot be used to enumerate registered emails.
  if (!user || !isPasswordValid) {
    throw unauthorized("Invalid email or password.");
  }

  const session = await issueSession(user);
  return { user: toPublicUser(user), ...session };
}

export async function refresh(rawRefreshToken) {
  if (!rawRefreshToken) {
    throw unauthorized("No refresh token provided.");
  }

  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw unauthorized("Invalid or expired refresh token.");
  }

  const tokenHash = hashToken(rawRefreshToken);
  const stored = await authRepository.findActiveRefreshTokenByHash(tokenHash);
  if (!stored || stored.userId !== payload.sub) {
    throw unauthorized("Refresh token has been revoked.");
  }

  const user = await authRepository.findUserById(payload.sub);
  if (!user) {
    throw unauthorized("Account no longer exists.");
  }

  // Rotate: the presented refresh token is single-use. Revoking it here
  // means a leaked-then-reused refresh token fails on its second use.
  await authRepository.revokeRefreshTokenById(stored.id);
  const session = await issueSession(user);
  return { user: toPublicUser(user), ...session };
}

export async function logout(rawRefreshToken) {
  if (!rawRefreshToken) {
    return;
  }
  await authRepository.revokeRefreshTokenByHash(hashToken(rawRefreshToken));
}
