# ShipWithAtlas.online
AtlasLine Dispatch Company official website. Includes shipment tracking and contact form. Built with HTML, CSS, and JavaScript. Deployable on Vercel, Netlify, or GitHub Pages.

## Added by assistant
- `api/contact.js` - sends contact form emails using nodemailer. Configure SMTP env vars in Vercel.
- `api/track.js` - deterministic mock tracking; reads overrides from `/data/tracking.json`.
- `api/updateTrack.js` - admin-only endpoint to add/edit/delete entries in `/data/tracking.json`. Requires ADMIN_KEY env var.
- `admin.html` + `/admin/script-admin.js` - password-only admin UI to edit tracking JSON.
- `data/tracking.json` - editable JSON store (committed and also writable by the server at runtime; note: on Vercel writes are ephemeral).
- `vercel.json`, `package.json`, `.gitignore` added/updated.

### Environment variables to set on Vercel
- SMTP_HOST (e.g. smtp.office365.com)
- SMTP_PORT (e.g. 587)
- SMTP_USER (shipwithatlas@outlook.com)
- SMTP_PASS (<your SMTP password or app password>)
- ADMIN_EMAIL (shipwithatlas@outlook.com)
- ADMIN_KEY (a secret password for admin UI)

### Local test
1. npm install
2. npx vercel dev
3. Open http://localhost:3000 (or the URL vercel dev prints)

### Notes
- The JSON file at `/data/tracking.json` is the editable "database" for the mock tracker. When editing via the admin UI the server writes to this file. On Vercel this file will be writable during runtime but **not persistent between deployments**. For long-term persistence, connect to a DB or an external store (Airtable, Supabase, etc.).
