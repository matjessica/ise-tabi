/* =============================================
   ui.js — アコーディオン・チェックリスト
   ============================================= */

(function () {
  'use strict';

  const STORAGE_KEY = 'ise-tabi-v2-checklist';

  /* ─────────────────────────────────────────
     1. アコーディオン
  ───────────────────────────────────────── */
  function initAccordion() {
    document.querySelectorAll('.accordion-btn').forEach(btn => {
      const body = btn.nextElementSibling;
      if (!body || !body.classList.contains('accordion-body')) return;

      btn.addEventListener('click', () => {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';

        if (isOpen) {
          // 閉じる
          btn.setAttribute('aria-expanded', 'false');
          body.classList.remove('open');
        } else {
          // 開く
          btn.setAttribute('aria-expanded', 'true');
          body.classList.add('open');
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     2. チェックリスト
  ───────────────────────────────────────── */
  function loadStates() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (_) { return {}; }
  }

  function saveStates(states) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(states)); }
    catch (_) {}
  }

  function applyState(item, checked) {
    const btn  = item.querySelector('.check-btn');
    const icon = item.querySelector('.check-icon');
    const label = item.querySelector('.check-label');

    if (checked) {
      item.classList.add('checked');
      btn.setAttribute('aria-pressed', 'true');
      if (icon)  icon.textContent = '✓';
      if (label) label.setAttribute('aria-label', label.textContent + '（完了）');
    } else {
      item.classList.remove('checked');
      btn.setAttribute('aria-pressed', 'false');
      if (icon)  icon.textContent = '';
      if (label) label.removeAttribute('aria-label');
    }
  }

  function checkAllDone(items) {
    const allDone = [...items].every(it => it.classList.contains('checked'));
    const msg     = document.getElementById('complete-msg');
    if (!msg) return;
    if (allDone) {
      msg.classList.add('visible');
    } else {
      msg.classList.remove('visible');
    }
  }

  function initChecklist() {
    const items  = document.querySelectorAll('.check-item');
    if (!items.length) return;

    const states = loadStates();

    items.forEach((item, idx) => {
      // 状態を復元
      if (states[idx]) applyState(item, true);

      const btn = item.querySelector('.check-btn');
      if (!btn) return;

      btn.addEventListener('click', () => {
        const next     = !item.classList.contains('checked');
        applyState(item, next);

        // 保存
        const newStates = {};
        items.forEach((it, i) => { newStates[i] = it.classList.contains('checked'); });
        saveStates(newStates);

        // 完了メッセージ
        checkAllDone(items);
      });
    });

    // 復元後に完了判定
    checkAllDone(items);
  }

  /* ─────────────────────────────────────────
     初期化
  ───────────────────────────────────────── */
  function init() {
    initAccordion();
    initChecklist();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
