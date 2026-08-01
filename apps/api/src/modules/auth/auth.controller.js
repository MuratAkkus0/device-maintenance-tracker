import { env } from "../../config/env.js";
import * as authService from "./auth.service.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth",
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
};

function sendSession(res, status, { user, accessToken, refreshToken }) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(status).json({ user, accessToken });
}

export async function register(req, res, next) {
  try {
    const session = await authService.register(req.body);
    sendSession(res, 201, session);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const session = await authService.login(req.body);
    sendSession(res, 200, session);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const session = await authService.refresh(req.cookies?.[REFRESH_COOKIE_NAME]);
    sendSession(res, 200, session);
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    await authService.logout(req.cookies?.[REFRESH_COOKIE_NAME]);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
