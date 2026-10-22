# STG Command Centre — ZesaTracker

A mobile-friendly dashboard focused on one project: ZesaTracker.

**Live site:** https://shepherdgumbo.github.io/stg-command-centre-/

## Features

- ZesaTracker production link, GitHub source and Vercel deployment links.
- Automatic checks for the public website, health API and reports API.
- ZesaTracker repository workflow status when a read-only GitHub token is configured.
- Add, complete, categorize and delete ZesaTracker tasks.
- Post-deployment checklist for mobile layout, key flows and release checks.
- Export and import a JSON backup of tasks and checklist state.
- Install as a web app where the browser supports installation.
- Offline app shell after the first successful online load and service-worker install.

## Publish

This is a static site. GitHub Pages publishes the repository root from `main` when files change. Deployment runs are available at:

https://github.com/shepherdgumbo/stg-command-centre-/actions

## Automation and access

The sync workflow runs twice daily and can also be started manually. It checks ZesaTracker website/API responses and retrieves repository workflow status when the `GH_READ_TOKEN` Actions secret is configured. Use a fine-grained token with read-only access to the ZesaTracker repository and Actions metadata. Never add credentials to HTML or browser storage.

The dashboard task list and checklist are stored in this browser on this device/profile; they are not synced between devices. Export a backup before clearing browser data or changing devices. HTTP success indicates a route responded; manually test the solar planner, AI assistant and report flow after each release.

## Files

- `index.html` and `index-5.html` — dashboard
- `command-centre.config.json` — ZesaTracker URLs and monitored endpoints
- `scripts/sync.mjs` — scheduled site and repository checks
- `sync-panel.js` — live status panel
- `data/status.json` and `data/auto-tasks.json` — sync output
- `manifest.webmanifest` and `sw.js` — installable offline shell

There are no build-time package dependencies.
