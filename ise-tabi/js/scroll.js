/* =============================================
   scroll.js — パララックス・スクロール演出
   ============================================= */

(function () {
  'use strict';

  /* ── ユーティリティ ── */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────
     1. プログレスバー
  ───────────────────────────────────────── */
  const progressEl = document.getElementById('progress');
  function updateProgress() {
    if (!progressEl) return;
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    progressEl.style.width = total > 0 ? (scrolled / total * 100).toFixed(2) + '%' : '0%';
  }

  /* ─────────────────────────────────────────
     2. パララックス（RAF ループ）
        スクロール速度の 0.4 倍で画像が動く
  ───────────────────────────────────────── */
  const parallaxImgs = Array.from(document.querySelectorAll('.parallax-img'));
  let   rafId        = null;

  function applyParallax() {
    const vh = window.innerHeight;
    parallaxImgs.forEach(img => {
      const block = img.closest('.img-block');
      if (!block) return;
      const rect = block.getBoundingClientRect();
      // 画面外は処理しない
      if (rect.bottom < -100 || rect.top > vh + 100) return;
      const center = rect.top + rect.height / 2 - vh / 2;
      img.style.transform = `translateY(${(center * 0.4).toFixed(2)}px)`;
    });
    rafId = requestAnimationFrame(applyParallax);
  }

  function startParallax() {
    if (!prefersReduced && parallaxImgs.length > 0) {
      rafId = requestAnimationFrame(applyParallax);
    }
  }

  function stopParallax() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  /* タブ非表示時に RAF を止める */
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopParallax() : startParallax();
  });

  /* ─────────────────────────────────────────
     3. 画像ロード処理（skeleton → フェードイン・フォールバック）
  ───────────────────────────────────────── */
  parallaxImgs.forEach(img => {
    const block    = img.closest('.img-block');
    const fallback = block ? (block.dataset.fallback || '#111111') : '#111111';

    // 代替背景色をセット（画像が来るまでスケルトン）
    if (block) block.style.backgroundColor = fallback;

    function markLoaded() { img.classList.add('loaded'); }

    if (img.complete && img.naturalWidth > 0) {
      markLoaded();
    } else {
      img.addEventListener('load',  markLoaded, { once: true });
      img.addEventListener('error', () => {
        // 画像が存在しない → imgを非表示にし、代替背景色のままにする
        img.style.display = 'none';
      }, { once: true });
    }
  });

  /* ─────────────────────────────────────────
     4. スクロールイベント（一元化）
  ───────────────────────────────────────── */
  function onScroll() {
    updateProgress();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─────────────────────────────────────────
     5. IntersectionObserver — 共通フェードイン
  ───────────────────────────────────────── */
  function observeFadeIn() {
    const els = document.querySelectorAll('.fade-in');
    if (!els.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

    els.forEach(el => obs.observe(el));
  }

  /* ─────────────────────────────────────────
     6. テキストリビール（clip-path）
  ───────────────────────────────────────── */
  function observeTextReveal() {
    const els = document.querySelectorAll('.reveal-text');
    if (!els.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.2 });

    els.forEach(el => obs.observe(el));
  }

  /* ─────────────────────────────────────────
     7. ラインドロー
  ───────────────────────────────────────── */
  function observeLineDraw() {
    const els = document.querySelectorAll('.reveal-line');
    if (!els.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('drawn');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    els.forEach(el => obs.observe(el));
  }

  /* ─────────────────────────────────────────
     8. 数字カウントアップ
  ───────────────────────────────────────── */
  function countUp(el, target, duration) {
    if (target === 0) { el.textContent = '0'; return; }
    const startTime = performance.now();
    function step(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }

  function observeCountUp() {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const target   = parseInt(entry.target.dataset.count, 10);
        const duration = prefersReduced ? 0 : 1600;
        countUp(entry.target, target, duration);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    els.forEach(el => obs.observe(el));
  }

  /* ─────────────────────────────────────────
     9. img-block に fade-in スケール演出
        （画像自体のフェードとは別に、ブロック全体を）
  ───────────────────────────────────────── */
  function observeImgBlocks() {
    const blocks = document.querySelectorAll('.img-block.fade-in');
    if (!blocks.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.05 });

    blocks.forEach(el => obs.observe(el));
  }

  /* ─────────────────────────────────────────
     初期化
  ───────────────────────────────────────── */
  function init() {
    updateProgress();
    startParallax();
    observeFadeIn();
    observeTextReveal();
    observeLineDraw();
    observeCountUp();
    observeImgBlocks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
