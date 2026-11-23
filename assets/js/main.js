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

  /* ---------- Teste interativo: descubra sua cor ---------- */
  const qz = $('[data-qz]');
  if (qz) {
    const section = qz.closest('.qz');
    const track = $('[data-qz-track]', qz);
    const viewport = $('[data-qz-viewport]', qz);
    const steps = $$('[data-qz-step]', qz);
    const dots = $$('.qz-dots li', qz);

    const BASES = {
      preto: { nome: 'Preto', raiz: '#17100D' },
      escuro: { nome: 'Castanho escuro', raiz: '#3A2318' },
      claro: { nome: 'Castanho claro', raiz: '#6B4630' },
      loiro: { nome: 'Loiro', raiz: '#9C774A' },
      quimica: { nome: 'Com química', raiz: '#3A2318' },
    };
    const TEXTURAS = { liso: 'liso', ondulado: 'ondulado', cacheado: 'cacheado' };
    // rec = intervalo de cuidado recomendado (meses). PROVISÓRIO: confirmar com a Dra. Nicoly.
    // suave = técnica com raiz esfumada (cresce sem marcar)
    const SONHOS = {
      perola: { nome: 'Loiro pérola', tec: 'Loiro com clareamento e tonalização perolada', c1: '#CDBB9C', c2: '#F3ECDF', rec: 2, suave: false },
      mel: { nome: 'Mel', tec: 'Iluminado em tom mel', c1: '#8A5A30', c2: '#DDAE68', rec: 4, suave: true },
      'mechas-douradas': { nome: 'Mechas douradas', tec: 'Mechas douradas com raiz esfumada', c1: '#7A5434', c2: '#E2BF80', rec: 4, suave: true },
      'marrom-dourado': { nome: 'Morena iluminada marrom dourado', tec: 'Morena iluminada em marrom dourado', c1: '#4A2C1C', c2: '#AC7840', rec: 5, suave: true },
      caramelo: { nome: 'Caramelo', tec: 'Morena iluminada caramelo', c1: '#3A2216', c2: '#A4662F', rec: 5, suave: true },
      cobre: { nome: 'Cobre', tec: 'Pigmentação em tons quentes', c1: '#7A4A22', c2: '#CC924C', rec: 2, suave: false },
      coloracao: { nome: 'Coloração', tec: 'Coloração intensa e uniforme', c1: '#8A3A18', c2: '#C86C32', rec: 2, suave: false },
      cafe: { nome: 'Café', tec: 'Coloração castanha com reflexos quentes', c1: '#2A170F', c2: '#704230', rec: 2, suave: false },
    };
    const meses = (n) => `${n} ${n === 1 ? 'mês' : 'meses'}`;

    const KEY = 'qz-nicoly';
    let st = { step: 0, base: null, tex: null, dream: null, months: 3 };
    try { st = { ...st, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { /* sem armazenamento */ }
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* ok */ } };

    /* ---- arco à esquerda ---- */
    const arch = $('[data-qz-arch]', section);
    const archName = $('[data-qz-name]', section);
    const paintArch = () => {
      if (st.base) arch.style.setProperty('--base', BASES[st.base].raiz);
      $$('[data-qz-photo]', arch).forEach((img) => img.classList.toggle('is-on', img.dataset.qzPhoto === st.dream));
      archName.textContent = st.dream ? SONHOS[st.dream].nome : (st.base ? BASES[st.base].nome : 'Sua cor');
    };

    /* ---- simulador da mecha ---- */
    const lock = $('[data-qz-lock]', qz);
    const lockClip = $('[data-qz-lockclip]', qz);
    const grad = $('[data-qz-grad]', qz);
    const fibers = $('[data-qz-fibers]', qz);
    const marker = $('[data-qz-marker]', qz);
    const rootCap = $('[data-qz-rootcap]', qz);
    const range = $('[data-qz-months]', qz);
    const LEN = 380; const TOP = 10; const CRESC = 0.05; // 5% do comprimento por mês

    const waveX = (y, tex) => {
      const t = (y - TOP) / LEN;
      if (tex === 'ondulado') return Math.sin(t * Math.PI * 4.2) * 8 * (0.4 + t);
      if (tex === 'cacheado') return Math.sin(t * Math.PI * 9) * 11 * (0.5 + t * 0.8);
      return 0;
    };
    const lockPath = (tex) => {
      const L = []; const R = [];
      for (let i = 0; i <= 60; i += 1) {
        const y = TOP + (LEN * i) / 60;
        const t = i / 60;
        const half = 30 - 14 * t * t;          // afina nas pontas
        const cx = 60 + waveX(y, tex);
        L.push([cx - half, y]); R.push([cx + half, y]);
      }
      const end = R[R.length - 1]; const endL = L[L.length - 1];
      const f = (pt) => `${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`;
      return `M${f(L[0])} Q60 2 ${f(R[0])} L${R.map(f).join(' L')} Q${((end[0] + endL[0]) / 2).toFixed(1)} ${(end[1] + 14).toFixed(1)} ${f(endL)} L${L.reverse().map(f).join(' L')} Z`;
    };
    const fiberPaths = (tex) => {
      let out = '';
      for (let k = -4; k <= 4; k += 1) {
        let d = '';
        for (let i = 0; i <= 40; i += 1) {
          const y = TOP + (LEN * i) / 40;
          const t = i / 40;
          const x = 60 + waveX(y, tex) + k * (6.4 - 3 * t * t);
          d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `;
        }
        out += `<path d="${d}" stroke="${k % 2 ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.16)'}" stroke-width="${k % 3 ? 0.8 : 1.3}"/>`;
      }
      return out;
    };
    const stop = (o, c) => `<stop offset="${Math.min(1, Math.max(0, o)).toFixed(3)}" stop-color="${c}"/>`;

    const paintLock = () => {
      if (!st.dream) return;
      const d = SONHOS[st.dream];
      const raiz = BASES[st.base || 'escuro'].raiz;
      const tex = st.tex || 'liso';
      const r = st.months * CRESC;
      const pathD = lockPath(tex);
      lock.setAttribute('d', pathD);
      lockClip.setAttribute('d', pathD);
      fibers.innerHTML = fiberPaths(tex);
      grad.innerHTML = d.suave
        ? stop(0, raiz) + stop(r * 0.7, raiz) + stop(r + 0.2, d.c1) + stop(0.62, d.c2) + stop(1, d.c2)
        : stop(0, raiz) + stop(r, raiz) + stop(r + 0.008, d.c1) + stop(0.4, d.c2) + stop(1, d.c2);
      const yMark = TOP + LEN * r;
      $('line', marker).setAttribute('y1', yMark); $('line', marker).setAttribute('y2', yMark);
      rootCap.style.top = `${(yMark / 400) * 100}%`;
      rootCap.textContent = `+${st.months} cm`;
      $('[data-qz-mout]', qz).textContent = st.months;
      $('[data-qz-munit]', qz).textContent = st.months === 1 ? 'mês' : 'meses';
      range.value = st.months;
      range.style.setProperty('--p', `${((st.months - 1) / 5) * 100}%`);
      let tip;
      if (st.months <= d.rec) {
        tip = `Perfeito! Com cuidado a cada ${meses(st.months)}, o seu resultado fica sempre impecável.`;
      } else if (d.suave) {
        tip = `A raiz esfumada cresce de forma natural e sem marcar. Para manter o brilho e o tom, o ideal é cuidar a cada ${meses(d.rec)}.`;
      } else {
        tip = `Repare na raiz: com ${meses(st.months)} ela já aparece marcada. Para ficar sempre impecável, o ideal é retocar a cada ${meses(d.rec)}.`;
        if (st.months >= d.rec + 2) tip += ' Quer cuidar com menos frequência? Peça à Dra. uma versão com raiz esfumada.';
      }
      $('[data-qz-tip]', qz).textContent = tip;
      if (st.step === 2) fitHeight();
    };

    /* ---- resultado ---- */
    const waBtn = $('[data-qz-wa]', qz);
    const noteFor = () => {
      const d = SONHOS[st.dream];
      if ((st.base === 'preto' || st.base === 'escuro') && st.dream === 'perola') return 'Saindo de um cabelo escuro, a transformação para esse loiro costuma ser feita em etapas, preservando a saúde dos fios.';
      if (st.base === 'quimica') return 'Como o seu cabelo tem química, a Dra. avalia o histórico dos fios antes de definir o caminho.';
      return d.suave ? 'Uma cor que cresce bonita: valoriza o seu rosto e pede pouca manutenção.' : 'Uma cor marcante, que brilha mais com retoques no tempo certo.';
    };
    const paintResult = () => {
      if (!st.dream) return;
      const d = SONHOS[st.dream];
      const img = $('[data-qz-cphoto]', qz);
      img.src = `assets/img/cor-${st.dream}.jpg`;
      img.alt = `Resultado real: ${d.nome}`;
      $('[data-qz-cname]', qz).textContent = d.nome;
      $('[data-qz-ctec]', qz).textContent = d.tec;
      $('[data-qz-crec]', qz).textContent = `a cada ${meses(d.rec)}`;
      $('[data-qz-cbase]', qz).textContent = `${BASES[st.base].nome}, ${TEXTURAS[st.tex]}`;
      $('[data-qz-cnote]', qz).textContent = noteFor();
      const msg = 'Olá, Dra. Nicoly! Fiz o teste "Descubra sua cor" no site.\n\n'
        + `Meu cabelo hoje: ${BASES[st.base].nome}, ${TEXTURAS[st.tex]}\n`
        + `Resultado que sonho: *${d.nome}*\n`
        + `Quero cuidar a cada: ${meses(st.months)}\n\n`
        + 'Gostaria de agendar uma avaliação!';
      waBtn.href = waLink(msg);
    };

    /* ---- navegação entre etapas ---- */
    const ready = (i) => (i === 0 ? true : i === 1 ? !!(st.base && st.tex) : i === 2 || i === 3 ? !!(st.base && st.tex && st.dream) : false);
    // as etapas ficam empilhadas (CSS grid): o painel já tem a altura da maior, nada é cortado
    const fitHeight = () => {};
    const show = (i, focus) => {
      if (!ready(i)) return;
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
        li.classList.toggle('is-done', k < i || (k !== i && ready(k) && k < 3 && k <= maxReached()));
        $('button', li).disabled = !ready(k);
      });
      if (i === 2) paintLock();
      if (i === 3) paintResult();
      fitHeight();
      save();
      if (focus) { const h = $('.qz-q, .qz-card__name', steps[i]); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
    };
    const maxReached = () => (st.dream ? 3 : st.base && st.tex ? 1 : 0);
    const syncPicks = () => {
      $$('[data-qz-base]', qz).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.qzBase === st.base)));
      $$('[data-qz-tex]', qz).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.qzTex === st.tex)));
      $$('[data-qz-dream]', qz).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.qzDream === st.dream)));
      $('[data-qz-next]', steps[0]).disabled = !(st.base && st.tex);
      $('[data-qz-next]', steps[1]).disabled = !st.dream;
      paintArch();
    };

    qz.addEventListener('click', (e) => {
      const t = e.target.closest('button');
      if (!t) return;
      if (t.dataset.qzBase) { st.base = t.dataset.qzBase; syncPicks(); save(); return; }
      if (t.dataset.qzTex) { st.tex = t.dataset.qzTex; syncPicks(); save(); return; }
      if (t.dataset.qzDream) { st.dream = t.dataset.qzDream; syncPicks(); save(); return; }
      if (t.hasAttribute('data-qz-next')) { show(st.step + 1, true); return; }
      if (t.hasAttribute('data-qz-back')) { show(st.step - 1, true); return; }
      if (t.dataset.qzGoto) { show(Number(t.dataset.qzGoto), true); return; }
      if (t.hasAttribute('data-qz-restart')) {
        st = { step: 0, base: null, tex: null, dream: null, months: 3 };
        arch.style.removeProperty('--base');
        syncPicks(); show(0, true);
      }
    });
    range.addEventListener('input', () => { st.months = Number(range.value); paintLock(); save(); });
    window.addEventListener('resize', fitHeight);

    /* ---- cartão para salvar/compartilhar ---- */
    const MONO = new Path2D('M47.12 73.49Q46.78 73.49 46.78 73.15Q46.78 72.96 46.97 72.83Q47.07 72.74 47.21 72.63Q47.34 72.52 47.44 72.4Q48.05 71.64 48.54 70.58Q49.03 69.51 49.57 67.83Q50.12 66.15 50.88 63.56Q52.17 59.24 54.6 53.91Q57.03 48.59 59.99 43.51Q58.13 45.83 56.57 47.77Q55.01 49.71 53.44 51.59Q51.88 53.47 50.06 55.56Q48.24 57.65 45.85 60.29Q40.14 66.51 35.96 69.79Q31.79 73.08 28.74 73.08Q26.25 73.08 25.04 72.1Q23.83 71.13 23.83 69.78Q23.83 68.68 24.59 68.21Q25.34 67.73 26.1 67.73Q26.52 67.73 26.93 68Q27.35 68.27 27.35 68.85Q27.35 69.32 26.93 69.7Q26.52 70.08 25.98 70.08Q25.66 70.08 25.36 70.03Q25.05 69.98 24.81 69.83V69.98Q24.81 71.03 25.75 71.72Q26.69 72.42 28.69 72.42Q30.2 72.42 32.53 71.16Q34.87 69.9 38.21 66.95Q41.55 64 46.07 58.92Q53.74 50.28 57.78 45.25Q61.82 40.22 62.21 39.63Q62.65 39.09 62.82 39.09Q63.04 39.09 63.04 39.31Q63.04 39.46 62.94 39.63L62.6 40.27Q61.99 41.29 61.65 42.23Q61.31 43.17 61.01 44.2Q60.65 45.47 60.29 46.82Q59.94 48.18 59.4 49.92Q58.86 51.67 57.96 54.13Q56.98 56.82 55.98 58.92Q54.98 61.02 53.73 63.26Q52.47 65.51 50.66 68.68Q51.81 67.29 53.74 64.99Q55.67 62.68 58.05 59.91Q60.43 57.14 62.99 54.29Q65.55 51.45 67.97 48.96Q72.29 44.47 75.76 41.74Q79.23 39.02 82.17 37.78Q85.11 36.53 87.87 36.51Q90.43 36.51 91.75 37.64Q93.07 38.78 93.09 40.85Q93.12 42.37 92.03 44.21Q90.94 46.05 89 47.79Q87.06 49.52 84.5 50.76Q83.6 51.18 83.13 51.18Q82.86 51.18 82.86 51.01Q82.86 50.81 83.28 50.62Q85.26 49.86 87.16 48.37Q89.06 46.88 90.31 45.01Q91.55 43.15 91.55 41.27Q91.55 39.34 90.52 38.28Q89.48 37.21 87.6 37.21Q84.87 37.21 81.65 38.78Q78.44 40.34 74.44 43.76Q70.44 47.18 65.33 52.77Q61.28 57.21 57.99 61.08Q54.69 64.95 52.28 67.85Q49.88 70.76 48.49 72.35Q47.85 73.1 47.56 73.3Q47.27 73.49 47.12 73.49ZM36.23 53.13Q34.35 53.13 32.69 52.4Q31.03 51.67 30.02 50.17Q29.01 48.66 29.01 46.39Q29.01 44.1 30.4 42.26Q31.79 40.41 34.27 39.34Q36.75 38.26 39.99 38.26Q41.77 38.26 43.36 38.52Q44.95 38.78 46.85 39.56Q48.1 40.07 49.2 40.6Q50.29 41.12 51.69 41.76Q52.52 42.1 53.4 42.32Q54.27 42.54 55.08 42.54Q55.98 42.54 56.95 42.17Q57.91 41.8 58.6 41.22Q59.01 40.83 59.16 40.83Q59.35 40.83 59.35 41.02Q59.35 41.22 59.01 41.58Q58.35 42.22 57.3 42.72Q56.25 43.22 55.17 43.5Q54.08 43.78 53.32 43.78Q51.81 43.78 49.83 43.23Q47.85 42.68 46.34 41.78Q44.41 40.66 43.1 40.12Q41.8 39.58 40.8 39.4Q39.8 39.22 38.77 39.22Q36.35 39.22 34.3 40.17Q32.25 41.12 31.02 42.78Q29.79 44.44 29.79 46.54Q29.79 49.13 31.52 50.84Q33.25 52.55 36.13 52.55Q37.82 52.55 39.43 51.83Q41.04 51.11 42.1 49.79Q43.17 48.47 43.17 46.64Q43.17 45.66 42.51 44.95Q42.34 45.15 42.1 45.31Q41.87 45.47 41.55 45.47Q41.09 45.47 40.72 45.16Q40.36 44.86 40.36 44.37Q40.36 43.95 40.66 43.61Q40.97 43.27 41.55 43.27Q42.46 43.27 43.19 44.16Q43.92 45.05 43.92 46.54Q43.92 48.52 42.8 50Q41.68 51.47 39.92 52.3Q38.16 53.13 36.23 53.13ZM90.36 73.08Q88.88 73.08 88.14 72.41Q87.41 71.74 87.41 70.76Q87.41 70.05 88.04 68.51Q88.68 66.98 90.68 63.95Q93.03 60.46 95.96 56.9Q98.88 53.35 101.95 50.01Q105.01 46.66 107.86 43.76Q110.7 40.85 112.9 38.68Q111.8 39.46 110.46 40.58Q109.11 41.71 107.16 43.48Q105.21 45.25 102.35 47.93Q99.5 50.62 95.39 54.55Q93.34 56.5 89.45 60.53Q85.55 64.56 80.31 70.69Q79.04 72.18 78.56 72.52Q78.08 72.86 77.82 72.86Q77.64 72.86 77.46 72.61Q77.28 72.37 77.28 71.83Q77.28 69.78 78.69 66.45Q80.11 63.12 82.71 58.91Q85.31 54.69 88.88 49.98Q92.44 45.27 96.71 40.44Q95.34 41.68 91.72 45.44Q88.09 49.2 81.67 56.26Q76.11 62.36 71.66 66.11Q67.22 69.86 63.8 71.59Q60.87 73.05 58.63 73.05Q56.33 73.05 55.18 72.18Q54.04 71.3 54.04 69.93Q54.04 68.81 54.79 68.26Q55.55 67.71 56.31 67.71Q56.7 67.71 57.12 67.98Q57.55 68.24 57.55 68.83Q57.55 69.29 57.14 69.67Q56.72 70.05 56.16 70.05Q55.84 70.05 55.54 70Q55.23 69.95 54.99 69.78Q54.99 69.88 54.98 69.95Q54.96 70.03 54.96 70.08Q54.96 71.13 55.89 71.76Q56.82 72.4 58.6 72.4Q60.41 72.4 62.76 71.32Q65.12 70.25 68.33 67.74Q71.54 65.24 75.89 60.99Q80.23 56.75 86.02 50.42Q90.88 45.12 93.99 42.16Q97.1 39.19 98.68 38Q100.25 36.8 100.47 36.8Q100.64 36.8 100.89 36.86Q101.13 36.92 101.13 37.04Q101.13 37.19 100.76 37.51Q100.52 37.73 100.17 38.04Q99.81 38.36 99.3 38.87Q98.67 39.56 97.36 41.4Q96.05 43.24 94.33 45.84Q92.61 48.44 90.67 51.47Q88.73 54.5 86.82 57.58Q84.92 60.65 83.25 63.41Q81.58 66.17 80.37 68.28Q79.16 70.39 78.65 71.44Q81.31 68.37 83.47 65.93Q85.63 63.48 87.62 61.35Q89.61 59.21 91.69 57.09Q93.78 54.96 96.27 52.56Q98.76 50.15 101.94 47.15Q106.16 43.22 108.98 40.94Q111.8 38.65 113.48 37.69Q115.17 36.73 115.93 36.73Q116.17 36.73 116.17 36.92Q116.17 37.09 115.54 37.53Q114.9 37.97 114.17 38.61Q111.75 40.73 108.93 44.04Q106.11 47.35 103.16 51.28Q100.2 55.21 97.32 59.26Q94.44 63.31 91.9 66.93Q90.75 68.61 90.21 69.48Q89.66 70.34 89.51 70.72Q89.36 71.1 89.36 71.39Q89.36 72.42 90.78 72.42Q91.49 72.42 92.7 72.07Q93.9 71.71 95.22 71.04Q96.54 70.37 97.52 69.42Q97.64 69.47 97.64 69.73Q97.64 70.1 97.52 70.3Q96.47 71.17 95.1 71.8Q93.73 72.42 92.46 72.75Q91.19 73.08 90.36 73.08Z');
    const loadImg = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
    const fitText = (ctx, text, max, size, font) => {
      let s = size;
      do { ctx.font = font.replace('{s}', s); s -= 2; } while (ctx.measureText(text).width > max && s > 20);
    };
    const buildCard = async () => {
      const d = SONHOS[st.dream];
      const W = 1080; const H = 1350;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d');
      try {
        await Promise.all(['italic 64px "Cormorant Garamond"', '400 30px "Jost"', '500 22px "Jost"', '60px "Pinyon Script"'].map((f) => document.fonts.load(f)));
      } catch (e) { /* segue com fontes do sistema */ }
      const g = ctx.createRadialGradient(W / 2, 520, 60, W / 2, 560, 760);
      g.addColorStop(0, '#4A3027'); g.addColorStop(1, '#2F1B16');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // monograma
      ctx.save(); ctx.translate(W / 2 - 70 * 0.9, 34); ctx.scale(0.9, 0.9);
      ctx.strokeStyle = '#C8A46C'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.ellipse(70, 55, 66, 51, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([0.1, 6]); ctx.lineCap = 'round'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(70, 55, 59, 44.5, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = '#C8A46C'; ctx.fill(MONO); ctx.restore();
      // foto em arco
      const x0 = 260; const x1 = 820; const yTop = 200; const yBot = 880; const rad = (x1 - x0) / 2;
      const archPath = () => { ctx.beginPath(); ctx.moveTo(x0, yBot); ctx.lineTo(x0, yTop + rad); ctx.arc(W / 2, yTop + rad, rad, Math.PI, 0); ctx.lineTo(x1, yBot); ctx.closePath(); };
      try {
        const im = await loadImg(`assets/img/cor-${st.dream}.jpg`);
        ctx.save(); archPath(); ctx.clip();
        const bw = x1 - x0; const bh = yBot - yTop; const sc = Math.max(bw / im.width, bh / im.height);
        ctx.drawImage(im, x0 + (bw - im.width * sc) / 2, yTop + (bh - im.height * sc) / 2, im.width * sc, im.height * sc);
        ctx.restore();
      } catch (e) { /* sem foto */ }
      ctx.strokeStyle = 'rgba(200,164,108,.85)'; ctx.lineWidth = 3; archPath(); ctx.stroke();
      ctx.save(); ctx.translate(0, 0); ctx.strokeStyle = 'rgba(200,164,108,.35)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0 - 18, yBot + 18); ctx.lineTo(x0 - 18, yTop + rad); ctx.arc(W / 2, yTop + rad, rad + 18, Math.PI, 0); ctx.lineTo(x1 + 18, yBot + 18); ctx.closePath(); ctx.stroke(); ctx.restore();
      // textos
      ctx.textAlign = 'center'; ctx.fillStyle = '#C8A46C';
      ctx.font = '500 22px "Jost", sans-serif';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '8px';
      ctx.fillText('MEU TOM IDEAL', W / 2, 960);
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      ctx.fillStyle = '#FBF7F1'; fitText(ctx, d.nome, 940, 72, 'italic {s}px "Cormorant Garamond", serif');
      ctx.fillText(d.nome, W / 2, 1040);
      ctx.fillStyle = 'rgba(251,247,241,.72)'; ctx.font = '400 30px "Jost", sans-serif';
      ctx.fillText(d.tec, W / 2, 1094);
      ctx.fillStyle = '#E3CA9C'; ctx.fillText(`Cuidado ideal: a cada ${meses(d.rec)}`, W / 2, 1140);
      ctx.fillStyle = '#FBF7F1'; ctx.font = '60px "Pinyon Script", cursive';
      ctx.fillText('Dra. Nicoly Medeiros', W / 2, 1250);
      ctx.fillStyle = 'rgba(251,247,241,.6)'; ctx.font = '400 24px "Jost", sans-serif';
      ctx.fillText(`@${CONFIG.instagram}`, W / 2, 1300);
      return new Promise((res) => cv.toBlob(res, 'image/png'));
    };
    const saveBtn = $('[data-qz-save]', qz);
    saveBtn.addEventListener('click', async () => {
      if (!st.dream) return;
      saveBtn.disabled = true;
      try {
        const blob = await buildCard();
        const name = `meu-tom-${st.dream}.png`;
        const file = new File([blob], name, { type: 'image/png' });
        const baixar = () => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 4000);
        };
        // no celular abre o menu de compartilhar (WhatsApp, Instagram…); no computador, baixa a imagem
        const celular = window.matchMedia('(pointer: coarse)').matches;
        if (celular && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: 'Meu tom ideal · Dra. Nicoly Medeiros' });
          } catch (e) {
            if (e && e.name !== 'AbortError') baixar();
          }
        } else {
          baixar();
        }
      } finally { saveBtn.disabled = false; }
    });

    // estado inicial (retoma de onde a cliente parou), descartando valores inválidos
    if (!BASES[st.base]) st.base = null;
    if (!TEXTURAS[st.tex]) st.tex = null;
    if (!SONHOS[st.dream]) st.dream = null;
    st.months = Math.min(6, Math.max(1, Number(st.months) || 3));
    st.step = Number(st.step) || 0;
    if (st.step < 0 || st.step > 3 || !ready(st.step)) st.step = 0;
    $$('img', qz).forEach((im) => im.addEventListener('load', fitHeight));
    syncPicks();
    show(st.step, false);
    if (document.fonts) document.fonts.ready.then(fitHeight);
    window.addEventListener('load', fitHeight);
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
