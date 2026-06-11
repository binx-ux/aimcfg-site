// ===== full changelog page =====
const CHANGELOG_URL = "https://raw.githubusercontent.com/binx-ux/aim.cfg/refs/heads/main/changelog.json";

// normalize a change type (symbol or word) to { sym, cls }
function normType(t) {
  t = (t || "").toString().trim().toLowerCase();
  if (["+", "added", "add", "new", "done", "feature"].includes(t)) return { sym: "+", cls: "added" };
  if (["-", "removed", "remove", "delete", "deleted"].includes(t)) return { sym: "-", cls: "removed" };
  return { sym: "~", cls: "changed" };
}

function makeEntry(c) {
  const { sym, cls } = normType(c.type);
  const row = document.createElement("div");
  row.className = "cl-row " + cls;
  const dot = document.createElement("i");
  const txt = document.createElement("span");
  txt.textContent = c.note || c.text || "";
  const tag = document.createElement("em");
  tag.className = "cl-tag";
  tag.textContent = "[" + sym + "]";
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
  if (rel.date) {
    const d = document.createElement("span");
    d.className = "cl-date";
    d.textContent = rel.date;
    head.appendChild(d);
  }
  wrap.appendChild(head);

  const list = document.createElement("div");
  list.className = "cl-list";
  (rel.changes || []).forEach(c => list.appendChild(makeEntry(c)));
  wrap.appendChild(list);
  return wrap;
}

// support both the new {changelog:[...]} shape and the old flat {entries:[...]}
function releasesOf(data) {
  if (Array.isArray(data.changelog) && data.changelog.length) return data.changelog;
  if (Array.isArray(data.entries)) {
    return [{
      version: data.version || "latest",
      date: data.updated,
      changes: data.entries.map(e => ({ type: e.type, note: e.text })),
    }];
  }
  return [];
}

(async function load() {
  const tl = document.getElementById("cl-timeline");
  const sub = document.getElementById("cl-sub");
  try {
    const res = await fetch(CHANGELOG_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("status " + res.status);
    const data = await res.json();

    const releases = releasesOf(data);
    if (!releases.length) throw new Error("empty");

    tl.innerHTML = "";
    releases.forEach(r => tl.appendChild(makeRelease(r)));

    const total = releases.reduce((n, r) => n + (r.changes ? r.changes.length : 0), 0);
    const latestDate = releases[0] && releases[0].date ? ` · last updated ${releases[0].date}` : "";
    sub.textContent = `${total} changes across ${releases.length} release${releases.length > 1 ? "s" : ""}` + latestDate;
  } catch (err) {
    tl.innerHTML = '<div class="cl-empty">couldn\'t load the changelog right now. try the ' +
      '<a href="https://github.com/binx-ux/aim.cfg/blob/main/changelog.json">source on github</a>.</div>';
    sub.textContent = "";
    console.warn("changelog load failed:", err);
  }
})();
