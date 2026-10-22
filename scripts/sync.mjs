import fs from "node:fs/promises";

const DATA = new URL("../data/", import.meta.url);
const cfg = JSON.parse(await fs.readFile(new URL("../command-centre.config.json", import.meta.url), "utf8"));
const now = new Date().toISOString();
await fs.mkdir(DATA, { recursive: true });

async function getJson(url, headers = {}) {
  const response = await fetch(url, { headers });
  const raw = await response.text();
  let body;
  try { body = JSON.parse(raw); } catch { body = null; }
  if (!response.ok) throw new Error(response.status + " — " + (body?.message || response.statusText));
  if (!body) throw new Error("Invalid JSON response from " + new URL(url).hostname);
  return body;
}

async function checkUrl(url) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(10000) });
      return { url, up: response.ok, status: response.status, checkedAt: now };
    } catch (error) {
      if (attempt === 2) return { url, up: false, status: null, checkedAt: now, error: error.message };
    }
  }
  return { url, up: false, status: null, checkedAt: now };
}

async function checkSite(site) {
  const primary = await checkUrl(site.url);
  const endpoints = await Promise.all((site.checks || []).map(check => checkUrl(check.url)));
  return { id: site.id, name: site.name, url: site.url, up: primary.up, status: primary.status, checkedAt: now, endpoints };
}

async function githubRepo(repo) {
  const token = process.env.GH_READ_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) return { repo: repo.repo, name: repo.name, error: "GH_READ_TOKEN is not configured", checkedAt: now };
  const headers = { authorization: "Bearer " + token, accept: "application/vnd.github+json" };
  try {
    const metadata = await getJson("https://api.github.com/repos/" + repo.repo, headers);
    const runs = await getJson("https://api.github.com/repos/" + repo.repo + "/actions/runs?per_page=1", headers);
    return {
      repo: repo.repo,
      name: repo.name,
      private: metadata.private,
      defaultBranch: metadata.default_branch,
      latestRun: runs.workflow_runs?.[0] || null,
      checkedAt: now
    };
  } catch (error) {
    return { repo: repo.repo, name: repo.name, error: error.message, checkedAt: now };
  }
}

const sites = await Promise.all(cfg.sites.map(checkSite));
const repos = await Promise.all((cfg.repos || []).map(githubRepo));
const tasks = [];
for (const site of sites) {
  if (!site.up) tasks.push({ id: "site-down-" + site.id, tag: "Site", title: site.name + " website is not responding", link: site.url });
  for (const endpoint of site.endpoints || []) {
    if (!endpoint.up) tasks.push({ id: "endpoint-down-" + site.id + "-" + endpoint.url.split("/").pop(), tag: "API", title: site.name + " " + endpoint.url.split("/").pop() + " endpoint is not responding", link: endpoint.url });
  }
}
for (const item of repos) {
  if (item?.latestRun?.conclusion === "failure") tasks.push({ id: "build-failed-" + item.repo, tag: "Build", title: "Latest workflow run failed for " + item.repo, link: "https://github.com/" + item.repo + "/actions" });
  if (item?.error) tasks.push({ id: "repo-access-" + item.repo, tag: "GitHub", title: "Enable read access to the private ZesaTracker repository", link: "https://github.com/shepherdgumbo/stg-command-centre-/settings/secrets/actions" });
}

await fs.writeFile(new URL("status.json", DATA), JSON.stringify({ updatedAt: now, sites, repos }, null, 2) + "\n");
await fs.writeFile(new URL("auto-tasks.json", DATA), JSON.stringify({ updatedAt: now, tasks }, null, 2) + "\n");
