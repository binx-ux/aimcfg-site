// ===== full changelog page =====
const CHANGELOG_URL = "https://raw.githubusercontent.com/binx-ux/aim.cfg/refs/heads/main/changelog.json";
const VALID_TYPES = new Set(["wip", "fix", "test", "new", "done", "added", "removed", "changed"]);

function makeEntry(e) {
  const type = VALID_TYPES.has(e.type) ? e.type : "new";
  const row = document.createElement("div");
  row.className = "cl-row " + type;
  const dot = document.createElement("i");
  const txt = document.createElement("span");
  txt.textContent = e.text || "";
  const tag = document.createElement("em");
  tag.className = "cl-tag";
  tag.textContent = type;
  row.append(dot, txt, tag);
  return row;
}

function makeRelease(rel) {
  const wrap = document.createElement("section");
  wrap.className = "cl-release";

  const head = document.createElement("div");
  head.className = "cl-rel-head";
  const v = document.createElement("h2");
  v.textContent = rel.version || "update";
  head.appendChild(v);
  if (rel.date || rel.updated) {
    const d = document.createElement("span");
    d.className = "cl-date";
    d.textContent = rel.date || rel.updated;
    head.appendChild(d);
  }
  wrap.appendChild(head);

  const list = document.createElement("div");
  list.className = "cl-list";
  (rel.entries || []).forEach(e => list.appendChild(makeEntry(e)));
  wrap.appendChild(list);
  return wrap;
}

(async function load() {
  const tl = document.getElementById("cl-timeline");
  const sub = document.getElementById("cl-sub");
  try {
    const res = await fetch(CHANGELOG_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("status " + res.status);
    const data = await res.json();

    // current release = top-level version + entries; history = optional older releases
    const releases = [];
    if (data.entries && data.entries.length) {
      releases.push({ version: data.version || "latest", date: data.updated, entries: data.entries });
    }
    if (Array.isArray(data.history)) {
      data.history.forEach(r => releases.push(r));
    }
    if (!releases.length) throw new Error("empty");

    tl.innerHTML = "";
    releases.forEach(r => tl.appendChild(makeRelease(r)));

    const total = releases.reduce((n, r) => n + (r.entries ? r.entries.length : 0), 0);
    sub.textContent = `${total} updates across ${releases.length} release${releases.length > 1 ? "s" : ""}` +
      (data.updated ? ` · last updated ${data.updated}` : "");
  } catch (err) {
    tl.innerHTML = '<div class="cl-empty">couldn\'t load the changelog right now. try the ' +
      '<a href="https://github.com/binx-ux/aim.cfg/blob/main/changelog.json">source on github</a>.</div>';
    sub.textContent = "";
    console.warn("changelog load failed:", err);
  }
})();

// nav stays solid on this page; tiny scroll polish only
window.addEventListener("scroll", () => {}, { passive: true });
