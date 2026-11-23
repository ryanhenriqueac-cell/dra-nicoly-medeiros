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

  /* ---------- Teste: descubra sua cor ---------- */
  const quiz = $('[data-quiz]');
  if (quiz) {
    const stage = $('[data-q-stage]', quiz);
    const bar = $('[data-q-bar]', quiz);
    const section = quiz.closest('.quiz');
    const toneName = $('[data-q-name]', section);

    const QUESTIONS = [
      {
        id: 'base', title: 'Como está o seu cabelo hoje?',
        options: [
          { v: 'escuro', label: 'Castanho escuro ou preto', sub: 'cor natural', c: '#2A1810', tone: 'coloracao' },
          { v: 'medio', label: 'Castanho médio ou claro', sub: 'cor natural', c: '#6B4129', tone: 'morena' },
          { v: 'loiro', label: 'Já tenho loiro ou mechas', sub: 'quero renovar', c: '#D9B97E', tone: 'mechas' },
          { v: 'quimica', label: 'Tenho coloração ou química', sub: 'tinta, progressiva…', c: '#5A2A1C', tone: 'pigmentacao' },
        ],
      },
      {
        id: 'sonho', title: 'Qual resultado você sonha?',
        options: [
          { v: 'loiro', label: 'Um loiro luminoso', sub: 'do mel ao pérola', c: '#EFE3C8', tone: 'loiro' },
          { v: 'luz', label: 'Luz suave no rosto', sub: 'natural e sofisticado', c: '#C9A06A', tone: 'mechas' },
          { v: 'morena', label: 'Morena com reflexos', sub: 'caramelo e mel', c: '#9A6538', tone: 'morena' },
          { v: 'intensa', label: 'Cor intensa e brilho', sub: 'vida de volta aos fios', c: '#8A3A20', tone: 'pigmentacao' },
          { v: 'brancos', label: 'Cobrir os brancos', sub: 'com elegância', c: '#3A2219', tone: 'coloracao' },
        ],
      },
      {
        id: 'rotina', title: 'Quanto de manutenção combina com você?',
        options: [
          { v: 'minima', label: 'O mínimo possível', sub: 'a cada 4 a 6 meses', c: '#E6DACB' },
          { v: 'moderada', label: 'Moderada', sub: 'a cada 2 a 3 meses', c: '#C8A46C' },
          { v: 'impecavel', label: 'Amo estar sempre impecável', sub: 'todo mês, sem erro', c: '#A9854F' },
        ],
      },
    ];

    const RESULTS = {
      loiro: { nome: 'Loiro luminoso', tone: 'loiro', texto: 'Um loiro construído com técnica e cuidado com a fibra: claro, brilhante e saudável, no tom que valoriza a sua pele.', tecnica: 'Clareamento com proteção da fibra + tonalização' },
      mechas: { nome: 'Mechas iluminadas', tone: 'mechas', texto: 'Pontos de luz desenhados para o seu rosto, com raiz esfumada e transição suave. Você clareia sem marcação e cresce com elegância.', tecnica: 'Mechas personalizadas com raiz esfumada' },
      morena: { nome: 'Morena iluminada', tone: 'morena', texto: 'A profundidade das morenas com reflexos caramelo e mel que iluminam o rosto. Sofisticada, natural e de manutenção leve.', tecnica: 'Iluminação em tons caramelo e mel' },
      pigmentacao: { nome: 'Pigmentação & brilho', tone: 'pigmentacao', texto: 'Cor intensa, tons corrigidos e brilho de volta aos fios. Uma renovação visível já na primeira sessão.', tecnica: 'Pigmentação e correção de tons' },
      coloracao: { nome: 'Coloração sob medida', tone: 'coloracao', texto: 'Cobertura impecável da raiz às pontas, com uma cor criada para você e acabamento sofisticado.', tecnica: 'Coloração personalizada' },
    };
    const ROTINA_TXT = {
      minima: 'Pensada para crescer bonita e pedir pouca manutenção.',
      moderada: 'Retoques a cada 2 a 3 meses mantêm tudo perfeito.',
      impecavel: 'Com retoques frequentes, a cor fica sempre no auge.',
    };

    const decide = (a) => {
      const map = { loiro: 'loiro', luz: 'mechas', morena: 'morena', intensa: 'pigmentacao', brancos: 'coloracao' };
      let r = map[a.sonho];
      // loiro total em cabelo escuro com pouca manutenção: o caminho certo são mechas com raiz esfumada
      if (r === 'loiro' && a.base === 'escuro' && a.rotina === 'minima') r = 'mechas';
      // luz suave em cabelo escuro com pouca manutenção: morena iluminada
      if (a.sonho === 'luz' && a.base === 'escuro' && a.rotina === 'minima') r = 'morena';
      return r;
    };

    let step = 0;
    let answers = {};
    let busy = false;
    const label = (qId) => QUESTIONS.find((q) => q.id === qId).options.find((o) => o.v === answers[qId]).label;

    const showTone = (tone, name) => {
      $$('[data-q-tone]', section).forEach((t) => t.classList.toggle('is-active', t.dataset.qTone === tone));
      if (name) toneName.textContent = name;
    };

    const swap = (html) => {
      stage.classList.add('is-leaving');
      setTimeout(() => {
        stage.innerHTML = html;
        stage.classList.remove('is-leaving');
      }, reduceMotion ? 0 : 280);
    };

    const renderQuestion = (instant) => {
      const q = QUESTIONS[step];
      bar.style.width = `${(step / QUESTIONS.length) * 100}%`;
      const html = `
        <p class="quiz__count">Pergunta ${step + 1} de ${QUESTIONS.length}</p>
        <h3 class="quiz__q">${q.title}</h3>
        <div class="quiz__opts" role="group" aria-label="${q.title}">
          ${q.options.map((o) => `
            <button type="button" class="quiz__opt${answers[q.id] === o.v ? ' is-picked' : ''}" data-v="${o.v}">
              <span class="quiz__dot" style="--c:${o.c}"></span>
              <span class="quiz__opt-txt"><b>${o.label}</b><small>${o.sub}</small></span>
              <svg class="ico"><use href="#i-arrow"/></svg>
            </button>`).join('')}
        </div>
        ${step > 0 ? '<button type="button" class="quiz__back" data-back>← Voltar</button>' : ''}`;
      if (instant) stage.innerHTML = html; else swap(html);
    };

    const renderResult = () => {
      const r = RESULTS[decide(answers)];
      bar.style.width = '100%';
      showTone(r.tone, r.nome);
      const msg = 'Olá, Dra. Nicoly! Fiz o teste "Descubra sua cor" no site.\n\n'
        + `Meu resultado: *${r.nome}*\n`
        + `Cabelo hoje: ${label('base')}\n`
        + `Meu sonho: ${label('sonho')}\n`
        + `Manutenção: ${label('rotina')}\n\n`
        + 'Gostaria de agendar uma avaliação!';
      swap(`
        <p class="quiz__count">Seu resultado</p>
        <h3 class="quiz__result">${r.nome}</h3>
        <p class="quiz__text">${r.texto} ${ROTINA_TXT[answers.rotina]}</p>
        <p class="quiz__tec"><span>Caminho sugerido</span>${r.tecnica}</p>
        <div class="quiz__actions">
          <a class="btn btn--gold" href="${waLink(msg)}" target="_blank" rel="noopener"><svg class="ico"><use href="#i-wa"/></svg>Quero esse resultado</a>
          <button type="button" class="quiz__back" data-restart>Refazer o teste</button>
        </div>
        <p class="quiz__note">Resultado indicativo. A indicação final é feita na avaliação presencial, de acordo com o histórico e a saúde dos seus fios.</p>`);
    };

    stage.addEventListener('click', (e) => {
      const opt = e.target.closest('.quiz__opt');
      if (opt) {
        if (busy) return;
        busy = true;
        const q = QUESTIONS[step];
        answers[q.id] = opt.dataset.v;
        $$('.quiz__opt', stage).forEach((b) => b.classList.toggle('is-picked', b === opt));
        const o = q.options.find((x) => x.v === opt.dataset.v);
        if (o.tone) showTone(o.tone, o.label);
        step += 1;
        setTimeout(() => {
          if (step < QUESTIONS.length) renderQuestion(); else renderResult();
          setTimeout(() => { busy = false; }, reduceMotion ? 0 : 300);
        }, reduceMotion ? 0 : 220);
        return;
      }
      if (e.target.closest('[data-back]')) { step -= 1; renderQuestion(); return; }
      if (e.target.closest('[data-restart]')) {
        step = 0;
        answers = {};
        showTone('coloracao', 'Sua cor');
        renderQuestion();
      }
    });

    renderQuestion(true);
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
