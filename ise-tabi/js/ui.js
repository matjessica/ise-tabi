/* ui.js — カードフリップ・チェックリスト・紙吹雪 */

/* ── カードフリップ ── */
const CardFlip = (() => {
  function init() {
    document.querySelectorAll('.flip-wrapper').forEach(wrapper => {
      wrapper.addEventListener('click', () => wrapper.classList.toggle('flipped'));
    });
  }
  return { init };
})();


/* ── 紙吹雪（DOM自作） ── */
const Confetti = (() => {
  const colors = [
    '#1ABC9C','#1B5E8A','#F1C40F','#E74C3C',
    '#9B59B6','#2ECC71','#E67E22','#3498DB',
  ];

  function launch() {
    const container = document.getElementById('confetti-container');
    if (!container) return;

    for (let i = 0; i < 90; i++) {
      setTimeout(() => {
        const el    = document.createElement('div');
        el.className = 'confetti-piece';
        const size   = 6 + Math.random() * 8;
        const left   = Math.random() * 100;
        const drift  = (Math.random() - 0.5) * 130 + 'px';
        const dur    = 1.8 + Math.random() * 1.8;
        const color  = colors[Math.floor(Math.random() * colors.length)];
        const radius = Math.random() > 0.4 ? '50%' : '3px';
        el.style.cssText = `
          left:${left}%;width:${size}px;height:${size}px;
          background:${color};border-radius:${radius};
          --drift:${drift};
          animation-duration:${dur}s;animation-delay:${Math.random()*0.4}s;
        `;
        container.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
      }, i * 16);
    }
  }
  return { launch };
})();


/* ── チェックリスト ── */
const Checklist = (() => {
  const KEY = 'ise-tabi-checklist';

  function save(states) {
    try { localStorage.setItem(KEY, JSON.stringify(states)); } catch (_) {}
  }
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { return {}; }
  }

  function applyCheck(item, checked) {
    const box = item.querySelector('.check-box');
    if (checked) {
      item.classList.add('checked');
      if (box) box.textContent = '✓';
    } else {
      item.classList.remove('checked');
      if (box) box.textContent = '';
    }
  }

  function updateBanner(items) {
    const banner = document.getElementById('complete-banner');
    if (!banner) return;
    const allDone = [...items].every(it => it.classList.contains('checked'));
    banner.style.display = allDone ? 'block' : 'none';
    if (allDone) Confetti.launch();
  }

  function init() {
    const items  = document.querySelectorAll('.check-item');
    if (!items.length) return;
    const states = load();

    items.forEach((item, idx) => {
      if (states[idx]) applyCheck(item, true);

      item.addEventListener('click', () => {
        const next = !item.classList.contains('checked');
        applyCheck(item, next);
        const newStates = {};
        items.forEach((it, i) => { newStates[i] = it.classList.contains('checked'); });
        save(newStates);
        updateBanner(items);
      });
    });

    updateBanner(items);
  }

  return { init };
})();
