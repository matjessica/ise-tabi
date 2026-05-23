/* main.js — 初期化・プログレスバー */

document.addEventListener('DOMContentLoaded', () => {

  /* プログレスバー */
  const bar = document.getElementById('progress-bar');
  if (bar) {
    const update = () => {
      const scrollTop = window.scrollY;
      const docH      = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (docH > 0 ? (scrollTop / docH) * 100 : 0).toFixed(1) + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ヘッダータイトル文字分割 */
  const titleEl = document.querySelector('.header-title');
  if (titleEl) {
    const text = titleEl.textContent;
    titleEl.innerHTML = [...text].map((ch, i) =>
      `<span style="animation-delay:${(i * 0.13).toFixed(2)}s">${ch}</span>`
    ).join('');
  }

  /* モジュール初期化 */
  WaveAnimation.init();
  ScrollFade.init();
  TimelineAnim.init();
  CardFlip.init();
  Checklist.init();

});
