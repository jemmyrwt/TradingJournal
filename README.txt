TradeVault
=========

Audited final build.

This build preserves the existing localStorage key: tradevault_v2.
Upload the extracted folder contents to the GitHub Pages repository root.

IMPORTANT:
- Do not upload the ZIP itself expecting GitHub Pages to extract it.
- Extract first, then upload index.html, css/, js/, icons/, manifest.json and service-worker.js.
- Existing trades/setups/reviews stored under tradevault_v2 are read by the new app.
- Take a JSON backup before replacing the live files.

Final audit fixes included:
- Mobile More menu now exposes Playbook, Backtesting, Reviews and Settings.
- Dashboard navigation, Risk Calculator, trade search/filter and Analytics period controls are wired to module functions.
- Calendar month navigation resets the selected day correctly.
- Notification permission status is safe when Notification is unavailable.
- JSON import normalizes missing collections/settings.
- Calendar date numbers are centered.
- Modal locks background scrolling and closes with Escape.
- Service-worker cache bumped to v4.
