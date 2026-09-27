(() => {
  const canvas = document.getElementById('pointer-stars');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;

  const desktop = window.matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const palette = ['#e9efff', '#9dbbff', '#f2dca4'];
  const stars = [];
  const mouse = { x: -1000, y: -1000 };
  let frame = 0;
  let width = 0;
  let height = 0;

  function makeSky() {
    stars.length = 0;
    const count = Math.min(260, Math.max(110, Math.round(width * height / 5900)));
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      stars.push({
        homeX: x, homeY: y, x, y, vx: 0, vy: 0,
        size: Math.random() < .15 ? 2.2 + Math.random() * 1.7 : .65 + Math.random() * 1.15,
        color: palette[(Math.random() * palette.length) | 0],
        opacity: .35 + Math.random() * .55,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (desktop.matches) makeSky();
    refresh();
  }

  function paintStar(s, time) {
    const twinkle = reducedMotion.matches ? 1 : .88 + Math.sin(time * .0014 + s.phase) * .12;
    ctx.globalAlpha = s.opacity * twinkle;
    ctx.fillStyle = s.color;
    if (s.size < 2.2) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    } else {
      const r = s.size;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y - r * 1.8);
      ctx.quadraticCurveTo(s.x + r * .26, s.y - r * .26, s.x + r, s.y);
      ctx.quadraticCurveTo(s.x + r * .26, s.y + r * .26, s.x, s.y + r * 1.8);
      ctx.quadraticCurveTo(s.x - r * .26, s.y + r * .26, s.x - r, s.y);
      ctx.quadraticCurveTo(s.x - r * .26, s.y - r * .26, s.x, s.y - r * 1.8);
      ctx.closePath();
    }
    ctx.fill();
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    if (!desktop.matches) return;

    for (const s of stars) {
      if (!reducedMotion.matches) {
        const dx = s.x - mouse.x;
        const dy = s.y - mouse.y;
        const distance = Math.hypot(dx, dy);
        const radius = 145;
        if (distance < radius) {
          const force = (1 - distance / radius) * .9;
          const angle = distance > .01 ? Math.atan2(dy, dx) : s.phase;
          s.vx += Math.cos(angle) * force;
          s.vy += Math.sin(angle) * force;
        }
        s.vx += (s.homeX - s.x) * .018;
        s.vy += (s.homeY - s.y) * .018;
        s.vx *= .86;
        s.vy *= .86;
        s.x += s.vx;
        s.y += s.vy;
      }
      paintStar(s, time);
    }
    ctx.globalAlpha = 1;
    if (!reducedMotion.matches) frame = requestAnimationFrame(draw);
  }

  function refresh() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!desktop.matches) {
      ctx.clearRect(0, 0, width, height);
      return;
    }
    if (!stars.length) makeSky();
    frame = requestAnimationFrame(draw);
  }

  window.addEventListener('pointermove', (event) => {
    if (!desktop.matches || event.pointerType === 'touch') return;
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { mouse.x = -1000; mouse.y = -1000; });
  window.addEventListener('blur', () => { mouse.x = -1000; mouse.y = -1000; });
  window.addEventListener('resize', resize, { passive: true });
  desktop.addEventListener('change', resize);
  reducedMotion.addEventListener('change', refresh);
  resize();
})();
