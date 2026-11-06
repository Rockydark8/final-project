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
- `server.py` — Python HTTP server and JSON API.
- `bug_tracker.sqlite3` — SQLite database created automatically when the server starts.

## Run locally

Requires Python 3.10 or later; the backend uses only the Python standard library. From the project directory, start the app and API:

```bash
python server.py
```

Then open [http://localhost:8000](http://localhost:8000) in a modern web browser. The API initializes the sample bugs on first run and saves bugs, triage assignments, and diagnosis results in SQLite. The page loads React, Babel, Tailwind CSS, and Lucide from public CDNs, so an internet connection is required.

## Notes

AI diagnosis, triage assignment choices, Gmail notifications, CI/CD workflows, and dependency information remain demonstrations; they are not connected to external AI, email, CI/CD, or repository services. The Python server binds to `127.0.0.1` by default and is intended for local development, not public deployment.

Run the backend tests with:

```bash
python -m unittest
```
