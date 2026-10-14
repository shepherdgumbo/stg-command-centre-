# STG Command Centre: automation setup

## What you get
- **YouTube stats:** latest Short (views, likes, comments) plus channel totals, filled in automatically.
- **Site checks:** ZesaTracker and ZimMarket up/down, with one retry to avoid false alarms.
- **Build and deploy status:** latest GitHub Actions run and GitHub deployment per repo (Vercel reports deployments to GitHub).
- **Suggested tasks:** created from the data above (stale Shorts, new comments, site down, failed build). Ticking one off is remembered on that device; it only returns when the situation changes.
- **Free alerts:** the workflow turns red when a site is down or a sync step fails, and GitHub emails you about failed runs.

## Setup (about 10 minutes)
1. **Copy files into your Command Centre repo**, keeping the folder layout:
   - `.github/workflows/command-centre-sync.yml`
   - `scripts/sync.mjs`
   - `command-centre.config.json`
   - `sync-panel.js`
2. **Edit `command-centre.config.json`:**
   - `youtube.channelHandle`: your YouTube @handle (YouTube app > You tab, shown under your name). This is the easy option. Alternatively fill `youtube.channelId` (starts with `UC`, found at youtube.com/account_advanced in a desktop browser) and it takes priority.
   - `sites`: the real URLs of ZesaTracker and ZimMarket.
   - `repos`: `owner/name` of each GitHub repo (Command Centre, ZesaTracker). Entries still containing `REPLACE-ME` or `OWNER/REPO` are skipped.
3. **Create a YouTube API key:** Google Cloud Console > create a project > enable "YouTube Data API v3" > Credentials > Create API key. Restrict the key to that API.
4. **Add the key as a repo secret:** GitHub repo > Settings > Secrets and variables > Actions > New repository secret, named `YOUTUBE_API_KEY`.
5. **Allow the workflow to save data:** Settings > Actions > General > Workflow permissions > "Read and write permissions".
6. **Show the panel:** add this line before `</body>` in `index.html`:
   `<script src="sync-panel.js" defer></script>`
7. **First run:** Actions tab > "Command Centre sync" > Run workflow. After it finishes and Pages redeploys, reload the dashboard.

## Good to know
- Checks run twice a day (08:00 and 20:00 Zimbabwe time). Edit the `cron` line to change that. This is a daily snapshot, not real-time monitoring.
- A "Short" is any upload of 180 seconds or less (`shortMaxSeconds`).
- Comment counts are automatic. Reading the comment text needs a Google sign-in (OAuth) setup, which is not included.
- If a ZesaTracker or other repo is private, the built-in token cannot read it. Create a fine-grained personal access token with read access to Actions and Deployments, store it as a secret, and use it in place of `GITHUB_TOKEN` in the workflow.
- Firebase (ZimMarket) deploys are not read; the up/down check covers the live site.
