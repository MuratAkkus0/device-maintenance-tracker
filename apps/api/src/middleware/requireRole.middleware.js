// Route-level authorization gate. Must run after authMiddleware, which
// populates req.user. Used e.g. as requireRole("ADMIN") on
// DELETE /api/devices/:id so a TECHNICIAN gets a 403, not a crash or a
// silent no-op.
export default function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions." });
    }

    next();
  };
}
