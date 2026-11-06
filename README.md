# Rockydark8 Bug Tracker

A single-page bug-tracking dashboard prototype for reviewing defects, exploring triage workflows, and viewing project metrics.

## Features

- Dashboard with issue metrics, lifecycle chart, and component breakdown.
- Defect queue with search, filters, sorting, and issue details.
- AI analyzer view with simulated diagnosis results.
- Simulated auto-triage assignments and Gmail notification log.
- CI/CD workflow and dependency graph views.
- Create defects and export the current issue list as JSON.

## Project files

- `index.html` — page structure and external library setup.
- `styles.css` — custom styles.
- `app.jsx` — React app and UI logic.

## Run locally

From the project directory, start a local web server:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in a modern web browser. The page loads React, Babel, Tailwind CSS, and Lucide from public CDNs, so an internet connection is required. Serve the files over HTTP rather than opening `index.html` directly, so the browser can load `app.jsx`.

## Notes

This is a front-end prototype: issue data starts from sample records and changes are kept in page memory only. Refreshing the page resets changes. AI diagnosis, triage, Gmail notifications, CI/CD workflows, and dependency information are demonstrations; they are not connected to backend services or external accounts.
