// ===== aim.cfg site =====

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
    let n = 0;
    const step = Math.max(1, Math.round(target / 28));
    const tick = () => {
      n += step;
      if (n >= target) { el.textContent = target; }
      else { el.textContent = n; requestAnimationFrame(tick); }
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
