/* =========================================================
   Laboratório da mecha · Dra. Nicoly Medeiros
   Fios de cabelo gerados por código (canvas 2D), com física
   de mola (balançam e reagem ao dedo/mouse) e luz que segue o cursor.
   Uso: HairLab.create(canvas).set({ base, tex, mode, level, reflexo, tecnica, months })
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Paleta: níveis de 1 (preto) a 10 (loiro claríssimo) ---------- */
  const LEVELS = ['#0E0B0A', '#1E1512', '#2E1D15', '#4A2E20', '#6A4128', '#8A5A36', '#A87A4C', '#C49A66', '#DDBE8E', '#EEDDBB'];
  const LEVEL_NAMES = ['Preto', 'Castanho muito escuro', 'Castanho escuro', 'Castanho médio', 'Castanho claro',
    'Loiro escuro', 'Loiro médio', 'Loiro claro', 'Loiro muito claro', 'Loiro claríssimo'];
  const REFLEXOS = {
    natural: { nome: 'Natural', adj: '', tint: null, amt: 0, dot: '#8A5A36' },
    dourado: { nome: 'Dourado', adj: 'dourado', tint: '#E2A93E', amt: 0.34, dot: '#D9A447' },
    acobreado: { nome: 'Acobreado', adj: 'acobreado', tint: '#C2521E', amt: 0.42, dot: '#B9572A' },
    perolado: { nome: 'Perolado', adj: 'perolado', tint: '#F1ECF2', amt: 0.32, dot: '#E9E1E4' },
    cinza: { nome: 'Cinza', adj: 'acinzentado', tint: '#B7B7B2', amt: 0.38, dot: '#ADA9A2' },
  };
  // rec = cuidado recomendado em meses. PROVISÓRIO: confirmar com a Dra. Nicoly.
  const TECNICAS = {
    global: { nome: 'Cor global', desc: 'A mesma cor da raiz às pontas', rec: 2, suave: false },
    esfumada: { nome: 'Raiz esfumada', desc: 'A cor nasce suave a partir da raiz natural', rec: 4, suave: true },
    mechas: { nome: 'Mechas', desc: 'Fios de luz entre o seu tom natural', rec: 4, suave: true },
    pontas: { nome: 'Pontas iluminadas', desc: 'Luz no comprimento e nas pontas', rec: 5, suave: true },
  };

  /* ---------- Cores ---------- */
  const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const smooth = (a, b, t) => { const x = Math.min(1, Math.max(0, (t - a) / (b - a || 1e-6))); return x * x * (3 - 2 * x); };
  const BLACK = [0, 0, 0]; const WHITE = [255, 255, 255]; const SPEC = [255, 248, 236];

  const dreamColors = (level, reflexo) => {
    let c = hex(LEVELS[Math.min(10, Math.max(1, level)) - 1]);
    const r = REFLEXOS[reflexo] || REFLEXOS.natural;
    if (r.tint) c = mix(c, hex(r.tint), r.amt * (0.45 + 0.55 * (level / 10)));
    return { c1: mix(c, BLACK, 0.24), c2: mix(c, WHITE, 0.1), mid: c };
  };
  const nomeDoTom = (level, reflexo) => {
    if (level >= 10 && reflexo === 'cinza') return 'Loiro platinado';
    const adj = (REFLEXOS[reflexo] || REFLEXOS.natural).adj;
    return LEVEL_NAMES[level - 1] + (adj ? ` ${adj}` : '');
  };

  /* ---------- Aleatório com semente (resultado sempre igual) ---------- */
  const seeded = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  const M = 44; // pontos por fio (suficiente para cachos redondos)
  const K = 12; // trechos de cor por fio

  function create(canvas, o = {}) {
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const live = o.interactive !== false && !reduce;
    let W = 0; let H = 0; let dpr = 1;
    let strands = [];
    let under = [];
    let opts = { base: '#3A2318', tex: 'liso', mode: 'hoje', level: 8, reflexo: 'dourado', tecnica: 'esfumada', months: 0 };
    let light = 0.32; let time = 0; let raf = 0; let running = false; let last = 0;
    const pointer = { x: -1e4, y: -1e4, px: 0, py: 0, vx: 0, vy: 0, active: false };

    /* Os fios andam em mechas (grupos que ondulam juntos), como cabelo de verdade.
       liso: caimento reto · ondulado: ondas em "S" alinhadas · cacheado: cachos em espiral por mecha */
    const texParams = () => {
      if (opts.tex === 'ondulado') return { amp: W * 0.055, freq: 1.9, spread: W * 0.022, lenK: 1, loop: 0 };
      if (opts.tex === 'cacheado') return { amp: W * 0.042, freq: 4.8, spread: W * 0.024, lenK: 0.97, loop: 0.5 };
      return { amp: W * 0.006, freq: 0.7, spread: W * 0.07, lenK: 1, loop: 0 };
    };
    const computeRest = (s) => {
      const p = texParams();
      // cachos: 3 mechas vizinhas formam um cacho maior e bem definido
      const x0 = (opts.tex === 'cacheado' ? s.ringCx : s.cx) + s.u * p.spread;
      const phase = opts.tex === 'ondulado' ? s.wavePhase + s.jit * 0.5 : opts.tex === 'cacheado' ? s.curlPhase + s.jit : s.jit * 6;
      for (let i = 0; i < M; i += 1) {
        const t = i / (M - 1);
        const env = opts.tex === 'cacheado' ? 0.55 + 0.45 * t : 0.3 + 0.7 * t;
        const th = t * p.freq * Math.PI * 2 + phase;
        s.rx[i] = x0 + Math.sin(th) * p.amp * env;
        s.ry[i] = s.y0 + t * s.len * p.lenK + Math.cos(th) * p.amp * p.loop * env;
      }
    };

    const build = () => {
      const rnd = seeded(o.seed || 7);
      const n = o.count || Math.round(Math.min(340, Math.max(200, (W / dpr) * 0.8)));
      const nClumps = Math.max(18, Math.round(n / 8));
      const clumps = [];
      for (let c = 0; c < nClumps; c += 1) {
        const cx = W * -0.06 + (W * 1.12 * (c + 0.5)) / nClumps + (rnd() - 0.5) * (W / nClumps) * 0.6;
        clumps.push({ cx, wave: (cx / W) * 1.4 + rnd() * 0.7, curl: 0 });
      }
      for (let c = 0; c < nClumps; c += 3) {
        const grp = clumps.slice(c, c + 3);
        const ringCx = grp.reduce((a, g) => a + g.cx, 0) / grp.length;
        const curl = rnd() * Math.PI * 2;
        grp.forEach((g) => { g.ringCx = ringCx; g.curl = curl; });
      }
      strands = [];
      for (let k = 0; k < n; k += 1) {
        const cl = clumps[Math.floor(rnd() * nClumps)];
        const back = rnd() < 0.4;
        const y0 = -H * 0.05 - rnd() * H * 0.05;
        const gauss = (rnd() + rnd() + rnd() - 1.5) / 1.5;
        const s = {
          cx: cl.cx, ringCx: cl.ringCx, u: gauss, wavePhase: cl.wave, curlPhase: cl.curl, jit: (rnd() - 0.5) * 0.5,
          y0, back,
          len: H * 1.1 * (0.86 + rnd() * 0.16),
          shade: back ? 0.6 + rnd() * 0.16 : 0.84 + rnd() * 0.26,
          w: (back ? 3.6 + rnd() * 2.8 : 1 + rnd() * 1.3) * dpr,
          lit: rnd() < 0.46,
          specK: 0.55 + rnd() * 0.7,
          x: new Float32Array(M), y: new Float32Array(M), vx: new Float32Array(M), vy: new Float32Array(M),
          rx: new Float32Array(M), ry: new Float32Array(M), cols: [],
        };
        computeRest(s);
        s.x.set(s.rx); s.y.set(s.ry);
        strands.push(s);
      }
      strands.sort((a, b) => Number(b.back) - Number(a.back));
      paintColors();
    };

    const colorAt = (s, t, base, dc, r) => {
      if (opts.mode === 'hoje') return base;
      const dream = mix(dc.c1, dc.c2, Math.pow(t, 0.85));
      switch (opts.tecnica) {
        case 'global': return mix(base, dream, smooth(r, r + 0.014, t));
        case 'mechas': return s.lit ? mix(base, dream, smooth(r + 0.01, r + 0.13, t)) : mix(base, dream, 0.06 * t);
        case 'pontas': return mix(base, dream, smooth(Math.max(0.4, r + 0.06), 0.82, t));
        default: return mix(base, dream, smooth(r * 0.6 + 0.04, r + 0.25, t)); // esfumada
      }
    };
    const paintColors = () => {
      const base = hex(opts.base);
      const dc = dreamColors(opts.level, opts.reflexo);
      const r = opts.mode === 'hoje' ? 0 : (opts.months || 0) * 0.045;
      strands.forEach((s) => {
        s.cols = [];
        for (let k = 0; k < K; k += 1) s.cols.push(colorAt(s, (k + 0.5) / K, base, dc, r));
      });
      // camada de fundo: a "massa" do cabelo, para não aparecer vão entre os fios
      under = [];
      for (let k = 0; k <= K; k += 1) {
        const t = k / K;
        const a = colorAt({ lit: true }, t, base, dc, r); const b = colorAt({ lit: false }, t, base, dc, r);
        under.push(mix(opts.tecnica === 'mechas' && opts.mode !== 'hoje' ? mix(a, b, 0.55) : a, BLACK, 0.42));
      }
    };

    const draw = () => {
      if (!W) return;
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      under.forEach((c, k) => bg.addColorStop(k / K, `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`));
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      const ly = light * H; const band = H * 0.1;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const wK = opts.tex === 'cacheado' ? 1.55 : opts.tex === 'ondulado' ? 1.15 : 1;
      for (const s of strands) {
        ctx.lineWidth = s.w * wK;
        for (let k = 0; k < K; k += 1) {
          const i0 = Math.floor((k * (M - 1)) / K); const i1 = Math.floor(((k + 1) * (M - 1)) / K);
          const midY = (s.y[i0] + s.y[i1]) / 2;
          const sp = Math.exp(-(((midY - ly) / band) ** 2)) * 0.3 * s.specK * (s.back ? 0.3 : 1);
          const col = mix(s.cols[k], BLACK, 1 - s.shade);
          const c = mix(col, mix(col, SPEC, 0.55), sp);
          ctx.strokeStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
          ctx.beginPath();
          ctx.moveTo(s.x[i0], s.y[i0]);
          for (let i = i0 + 1; i < i1; i += 1) {
            ctx.quadraticCurveTo(s.x[i], s.y[i], (s.x[i] + s.x[i + 1]) / 2, (s.y[i] + s.y[i + 1]) / 2);
          }
          ctx.lineTo(s.x[i1], s.y[i1]);
          ctx.stroke();
        }
      }
      // brilho contínuo (reflexo de luz) que acompanha o cursor
      const sheen = ctx.createLinearGradient(0, ly - H * 0.2, 0, ly + H * 0.2);
      sheen.addColorStop(0, 'rgba(255,246,230,0)');
      sheen.addColorStop(0.5, 'rgba(255,246,230,.5)');
      sheen.addColorStop(1, 'rgba(255,246,230,0)');
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = sheen; ctx.fillRect(0, ly - H * 0.2, W, H * 0.4);
      ctx.globalCompositeOperation = 'source-over';
      // sombra na raiz e vinheta
      const top = ctx.createLinearGradient(0, 0, 0, H * 0.12);
      top.addColorStop(0, 'rgba(18,10,7,.45)'); top.addColorStop(1, 'rgba(18,10,7,0)');
      ctx.fillStyle = top; ctx.fillRect(0, 0, W, H * 0.12);
      const vg = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.25, W / 2, H * 0.55, H * 0.8);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,6,4,.55)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    };

    const step = (dt) => {
      time += dt;
      const target = pointer.active ? Math.min(0.9, Math.max(0.12, pointer.y / H)) : 0.3 + Math.sin(time * 0.0005) * 0.14;
      light += (target - light) * 0.06;
      const R = 110 * dpr; const R2 = R * R;
      for (const s of strands) {
        for (let i = 1; i < M; i += 1) {
          const t = i / (M - 1);
          const breeze = Math.sin(time * 0.0011 + s.jit * 12 + s.cx * 0.01 + t * 2.4) * W * 0.006 * t;
          const kx = 0.05 * (1.15 - 0.65 * t);
          s.vx[i] = (s.vx[i] + (s.rx[i] + breeze - s.x[i]) * kx) * 0.87;
          s.vy[i] = (s.vy[i] + (s.ry[i] - s.y[i]) * 0.07) * 0.85;
          if (pointer.active) {
            const dx = s.x[i] - pointer.x; const dy = s.y[i] - pointer.y; const d2 = dx * dx + dy * dy;
            if (d2 < R2) {
              const f = 1 - Math.sqrt(d2) / R;
              s.vx[i] += pointer.vx * 0.16 * f * (0.4 + t);
              s.vy[i] += pointer.vy * 0.05 * f;
            }
          }
          s.x[i] += s.vx[i]; s.y[i] += s.vy[i];
        }
      }
      pointer.vx *= 0.82; pointer.vy *= 0.82;
    };

    const frame = (now) => {
      if (!running) return;
      const dt = Math.min(48, now - (last || now)); last = now;
      step(dt); draw();
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (live && !running && W) { running = true; last = 0; raf = requestAnimationFrame(frame); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const resize = () => {
      if (o.width) { dpr = 1; W = o.width; H = o.height; } else {
        const r = canvas.getBoundingClientRect();
        if (!r.width || !r.height) return;
        dpr = Math.min(2, window.devicePixelRatio || 1);
        W = Math.round(r.width * dpr); H = Math.round(r.height * dpr);
      }
      canvas.width = W; canvas.height = H;
      build(); draw();
    };

    const api = {
      set(n) {
        const texChanged = n.tex && n.tex !== opts.tex;
        opts = { ...opts, ...n };
        if (texChanged) strands.forEach(computeRest);
        if (!live) strands.forEach((s) => { s.x.set(s.rx); s.y.set(s.ry); });
        paintColors();
        if (!running) draw();
        return api;
      },
      get: () => ({ ...opts }),
      resize, start, stop, draw,
      canvas,
    };

    if (!o.width) {
      // interação: o dedo/mouse "penteia" os fios
      const pos = (e) => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr]; };
      canvas.addEventListener('pointermove', (e) => {
        const [x, y] = pos(e);
        if (pointer.active) { pointer.vx = (x - pointer.x) * 0.9; pointer.vy = (y - pointer.y) * 0.9; }
        pointer.x = x; pointer.y = y; pointer.active = true;
      });
      canvas.addEventListener('pointerleave', () => { pointer.active = false; });
      canvas.addEventListener('pointercancel', () => { pointer.active = false; });
      if ('ResizeObserver' in window) new ResizeObserver(() => resize()).observe(canvas);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); else stop(); }).observe(canvas);
      } else start();
      document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
    }
    resize();
    return api;
  }

  /* ---------- Imagem estática da mecha (para o cartão) ---------- */
  const snapshot = (w, h, state) => {
    const c = document.createElement('canvas');
    const lab = create(c, { interactive: false, width: w, height: h, count: 300, seed: 11 });
    lab.set({ ...state, mode: 'sonho' });
    return c;
  };

  /* ---------- Cartão "Meu tom ideal" (1080×1350, JPG) ---------- */
  const card = async (state, info) => {
    const W = 1080; const H = 1350;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const fontes = [['italic 64px "Cormorant Garamond"', info.nome], ['400 30px "Jost"', info.sub], ['500 22px "Jost"', 'MEU TOM IDEAL'], ['60px "Pinyon Script"', 'Dra. Nicoly Medeiros']];
    try {
      for (let tent = 0; tent < 4; tent += 1) {
        await Promise.all(fontes.map(([f, t]) => document.fonts.load(f, t)));
        if (fontes.every(([f, t]) => document.fonts.check(f, t))) break;
        await new Promise((r) => setTimeout(r, 400));
      }
    } catch (e) { /* segue com fontes do sistema */ }
    const g = ctx.createRadialGradient(W / 2, 520, 60, W / 2, 560, 760);
    g.addColorStop(0, '#4A3027'); g.addColorStop(1, '#2F1B16');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (info.monoPath) {
      ctx.save(); ctx.translate(W / 2 - 63, 34); ctx.scale(0.9, 0.9);
      ctx.strokeStyle = '#C8A46C'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.ellipse(70, 55, 66, 51, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([0.1, 6]); ctx.lineCap = 'round'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(70, 55, 59, 44.5, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = '#C8A46C'; ctx.fill(new Path2D(info.monoPath)); ctx.restore();
    }
    const x0 = 260; const x1 = 820; const yTop = 200; const yBot = 880; const rad = (x1 - x0) / 2;
    const arch = (pad = 0) => { ctx.beginPath(); ctx.moveTo(x0 - pad, yBot + pad); ctx.lineTo(x0 - pad, yTop + rad); ctx.arc(W / 2, yTop + rad, rad + pad, Math.PI, 0); ctx.lineTo(x1 + pad, yBot + pad); ctx.closePath(); };
    ctx.save(); arch(); ctx.clip();
    ctx.drawImage(snapshot(x1 - x0, yBot - yTop, state), x0, yTop);
    ctx.restore();
    ctx.strokeStyle = 'rgba(200,164,108,.85)'; ctx.lineWidth = 3; arch(); ctx.stroke();
    ctx.strokeStyle = 'rgba(200,164,108,.35)'; ctx.lineWidth = 1.5; arch(18); ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#C8A46C'; ctx.font = '500 22px "Jost", sans-serif';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '8px';
    ctx.fillText('MEU TOM IDEAL', W / 2, 960);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    let s = 72;
    do { ctx.font = `italic ${s}px "Cormorant Garamond", serif`; s -= 2; } while (ctx.measureText(info.nome).width > 940 && s > 24);
    ctx.fillStyle = '#FBF7F1'; ctx.fillText(info.nome, W / 2, 1040);
    ctx.fillStyle = 'rgba(251,247,241,.72)'; ctx.font = '400 30px "Jost", sans-serif'; ctx.fillText(info.sub, W / 2, 1094);
    ctx.fillStyle = '#E3CA9C'; ctx.fillText(info.cuidado, W / 2, 1140);
    ctx.fillStyle = '#FBF7F1'; ctx.font = '60px "Pinyon Script", cursive'; ctx.fillText('Dra. Nicoly Medeiros', W / 2, 1250);
    ctx.fillStyle = 'rgba(251,247,241,.6)'; ctx.font = '400 24px "Jost", sans-serif'; ctx.fillText(info.handle || '', W / 2, 1300);
    return new Promise((res) => cv.toBlob(res, 'image/jpeg', 0.95));
  };

  window.HairLab = { create, snapshot, card, dreamColors, nomeDoTom, LEVELS, LEVEL_NAMES, REFLEXOS, TECNICAS };
}());
