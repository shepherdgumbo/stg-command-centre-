# STG Command Centre — Setup

This is a lightweight, mobile-friendly workspace focused on **ZesaTracker**.

**Live dashboard:** https://shepherdgumbo.github.io/stg-command-centre-/

## What it does

- Checks the ZesaTracker website, health endpoint and community reports endpoint.
- Shows recent GitHub Actions status for the private ZesaTracker repository when a read-only token is configured.
- Suggests follow-up tasks when a monitored endpoint is down or the latest workflow fails.
- Lets you add, complete and remove tasks, and export/import a JSON backup.
- Can be installed as a web app in browsers that support installation.
- Keeps tasks and checklist selections in the current browser on this device. They do not automatically sync between devices.

A successful health check only means the website responded. It does **not** mean ZETDC outage information is live or verified. ZesaTracker has no verified live official outage feed connected yet.

## Turn on private repository checks (optional)

The dashboard can check public website/API endpoints without a token. To let GitHub Actions read workflow status from the private ZesaTracker repository:

1. Open GitHub **Settings** for your account, then **Developer settings → Personal access tokens → Fine-grained tokens**.
2. Create a token with resource owner **shepherdgumbo** and repository access limited to **Only select repositories → zesatracker**.
3. Give it **Actions: Read-only** permission. Keep the token read-only; it does not need write access.
4. Open the Command Centre repository's [Actions secrets settings](https://github.com/shepherdgumbo/stg-command-centre-/settings/secrets/actions).
5. Choose **New repository secret**, enter the name `GH_READ_TOKEN`, and paste the token into the secret-value box. Save it there only. Never paste the token into chat, HTML, or a repository file.
6. Open [Command Centre sync workflow](https://github.com/shepherdgumbo/stg-command-centre-/actions/workflows/command-centre-sync.yml) and select **Run workflow**. After it finishes, reload the dashboard.

If you leave out this optional token, the website/API checks still run. The dashboard will show a task explaining that private-repository workflow status is unavailable.

## Timing and maintenance

The automatic sync runs at **08:00 and 20:00 Zimbabwe time**. This is a scheduled snapshot, not continuous monitoring. You can also start the workflow manually.

Before clearing browser data or changing devices, use **Export backup** to save your tasks. Use **Import backup** to restore them later.

## Hosting and source

- **Dashboard:** [GitHub Pages](https://shepherdgumbo.github.io/stg-command-centre-/)
- **Repository:** [stg-command-centre-](https://github.com/shepherdgumbo/stg-command-centre-)
- **ZesaTracker production:** https://zesatracker.vercel.app/
- **ZesaTracker source:** https://github.com/shepherdgumbo/zesatracker
- **ZesaTracker deployment checks:** https://github.com/shepherdgumbo/zesatracker/actions

The root `Dockerfile`, `server.mjs`, and `railway.json` are optional Railway-hosting files. GitHub Pages remains independent. The current Railway ZesaTracker service is not deployed; the Vercel website is the active production site.

## Main files

- `index.html` — dashboard and task manager
- `command-centre.config.json` — monitored ZesaTracker site and endpoints
- `scripts/sync.mjs` — scheduled checks
- `sync-panel.js` — status panel
- `data/status.json` and `data/auto-tasks.json` — latest sync results
- `manifest.webmanifest` and `sw.js` — installable app shell
