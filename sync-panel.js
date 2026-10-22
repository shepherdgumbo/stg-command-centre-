// STG Command Centre: focused ZesaTracker status panel.
(() => {
  "use strict";
  const DONE_KEY = "stg-auto-tasks-done-zesa";
  const loadDone = () => { try { return JSON.parse(localStorage.getItem(DONE_KEY) || "[]"); } catch { return []; } };
  const saveDone = list => { try { localStorage.setItem(DONE_KEY, JSON.stringify(list.slice(-300))); } catch {} };
  async function load(name) {
    try { const response = await fetch("data/" + name + "?t=" + Date.now(), { cache: "no-store" }); return response.ok ? await response.json() : null; }
    catch { return null; }
  }
  const safeUrl = value => (/^https?:\/\//.test(value || "") ? value : null);
  const ago = iso => {
    if (!iso) return "never";
    const mins = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
    if (mins < 2) return "just now";
    if (mins < 90) return mins + " min ago";
    const hrs = Math.round(mins / 60);
    if (hrs < 36) return hrs + " h ago";
    return Math.round(mins / 1440) + " days ago";
  };
  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value);
    }
    children.flat().filter(Boolean).forEach(child => node.append(child));
    return node;
  }
  function link(url, label) {
    const href = safeUrl(url);
    return href ? el("a", { href, target: "_blank", rel: "noopener", text: label }) : el("span", { text: label });
  }
  function injectStyle() {
    if (document.getElementById("ccs-style")) return;
    const css = ".ccs{margin:16px 0;padding:14px;border:1px solid rgba(128,128,128,.35);border-radius:14px;font:inherit;color:inherit}.ccs h2{margin:0;font-size:1.05rem}.ccs h3{margin:14px 0 6px;font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;opacity:.7}.ccs .ccs-head{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}.ccs .ccs-sub{font-size:.8rem;opacity:.7}.ccs button{font:inherit;font-size:.8rem;padding:6px 10px;border-radius:8px;border:1px solid rgba(128,128,128,.5);background:transparent;color:inherit;cursor:pointer}.ccs ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}.ccs li{padding:8px 10px;border:1px solid rgba(128,128,128,.25);border-radius:10px;font-size:.9rem}.ccs li small{display:block;opacity:.7;margin-top:2px}.ccs .ccs-row{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}.ccs .ccs-task{display:flex;gap:10px;align-items:flex-start}.ccs .ccs-task input{margin-top:3px;width:18px;height:18px;flex:none}.ccs .ccs-bad{font-weight:700;color:#ff8585}.ccs a{color:inherit}.ccs .ccs-err{padding:8px 10px;border-radius:10px;border:1px solid rgba(220,60,60,.6);font-size:.85rem;margin-top:8px}";
    document.head.append(el("style", { id: "ccs-style", text: css }));
  }
  async function render(root) {
    const [status, auto] = await Promise.all([load("status.json"), load("auto-tasks.json")]);
    root.replaceChildren();
    const newest = [status?.updatedAt, auto?.updatedAt].filter(Boolean).sort().pop();
    root.append(el("div", { class: "ccs-head" },
      el("div", {}, el("h2", { text: "ZesaTracker live checks" }),
        el("div", { class: "ccs-sub", text: newest ? "Updated " + ago(newest) + " · automatic checks twice daily" : "No check data yet" })),
      el("button", { type: "button", text: "Reload", onclick: () => render(root) })));
    if (!status && !auto) { root.append(el("div", { class: "ccs-err", text: "No sync data found yet." })); return; }
    const done = new Set(loadDone()), tasks = (auto?.tasks || []).filter(task => !done.has(task.id));
    root.append(el("h3", { text: "Suggested ZesaTracker tasks (" + tasks.length + ")" }),
      tasks.length ? el("ul", {}, tasks.map(task => {
        const checkbox = el("input", { type: "checkbox", "aria-label": "Mark done: " + task.title });
        checkbox.addEventListener("change", () => { const saved = loadDone(); saved.push(task.id); saveDone(saved); render(root); });
        const details = el("div", {}, el("div", { text: (task.tag ? task.tag + ": " : "") + task.title }));
        if (task.link) details.append(el("small", {}, link(task.link, "Open")));
        return el("li", { class: "ccs-task" }, checkbox, details);
      })) : el("div", { class: "ccs-sub", text: "No automatic follow-up tasks right now." }));
    root.append(el("h3", { text: "Production website and APIs" }));
    const sites = status?.sites || [];
    root.append(el("ul", {}, sites.flatMap(site => {
      const rows = [el("li", {}, el("div", { class: "ccs-row" }, el("strong", {}, link(site.url, site.name)), el("span", { class: site.up ? "" : "ccs-bad", text: site.up ? "● Up" : "● Down" })),
        el("small", { text: site.up ? "HTTP " + site.status + " · checked " + ago(site.checkedAt) : "No response · checked " + ago(site.checkedAt) }))];
      for (const endpoint of site.endpoints || []) rows.push(el("li", {}, el("div", { class: "ccs-row" }, el("strong", {}, link(endpoint.url, site.name + " " + endpoint.url.split("/").pop())), el("span", { class: endpoint.up ? "" : "ccs-bad", text: endpoint.up ? "HTTP " + endpoint.status : "Down" })), el("small", { text: "Checked " + ago(endpoint.checkedAt) })));
      return rows;
    })));
    root.append(el("h3", { text: "ZesaTracker repository checks" }));
    const repos = status?.repos || [];
    root.append(el("ul", {}, repos.map(item => {
      const run = item.latestRun;
      const label = run ? (run.status === "completed" ? (run.conclusion || "completed") : run.status) : (item.error ? "Access needed" : "No workflow run");
      const children = [el("div", { class: "ccs-row" }, el("strong", { text: item.repo }), el("span", { class: run?.conclusion === "failure" || item.error ? "ccs-bad" : "", text: label }))];
      if (run) children.push(el("small", { text: (run.name || "Workflow") + " · updated " + ago(run.updated_at) }));
      else if (item.error) children.push(el("small", { text: "Add the GH_READ_TOKEN Actions secret with read-only access to this private repository." }));
      return el("li", {}, ...children);
    })));
  }
  function mount() {
    injectStyle();
    const root = el("section", { id: "cc-sync", class: "ccs", "aria-label": "ZesaTracker live checks" });
    const page = document.querySelector(".wrap");
    if (page) page.insertBefore(root, page.querySelector(".grid"));
    else document.body.prepend(root);
    render(root);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
