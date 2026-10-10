# STG Command Centre

A mobile-friendly personal workspace for project tasks, manually entered YouTube Shorts metrics, project launch links, and post-deployment checks.

**Live site:** https://shepherdgumbo.github.io/stg-command-centre/

## Features

- Add, complete, categorize, and delete tasks.
- Track a manual YouTube Shorts snapshot (views, likes, comments, and title).
- Export and import a JSON backup, including task and checklist state.
- Persist the deployment checklist on the current browser profile.
- Install as a web app where the browser supports installation.
- Open the dashboard shell offline after the first successful online load, provided the service worker has been installed.
- Quick links to the ZesaTracker live site and Vercel project, ZimMarket Firebase Console, YouTube Studio, and deployment history.

## Publish

The repository is a static site. GitHub Pages publishes the root directory on updates to `main`. The Pages build and deployment history is available at:

https://github.com/shepherdgumbo/stg-command-centre-/actions

The repository also includes a `netlify.toml` for static hosting providers that use Netlify configuration.

## Data and privacy

Tasks, manual stats, and checklist state are stored in `localStorage` in the browser on this device/profile. They are not synchronized to a server or shared automatically between devices. Use **Export backup** before clearing browser data or changing devices.

The dashboard does not sign into YouTube, read inboxes or comments, monitor deployments in the background, or receive automatic analytics. Those features require separate provider authorization or notification setup. Labels are intentionally honest about these limits.

## Files

- `index.html` — main dashboard
- `index-5.html` — synchronized alternate entry page
- `manifest.webmanifest` — web-app installation metadata
- `sw.js` — conservative network-first app-shell cache and offline fallback
- `icon.svg` — STG app icon
- `netlify.toml` — static publish directory configuration

The page has no build-time package dependencies.
