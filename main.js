// ===== kyn portfolio =====

const TYPEWRITER_LINES = [
  "Your hand finds my hand",
  "two heartbeats learning one song,",
  "quiet as warm rain."
];

// ===== click to enter =====
(function enterScreen() {
  const el = document.getElementById("enter");
  const bg = document.getElementById("bg-video");
  const enterVid = el?.querySelector(".enter-video");
  if (!el) return;

  const unlock = () => {
    el.classList.add("hide");
    if (bg) { bg.play().catch(() => {}); bg.muted = false; }
    setTimeout(() => el.remove(), 600);
  };

  el.addEventListener("click", unlock);
  enterVid?.play().catch(() => {});
})();

// ===== volume toggle =====
(function volume() {
  const btn = document.getElementById("vol-btn");
  const bg = document.getElementById("bg-video");
  if (!btn || !bg) return;

  btn.addEventListener("click", () => {
    bg.muted = !bg.muted;
    btn.classList.toggle("muted", bg.muted);
  });
})();

// ===== view switching =====
(function views() {
  const home = document.getElementById("view-home");
  const scripts = document.getElementById("view-scripts");
  const btnScripts = document.getElementById("btn-scripts");
  const btnBack = document.getElementById("btn-back");
  if (!home || !scripts || !btnScripts || !btnBack) return;

  const showScripts = () => {
    home.classList.remove("active");
    home.hidden = true;
    scripts.hidden = false;
    requestAnimationFrame(() => scripts.classList.add("active"));
    window.scrollTo(0, 0);
  };

  const showHome = () => {
    scripts.classList.remove("active");
    scripts.hidden = true;
    home.hidden = false;
    requestAnimationFrame(() => home.classList.add("active"));
    window.scrollTo(0, 0);
  };

  btnScripts.addEventListener("click", showScripts);
  btnBack.addEventListener("click", showHome);
})();

// ===== typewriter bio =====
(function typewriter() {
  const el = document.getElementById("typewriter");
  if (!el) return;

  let line = 0;
  let char = 0;
  let deleting = false;

  const tick = () => {
    const current = TYPEWRITER_LINES[line];
    if (!deleting) {
      char++;
      el.textContent = current.slice(0, char).toUpperCase();
      if (char >= current.length) {
        setTimeout(() => { deleting = true; tick(); }, 2200);
        return;
      }
      setTimeout(tick, 58);
    } else {
      char--;
      el.textContent = current.slice(0, char).toUpperCase();
      if (char <= 0) {
        deleting = false;
        line = (line + 1) % TYPEWRITER_LINES.length;
        setTimeout(tick, 500);
        return;
      }
      setTimeout(tick, 32);
    }
  };

  tick();
})();

// ===== discord avatar via lanyard =====
(async function avatar() {
  const img = document.getElementById("avatar");
  if (!img) return;
  try {
    const res = await fetch("https://api.lanyard.rest/v1/users/839321627938390047");
    if (!res.ok) return;
    const { data } = await res.json();
    if (data?.discord_user?.avatar) {
      const id = data.discord_user.id;
      const hash = data.discord_user.avatar;
      img.src = `https://cdn.discordapp.com/avatars/${id}/${hash}.png?size=256`;
    }
  } catch {}
})();

// ===== copy discord =====
(function copyDiscord() {
  const btn = document.getElementById("copy-discord");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("kynvyr_");
      showToast("discord copied");
    } catch {
      showToast("kynvyr_");
    }
  });
})();

// ===== copy script loaders =====
document.querySelectorAll(".copy").forEach(btn => {
  btn.addEventListener("click", async () => {
    const code = document.getElementById(btn.dataset.target)?.textContent;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    const old = btn.textContent;
    btn.textContent = "copied";
    btn.classList.add("done");
    showToast();
    setTimeout(() => { btn.textContent = old; btn.classList.remove("done"); }, 1600);
  });
});

// ===== profile card video hover =====
document.querySelectorAll(".pcard-banner video").forEach(v => {
  const card = v.closest(".pcard");
  card?.addEventListener("mouseenter", () => v.play().catch(() => {}));
  card?.addEventListener("mouseleave", () => { v.pause(); v.currentTime = 0; });
});

// ===== toast =====
const toast = document.getElementById("toast");
let toastTimer;
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg || "copied to clipboard";
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}
