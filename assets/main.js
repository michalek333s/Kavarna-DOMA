(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // page load → hero intro
  requestAnimationFrame(() => setTimeout(() => document.body.classList.add('is-loaded'), 80));

  // nav state
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // mobile drawer
  const burger = document.querySelector('.nav__burger');
  const drawer = document.getElementById('drawer');
  const setDrawer = open => {
    burger.setAttribute('aria-expanded', open);
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setDrawer(burger.getAttribute('aria-expanded') !== 'true'));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setDrawer(false)));

  // reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // hero warm glow follows pointer
  const hero = document.querySelector('.hero');
  const glow = document.querySelector('.hero__glow');
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      glow.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      glow.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  }

  // gentle parallax
  const pEls = [...document.querySelectorAll('[data-parallax]')];
  if (!reduce && pEls.length) {
    let ticking = false;
    const run = () => {
      pEls.forEach(el => {
        const r = el.getBoundingClientRect();
        const off = (r.top + r.height / 2 - innerHeight / 2) * parseFloat(el.dataset.parallax);
        el.style.translate = `0 ${off.toFixed(1)}px`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  // "Zavřete oči" – words light up while scrolling
  const st = document.getElementById('sensesText');
  if (st) {
    const accents = ['oči.', 'DOMA.'];
    st.innerHTML = st.textContent.trim().split(/\s+/)
      .map(w => `<span class="w${accents.includes(w) ? ' accent' : ''}">${w}</span>`).join(' ');
    const words = [...st.querySelectorAll('.w')];
    const light = () => {
      const r = st.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    };
    if (reduce) words.forEach(w => w.classList.add('on'));
    else { addEventListener('scroll', () => requestAnimationFrame(light), { passive: true }); light(); }
  }

  // menu tabs with sliding pill
  const tabs = [...document.querySelectorAll('.tabs button')];
  const pill = document.querySelector('.tabs__pill');
  const movePill = btn => {
    pill.style.width = btn.offsetWidth + 'px';
    pill.style.transform = `translateX(${btn.offsetLeft}px)`;
  };
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => b.setAttribute('aria-selected', b === btn));
    document.querySelectorAll('.menu__panel').forEach(p => {
      const on = p.dataset.panel === btn.dataset.tab;
      p.hidden = !on; p.classList.toggle('is-active', on);
    });
    movePill(btn);
    swapCard(btn.dataset.tab);
  }));

  // barista card follows the selected tab
  const cards = {
    kava:   { img: 'prelevani.jpg', alt: 'Přelévaná filtrovaná káva na pozadí naskládaného dřeva', t: 'Filtr z\u00a0výběrovky měsíce', p: 'Zeptejte se nás na aktuální zrno\u00a0— rádi Vám povíme, odkud pochází a\u00a0proč nás tak baví.', h: 'a k\u00a0tomu perníček ♥' },
    snidane: { img: 'snidane-croissant.jpg', alt: 'Croissant sendvič, latte a pomerančový džus na podnosu s logem DOMA', t: 'Croissant sendvič', p: 'Křupavý croissant plný dobrot, k\u00a0tomu latte a čerstvý džus. Takhle chutná dobré ráno.', h: 'snídaně jako doma ♥' },
    napoje: { img: 'ledova-kava.jpg', alt: 'Ledové latte a karamelové frappé se šlehačkou', t: 'Ledová káva & frappé', p: 'Když je venku horko: ledové latte nebo karamelové frappé se šlehačkou. Osvěží i\u00a0potěší.', h: 'léto u nás ☀' },
    sladke: { img: 'kolace.jpg', alt: 'Domácí koláče a fíkový koláč při svíčce', t: 'Domácí koláče', p: 'Pečené s\u00a0láskou, jako od babičky. A\u00a0když se poštěstí, i\u00a0fíkový koláč.', h: 'voní celou kavárnou ♥' }
  };
  const cardImg = () => document.getElementById('cardImg');
  const cardBody = document.querySelector('.menu__card-body');
  Object.values(cards).forEach(c => { const i = new Image(); i.src = 'assets/img/' + c.img; });
  function swapCard(key) {
    const c = cards[key], img = cardImg();
    img?.classList.add('swap'); cardBody.classList.add('swap');
    setTimeout(() => {
      if (img) { img.style.visibility = ''; img.src = 'assets/img/' + c.img; img.alt = c.alt; }
      document.getElementById('cardTitle').textContent = c.t;
      document.getElementById('cardText').textContent = c.p;
      document.getElementById('cardHand').textContent = c.h;
      img?.classList.remove('swap'); cardBody.classList.remove('swap');
    }, 380);
  }
  const syncPill = () => movePill(tabs.find(b => b.getAttribute('aria-selected') === 'true'));
  addEventListener('resize', syncPill);
  document.fonts?.ready.then(syncPill); syncPill();

  // opening hours → highlight today + open/closed badge
  const hours = { 0: [13, 18], 1: [7.5, 18], 2: [7.5, 18], 3: [7.5, 18], 4: [7.5, 18], 5: [7.5, 18], 6: [9, 17] };
  const now = new Date(), d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
  const rowDay = d === 0 ? '0' : d === 6 ? '6' : '1';
  document.querySelector(`#hours li[data-day="${rowDay}"]`)?.classList.add('today');
  const [o, c] = hours[d];
  const state = document.getElementById('openState');
  if (h >= o && h < c) state.textContent = `Právě otevřeno · do ${String(c).replace('.5', ':30')}${String(c).includes('.') ? '' : ':00'}`;
  else {
    state.textContent = h < o ? `Dnes otevíráme v ${Math.floor(o)}:${o % 1 ? '30' : '00'}` : 'Dnes už zavřeno · zítra zase';
    state.parentElement.classList.add('is-closed');
  }

  // count-up
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    if (reduce) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; obs.disconnect();
      const t0 = performance.now();
      const tick = t => {
        const p = Math.min(1, (t - t0) / 1600), v = Math.round(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = v.toLocaleString('cs-CZ');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    obs.observe(el);
  });

  // gallery: keep only photos that exist, then fill each row for a seamless loop
  (async () => {
    const tracks = [...document.querySelectorAll('.drift__track')];
    const figs = tracks.flatMap(tr => [...tr.children]);
    const ok = await Promise.all(figs.map(f => new Promise(res => {
      const i = new Image(); i.onload = () => res(true); i.onerror = () => res(false);
      i.src = f.querySelector('img').getAttribute('src');
    })));
    const avail = figs.filter((f, i) => ok[i]);
    if (!avail.length) return;
    tracks.forEach(tr => tr.innerHTML = '');
    avail.forEach((f, i) => { f.querySelector('img').loading = 'eager'; tracks[avail.length > 5 ? i % 2 : 0].appendChild(f); });
    tracks.forEach(tr => {
      if (!tr.children.length) { tr.closest('.drift__row').remove(); return; }
      const base = [...tr.children], need = innerWidth * 1.1;
      while (tr.scrollWidth < need) base.forEach(f => tr.appendChild(f.cloneNode(true)));
      [...tr.children].forEach(f => tr.appendChild(Object.assign(f.cloneNode(true), {})).setAttribute('aria-hidden', 'true'));
    });
  })();

  document.getElementById('year').textContent = new Date().getFullYear();
})();
