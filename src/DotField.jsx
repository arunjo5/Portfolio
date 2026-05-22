import React from 'react';

function hexToRgbStr(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return '24,28,40';
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

function DotField({ density = 'regular', intensity = 1, dark = false, paused = false, effect = 'ripple', color = null }) {
  const canvasRef = React.useRef(null);
  const stateRef = React.useRef({
    dots: [],
    pairs: [],
    swarmIdx: [],
    ripples: [],
    particles: [],
    trail: [],
    mouse: { x: -9999, y: -9999, lastSpawn: 0, lastX: -9999, lastY: -9999 },
    w: 0, h: 0, dpr: 1, lastT: 0,
  });

  const spacing = typeof density === 'number'
    ? density
    : ({ sparse: 56, regular: 42, dense: 30 }[density] ?? 42);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const st = stateRef.current;
    let raf = 0;

    const layoutDots = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      st.w = rect.width;
      st.h = rect.height;
      st.dpr = dpr;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(rect.width / spacing) + 1;
      const rows = Math.ceil(rect.height / spacing) + 1;
      const offX = (rect.width - (cols - 1) * spacing) / 2;
      const offY = (rect.height - (rows - 1) * spacing) / 2;
      const dots = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const seed = (r * 73856093) ^ (c * 19349663);
          const jx = ((seed & 0xff) / 255 - 0.5) * 4;
          const jy = (((seed >> 8) & 0xff) / 255 - 0.5) * 4;
          const hx = offX + c * spacing + jx;
          const hy = offY + r * spacing + jy;
          dots.push({
            hx, hy,
            x: hx, y: hy,
            vx: 0, vy: 0,
            phase: ((seed >> 16) & 0xff) / 255 * Math.PI * 2,
            heat: 0,
          });
        }
      }
      st.dots = dots;

      const MAX = spacing * 1.85;
      const pairs = [];
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].hx - dots[j].hx;
          const dy = dots[i].hy - dots[j].hy;
          if (dx * dx + dy * dy < MAX * MAX) pairs.push([i, j]);
        }
      }
      st.pairs = pairs;

      const swarmIdx = [];
      for (let i = 0; i < dots.length; i++) {
        const seed = (i * 2654435761) >>> 0;
        if ((seed & 0xff) / 255 < 0.06) swarmIdx.push(i);
      }
      st.swarmIdx = swarmIdx;
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      st.mouse.x = x;
      st.mouse.y = y;
      const now = performance.now();
      const dx = x - st.mouse.lastX;
      const dy = y - st.mouse.lastY;
      const moved = Math.hypot(dx, dy);
      if (now - st.mouse.lastSpawn > 90 && moved > 6) {
        st.ripples.push({ x, y, t0: now });
        st.mouse.lastSpawn = now;
        st.mouse.lastX = x;
        st.mouse.lastY = y;
        if (st.ripples.length > 24) st.ripples.shift();
      }
      if (moved > 3) {
        st.trail.push({ x, y, t: now });
        if (st.trail.length > 80) st.trail.shift();
      }
    };
    const onLeave = () => { st.mouse.x = -9999; st.mouse.y = -9999; };
    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      st.ripples.push({ x: cx, y: cy, t0: performance.now(), strong: true });

      const N = 22;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2 + Math.random() * 0.3;
        const sp = 140 + Math.random() * 180;
        st.particles.push({
          x: cx, y: cy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 60,
          t0: performance.now(),
          life: 900 + Math.random() * 600,
        });
      }
      if (st.particles.length > 200) st.particles.splice(0, st.particles.length - 200);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('click', onClick);

    layoutDots();
    const ro = new ResizeObserver(layoutDots);
    ro.observe(canvas);

    const SPEED = 420;
    const SIGMA = 60;
    const LIFETIME = 2200;
    const TRAIL_MS = 700;
    const baseInk = color ? hexToRgbStr(color) : (dark ? '255,255,255' : '24,28,40');

    const frame = (t) => {
      if (paused) { raf = requestAnimationFrame(frame); return; }
      const dt = st.lastT ? Math.min(50, t - st.lastT) / 1000 : 0.016;
      st.lastT = t;
      const w = st.w, h = st.h;
      ctx.clearRect(0, 0, w, h);

      const now = t;
      st.ripples = st.ripples.filter((r) => now - r.t0 < LIFETIME);
      if (effect === 'trail') st.trail = st.trail.filter((s) => now - s.t < TRAIL_MS);
      if (effect === 'confetti') {
        st.particles = st.particles.filter((p) => now - p.t0 < p.life);
      }

      const ambT = now / 1800;
      const PROX_SIGMA = effect === 'glow' || effect === 'spotlight' ? 110 : 80;
      const FORCE_RADIUS = 140;
      const FORCE_MAX = 16;
      const mx = st.mouse.x, my = st.mouse.y;
      const mouseLive = mx > -1000;

      if (effect === 'elastic') {
        const K = 18;
        const D = 4.5;
        const PUSH_R = 120;
        const PUSH = 1100 * intensity;
        for (let i = 0; i < st.dots.length; i++) {
          const d = st.dots[i];
          let fx = (d.hx - d.x) * K;
          let fy = (d.hy - d.y) * K;
          if (mouseLive) {
            const ddx = d.x - mx;
            const ddy = d.y - my;
            const dd = Math.sqrt(ddx * ddx + ddy * ddy);
            if (dd < PUSH_R && dd > 0.1) {
              const t = 1 - dd / PUSH_R;
              const mag = PUSH * t * t / dd;
              fx += ddx * mag;
              fy += ddy * mag;
            }
          }
          d.vx = (d.vx + fx * dt) * (1 - D * dt);
          d.vy = (d.vy + fy * dt) * (1 - D * dt);
          d.x += d.vx * dt;
          d.y += d.vy * dt;
        }
      } else {

        for (let i = 0; i < st.dots.length; i++) {
          const d = st.dots[i];
          d.x = d.hx; d.y = d.hy;
        }
      }

      if (effect === 'swarm' && mouseLive) {
        for (let k = 0; k < st.swarmIdx.length; k++) {
          const i = st.swarmIdx[k];
          const d = st.dots[i];

          const lag = 0.04 + (k % 7) * 0.012;
          d.x = d.x + (mx + (k % 5 - 2) * 12 - d.x) * lag * intensity * (1 + dt * 30);
          d.y = d.y + (my + ((k * 3) % 5 - 2) * 12 - d.y) * lag * intensity * (1 + dt * 30);
        }
      }

      if (effect === 'heatmap' || effect === 'synapse') {
        const decay = Math.exp(-0.6 * dt);
        for (let i = 0; i < st.dots.length; i++) {
          const d = st.dots[i];
          d.heat *= decay;
          if (mouseLive) {
            const ddx = d.hx - mx, ddy = d.hy - my;
            const dd2 = ddx * ddx + ddy * ddy;
            const add = Math.exp(-dd2 / (2 * 42 * 42)) * dt * 4.5 * intensity;
            d.heat = Math.min(1.4, d.heat + add);
          }
        }
      }

      if (effect === 'constellation') {
        ctx.lineWidth = 0.6;
        for (let p = 0; p < st.pairs.length; p++) {
          const [i, j] = st.pairs[p];
          const a = st.dots[i], b = st.dots[j];

          let bias = 0.35;
          if (mouseLive) {
            const cxm = (a.x + b.x) * 0.5 - mx;
            const cym = (a.y + b.y) * 0.5 - my;
            bias += Math.exp(-(cxm * cxm + cym * cym) / (2 * 130 * 130)) * 0.6 * intensity;
          }
          const op = Math.min(0.5, bias * (dark ? 0.18 : 0.13));
          if (op < 0.015) continue;
          ctx.strokeStyle = `rgba(${baseInk},${op})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        if (mouseLive) {
          for (let i = 0; i < st.dots.length; i++) {
            const d = st.dots[i];
            const ddx = d.x - mx, ddy = d.y - my;
            const dd2 = ddx * ddx + ddy * ddy;
            if (dd2 > 95 * 95) continue;
            const k = Math.exp(-dd2 / (2 * 55 * 55)) * intensity;
            ctx.strokeStyle = `rgba(${baseInk},${Math.min(0.5, k * 0.55)})`;
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(d.x, d.y);
            ctx.stroke();
          }
        }
      }

      if (effect === 'synapse') {
        ctx.lineWidth = 0.7;
        for (let p = 0; p < st.pairs.length; p++) {
          const [i, j] = st.pairs[p];
          const a = st.dots[i], b = st.dots[j];

          const k = Math.min(a.heat, b.heat);
          if (k < 0.05) continue;
          const op = Math.min(0.7, k * 0.9);
          ctx.strokeStyle = `rgba(${baseInk},${op})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        if (mouseLive) {
          for (let i = 0; i < st.dots.length; i++) {
            const d = st.dots[i];
            const ddx = d.x - mx, ddy = d.y - my;
            const dd2 = ddx * ddx + ddy * ddy;
            if (dd2 > 70 * 70) continue;
            const k = Math.exp(-dd2 / (2 * 45 * 45)) * intensity;
            ctx.strokeStyle = `rgba(${baseInk},${Math.min(0.4, k * 0.4)})`;
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(d.x, d.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < st.dots.length; i++) {
        const d = st.dots[i];

        let wave = 0;
        if (effect === 'ripple') {
          for (let j = 0; j < st.ripples.length; j++) {
            const r = st.ripples[j];
            const age = (now - r.t0) / 1000;
            const dx = d.x - r.x, dy = d.y - r.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const delta = dist - age * SPEED;
            const decay = Math.exp(-age * 1.5);
            const amp = (r.strong ? 1.5 : 1) * decay * Math.exp(-(delta * delta) / (2 * SIGMA * SIGMA));
            wave += amp;
          }
        }

        const mdx = d.x - mx, mdy = d.y - my;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        const prox = mouseLive ? Math.exp(-(mdist * mdist) / (2 * PROX_SIGMA * PROX_SIGMA)) : 0;

        let trail = 0;
        if (effect === 'trail' && st.trail.length) {
          for (let s = 0; s < st.trail.length; s++) {
            const ts = st.trail[s];
            const ageN = 1 - (now - ts.t) / TRAIL_MS;
            if (ageN <= 0) continue;
            const tdx = d.x - ts.x, tdy = d.y - ts.y;
            const td2 = tdx * tdx + tdy * tdy;
            const k = ageN * Math.exp(-td2 / (2 * 55 * 55));
            if (k > trail) trail = k;
          }
        }

        let ox = 0, oy = 0;
        if ((effect === 'repel' || effect === 'attract') && mdist < FORCE_RADIUS && mdist > 0.01 && mouseLive) {
          const t = 1 - mdist / FORCE_RADIUS;
          const fall = t * t;
          const mag = FORCE_MAX * fall * intensity;
          const sign = effect === 'repel' ? 1 : -1;
          ox = (mdx / mdist) * mag * sign;
          oy = (mdy / mdist) * mag * sign;
        }

        if (effect === 'zdepth' && mdist < 200 && mouseLive) {
          const t = Math.max(0, 1 - mdist / 200);
          ox = -mdx * t * 0.18 * intensity;
          oy = -mdy * t * 0.18 * intensity;
        }

        const ambient = 0.5 + 0.5 * Math.sin(ambT + d.phase);

        let baseR = 1.15 + 0.25 * ambient;
        let baseOpacity = dark ? 0.22 : 0.18;
        let r = baseR;
        let opacity = baseOpacity + ambient * 0.04;

        if (effect === 'ripple') {
          const k = Math.min(1.6, wave * intensity);
          r += k * 1.8 + prox * 1.2;
          opacity += k * 0.32 + prox * 0.22;
        } else if (effect === 'glow') {
          const g = prox * intensity;
          r += g * 2.6;
          opacity += g * 0.55;
        } else if (effect === 'trail') {
          r += trail * 2.1 * intensity + prox * 0.5;
          opacity += trail * 0.5 * intensity + prox * 0.15;
        } else if (effect === 'repel' || effect === 'attract') {
          r += prox * 0.9;
          opacity += prox * 0.18;
        } else if (effect === 'spotlight') {

          opacity = 0.04 + prox * 0.85 * intensity;
          r = baseR + prox * 2.0 * intensity;
        } else if (effect === 'heatmap') {
          r += d.heat * 2.0;
          opacity = Math.min(0.85, baseOpacity * 0.55 + d.heat * 0.55);
        } else if (effect === 'elastic') {

          const disp = Math.sqrt((d.x - d.hx) ** 2 + (d.y - d.hy) ** 2);
          r += Math.min(1.5, disp / 25);
          opacity += Math.min(0.3, disp / 70) + prox * 0.18;
        } else if (effect === 'zdepth') {

          const t = mouseLive ? Math.max(0, 1 - mdist / 200) : 0;
          r += t * t * 2.4 * intensity;
          opacity += t * t * 0.45 * intensity;
        } else if (effect === 'rings') {

          if (mouseLive) {
            const SP = 38;
            const phase = (mdist / SP) - now / 700;
            const ring = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);

            const fall = Math.exp(-mdist / 380);
            opacity = baseOpacity * 0.4 + ring * 0.55 * fall * intensity;
            r = baseR + ring * 1.4 * fall * intensity;
          }
        } else if (effect === 'constellation') {

          r += prox * 1.2;
          opacity += prox * 0.25;
        } else if (effect === 'synapse') {

          r += d.heat * 1.7 + prox * 0.7;
          opacity = Math.min(0.85, baseOpacity * 0.55 + d.heat * 0.5 + prox * 0.15);
        } else if (effect === 'swarm') {

          const swarming = d.x !== d.hx || d.y !== d.hy;
          if (swarming) {
            r += 1.0;
            opacity += 0.25;
          }
          opacity += prox * 0.15;
        } else if (effect === 'confetti') {

          opacity += prox * 0.15;
        }

        opacity = Math.min(0.92, opacity);

        ctx.beginPath();
        ctx.fillStyle = `rgba(${baseInk},${opacity})`;
        ctx.arc(d.x + ox, d.y + oy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (effect === 'confetti' && st.particles.length) {
        const G = 380;
        for (let i = 0; i < st.particles.length; i++) {
          const p = st.particles[i];
          p.vy += G * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          const age = (now - p.t0) / p.life;
          const op = Math.max(0, 1 - age) * 0.95;
          const rad = 1.8 + (1 - age) * 1.6;
          ctx.beginPath();
          ctx.fillStyle = `rgba(${baseInk},${op})`;
          ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('click', onClick);
      ro.disconnect();
    };
  }, [spacing, intensity, dark, paused, effect, color]);

  return (
    <canvas
      ref={canvasRef}
      className="dot-field"
      aria-hidden="true"
    />
  );
}

export default DotField;