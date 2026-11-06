# Rockydark8 Bug Tracker

A single-page bug-tracking dashboard prototype for reviewing defects, exploring triage workflows, and viewing project metrics.

## Features

- Dashboard with issue metrics, lifecycle chart, and component breakdown.
- Defect queue with search, filters, sorting, and issue details.
- AI analyzer view with simulated diagnosis results.
- Simulated auto-triage assignments and Gmail notification log.
- CI/CD workflow and dependency graph views.
- Create defects and export the current issue list as JSON.

## Run locally

Open `rockydark8_bug_tracker (1).html` in a modern web browser. The page loads React, Babel, Tailwind CSS, and Lucide from public CDNs, so an internet connection is required.

## Notes

This is a front-end prototype: issue data starts from sample records and changes are kept in page memory only. Refreshing the page resets changes. AI diagnosis, triage, Gmail notifications, CI/CD workflows, and dependency information are demonstrations; they are not connected to backend services or external accounts.
