(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // page load → intro
  requestAnimationFrame(() => setTimeout(() => document.body.classList.add('is-loaded'), 60));

  // nav state
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // mobile drawer
  const burger = $('.nav__burger');
  const drawer = $('#drawer');
  const setDrawer = open => {
    burger.setAttribute('aria-expanded', open);
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setDrawer(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', drawer).forEach(a => a.addEventListener('click', () => setDrawer(false)));

  // reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  // hero: collage layers drift softly with the pointer
  const hp = $('#heroPhotos');
  if (hp) {
    $$('[data-depth]', hp).forEach(el => el.style.setProperty('--dp', el.dataset.depth));
    if (!reduce && matchMedia('(pointer:fine)').matches) {
      const hero = hp.closest('.hero');
      hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        hp.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        hp.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      });
      hero.addEventListener('pointerleave', () => { hp.style.setProperty('--px', 0); hp.style.setProperty('--py', 0); });
    }
  }

  // hero: little hearts rise from the latte now and then
  const hearts = $('#hearts');
  if (hearts && !reduce) {
    const svg = '<svg viewBox="0 0 20 18"><path d="M10 17S1 11.3 1 5.6A4.6 4.6 0 0 1 10 3.4a4.6 4.6 0 0 1 9 2.2C19 11.3 10 17 10 17z" fill="currentColor"/></svg>';
    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hearts.parentElement);
    const puff = () => {
      if (visible && !document.hidden) {
        const h = document.createElement('span');
        h.className = 'heartlet'; h.innerHTML = svg;
        h.style.setProperty('--dx', (Math.random() * 60 - 30).toFixed(0) + 'px');
        h.style.setProperty('--rot', (Math.random() * 40 - 20).toFixed(0) + 'deg');
        h.style.left = (Math.random() * 40 - 20).toFixed(0) + 'px';
        const s = 0.7 + Math.random() * 0.6; h.style.width = 18 * s + 'px'; h.style.height = 16 * s + 'px';
        hearts.appendChild(h); setTimeout(() => h.remove(), 3600);
      }
      setTimeout(puff, 1400 + Math.random() * 1800);
    };
    setTimeout(puff, 2200);
  }

  // gentle parallax
  const pEls = $$('[data-parallax]');
  if (!reduce && pEls.length) {
    let ticking = false;
    const run = () => {
      pEls.forEach(el => {
        const r = el.getBoundingClientRect();
        el.style.translate = `0 ${((r.top + r.height / 2 - innerHeight / 2) * parseFloat(el.dataset.parallax)).toFixed(1)}px`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  // "Zavřete oči" – words light up while scrolling
  const st = $('#sensesText');
  if (st) {
    const accents = ['oči.', 'DOMA.'];
    st.innerHTML = st.textContent.trim().split(/\s+/)
      .map(w => `<span class="w${accents.includes(w) ? ' accent' : ''}">${w}</span>`).join(' ');
    const words = $$('.w', st);
    const light = () => {
      const r = st.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.9 - r.top) / (r.height + innerHeight * 0.2)));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    };
    if (reduce) words.forEach(w => w.classList.add('on'));
    else { addEventListener('scroll', () => requestAnimationFrame(light), { passive: true }); light(); }
  }

  // menu tabs + barista card
  const tabs = $$('.tabs button');
  if (tabs.length) {
    const pill = $('.tabs__pill');
    const movePill = btn => { pill.style.width = btn.offsetWidth + 'px'; pill.style.transform = `translateX(${btn.offsetLeft}px)`; };
    const cards = {
      kava:    { img: 'prelevani.jpg', alt: 'Přelévaná filtrovaná káva na pozadí naskládaného dřeva', t: 'Přelévaná káva', p: 'Zeptejte se nás, jaké zrno máme zrovna na mlýnku\u00a0— rádi Vám o\u00a0něm povíme.', h: 'a k\u00a0tomu perníček ♥' },
      snidane: { img: 'snidane-croissant.jpg', alt: 'Croissant sendvič, latte a pomerančový džus na podnosu s logem DOMA', t: 'Croissant sendvič', p: 'Křupavý croissant plný dobrot, k tomu latte a čerstvý džus. Takhle chutná dobré ráno.', h: 'snídaně jako doma ♥' },
      sezona:  { img: 'dyne-latte.jpg', alt: 'Latte art dýně v keramickém hrnku', t: 'Co je zrovna v sezóně', p: 'V\u00a0létě káva na ledu a melounová limonáda, na podzim dýňové latte. Nabídka se mění s\u00a0ročním obdobím.', h: 'sledujte nás na Instagramu ♥' },
      sladke:  { img: 'dort-cokomalina.jpg', alt: 'Čokomalina – čokoládový dort s malinovým želé', t: 'Oblíbená čokomalina', p: 'Čokoládový dort s\u00a0malinami, kvůli kterému se k\u00a0nám hosté vracejí. A\u00a0ve vitríně vždy najdete i\u00a0něco veganského.', h: 'dortíky pečeme s\u00a0láskou ♥' }
    };
    Object.values(cards).forEach(c => { new Image().src = 'assets/img/' + c.img; });
    const img = $('#cardImg'), body = $('.menu__card-body');
    const swapCard = key => {
      const c = cards[key];
      img.classList.add('swap'); body.classList.add('swap');
      setTimeout(() => {
        img.src = 'assets/img/' + c.img; img.alt = c.alt;
        $('#cardTitle').textContent = c.t; $('#cardText').textContent = c.p; $('#cardHand').textContent = c.h;
        img.classList.remove('swap'); body.classList.remove('swap');
      }, 380);
    };
    tabs.forEach(btn => btn.addEventListener('click', () => {
      tabs.forEach(b => b.setAttribute('aria-selected', b === btn));
      $$('.menu__panel').forEach(p => { const on = p.dataset.panel === btn.dataset.tab; p.hidden = !on; p.classList.toggle('is-active', on); });
      movePill(btn); swapCard(btn.dataset.tab);
    }));
    const syncPill = () => movePill(tabs.find(b => b.getAttribute('aria-selected') === 'true'));
    addEventListener('resize', syncPill);
    document.fonts?.ready.then(syncPill); syncPill();
  }

  // opening hours → highlight today + open/closed badge
  const hours = { 0: [9, 18], 1: [8, 18], 2: [8, 18], 3: [8, 18], 4: [8, 18], 5: [8, 18], 6: [9, 18] };
  const now = new Date(), d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
  const fmt = x => `${Math.floor(x)}:${x % 1 ? '30' : '00'}`;
  $$(`#hours li[data-day="${d === 0 || d === 6 ? 'we' : 'wk'}"]`).forEach(li => li.classList.add('today'));
  const [o, c] = hours[d];
  const nextOpen = hours[(d + 1) % 7][0];
  $$('[data-open-state]').forEach(el => {
    if (h >= o && h < c) el.textContent = `Právě máme otevřeno · do ${fmt(c)}`;
    else {
      el.textContent = h < o ? `Dnes otevíráme v ${fmt(o)} · těšíme se` : `Zítra od ${fmt(nextOpen)} jsme tu pro Vás`;
      el.parentElement.classList.add('is-closed');
    }
  });

  // gallery lightbox
  const lb = $('#lightbox');
  if (lb) {
    const items = $$('.gfig__btn');
    let cur = 0;
    const show = i => {
      cur = (i + items.length) % items.length;
      const im = $('img', items[cur]);
      $('img', lb).src = im.src; $('img', lb).alt = im.alt;
      $('figcaption', lb).textContent = items[cur].closest('figure').querySelector('figcaption').textContent;
    };
    items.forEach((b, i) => b.addEventListener('click', () => { show(i); lb.showModal(); }));
    $('.lightbox__prev', lb).addEventListener('click', () => show(cur - 1));
    $('.lightbox__next', lb).addEventListener('click', () => show(cur + 1));
    $('.lightbox__close', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
  }

  const y = $('#year'); if (y) y.textContent = now.getFullYear();
})();
