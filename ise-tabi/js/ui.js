/* =============================================
   ui.js — タブ・カードフリップ・チェックリスト
   ============================================= */

/* ── タブ切り替え ─────────────────────────── */
const TabManager = (() => {
  function init() {
    const btns   = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        panels.forEach(p => {
          if (p.id === target) {
            p.classList.add('active');
          } else {
            p.classList.remove('active');
          }
        });

        // パネル内のfade-upを再起動（非表示→表示時に再アニメ）
        const activePanel = document.getElementById(target);
        if (activePanel) {
          activePanel.querySelectorAll('.fade-up:not(.visible)').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 120);
          });
        }
      });
    });

    // 初期パネルのフェードイン起動
    const firstPanel = document.querySelector('.tab-panel.active');
    if (firstPanel) {
      firstPanel.querySelectorAll('.fade-up').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 120);
      });
    }
  }

  return { init };
})();


/* ── カードフリップ ───────────────────────── */
const CardFlip = (() => {
  function init() {
    document.querySelectorAll('.flip-wrapper').forEach(wrapper => {
      wrapper.addEventListener('click', () => {
        wrapper.classList.toggle('flipped');
      });
    });
  }
  return { init };
})();


/* ── 紙吹雪（DOM自作） ────────────────────── */
const Confetti = (() => {
  const colors = [
    '#1ABC9C', '#1B5E8A', '#F1C40F', '#E74C3C',
    '#9B59B6', '#2ECC71', '#E67E22', '#3498DB',
  ];

  function launch() {
    const container = document.getElementById('confetti-container');
    if (!container) return;

    const count = 80;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'confetti-piece';

        const size   = 6 + Math.random() * 8;
        const left   = Math.random() * 100;
        const drift  = (Math.random() - 0.5) * 120 + 'px';
        const dur    = 1.8 + Math.random() * 1.6;
        const delay  = Math.random() * 0.5;
        const color  = colors[Math.floor(Math.random() * colors.length)];
        const radius = Math.random() > 0.4 ? '50%' : '2px';

        el.style.cssText = `
          left:${left}%;
          width:${size}px; height:${size}px;
          background:${color};
          border-radius:${radius};
          --drift:${drift};
          animation-duration:${dur}s;
          animation-delay:${delay}s;
        `;
        container.appendChild(el);

        el.addEventListener('animationend', () => el.remove());
      }, i * 18);
    }
  }

  return { launch };
})();


/* ── 予約チェックリスト ───────────────────── */
const Checklist = (() => {
  const STORAGE_KEY = 'ise-tabi-checklist';

  function save(states) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(states)); } catch (_) {}
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (_) { return {}; }
  }

  function updateBanner(items) {
    const banner  = document.getElementById('complete-banner');
    if (!banner) return;
    const allDone = [...items].every(item => item.classList.contains('checked'));
    banner.style.display = allDone ? 'block' : 'none';
    if (allDone) Confetti.launch();
  }

  function init() {
    const items  = document.querySelectorAll('.check-item');
    if (!items.length) return;

    const states = load();

    items.forEach((item, idx) => {
      // 状態復元
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

  return { init };
})();
