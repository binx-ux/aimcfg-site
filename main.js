// ===== aim.cfg site =====

// ===== splash screen =====
(function splash() {
  const el = document.getElementById("splash");
  if (!el) return;
  const MIN_MS = 2200;          // show at least this long so the animation reads
  const start = performance.now();
  let done = false;
  const hide = () => {
    if (done) return; done = true;
    const wait = Math.max(0, MIN_MS - (performance.now() - start));
    setTimeout(() => {
      el.classList.add("hide");
      setTimeout(() => el.remove(), 650);
    }, wait);
  };
  window.addEventListener("load", hide);
  setTimeout(hide, 4500); // fallback in case load never fires
})();

// ===== auto changelog (pulled live from the aim.cfg repo) =====
// edit changelog.json in github.com/binx-ux/aim.cfg and this updates itself.
const CHANGELOG_URL = "https://raw.githubusercontent.com/binx-ux/aim.cfg/refs/heads/main/changelog.json";
const PANEL_LIMIT = 12;

// normalize a change type (symbol or word) to { sym, cls }
function normType(t) {
  t = (t || "").toString().trim().toLowerCase();
  if (["+", "added", "add", "new", "done", "feature"].includes(t)) return { sym: "+", cls: "added" };
  if (["-", "removed", "remove", "delete", "deleted"].includes(t)) return { sym: "-", cls: "removed" };
  return { sym: "~", cls: "changed" };
}

// pull the latest release's changes from either the new or old json shape
function latestChanges(data) {
  if (Array.isArray(data.changelog) && data.changelog.length) {
    const rel = data.changelog[0];
    return { changes: rel.changes || [], version: rel.version, date: rel.date };
  }
  if (Array.isArray(data.entries)) {
    return { changes: data.entries.map(e => ({ type: e.type, note: e.text })), version: data.version };
  }
  return { changes: [] };
}

(async function loadChangelog() {
  const box = document.getElementById("updates");
  if (!box) return;
  try {
    const res = await fetch(CHANGELOG_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("status " + res.status);
    const data = await res.json();
    const { changes, version } = latestChanges(data);
    if (!changes.length) return; // keep fallback markup

    box.innerHTML = "";
    for (const c of changes.slice(0, PANEL_LIMIT)) {
      const { cls } = normType(c.type);
      const row = document.createElement("div");
      row.className = "update " + cls;
      const dot = document.createElement("i");
      const span = document.createElement("span");
      span.textContent = c.note || c.text || "";
      row.append(dot, span);
      box.appendChild(row);
    }

    // reflect version in the panel header
    const head = document.querySelector(".side-head");
    if (head && version && version !== "latest") {
      let tag = head.querySelector(".side-ver");
      if (!tag) { tag = document.createElement("em"); tag.className = "side-ver"; head.appendChild(tag); }
      tag.textContent = version;
    }
  } catch (err) {
    // fetch failed (offline / rate limited) — the hardcoded list in the HTML stays as-is.
    console.warn("changelog fetch failed, using fallback:", err);
  }
})();

// ===== live executor status (from weao.json, refreshed by a scheduled action) =====
(async function loadWeao() {
  const cards = document.querySelectorAll(".exec[data-weao]");
  if (!cards.length) return;
  try {
    const res = await fetch("weao.json", { cache: "no-store" });
    if (!res.ok) throw new Error("status " + res.status);
    const data = await res.json();
    const map = data.exploits || {};

    cards.forEach(card => {
      const key = card.getAttribute("data-weao");
      const e = map[key];
      const pill = card.querySelector(".exec-stat");
      if (!pill) return;
      if (!e) { pill.className = "exec-stat na"; pill.textContent = "—"; return; }
      if (e.updateStatus) {
        pill.className = "exec-stat online";
        pill.textContent = "online";
        pill.title = "updated and working on the current Roblox version";
      } else {
        pill.className = "exec-stat offline";
        pill.textContent = "down";
        pill.title = "not updated to the current Roblox version yet";
      }
      if (e.detected) pill.title += " · detected";
    });

    // "updated Xm ago" label
    const label = document.getElementById("weao-updated");
    if (label && data.fetched) {
      const ageMin = Math.max(0, Math.round((Date.now() - new Date(data.fetched).getTime()) / 60000));
      label.textContent = ageMin < 1 ? "updated just now" : `updated ${ageMin}m ago`;
    }
  } catch (err) {
    document.querySelectorAll(".exec .exec-stat:not(.blocked)").forEach(p => { p.className = "exec-stat na"; p.textContent = "—"; });
    console.warn("weao status fetch failed:", err);
  }
})();

// dismissible notice (re-shows if the message changes via the key)
(function notice() {
  const el = document.getElementById("notice");
  const x = document.getElementById("notice-x");
  if (!el || !x) return;
  const KEY = "aimcfg-notice-2026-06-hiatus";
  if (localStorage.getItem(KEY) === "1") { el.classList.add("hidden"); return; }
  x.addEventListener("click", () => {
    el.classList.add("hidden");
    try { localStorage.setItem(KEY, "1"); } catch {}
  });
})();

// nav bg on scroll
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// scroll reveal + executor bars
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .exec').forEach(el => io.observe(el));

// animated stat counters
const counters = document.querySelectorAll('.stat b[data-count]');
const cio = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    let n = 0;
    const step = Math.max(1, Math.round(target / 28));
    const tick = () => {
      n += step;
      if (n >= target) { el.textContent = target + suffix; }
      else { el.textContent = n + suffix; requestAnimationFrame(tick); }
    };
    tick();
    cio.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach(c => cio.observe(c));

// copy buttons
document.querySelectorAll('.copy').forEach(btn => {
  btn.addEventListener('click', async () => {
    const code = document.getElementById(btn.dataset.target).textContent;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    const old = btn.textContent;
    btn.textContent = 'copied'; btn.classList.add('done');
    showToast();
    setTimeout(() => { btn.textContent = old; btn.classList.remove('done'); }, 1600);
  });
});

// toast
const toast = document.getElementById('toast');
let toastTimer;
function showToast() {
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

// card glow follows cursor
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('pointermove', (ev) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
    card.style.setProperty('--my', (ev.clientY - r.top) + 'px');
  });
});

// subtle parallax on hero glow
const glow = document.querySelector('.bg-glow');
window.addEventListener('pointermove', (ev) => {
  const x = (ev.clientX / window.innerWidth - 0.5) * 14;
  const y = (ev.clientY / window.innerHeight - 0.5) * 14;
  glow.style.transform = `translate(${x}px,${y}px)`;
}, { passive: true });
