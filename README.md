# STG Command Centre

A mobile-friendly operations dashboard for three projects: **ZesaTracker**, **ZimMarket**, and the Command Centre itself.

**Live dashboard:** https://shepherdgumbo.github.io/stg-command-centre/

## What it does

- Checks the ZesaTracker website and its health and community-reports API endpoints.
- Checks the ZimMarket production website.
- Checks the Command Centre's own published website.
- Reads the latest GitHub Actions workflow result for each configured repository when repository access permits.
- Generates follow-up tasks when websites, APIs or repository checks fail.
- Lets you add, categorize, complete and delete tasks for all three projects.
- Keeps tasks and the post-deployment checklist in this browser on this device.
- Exports and imports a JSON backup.
- Provides an installable offline app shell where supported.

## Projects

| Project | Production | Source |
|---|---|---|
| ZesaTracker | https://zesatracker.vercel.app/ | https://github.com/shepherdgumbo/zesatracker |
| ZimMarket | https://zimmarket-expo.vercel.app/ | https://github.com/shepherdgumbo/Shepherd- |
| STG Command Centre | https://shepherdgumbo.github.io/stg-command-centre-/ | https://github.com/shepherdgumbo/stg-command-centre- |

## Automated monitoring

The sync workflow runs twice daily at **06:00 and 18:00 UTC** (08:00 and 20:00 Zimbabwe time), and can be started manually. It updates `data/status.json` and `data/auto-tasks.json`.

Public GitHub repositories can be checked without a personal token. The ZesaTracker repository is private and therefore needs a fine-grained, read-only GitHub token in the Command Centre repository's Actions secrets under the name `GH_READ_TOKEN` to inspect its Actions runs. Do not place a token in website files, task data, or browser storage. Without that secret, the dashboard still checks the public websites and repositories and reports that private-repository access is missing.

The monitoring job checks HTTP responses and the latest available repository workflow. A responding URL is not proof that every feature works. Workflow data can also be stale if a scheduled sync has not run recently.

## Hosting

This is a static site published from the repository root on GitHub Pages. The Pages build workflow is available at:

https://github.com/shepherdgumbo/stg-command-centre-/actions

The repository also contains optional Railway files (`Dockerfile`, `server.mjs`, and `railway.json`), but the canonical public dashboard remains on GitHub Pages.

## Important project verification gates

### ZesaTracker

- There is no verified live official outage feed connected. Do not state that an area currently has electricity or is affected by an outage based only on this dashboard.
- Community reports are public, user-submitted and unverified. They do not create an official ZETDC fault ticket.
- The AI assistant can fall back to built-in guidance when no AI model responds; the app must make that mode clear.
- The solar planner provides estimates, not an installer design, quote or safety certification.
- Confirm persistent report storage and test the assistant and report flow separately from HTTP health checks.

Production: https://zesatracker.vercel.app/  
Android build workflow: https://github.com/shepherdgumbo/zesatracker/actions/workflows/build-zesatracker-android-apk.yml

### ZimMarket

- Public listings must remain admin-approved; no fabricated listings, reviews, ratings, seller badges or delivery promises.
- USD and ZWL are displayed as listed. Do not convert one currency into the other.
- The current app supports order requests and direct seller/customer arrangements; do not claim integrated payments.
- A successful web or APK build does not prove Firebase registration, sign-in, seller approval, product moderation or order flows work.
- Compare live Firestore and Storage rules with repository rules before deploying any security-rule changes. Do not deploy rules without that comparison.

Production: https://zimmarket-expo.vercel.app/  
Android build workflow: https://github.com/shepherdgumbo/Shepherd-/actions/workflows/build-android-apk.yml

## Using the dashboard

Tasks and checklist state are stored locally in the current browser profile; they are not synchronized between devices. Export a backup before clearing browser data or changing devices. Importing a backup replaces the locally saved task list and checklist.

After each release, manually test the affected app on a real phone, including its main customer journeys. Do not mark a feature as verified solely because a deployment or HTTP check succeeded.
