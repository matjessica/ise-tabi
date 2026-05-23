/* animation.js — Canvas波 + しまかぜ（Canvas描画）+ スクロール演出 */

const WaveAnimation = (() => {
  const canvas = document.getElementById('wave-canvas');
  if (!canvas) return { init: () => {} };
  const ctx = canvas.getContext('2d');

  let W, H, t = 0;
  let trainX;

  const waves = [
    { amp: 20, freq: 0.016, speed: 0.010, phase: 0.0, alpha: 0.20, color: '#1ABC9C' },
    { amp: 13, freq: 0.024, speed: 0.016, phase: 2.2, alpha: 0.16, color: '#2E86C1' },
    { amp: 24, freq: 0.011, speed: 0.007, phase: 1.1, alpha: 0.13, color: '#0a2e4a' },
    { amp:  9, freq: 0.038, speed: 0.028, phase: 3.6, alpha: 0.11, color: '#16a085' },
  ];

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;
    if (trainX === undefined) trainX = W + 60;
  }

  function drawWave(w, tick) {
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 3) {
      const y = H * 0.60
        + Math.sin(x * w.freq + w.phase + tick * w.speed) * w.amp
        + Math.sin(x * w.freq * 1.8 + w.phase * 0.5 + tick * w.speed * 1.4) * (w.amp * 0.35);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.globalAlpha = w.alpha;
    ctx.fillStyle = w.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /* しまかぜをCanvasで直接描く（SVG不使用） */
  function drawTrain(tick) {
    const TW = Math.min(W * 0.58, 210);
    const TH = TW * 0.20;
    const ty = H * 0.50 - TH + Math.sin(tick * 0.007) * 2.5;  // 波上下揺れ
    const tx = trainX;
    const nw = TH * 0.65;  // 先頭ノーズ幅

    ctx.save();
    ctx.globalAlpha = 0.86;

    /* --- 車体グラデーション --- */
    const bodyGrad = ctx.createLinearGradient(tx, ty, tx, ty + TH * 0.85);
    bodyGrad.addColorStop(0,   'rgba(235,248,255,0.95)');
    bodyGrad.addColorStop(0.5, 'rgba(210,235,250,0.90)');
    bodyGrad.addColorStop(1,   'rgba(180,215,240,0.88)');

    ctx.beginPath();
    ctx.moveTo(tx + nw, ty);
    // ノーズ（左向き）
    ctx.bezierCurveTo(tx + nw * 0.25, ty, tx - TH * 0.35, ty + TH * 0.28, tx - TH * 0.35, ty + TH * 0.5 * 0.85);
    ctx.bezierCurveTo(tx - TH * 0.35, ty + TH * 0.72, tx + nw * 0.25, ty + TH * 0.85, tx + nw, ty + TH * 0.85);
    ctx.lineTo(tx + TW, ty + TH * 0.85);
    ctx.lineTo(tx + TW, ty);
    ctx.closePath();
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    /* --- 窓帯 --- */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tx + nw, ty);
    ctx.lineTo(tx + TW, ty);
    ctx.lineTo(tx + TW, ty + TH * 0.85);
    ctx.lineTo(tx + nw, ty + TH * 0.85);
    ctx.bezierCurveTo(tx + nw * 0.25, ty + TH * 0.85, tx - TH * 0.35, ty + TH * 0.72, tx - TH * 0.35, ty + TH * 0.5 * 0.85);
    ctx.bezierCurveTo(tx - TH * 0.35, ty + TH * 0.28, tx + nw * 0.25, ty, tx + nw, ty);
    ctx.clip();

    ctx.fillStyle = 'rgba(90,160,210,0.45)';
    ctx.fillRect(tx + nw * 0.7, ty + TH * 0.12, TW - nw * 0.7, TH * 0.32);
    ctx.restore();

    /* --- 赤ストライプ（しまかぜカラー） --- */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tx + nw, ty);
    ctx.lineTo(tx + TW, ty);
    ctx.lineTo(tx + TW, ty + TH * 0.85);
    ctx.lineTo(tx + nw, ty + TH * 0.85);
    ctx.bezierCurveTo(tx + nw * 0.25, ty + TH * 0.85, tx - TH * 0.35, ty + TH * 0.72, tx - TH * 0.35, ty + TH * 0.5 * 0.85);
    ctx.bezierCurveTo(tx - TH * 0.35, ty + TH * 0.28, tx + nw * 0.25, ty, tx + nw, ty);
    ctx.clip();
    ctx.fillStyle = 'rgba(200,55,35,0.65)';
    ctx.fillRect(tx + nw * 0.4, ty + TH * 0.60, TW - nw * 0.4, TH * 0.10);
    ctx.fillStyle = 'rgba(235,148,30,0.55)';
    ctx.fillRect(tx + nw * 0.4, ty + TH * 0.72, TW - nw * 0.4, TH * 0.07);
    ctx.restore();

    /* --- 台車 / 車輪 --- */
    const wheelY  = ty + TH * 0.85;
    const wheelR  = TH * 0.14;
    const wheelXs = [0.20, 0.38, 0.60, 0.78];
    ctx.fillStyle = 'rgba(130,160,190,0.72)';
    wheelXs.forEach(p => {
      ctx.beginPath();
      ctx.arc(tx + TW * p, wheelY + wheelR * 0.6, wheelR, 0, Math.PI * 2);
      ctx.fill();
    });

    /* --- パンタグラフ --- */
    const pantXs = [0.35, 0.65];
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.2;
    pantXs.forEach(p => {
      const px = tx + TW * p;
      ctx.beginPath();
      ctx.moveTo(px, ty);
      ctx.lineTo(px - TH * 0.15, ty - TH * 0.3);
      ctx.lineTo(px + TH * 0.15, ty - TH * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px - TH * 0.15, ty - TH * 0.3);
      ctx.lineTo(px + TH * 0.15, ty - TH * 0.3);
      ctx.stroke();
    });

    ctx.restore();

    // 列車を左へ移動、右端から再登場
    trainX -= 0.5;
    if (trainX < -TW - 40) trainX = W + 20;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    waves.forEach(w => drawWave(w, t));
    drawTrain(t);
    t++;
    requestAnimationFrame(draw);
  }

  function init() {
    resize();
    window.addEventListener('resize', resize);
    draw();
  }

  return { init };
})();


/* ── スクロールフェードイン ── */
const ScrollFade = (() => {
  function init() {
    const els = document.querySelectorAll('.fade-up');
    if (!els.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = parseFloat(el.dataset.delay || 0) * 1000;
        setTimeout(() => el.classList.add('visible'), delay);
        obs.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -24px 0px' });

    els.forEach(el => obs.observe(el));
  }
  return { init };
})();


/* ── タイムラインドット ── */
const TimelineAnim = (() => {
  function init() {
    const dots = document.querySelectorAll('.tl-dot');
    if (!dots.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const dot = entry.target;
        const idx = parseInt(dot.dataset.idx || 0);
        setTimeout(() => dot.classList.add('pop'), idx * 110);
        obs.unobserve(dot);
      });
    }, { threshold: 0.5 });

    dots.forEach(dot => obs.observe(dot));
  }
  return { init };
})();
