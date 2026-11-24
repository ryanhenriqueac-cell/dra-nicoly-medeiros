/* =========================================================
   CONFIGURAÇÃO — troque aqui e o site inteiro é atualizado
   ========================================================= */
const CONFIG = {
  // WhatsApp: só números, com DDI 55 + DDD. Ex.: '5511999998888'
  whatsapp: '5531982712623',
  // Como o número aparece escrito na seção de contato
  whatsappLabel: '(31) 98271-2623',
  // Instagram: só o usuário, sem @. Ex.: 'dra.nicolymedeiros'
  instagram: 'nicoly_medeiros_beauty',
  // Endereço para o botão "Abrir rotas no Google Maps"
  endereco: 'Rua São Paulo, 684, Belo Horizonte - MG',
};

(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Links de WhatsApp, Instagram e Maps ---------- */
  const waLink = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg || '')}`;
  const igLink = `https://www.instagram.com/${CONFIG.instagram}/`;

  $$('[data-wa]').forEach((a) => {
    a.href = waLink(a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('[data-wa-label]').forEach((el) => { el.textContent = CONFIG.whatsappLabel; });
  $$('[data-ig]').forEach((a) => {
    a.href = igLink;
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('[data-ig-handle]').forEach((el) => { el.textContent = '@' + CONFIG.instagram; });
  $$('[data-maps]').forEach((a) => {
    if (CONFIG.endereco) {
      a.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.endereco)}`;
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.href = '#contato';
    }
  });
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header e botão flutuante ---------- */
  const header = $('#header');
  const waFloat = $('.wa-float');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    waFloat.classList.toggle('is-visible', y > window.innerHeight * 0.55);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const toggle = $('#menuToggle');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('#nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Link ativo no menu ---------- */
  const navLinks = $$('#nav a[href^="#"]');
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((a) => {
    const target = $(a.getAttribute('href'));
    if (target) sectionObs.observe(target);
  });

  /* ---------- Animações de entrada (com cascata) ---------- */
  $$('.pillars, .procs, .steps, .highlights').forEach((group) => {
    [...group.children].forEach((child, i) => child.style.setProperty('--d', `${(i % 4) * 0.09}s`));
  });
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach((el) => revealObs.observe(el));

  /* ---------- Antes e depois (arrastar) ---------- */
  $$('.ba').forEach((ba) => {
    const range = $('.ba__range', ba);
    let touched = false;
    const set = (v) => ba.style.setProperty('--pos', `${v}%`);
    range.addEventListener('input', () => { touched = true; set(range.value); });

    // Uma "dica" suave mostrando que dá para arrastar, só na primeira vez que aparece
    if (reduceMotion) return;
    const hintObs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      hintObs.disconnect();
      const frames = [50, 72, 30, 50];
      const dur = 2200;
      let start;
      const step = (t) => {
        if (touched) return;
        start = start || t;
        const p = Math.min((t - start) / dur, 1);
        const seg = p * (frames.length - 1);
        const i = Math.min(Math.floor(seg), frames.length - 2);
        const k = seg - i;
        const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const v = frames[i] + (frames[i + 1] - frames[i]) * ease;
        set(v);
        range.value = v;
        if (p < 1) requestAnimationFrame(step);
      };
      setTimeout(() => requestAnimationFrame(step), 500);
    }, { threshold: 0.6 });
    hintObs.observe(ba);
  });

  /* ---------- Atelier: cada serviço troca o tom da "mecha" ---------- */
  const toneItems = $$('.tone-item');
  const toneName = $('#toneName');
  const activateTone = (btn) => {
    const key = btn.dataset.tone;
    toneItems.forEach((b) => b.setAttribute('aria-expanded', String(b === btn)));
    $$('.tone-stage .tone').forEach((t) => t.classList.toggle('is-active', t.classList.contains(`tone--${key}`)));
    if (toneName) toneName.textContent = $('.tone-item__title', btn).textContent;
  };
  toneItems.forEach((btn) => {
    btn.addEventListener('click', () => activateTone(btn));
    // No computador, passar o mouse já mostra o tom (sem abrir/fechar o texto à toa)
    btn.addEventListener('mouseenter', () => {
      if (window.matchMedia('(hover: hover)').matches) activateTone(btn);
    });
  });
  if (toneItems[0]) activateTone(toneItems[0]);

  /* ---------- Galeria do Atelier: mostra a foto se o arquivo existir ---------- */
  $$('[data-photo]').forEach((el) => {
    const img = new Image();
    img.onload = () => {
      el.style.backgroundImage = `url("${el.dataset.photo}")`;
      el.classList.add('has-photo');
    };
    img.src = el.dataset.photo;
  });

  /* ---------- Carrossel de resultados ---------- */
  const track = $('#casesTrack');
  if (track) {
    $$('.carousel__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = track.firstElementChild;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        track.scrollBy({ left: Number(btn.dataset.dir) * (card.offsetWidth + gap), behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });

    // Arrastar com o mouse no computador (no celular o toque já rola nativamente)
    let down = false, startX = 0, startScroll = 0, moved = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false;
      startX = e.clientX; startScroll = track.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add('is-dragging'); }
      track.scrollLeft = startScroll - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      track.classList.remove('is-dragging');
    });
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    track.addEventListener('dragstart', (e) => e.preventDefault());
  }

  /* ---------- Carrossel em destaque (cores do Atelier e modelos de cílios) ---------- */
  $$('[data-cf]').forEach((root) => {
    const items = $$('.cf__item', root);
    const texts = $$('.cf__text', root);
    const n = items.length;
    const dotsBox = $('[data-cf-dots]', root);
    if (dotsBox) {
      items.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'cf__dot';
        b.dataset.cfGo = i;
        b.setAttribute('aria-label', `Ver ${$('h3', texts[i]).textContent}`);
        dotsBox.appendChild(b);
      });
    }
    const goBtns = $$('[data-cf-go]', root);
    let active = 0;

    const go = (i) => {
      active = (i + n) % n;
      items.forEach((el, k) => {
        let d = k - active;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        el.style.setProperty('--d', d);
        el.style.setProperty('--a', Math.abs(d));
        el.classList.toggle('is-active', d === 0);
        el.classList.toggle('is-far', Math.abs(d) > 1);
        el.setAttribute('aria-hidden', String(d !== 0));
      });
      texts.forEach((t, k) => t.classList.toggle('is-active', k === active));
      goBtns.forEach((b) => {
        const on = Number(b.dataset.cfGo) === active;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
    };

    items.forEach((el, k) => el.addEventListener('click', () => { if (k !== active) go(k); }));
    $('[data-cf-prev]', root).addEventListener('click', () => go(active - 1));
    $('[data-cf-next]', root).addEventListener('click', () => go(active + 1));
    goBtns.forEach((b) => b.addEventListener('click', () => go(Number(b.dataset.cfGo))));
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') go(active - 1);
      if (e.key === 'ArrowRight') go(active + 1);
    });

    // arrastar com o dedo (ou mouse) para os lados
    const stage = $('.cf__stage', root);
    let x0 = null;
    stage.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    stage.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
    });
    stage.addEventListener('pointercancel', () => { x0 = null; });

    go(0);

    // rotação automática (data-cf-auto = milissegundos por tom)
    const delay = Number(root.dataset.cfAuto);
    if (delay && !reduceMotion) {
      let timer = null;
      let visible = false;
      let hovering = false;
      let resumeAt = 0;
      const tick = () => {
        if (visible && !hovering && Date.now() >= resumeAt && document.visibilityState === 'visible') go(active + 1);
      };
      const start = () => { if (!timer) timer = setInterval(tick, delay); };
      const stop = () => { clearInterval(timer); timer = null; };
      // depois que a pessoa mexe, espera um pouco antes de voltar a girar
      const hold = () => { resumeAt = Date.now() + delay * 2; };
      root.addEventListener('pointerdown', hold);
      root.addEventListener('click', hold);
      root.addEventListener('keydown', hold);
      // pausa só enquanto navega pelo teclado; clique/toque/arraste usam o "hold" acima
      root.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) hovering = true; });
      root.addEventListener('focusout', () => { hovering = false; });
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) start(); else stop();
      }, { threshold: 0.35 }).observe(root);
    }
  });

  /* ---------- Vídeos "Na prática": tocam sem som quando aparecem; toque abre com som ---------- */
  const reelVideos = $$('.reel__item video');
  const lowData = navigator.connection && navigator.connection.saveData;
  if (reelVideos.length && !reduceMotion && !lowData && 'IntersectionObserver' in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach(({ target: v, isIntersecting }) => {
        if (isIntersecting) {
          if (!v.src) v.src = v.dataset.src;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.5 });
    reelVideos.forEach((v) => vio.observe(v));
  }

  const vmodal = $('#vmodal');
  if (vmodal && typeof vmodal.showModal === 'function') {
    const mv = $('.vmodal__video', vmodal);
    const openVideo = (key) => {
      const item = $(`.reel__item[data-video="${key}"]`);
      if (!item) return;
      const title = item.dataset.title;
      $('.vmodal__title', vmodal).textContent = title;
      $('.vmodal__cta', vmodal).href = waLink(`Olá, Dra. Nicoly! Vi o vídeo de ${title} no site e tenho interesse.`);
      mv.poster = `assets/video/${key}.jpg`;
      mv.src = `assets/video/${key}.mp4`;
      mv.muted = false;
      reelVideos.forEach((v) => v.pause());
      vmodal.showModal();
      mv.play().catch(() => {});
    };
    $$('.reel__item').forEach((b) => b.addEventListener('click', () => openVideo(b.dataset.video)));
    $$('[data-video-open]').forEach((b) => b.addEventListener('click', () => openVideo(b.dataset.videoOpen)));
    $('[data-vclose]', vmodal).addEventListener('click', () => vmodal.close());
    vmodal.addEventListener('click', (e) => { if (e.target === vmodal) vmodal.close(); });
    vmodal.addEventListener('close', () => {
      mv.pause();
      mv.removeAttribute('src');
      mv.load();
    });
  }

  /* ---------- Teste interativo: laboratório da cor (mecha gerada por código) ---------- */
  const qz = $('[data-qz]');
  if (qz && window.HairLab) {
    const HL = window.HairLab;
    const section = qz.closest('.qz');
    const steps = $$('[data-qz-step]', qz);
    const dots = $$('.qz-dots li', qz);
    const lab = HL.create($('[data-qz-canvas]', section));
    const labName = $('[data-qz-name]', section);

    const BASES = {
      preto: { nome: 'Preto', cor: '#17100D', nivel: 1 },
      escuro: { nome: 'Castanho escuro', cor: '#3A2318', nivel: 3 },
      claro: { nome: 'Castanho claro', cor: '#6B4630', nivel: 5 },
      loiro: { nome: 'Loiro', cor: '#B08A5A', nivel: 8 },
      quimica: { nome: 'Com química', cor: '#5A2A1C', nivel: 4 },
    };
    const TEXTURAS = { liso: 'liso', ondulado: 'ondulado', cacheado: 'cacheado' };
    const meses = (n) => `${n} ${n === 1 ? 'mês' : 'meses'}`;
    const KEY = 'qz-lab-nicoly';
    const fresh = () => ({ step: 0, base: null, tex: null, level: 8, reflexo: 'dourado', tecnica: 'esfumada', months: 3 });
    let st = fresh();
    try { st = { ...st, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { /* sem armazenamento */ }
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* ok */ } };

    const nomeTom = () => HL.nomeDoTom(st.level, st.reflexo);
    const tec = () => HL.TECNICAS[st.tecnica];
    const labState = (mode) => ({
      base: st.base ? BASES[st.base].cor : '#3A2318', tex: st.tex || 'liso', mode,
      level: st.level, reflexo: st.reflexo, tecnica: st.tecnica, months: mode === 'cuidado' ? st.months : 0,
    });
    const paintLab = () => {
      const mode = st.step === 0 ? 'hoje' : st.step === 1 ? 'sonho' : 'cuidado';
      lab.set(labState(mode));
      labName.textContent = st.step === 0 ? (st.base ? BASES[st.base].nome : 'Sua cor') : nomeTom();
    };

    /* ---- etapa 2: cores dos controles acompanham a escolha ---- */
    const levelInput = $('[data-qz-level]', qz);
    const paintControls = () => {
      levelInput.value = st.level;
      levelInput.style.setProperty('--p', `${((st.level - 1) / 9) * 100}%`);
      $('[data-qz-levelname]', qz).textContent = `Nível ${st.level} · ${HL.LEVEL_NAMES[st.level - 1]}`;
      const dc = HL.dreamColors(st.level, st.reflexo).mid.map((v) => v | 0);
      const techs = $('[data-qz-techs]', qz);
      techs.style.setProperty('--d', `rgb(${dc.join(',')})`);
      techs.style.setProperty('--b', st.base ? BASES[st.base].cor : '#3A2318');
    };

    /* ---- etapa 3: dica de manutenção ---- */
    const paintCare = () => {
      const t = tec();
      $('[data-qz-mout]', qz).textContent = st.months;
      $('[data-qz-munit]', qz).textContent = st.months === 1 ? 'mês' : 'meses';
      const range = $('[data-qz-months]', qz);
      range.value = st.months;
      range.style.setProperty('--p', `${((st.months - 1) / 5) * 100}%`);
      let tip;
      if (st.months <= t.rec) tip = `Perfeito! Com cuidado a cada ${meses(st.months)}, a sua cor fica sempre impecável.`;
      else if (t.suave) tip = `Com ${t.nome.toLowerCase()}, a raiz cresce de forma natural e sem marcar. Para manter o brilho e o tom, o ideal é cuidar a cada ${meses(t.rec)}.`;
      else tip = `Repare na raiz: com ${meses(st.months)} ela já aparece marcada. Para ficar sempre impecável, o ideal é retocar a cada ${meses(t.rec)}. Quer cuidar com menos frequência? Experimente "Raiz esfumada" na etapa anterior.`;
      $('[data-qz-tip]', qz).textContent = tip;
    };

    /* ---- resultado ---- */
    const noteFor = () => {
      const b = BASES[st.base];
      if (st.level - b.nivel >= 4) return 'Uma mudança grande assim costuma ser feita em etapas, preservando a saúde dos fios.';
      if (st.base === 'quimica') return 'Como o seu cabelo tem química, a Dra. avalia o histórico dos fios antes de definir o caminho.';
      if ((st.reflexo === 'perolado' || st.reflexo === 'cinza') && st.level >= 8) return 'Tons frios pedem cuidados de matização para manter o reflexo bonito.';
      return tec().suave ? 'Uma cor que cresce bonita e pede pouca manutenção.' : 'Uma cor marcante, que brilha mais com retoques no tempo certo.';
    };
    const cardInfo = () => ({
      nome: nomeTom(),
      sub: `${tec().nome} · nível ${st.level}`,
      cuidado: `Cuidado ideal: a cada ${meses(tec().rec)}`,
      handle: `@${CONFIG.instagram}`,
      monoPath: 'M47.12 73.49Q46.78 73.49 46.78 73.15Q46.78 72.96 46.97 72.83Q47.07 72.74 47.21 72.63Q47.34 72.52 47.44 72.4Q48.05 71.64 48.54 70.58Q49.03 69.51 49.57 67.83Q50.12 66.15 50.88 63.56Q52.17 59.24 54.6 53.91Q57.03 48.59 59.99 43.51Q58.13 45.83 56.57 47.77Q55.01 49.71 53.44 51.59Q51.88 53.47 50.06 55.56Q48.24 57.65 45.85 60.29Q40.14 66.51 35.96 69.79Q31.79 73.08 28.74 73.08Q26.25 73.08 25.04 72.1Q23.83 71.13 23.83 69.78Q23.83 68.68 24.59 68.21Q25.34 67.73 26.1 67.73Q26.52 67.73 26.93 68Q27.35 68.27 27.35 68.85Q27.35 69.32 26.93 69.7Q26.52 70.08 25.98 70.08Q25.66 70.08 25.36 70.03Q25.05 69.98 24.81 69.83V69.98Q24.81 71.03 25.75 71.72Q26.69 72.42 28.69 72.42Q30.2 72.42 32.53 71.16Q34.87 69.9 38.21 66.95Q41.55 64 46.07 58.92Q53.74 50.28 57.78 45.25Q61.82 40.22 62.21 39.63Q62.65 39.09 62.82 39.09Q63.04 39.09 63.04 39.31Q63.04 39.46 62.94 39.63L62.6 40.27Q61.99 41.29 61.65 42.23Q61.31 43.17 61.01 44.2Q60.65 45.47 60.29 46.82Q59.94 48.18 59.4 49.92Q58.86 51.67 57.96 54.13Q56.98 56.82 55.98 58.92Q54.98 61.02 53.73 63.26Q52.47 65.51 50.66 68.68Q51.81 67.29 53.74 64.99Q55.67 62.68 58.05 59.91Q60.43 57.14 62.99 54.29Q65.55 51.45 67.97 48.96Q72.29 44.47 75.76 41.74Q79.23 39.02 82.17 37.78Q85.11 36.53 87.87 36.51Q90.43 36.51 91.75 37.64Q93.07 38.78 93.09 40.85Q93.12 42.37 92.03 44.21Q90.94 46.05 89 47.79Q87.06 49.52 84.5 50.76Q83.6 51.18 83.13 51.18Q82.86 51.18 82.86 51.01Q82.86 50.81 83.28 50.62Q85.26 49.86 87.16 48.37Q89.06 46.88 90.31 45.01Q91.55 43.15 91.55 41.27Q91.55 39.34 90.52 38.28Q89.48 37.21 87.6 37.21Q84.87 37.21 81.65 38.78Q78.44 40.34 74.44 43.76Q70.44 47.18 65.33 52.77Q61.28 57.21 57.99 61.08Q54.69 64.95 52.28 67.85Q49.88 70.76 48.49 72.35Q47.85 73.1 47.56 73.3Q47.27 73.49 47.12 73.49ZM36.23 53.13Q34.35 53.13 32.69 52.4Q31.03 51.67 30.02 50.17Q29.01 48.66 29.01 46.39Q29.01 44.1 30.4 42.26Q31.79 40.41 34.27 39.34Q36.75 38.26 39.99 38.26Q41.77 38.26 43.36 38.52Q44.95 38.78 46.85 39.56Q48.1 40.07 49.2 40.6Q50.29 41.12 51.69 41.76Q52.52 42.1 53.4 42.32Q54.27 42.54 55.08 42.54Q55.98 42.54 56.95 42.17Q57.91 41.8 58.6 41.22Q59.01 40.83 59.16 40.83Q59.35 40.83 59.35 41.02Q59.35 41.22 59.01 41.58Q58.35 42.22 57.3 42.72Q56.25 43.22 55.17 43.5Q54.08 43.78 53.32 43.78Q51.81 43.78 49.83 43.23Q47.85 42.68 46.34 41.78Q44.41 40.66 43.1 40.12Q41.8 39.58 40.8 39.4Q39.8 39.22 38.77 39.22Q36.35 39.22 34.3 40.17Q32.25 41.12 31.02 42.78Q29.79 44.44 29.79 46.54Q29.79 49.13 31.52 50.84Q33.25 52.55 36.13 52.55Q37.82 52.55 39.43 51.83Q41.04 51.11 42.1 49.79Q43.17 48.47 43.17 46.64Q43.17 45.66 42.51 44.95Q42.34 45.15 42.1 45.31Q41.87 45.47 41.55 45.47Q41.09 45.47 40.72 45.16Q40.36 44.86 40.36 44.37Q40.36 43.95 40.66 43.61Q40.97 43.27 41.55 43.27Q42.46 43.27 43.19 44.16Q43.92 45.05 43.92 46.54Q43.92 48.52 42.8 50Q41.68 51.47 39.92 52.3Q38.16 53.13 36.23 53.13ZM90.36 73.08Q88.88 73.08 88.14 72.41Q87.41 71.74 87.41 70.76Q87.41 70.05 88.04 68.51Q88.68 66.98 90.68 63.95Q93.03 60.46 95.96 56.9Q98.88 53.35 101.95 50.01Q105.01 46.66 107.86 43.76Q110.7 40.85 112.9 38.68Q111.8 39.46 110.46 40.58Q109.11 41.71 107.16 43.48Q105.21 45.25 102.35 47.93Q99.5 50.62 95.39 54.55Q93.34 56.5 89.45 60.53Q85.55 64.56 80.31 70.69Q79.04 72.18 78.56 72.52Q78.08 72.86 77.82 72.86Q77.64 72.86 77.46 72.61Q77.28 72.37 77.28 71.83Q77.28 69.78 78.69 66.45Q80.11 63.12 82.71 58.91Q85.31 54.69 88.88 49.98Q92.44 45.27 96.71 40.44Q95.34 41.68 91.72 45.44Q88.09 49.2 81.67 56.26Q76.11 62.36 71.66 66.11Q67.22 69.86 63.8 71.59Q60.87 73.05 58.63 73.05Q56.33 73.05 55.18 72.18Q54.04 71.3 54.04 69.93Q54.04 68.81 54.79 68.26Q55.55 67.71 56.31 67.71Q56.7 67.71 57.12 67.98Q57.55 68.24 57.55 68.83Q57.55 69.29 57.14 69.67Q56.72 70.05 56.16 70.05Q55.84 70.05 55.54 70Q55.23 69.95 54.99 69.78Q54.99 69.88 54.98 69.95Q54.96 70.03 54.96 70.08Q54.96 71.13 55.89 71.76Q56.82 72.4 58.6 72.4Q60.41 72.4 62.76 71.32Q65.12 70.25 68.33 67.74Q71.54 65.24 75.89 60.99Q80.23 56.75 86.02 50.42Q90.88 45.12 93.99 42.16Q97.1 39.19 98.68 38Q100.25 36.8 100.47 36.8Q100.64 36.8 100.89 36.86Q101.13 36.92 101.13 37.04Q101.13 37.19 100.76 37.51Q100.52 37.73 100.17 38.04Q99.81 38.36 99.3 38.87Q98.67 39.56 97.36 41.4Q96.05 43.24 94.33 45.84Q92.61 48.44 90.67 51.47Q88.73 54.5 86.82 57.58Q84.92 60.65 83.25 63.41Q81.58 66.17 80.37 68.28Q79.16 70.39 78.65 71.44Q81.31 68.37 83.47 65.93Q85.63 63.48 87.62 61.35Q89.61 59.21 91.69 57.09Q93.78 54.96 96.27 52.56Q98.76 50.15 101.94 47.15Q106.16 43.22 108.98 40.94Q111.8 38.65 113.48 37.69Q115.17 36.73 115.93 36.73Q116.17 36.73 116.17 36.92Q116.17 37.09 115.54 37.53Q114.9 37.97 114.17 38.61Q111.75 40.73 108.93 44.04Q106.11 47.35 103.16 51.28Q100.2 55.21 97.32 59.26Q94.44 63.31 91.9 66.93Q90.75 68.61 90.21 69.48Q89.66 70.34 89.51 70.72Q89.36 71.1 89.36 71.39Q89.36 72.42 90.78 72.42Q91.49 72.42 92.7 72.07Q93.9 71.71 95.22 71.04Q96.54 70.37 97.52 69.42Q97.64 69.47 97.64 69.73Q97.64 70.1 97.52 70.3Q96.47 71.17 95.1 71.8Q93.73 72.42 92.46 72.75Q91.19 73.08 90.36 73.08Z',
    });
    const cardUrl = () => {
      const q = new URLSearchParams({ n: st.level, r: st.reflexo, t: st.tecnica, b: st.base, x: st.tex, m: st.months });
      return `${new URL('cartao/', location.href).href}?${q}`;
    };
    const paintResult = () => {
      const img = $('[data-qz-cimg]', qz);
      img.src = HL.snapshot(340, 450, labState('sonho')).toDataURL('image/jpeg', 0.9);
      img.alt = `Mecha no tom ${nomeTom()}`;
      $('[data-qz-cname]', qz).textContent = nomeTom();
      $('[data-qz-ctec]', qz).textContent = `${tec().nome}: ${tec().desc.toLowerCase()}.`;
      $('[data-qz-crec]', qz).textContent = `a cada ${meses(tec().rec)}`;
      $('[data-qz-cbase]', qz).textContent = `${BASES[st.base].nome}, ${TEXTURAS[st.tex]}`;
      $('[data-qz-cnote]', qz).textContent = noteFor();
      const msg = 'Olá, Dra. Nicoly! Criei a minha cor no Laboratório do site.\n\n'
        + `Meu cabelo hoje: ${BASES[st.base].nome}, ${TEXTURAS[st.tex]}\n`
        + `Cor dos sonhos: *${nomeTom()}* (nível ${st.level}, ${tec().nome.toLowerCase()})\n`
        + `Quero cuidar a cada: ${meses(st.months)}\n\n`
        + 'Gostaria de agendar uma avaliação!\n\n'
        + `Meu cartão: ${cardUrl()}`;
      $('[data-qz-wa]', qz).href = waLink(msg);
    };

    /* ---- navegação ---- */
    const ready = (i) => (i === 0 ? true : !!(st.base && st.tex));
    const show = (i, focus) => {
      if (i < 0 || i > 3 || !ready(i)) return;
      st.step = i;
      steps.forEach((el, k) => {
        const on = k === i;
        el.classList.toggle('is-on', on);
        el.classList.toggle('is-before', k < i);
        if (on) el.removeAttribute('inert'); else el.setAttribute('inert', '');
        el.setAttribute('aria-hidden', String(!on));
      });
      dots.forEach((li, k) => {
        li.classList.toggle('is-active', k === i);
        li.classList.toggle('is-done', k < i);
        $('button', li).disabled = !ready(k);
      });
      paintLab();
      if (i === 1) paintControls();
      if (i === 2) paintCare();
      if (i === 3) paintResult();
      save();
      if (focus) { const h = $('.qz-q, .qz-card__name', steps[i]); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
    };
    const syncPicks = () => {
      const pick = (attr, val) => $$(`[${attr}]`, qz).forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute(attr) === val)));
      pick('data-qz-base', st.base); pick('data-qz-tex', st.tex);
      pick('data-qz-reflexo', st.reflexo); pick('data-qz-tecnica', st.tecnica);
      $('[data-qz-next]', steps[0]).disabled = !(st.base && st.tex);
    };

    qz.addEventListener('click', (e) => {
      const t = e.target.closest('button');
      if (!t) return;
      const d = t.dataset;
      if (d.qzBase || d.qzTex || d.qzReflexo || d.qzTecnica) {
        if (d.qzBase) st.base = d.qzBase;
        if (d.qzTex) st.tex = d.qzTex;
        if (d.qzReflexo) st.reflexo = d.qzReflexo;
        if (d.qzTecnica) st.tecnica = d.qzTecnica;
        syncPicks(); paintLab(); if (st.step === 1) paintControls(); save();
        return;
      }
      if (t.hasAttribute('data-qz-next')) { show(st.step + 1, true); return; }
      if (t.hasAttribute('data-qz-back')) { show(st.step - 1, true); return; }
      if (d.qzGoto) { show(Number(d.qzGoto), true); return; }
      if (t.hasAttribute('data-qz-restart')) { st = fresh(); syncPicks(); show(0, true); }
    });
    levelInput.addEventListener('input', () => { st.level = Number(levelInput.value); paintControls(); paintLab(); save(); });
    $('[data-qz-months]', qz).addEventListener('input', (e) => { st.months = Number(e.target.value); paintCare(); paintLab(); save(); });

    /* ---- salvar / compartilhar o cartão ---- */
    const saveBtn = $('[data-qz-save]', qz);
    saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true;
      try {
        const blob = await HL.card(labState('sonho'), cardInfo());
        const name = `meu-tom-nivel-${st.level}-${st.reflexo}.jpg`;
        const file = new File([blob], name, { type: 'image/jpeg' });
        const baixar = () => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 4000);
        };
        const celular = window.matchMedia('(pointer: coarse)').matches;
        if (celular && navigator.canShare && navigator.canShare({ files: [file] })) {
          try { await navigator.share({ files: [file], title: 'Meu tom ideal · Dra. Nicoly Medeiros' }); } catch (e) { if (e && e.name !== 'AbortError') baixar(); }
        } else baixar();
      } finally { saveBtn.disabled = false; }
    });

    // estado inicial (retoma de onde parou), descartando valores inválidos
    if (!BASES[st.base]) st.base = null;
    if (!TEXTURAS[st.tex]) st.tex = null;
    if (!HL.REFLEXOS[st.reflexo]) st.reflexo = 'dourado';
    if (!HL.TECNICAS[st.tecnica]) st.tecnica = 'esfumada';
    st.level = Math.min(10, Math.max(1, Number(st.level) || 8));
    st.months = Math.min(6, Math.max(1, Number(st.months) || 3));
    st.step = Number(st.step) || 0;
    if (!ready(st.step)) st.step = 0;
    syncPicks();
    show(st.step, false);
  }

  /* ---------- Vídeo da abertura (só entra se o arquivo existir) ---------- */
  const heroVideo = document.querySelector('[data-hero-video]');
  if (heroVideo) {
    const hero = heroVideo.closest('.hero');
    const video = heroVideo.querySelector('video');
    const playBtn = hero.querySelector('.hero__play');
    const saveData = navigator.connection && navigator.connection.saveData;
    const mobile = window.matchMedia('(max-width: 1080px)').matches;
    const base = 'assets/video/';
    const candidates = mobile ? ['hero-mobile.mp4', 'hero.mp4'] : ['hero.mp4'];

    const exists = (url) => fetch(url, { method: 'HEAD' }).then((r) => r.ok).catch(() => false);
    const setPaused = (paused) => {
      playBtn.classList.toggle('is-paused', paused);
      playBtn.setAttribute('aria-label', paused ? 'Reproduzir vídeo' : 'Pausar vídeo');
    };

    (async () => {
      if (saveData) return;
      let src = null;
      for (const name of candidates) { if (await exists(base + name)) { src = base + name; break; } }
      if (!src) return;
      if (await exists(base + 'hero-poster.jpg')) video.poster = base + 'hero-poster.jpg';
      video.src = src;
      video.preload = 'auto';
      hero.classList.add('has-video');
      playBtn.hidden = false;
      if (reduceMotion) { setPaused(true); return; }
      video.play().then(() => setPaused(false)).catch(() => setPaused(true));
    })();

    playBtn.addEventListener('click', () => {
      if (video.paused) { video.play(); setPaused(false); } else { video.pause(); setPaused(true); }
    });
    // economiza bateria: pausa quando a abertura sai da tela
    new IntersectionObserver(([e]) => {
      if (!hero.classList.contains('has-video') || playBtn.classList.contains('is-paused')) return;
      if (e.isIntersecting) video.play().catch(() => {}); else video.pause();
    }).observe(hero);
  }
})();
