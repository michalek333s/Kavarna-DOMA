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

  // menu: tabs + every item shows its photo
  const tabs = $$('.tabs button');
  if (tabs.length) {
    const pill = $('.tabs__pill');
    const movePill = btn => { pill.style.width = btn.offsetWidth + 'px'; pill.style.transform = `translateX(${btn.offsetLeft}px)`; };
    const img = $('#cardImg'), body = $('.menu__card-body');
    const wide = matchMedia('(min-width: 641px)');
    let current = null, swapT;
    const showItem = li => {
      if (!li || li === current) return;
      $$('.item.is-active').forEach(x => x.classList.remove('is-active'));
      li.classList.add('is-active'); current = li;
      const name = li.querySelector('.item__name').cloneNode(true);
      name.querySelectorAll('.tag').forEach(t => t.remove());
      const src = 'assets/img/' + li.dataset.img;
      new Image().src = src;
      img.classList.add('swap'); body.classList.add('swap');
      clearTimeout(swapT);
      swapT = setTimeout(() => {
        img.src = src; img.alt = li.dataset.alt;
        $('#cardTitle').textContent = name.textContent.trim();
        $('#cardText').textContent = li.querySelector('.item__desc').textContent;
        $('#cardHand').textContent = li.dataset.hand;
        img.classList.remove('swap'); body.classList.remove('swap');
      }, 260);
    };
    $$('.item[data-img]').forEach(li => {
      const btn = $('.item__btn', li);
      if (matchMedia('(hover:hover)').matches) li.addEventListener('mouseenter', () => wide.matches && showItem(li));
      btn.addEventListener('click', () => {
        if (wide.matches) { showItem(li); return; }
        const open = !li.classList.contains('is-open');
        const ph = $('.item__photo', li);
        if (open && !ph.firstChild) ph.innerHTML = `<img src="assets/img/${li.dataset.img}" alt="${li.dataset.alt}">`;
        $$('.item.is-open').forEach(x => { if (x !== li) { x.classList.remove('is-open', 'is-active'); $('.item__btn', x).setAttribute('aria-expanded', 'false'); } });
        li.classList.toggle('is-open', open); li.classList.toggle('is-active', open);
        btn.setAttribute('aria-expanded', open);
      });
    });
    tabs.forEach(btn => btn.addEventListener('click', () => {
      tabs.forEach(b => b.setAttribute('aria-selected', b === btn));
      $$('.menu__panel').forEach(p => { const on = p.dataset.panel === btn.dataset.tab; p.hidden = !on; p.classList.toggle('is-active', on); });
      movePill(btn);
      if (wide.matches) { current = null; showItem($(`.menu__panel[data-panel="${btn.dataset.tab}"] .item[data-img]`)); }
    }));
    if (wide.matches) { const first = $('.menu__panel.is-active .item[data-img]'); first.classList.add('is-active'); current = first; }
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

  // gallery: filters + lightbox
  const bento = $('#bento');
  if (bento) {
    const figsAll = $$('.gfig', bento);
    const stagger = () => figsAll.filter(f => !f.hidden).forEach((f, i) => {
      f.style.setProperty('--gd', Math.min(i, 10) * 0.04 + 's');
      f.style.animation = 'none'; f.offsetWidth; f.style.animation = '';
    });
    // stretch photos in the last row so a filtered grid never ends with gaps
    const measure = () => {
      const cs = getComputedStyle(bento), cols = cs.gridTemplateColumns.split(' ').length;
      const gap = parseFloat(cs.rowGap), rh = parseFloat(cs.gridAutoRows);
      const gb = bento.getBoundingClientRect(), cw = (gb.width + gap) / cols;
      const occ = new Set(); let rows = 0;
      const vis = figsAll.filter(f => !f.hidden);
      vis.forEach(f => {
        const r = f.getBoundingClientRect();
        const c0 = Math.round((r.left - gb.left) / cw), cs_ = Math.round((r.width + gap) / cw);
        const r0 = Math.round((r.top - gb.top) / (rh + gap)), rs = Math.round((r.height + gap) / (rh + gap));
        f._g = { c0, cs: cs_, r0, rs };
        for (let i = 0; i < cs_; i++) for (let k = 0; k < rs; k++) occ.add((r0 + k) * 100 + c0 + i);
        rows = Math.max(rows, r0 + rs);
      });
      return { cols, vis, holes: rows * cols - occ.size, rows };
    };
    const fillGaps = () => {
      figsAll.forEach(f => f.style.gridColumn = '');
      let m = measure();
      for (let tries = 0; m.holes > 0 && tries < 6; tries++) {
        const cands = m.vis.filter(f => f._g.cs < m.cols).reverse();
        let fixed = false;
        for (const f of cands) {
          const prev = f.style.gridColumn;
          f.style.gridColumn = `span ${Math.min(m.cols, f._g.cs + Math.max(1, Math.floor(m.holes / f._g.rs)))}`;
          const n = measure();
          if (n.holes < m.holes) { m = n; fixed = true; break; }
          f.style.gridColumn = prev; m = measure();
        }
        if (!fixed) break;
      }
    };
    addEventListener('resize', () => requestAnimationFrame(fillGaps));
    $$('.chip').forEach(ch => ch.addEventListener('click', () => {
      $$('.chip').forEach(c => { c.classList.toggle('is-on', c === ch); c.setAttribute('aria-pressed', c === ch); });
      const k = ch.dataset.filter;
      figsAll.forEach(f => { f.hidden = !(k === 'all' || f.dataset.cat === k); });
      fillGaps();
      if (!reduce) stagger();
    }));
    fillGaps();
    const lb = $('#lightbox');
    let list = [], cur = 0;
    const show = i => {
      cur = (i + list.length) % list.length;
      const f = list[cur], im = $('img', f);
      $('img', lb).src = im.src; $('img', lb).alt = im.alt;
      $('figcaption', lb).textContent = $('figcaption', f).textContent;
    };
    figsAll.forEach(f => $('.gfig__btn', f).addEventListener('click', () => {
      list = figsAll.filter(x => !x.hidden); show(list.indexOf(f)); lb.showModal();
    }));
    $('.lightbox__prev', lb).addEventListener('click', () => show(cur - 1));
    $('.lightbox__next', lb).addEventListener('click', () => show(cur + 1));
    $('.lightbox__close', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
  }

  const y = $('#year'); if (y) y.textContent = now.getFullYear();
})();
