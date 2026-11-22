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
    $$('.tone').forEach((t) => t.classList.toggle('is-active', t.classList.contains(`tone--${key}`)));
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
})();
