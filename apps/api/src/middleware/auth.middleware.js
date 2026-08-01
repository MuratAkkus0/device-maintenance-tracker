import { verifyAccessToken } from "../lib/jwt.js";

// Authenticates the request from a short-lived Bearer access token and
// attaches { id, role } to req.user. Route-level requireRole() then decides
// what that role is allowed to do.
export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No access token provided." });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({ message: "No access token provided." });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired access token." });
  }
}
