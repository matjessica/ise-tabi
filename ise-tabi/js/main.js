/* =============================================
   main.js — 初期化・共通処理
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── スクロールプログレスバー ── */
  const bar = document.getElementById('progress-bar');
  if (bar) {
    const updateBar = () => {
      const scrollTop  = window.scrollY;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width  = pct.toFixed(1) + '%';
    };
    window.addEventListener('scroll', updateBar, { passive: true });
    updateBar();
  }

  /* ── ヘッダータイトル文字分割アニメーション ── */
  const titleEl = document.querySelector('.header-title');
  if (titleEl) {
    const text = titleEl.textContent;
    titleEl.innerHTML = [...text].map((ch, i) => {
      const span = document.createElement('span');
      span.textContent = ch;
      span.style.animationDelay = (i * 0.12) + 's';
      return span.outerHTML;
    }).join('');
  }

  /* ── モジュール初期化 ── */
  WaveAnimation.init();
  ScrollFade.init();
  TimelineAnim.init();
  TabManager.init();
  CardFlip.init();
  Checklist.init();

});
