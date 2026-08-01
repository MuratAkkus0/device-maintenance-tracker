import { escapeHtml } from "../../lib/html.js";

// Fictional, self-consistent branding for the portfolio project. Every
// reference below (company name, address, links) points at the same made-up
// company so nothing in the footer contradicts the sender - the previous
// template signed itself "ScooTeq GmbH" while linking to a real, unrelated
// company's site and LinkedIn page.
const COMPANY_NAME = "Nordlicht IT Services GmbH";
const COMPANY_ADDRESS = "Speicherstraße 12, D-20457 Hamburg";
const COMPANY_WEBSITE = "https://www.nordlicht-it.example";

// Bundled locally as an inline SVG data URI so the email never depends on
// (or hotlinks) an image hosted in someone else's GitHub repository.
const LOGO_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">` +
      `<rect width="64" height="64" rx="12" fill="#0F4C5C"/>` +
      `<text x="32" y="42" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#FFFFFF" text-anchor="middle">N</text>` +
      `</svg>`
  );

const STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; }
  .main-container { width: 100%; max-width: 600px; margin: 0 auto; }
  header { display: flex; align-items: center; gap: 12px; padding: 24px 16px; border-bottom: 1px solid #ddd; }
  header img { height: 48px; width: 48px; }
  header .company-name { font-size: 18px; font-weight: 700; color: #0F4C5C; }
  section { padding: 24px 16px; }
  h1 { font-size: 20px; margin-bottom: 16px; }
  #mailText { line-height: 1.6; }
  table.device-details { border-collapse: collapse; margin: 16px 0; width: 100%; }
  table.device-details td { padding: 6px 8px; border: 1px solid #ddd; }
  table.device-details td:first-child { font-weight: 700; width: 40%; background: #f5f5f5; }
  footer { padding: 24px 16px; border-top: 1px solid #ddd; font-size: 13px; color: #555; }
`;

/**
 * Builds the maintenance-reminder email. All device-derived values are
 * escaped before interpolation to prevent HTML/link injection through
 * device fields (the previous template interpolated deviceId/type/location
 * into the HTML body unescaped).
 */
export function buildMaintenanceReminderEmail({ device, locationLabel, statusLabel }) {
  const deviceName = escapeHtml(`${device.type === "LAPTOP" ? "Laptop" : "Desktop"}-${device.id}`);
  const deviceType = escapeHtml(device.type === "LAPTOP" ? "Laptop" : "Desktop Computer");
  const location = escapeHtml(locationLabel);
  const dueDate = escapeHtml(new Date(device.nextDueDate).toLocaleDateString("en-GB"));
  const status = escapeHtml(statusLabel);

  const subject = `Maintenance reminder: ${deviceName} (${status})`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Maintenance reminder</title>
    <style>${STYLES}</style>
  </head>
  <body>
    <div class="main-container">
      <header>
        <img src="${LOGO_DATA_URI}" alt="${COMPANY_NAME} logo" />
        <span class="company-name">${COMPANY_NAME}</span>
      </header>
      <section>
        <h1>Scheduled device maintenance is ${status === "OVERDUE" ? "overdue" : "coming up"}</h1>
        <p id="mailText">
          Hello,<br /><br />
          This is an automated reminder that the following device is due for
          its regular maintenance check:
        </p>
        <table class="device-details">
          <tr><td>Device</td><td>${deviceName}</td></tr>
          <tr><td>Type</td><td>${deviceType}</td></tr>
          <tr><td>${device.type === "LAPTOP" ? "Assigned to" : "Location"}</td><td>${location}</td></tr>
          <tr><td>Next due date</td><td>${dueDate}</td></tr>
          <tr><td>Status</td><td>${status}</td></tr>
        </table>
        <p>
          Please schedule the maintenance during regular business hours
          (Mon-Fri). No separate appointment is required.
          <br /><br />
          Thank you for your support.
          <br /><br />
          Kind regards,<br />
          ${COMPANY_NAME}
        </p>
      </section>
      <footer>
        ${COMPANY_NAME}<br />
        ${COMPANY_ADDRESS}<br />
        <a href="${COMPANY_WEBSITE}">${COMPANY_WEBSITE}</a>
      </footer>
    </div>
  </body>
</html>`;

  return { subject, html };
}
