/* =============================================
   animation.js — Canvas波 + スクロール演出
   ============================================= */

const WaveAnimation = (() => {
  const canvas = document.getElementById('wave-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, raf;
  let trainX;       // しまかぜX座標
  const trainImg = new Image();
  trainImg.src = 'assets/shimakaze.svg';

  const waves = [
    { amp: 18, freq: 0.018, speed: 0.012, phase: 0,    alpha: 0.22, color: '#1ABC9C' },
    { amp: 12, freq: 0.025, speed: 0.018, phase: 2.1,  alpha: 0.18, color: '#2E86C1' },
    { amp: 22, freq: 0.013, speed: 0.008, phase: 1.0,  alpha: 0.14, color: '#0d3b5e' },
    { amp: 8,  freq: 0.040, speed: 0.030, phase: 3.5,  alpha: 0.12, color: '#16a085' },
  ];

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;
    if (trainX === undefined) trainX = W + 50;
  }

  function drawWave(w, t) {
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 2) {
      const y = H * 0.62 + Math.sin(x * w.freq + w.phase + t * w.speed) * w.amp
                          + Math.sin(x * w.freq * 1.7 + w.phase * 0.6 + t * w.speed * 1.3) * (w.amp * 0.4);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = w.color;
    ctx.globalAlpha = w.alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawTrain(t) {
    const TW = Math.min(W * 0.55, 200);
    const TH = TW * (72 / 340);
    const ty = H * 0.52 - TH - 2 + Math.sin(t * 0.008) * 3;  // 波に乗る上下揺れ

    // 列車が右から流れて左端に消え、右端から再登場
    trainX -= 0.45;
    if (trainX < -TW - 10) trainX = W + 10;

    if (trainImg.complete && trainImg.naturalWidth > 0) {
      ctx.globalAlpha = 0.88;
      ctx.drawImage(trainImg, trainX, ty, TW, TH);
      ctx.globalAlpha = 1;
    } else {
      // フォールバック：シンプルな矩形
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.roundRect(trainX, ty, TW, TH, 6);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    waves.forEach(w => drawWave(w, t));
    drawTrain(t);
    t++;
    raf = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    window.addEventListener('resize', resize);
    trainImg.onload = () => {};   // onloadされたら次フレームで描画される
    draw();
  }

  return { init };
})();


/* =============================================
   スクロールフェードイン
   ============================================= */
const ScrollFade = (() => {
  function init() {
    const els = document.querySelectorAll('.fade-up');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseFloat(el.dataset.delay || 0);
        setTimeout(() => el.classList.add('visible'), delay * 1000);
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    els.forEach(el => obs.observe(el));
  }

  return { init };
})();


/* =============================================
   タイムラインドットアニメーション
   ============================================= */
const TimelineAnim = (() => {
  function init() {
    const dots = document.querySelectorAll('.tl-dot');
    if (!dots.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const dot = entry.target;
        const idx = parseInt(dot.dataset.idx || 0);
        setTimeout(() => dot.classList.add('pop'), idx * 120);
        obs.unobserve(dot);
      });
    }, { threshold: 0.5 });

    dots.forEach(dot => obs.observe(dot));
  }

  return { init };
})();
