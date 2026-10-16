// STG Command Centre: live sync panel.
// Add one line before </body> in index.html:  <script src="sync-panel.js" defer></script>
// It reads data/*.json (written by the GitHub Action) and shows a panel at the top of the page.
(() => {
  "use strict";
  const DONE_KEY = "stg-auto-tasks-done";

  const loadDone = () => {
    try { return JSON.parse(localStorage.getItem(DONE_KEY) || "[]"); } catch { return []; }
  };
  const saveDone = (list) => {
    try { localStorage.setItem(DONE_KEY, JSON.stringify(list.slice(-300))); } catch { /* storage unavailable */ }
  };
  async function load(name) {
    try {
      const r = await fetch(`data/${name}?t=${Date.now()}`, { cache: "no-store" });
      return r.ok ? await r.json() : null;
    } catch { return null; }
  }

  const safeUrl = (u) => (/^https?:\/\//.test(u || "") ? u : null);
  const num = (n) => (n == null ? "—" : Number(n).toLocaleString());
  const ago = (iso) => {
    if (!iso) return "never";
    const mins = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
    if (mins < 2) return "just now";
    if (mins < 90) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 36) return `${hrs} h ago`;
    return `${Math.round(hrs / 24)} days ago`;
  };

  function el(tag, props = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    kids.flat().filter(Boolean).forEach((c) => n.append(c));
    return n;
  }
  const link = (href, text) => {
    const u = safeUrl(href);
    return u ? el("a", { href: u, target: "_blank", rel: "noopener", text }) : el("span", { text });
  };

  function injectStyle() {
    if (document.getElementById("ccs-style")) return;
    const css = `
      .ccs{margin:16px 0;padding:14px;border:1px solid rgba(128,128,128,.35);border-radius:14px;font:inherit;color:inherit}
      .ccs h2{margin:0;font-size:1.05rem}
      .ccs h3{margin:14px 0 6px;font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;opacity:.7}
      .ccs .ccs-head{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
      .ccs .ccs-sub{font-size:.8rem;opacity:.7}
      .ccs button{font:inherit;font-size:.8rem;padding:6px 10px;border-radius:8px;border:1px solid rgba(128,128,128,.5);background:transparent;color:inherit;cursor:pointer}
      .ccs ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
      .ccs li{padding:8px 10px;border:1px solid rgba(128,128,128,.25);border-radius:10px;font-size:.9rem}
      .ccs li small{display:block;opacity:.7;margin-top:2px}
      .ccs .ccs-row{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}
      .ccs .ccs-task{display:flex;gap:10px;align-items:flex-start}
      .ccs .ccs-task input{margin-top:3px;width:18px;height:18px;flex:none}
      .ccs .ccs-bad{font-weight:600}
      .ccs a{color:inherit}
      .ccs .ccs-err{padding:8px 10px;border-radius:10px;border:1px solid rgba(220,60,60,.6);font-size:.85rem;margin-top:8px}
    `;
    document.head.append(el("style", { id: "ccs-style", text: css }));
  }

  function stateLabel(ok) { return ok ? "● Up" : "● Down"; }

  async function render(root) {
    const [yt,status,auto]=await Promise.all([load('youtube.json'),load('status.json'),load('auto-tasks.json')]);
    root.replaceChildren();
    const newest=[yt?.updatedAt,status?.updatedAt,auto?.updatedAt].filter(Boolean).sort().pop();
    root.append(el('div',{class:'ccs-head'},el('div',{},el('h2',{text:'Live sync'}),el('div',{class:'ccs-sub',{text:newest?'Updated '+ago(newest)+' · automatic checks twice a day':'No sync data yet'}})),el('button',{type:'button',text:'Reload',onclick:()=>render(root)})));
    if(!yt&&!status&&!auto){root.append(el('div',{class:'ccs-err',text:'No sync data found yet.'}));return;}
    const done=new Set(loadDone()),open=(auto?.tasks||[]).filter(t=>!done.has(t.id));
    root.append(el('h3',{text:'Suggested tasks ('+open.length+')'}),open.length?el('ul',{},open.map(t=>{const box=el('input',{type:'checkbox','aria-label':'Mark done: '+t.title});box.addEventListener('change',()=>{const d=loadDone();d.push(t.id);saveDone(d);render(root)});return el('li',{class:'ccs-task'},box,el('div',{},el('div',{text:(t.tag?t.tag+': ':'')+t.title},t.link?el('small',{},link(t.link,'Open')):null))})):el('div',{class:'ccs-sub',text:'Nothing suggested right now.'}));
    root.append(el('h3',{text:'YouTube Shorts'}));
    if(yt?.available===false&&yt?.reason)root.append(el('div',{class:'ccs-err',text:'YouTube sync: '+yt.reason+'. The dashboard remains functional; check YouTube Data API v3 enablement/restrictions.'}));
    if(yt?.available&&yt.channel){const l=yt.latestShort;root.append(el('ul',{},l?el('li',{},el('div',{class:'ccs-row'},el('strong',{},link('https://www.youtube.com/shorts/'+l.id,l.title)),el('span',{text:ago(l.publishedAt)})),el('small',{text:num(l.views)+' views · '+num(l.likes)+' likes · '+num(l.comments)+' comments'})):el('li',{text:'No recent Short found.'}),el('li',{},el('small',{text:yt.channel.title+': '+num(yt.channel.subscribers)+' subscribers · '+num(yt.channel.views)+' total views · '+num(yt.channel.videos)+' videos'}))));}
    root.append(el('h3',{text:'Live sites'}));const sites=status?.sites||[];root.append(el('ul',{},sites.map(s=>el('li',{},el('div',{class:'ccs-row'},el('strong',{},link(s.url,s.name)),el('span',{class:s.up?'':'ccs-bad',text:s.up?'● Up':'● Down'})),el('small',{text:s.up?'HTTP '+s.status+' · checked '+ago(s.checkedAt):'No response · checked '+ago(s.checkedAt)})))));
    root.append(el('h3',{text:'Builds and deployments'}));const repos=status?.repos||[];root.append(el('ul',{},repos.map(r=>{const run=r.latestRun,st=run?(run.status==='completed'?(run.conclusion||'completed'):run.status):'No workflow run';return el('li',{},el('div',{class:'ccs-row'},el('strong',{text:r.repo}),el('span',{class:run?.conclusion==='failure'?'ccs-bad':'',text:st})),el('small',{text:run?run.name+' · updated '+ago(run.updated_at):'No run data'}))})));
  }
  function mount() {
    injectStyle();
    const root = el("section", { id: "cc-sync", class: "ccs", "aria-label": "Live sync" });
    const main = document.querySelector("main");
    const header = document.querySelector("body > header");
    if (main) main.prepend(root);
    else if (header) header.after(root);
    else document.body.prepend(root);
    render(root);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
