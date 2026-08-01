const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

// Escapes user-controlled values before they are interpolated into an email
// (or any) HTML template, preventing HTML/link injection via device
// name/type/location fields. Every dynamic value in
// notifications.template.js must be passed through this first.
export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}
