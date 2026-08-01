// Catch-all for unmatched routes. Must be mounted after every real route.
export default function notFoundRoute(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found.` });
}
