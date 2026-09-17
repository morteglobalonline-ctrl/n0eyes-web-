/* n0eyes — site etkileşimleri (bağımlılık yok) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  I18N.apply(I18N.initial());
  document.querySelectorAll('.lang').forEach(b => b.addEventListener('click', () => I18N.apply(I18N.lang === 'tr' ? 'en' : 'tr')));
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- NAV ---------- */
  const nav = $('#nav');
  const onScrollNav = () => nav.classList.toggle('is-scrolled', scrollY > 40);
  addEventListener('scroll', onScrollNav, { passive: true }); onScrollNav();
  const burger = $('#burger');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open'); document.body.style.overflow = '';
  }));
  // logo: sayfayı yeniden yüklemeden başa dön, adres çubuğunda # kalmasın
  $('#brandHome').addEventListener('click', (e) => {
    e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' });
    history.replaceState(null, '', location.pathname + location.search);
  });

  /* ---------- INTRO: kare dizisi canvas'ta; kaydırdıkça akar; bitince site "bir anda" açılır ---------- */
  const intro = $('#intro'), spacer = $('#introSpacer'), loader = $('#introLoader');
  const canvas = $('#introCanvas'), ctx = canvas.getContext('2d', { alpha: false });
  const caption = $('#introCaption'), captionText = $('span', caption), bar = $('#introBar');
  const N = +canvas.dataset.frames, SRC = canvas.dataset.src;
  const frames = new Array(N).fill(null);
  let loaded = 0, drawn = -1, opened = false, lastCap = -1, target = 0, current = 0;
  const qs = new URLSearchParams(location.search);
  const hp = qs.get('hp');

  // --- yükleme: ilk 30 kare öncelikli, sonra kalan; 6 paralel istek ---
  const src = (i) => SRC.replace('{i}', String(i + 1).padStart(4, '0'));
  const loadFrame = (i) => new Promise((res) => {
    const im = new Image(); im.decoding = 'async';
    im.onload = () => { frames[i] = im; loaded++; res(); };
    im.onerror = () => res();
    im.src = src(i);
  });
  const queue = [...Array(N).keys()];
  // öncelik: 0..29 sırayla, sonra kalanlar her 4'te bir (kaba önizleme), sonra hepsi
  const order = [...queue.slice(0, 30), ...queue.slice(30).filter(i => i % 4 === 0), ...queue.slice(30).filter(i => i % 4 !== 0)];
  let cursor = 0;
  const worker = async () => { while (cursor < order.length) { const i = order[cursor++]; if (!frames[i]) await loadFrame(i); onLoadProgress(); } };
  const onLoadProgress = () => {
    loader.style.setProperty('--p', (loaded / N).toFixed(3));
    if (!intro.classList.contains('is-ready') && (loaded >= 30 || loaded === N)) { intro.classList.add('is-ready'); draw(0, true); }
  };
  for (let k = 0; k < 6; k++) worker();

  // --- çizim: cover-fit, dpr'a göre; kare yoksa en yakın yüklü önceki kare ---
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  const resize = () => { canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr); drawn = -1; draw(current, true); };
  addEventListener('resize', resize, { passive: true });
  const nearest = (i) => { for (let k = i; k >= 0; k--) if (frames[k]) return k; for (let k = i; k < N; k++) if (frames[k]) return k; return -1; };
  const draw = (p, force) => {
    let i = nearest(Math.round(p * (N - 1)));
    if (i < 0 || (i === drawn && !force)) return;
    const im = frames[i], cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
    drawn = i;
  };
  resize();

  // kaydırdıkça değişen alt yazılar (ilerleme eşiği, metin)
  const CAP_T = [0.00, 0.10, 0.24, 0.52, 0.88]; // metinler I18N.t('captions')
  addEventListener('langchange', () => { lastCap = -1; });

  const introProgress = () => {
    if (hp !== null) return +hp;
    const total = spacer.offsetHeight - innerHeight;
    return clamp(scrollY / total, 0, 1);
  };

  const applyIntro = (p) => {
    draw(p);
    bar.style.width = (p * 100).toFixed(2) + '%';
    intro.classList.toggle('is-scrolled', p > 0.03);
    let ci = 0; CAP_T.forEach((t0, i) => { if (p >= t0) ci = i; });
    if (ci !== lastCap) {
      lastCap = ci; caption.classList.remove('is-on');
      setTimeout(() => { captionText.textContent = I18N.t('captions')[ci]; caption.classList.add('is-on'); }, 160);
    }
  };

  const openSite = () => {
    if (opened) return; opened = true;
    intro.classList.add('is-flash');
    setTimeout(() => {
      document.body.classList.add('is-open');   // spacer gizlenir, nav belirir
      scrollTo({ top: 0, behavior: 'instant' });
      intro.classList.add('is-out');
      setTimeout(() => intro.classList.add('is-gone'), 500);
    }, 140);
  };

  // yumuşatma: hedefe uzaklığa göre hızlanan lerp (küçük farkta tam yapışır, büyük sıçramada akar)
  const introLoop = () => {
    if (opened) return;
    target = introProgress();
    const d = target - current;
    current += d * (reduced || hp !== null ? 1 : clamp(0.28 + Math.abs(d) * 2, 0.28, 0.6));
    if (Math.abs(d) < 0.0008) current = target;
    applyIntro(current);
    if (hp === null && target >= 0.985) openSite();
    requestAnimationFrame(introLoop);
  };

  $('#introSkip').addEventListener('click', openSite);
  addEventListener('keydown', (e) => { if (!opened && (e.key === 'Escape' || e.key === 'Enter')) openSite(); });
  if (qs.has('flat') || qs.has('site')) {
    opened = true; document.body.classList.add('is-open'); intro.classList.add('is-gone');
  } else {
    requestAnimationFrame(introLoop);
  }

  // HUD saati (hero) — sabah mesaisi saatinden akar
  const hudClock = $('#hudClock');
  let hudSec = 9 * 3600 + 23 * 60 + 12;
  const fmt = (s) => [s / 3600 | 0, (s / 60 | 0) % 60, s % 60].map(n => String(n).padStart(2, '0')).join(':');
  setInterval(() => { hudSec = (hudSec + 1) % 86400; hudClock.textContent = fmt(hudSec); }, 1000);

  /* ---------- REVEAL ---------- */
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal, .feature, #pipeline, #map').forEach(el => io.observe(el));

  /* ---------- SAYAÇLAR ---------- */
  const sufOf = (el) => (I18N.lang === 'en' && el.dataset.suffixEn !== undefined ? el.dataset.suffixEn : el.dataset.suffix) || '';
  addEventListener('langchange', () => $$('[data-count]').forEach(el => { if (el.dataset.done) el.textContent = el.dataset.count + sufOf(el); }));
  const countUp = (el) => {
    const end = +el.dataset.count, suf = sufOf(el), dur = 1400, t0 = performance.now();
    const step = (t) => {
      const k = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(end * e) + suf;
      if (k < 1) requestAnimationFrame(step); else el.dataset.done = '1';
    };
    requestAnimationFrame(step);
  };
  const cio = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); }
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  // tesis haritası: kamera sayacı bağlantı animasyonuyla artar
  const map = $('#map'), mapCount = $('#mapCamCount');
  const mio = new IntersectionObserver((es) => es.forEach(e => {
    if (!e.isIntersecting) return;
    const n = $$('.cam', map).length; let i = 0;
    const tick = () => { i++; mapCount.textContent = i; if (i < n) setTimeout(tick, 200); };
    setTimeout(tick, 300); mio.unobserve(map);
  }), { threshold: 0.3 });
  mio.observe(map);

  /* ---------- CANLI ANALİZ: video + eş zamanlı olay akışı ---------- */
  const live = $('.live'), lv = $('#liveVideo'), feed = $('#feed'), playBtn = $('#livePlay');
  const liveClock = $('#liveClock'), kKisi = $('#kpiKisi'), kHar = $('#kpiHareketsiz');
  const LIVE_START = 9 * 3600 + 23 * 60 + 30; // klip 09:23:30'da başlar (panel_veri: 33792 + 30 sn)
  // klibe göre saniye: gerçek pilot olaylarından (out/panel_veri.json, rapor_veri.json)
  // metinler I18N.t('events')[i] = [başlık, açıklama]
  const EVENTS = [
    { t: 0.5,  tip: 'info', kisi: 4, har: 3 },
    { t: 4,    tip: 'info', kisi: 5, har: 3 },
    { t: 10,   tip: 'warn', kisi: 5, har: 4 },
    { t: 16,   tip: 'info', kisi: 4, har: 1 },
    { t: 21,   tip: 'warn', kisi: 4, har: 2 },
    { t: 26,   tip: 'info', kisi: 3, har: 1 },
  ];
  addEventListener('langchange', () => { feed.innerHTML = ''; fired.clear(); }); // olaylar yeni dilde yeniden akar
  let fired = new Set();
  const resetFeed = () => { feed.innerHTML = ''; fired.clear(); };
  const pushEvent = (ev, t, i) => {
    const [b, sTxt] = I18N.t('events')[i];
    const li = document.createElement('li');
    li.className = 'feed__item' + (ev.tip === 'warn' ? ' feed__item--warn' : '');
    li.innerHTML = `<span class="feed__t">${fmt(LIVE_START + Math.floor(t))}</span><div><b>${b}</b><span>${sTxt}</span></div>`;
    feed.prepend(li);
    while (feed.children.length > 4) feed.lastElementChild.remove();
    kKisi.textContent = ev.kisi; kHar.textContent = ev.har;
  };
  lv.addEventListener('timeupdate', () => {
    const t = lv.currentTime;
    liveClock.textContent = fmt(LIVE_START + Math.floor(t));
    if (t < 0.3 && fired.size) resetFeed(); // döngü başa sardı
    EVENTS.forEach((ev, i) => { if (t >= ev.t && !fired.has(i)) { fired.add(i); pushEvent(ev, ev.t, i); } });
  });
  const playLive = () => lv.play().then(() => { live.classList.add('is-playing'); resetFeed(); }).catch(() => {});
  playBtn.addEventListener('click', playLive);
  lv.addEventListener('click', () => { if (lv.paused) playLive(); });
  // görünür olunca otomatik başlat (sessiz video => tarayıcı izin verir)
  const lio = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) playLive(); else { lv.pause(); live.classList.remove('is-playing'); }
  }), { threshold: 0.4 });
  lio.observe(live);

  /* ---------- DEBUG: ?flat=1 -> intro atlanır, her şey açık (tam sayfa ekran görüntüsü) ---------- */
  if (new URLSearchParams(location.search).has('flat')) {
    $$('.reveal, .feature, #pipeline, #map').forEach(el => el.classList.add('is-in'));
    $$('[data-count]').forEach(el => { el.textContent = el.dataset.count + sufOf(el); el.dataset.done = '1'; });
    mapCount.textContent = $$('.cam', map).length;
    $('.hero').style.minHeight = '900px'; // tam sayfa ekran görüntüsünde 100vh şişmesin
    const only = new URLSearchParams(location.search).get('only'); // &only=dunya -> yalnız o bölüm
    if (only) $$('main > *, .marquee').forEach(el => { if (el.id !== only) el.style.display = 'none'; });
  }

  /* ---------- DÜNYA AKIŞI: video + tespit JSON -> canvas kutular (id ile örnekler arası yumuşatma) ---------- */
  $$('.cam-tile').forEach(async (tile) => {
    const v = $('video', tile), c = $('canvas', tile), cx = c.getContext('2d');
    const cnt = $$('.cam-tile__cnt i', tile);
    let data; try { data = await (await fetch(tile.dataset.json)).json(); } catch { return; }
    const F = data.frames; if (!F.length) return;
    // data-yoksay="x1,y1,x2,y2;..." -> merkezi bu bölgelere düşen kutular çizilmez (durak, pano, sokak dışı)
    const YOK = (tile.dataset.yoksay || '').split(';').filter(Boolean).map(z => z.split(',').map(Number));
    const yoksay = (x1, y1, x2, y2) => { const cx0 = (x1 + x2) / 2, cy0 = (y1 + y2) / 2; return YOK.some(([a, b, c, d]) => cx0 >= a && cx0 <= c && cy0 >= b && cy0 <= d); };
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const fit = () => { c.width = tile.clientWidth * dpr; c.height = tile.clientHeight * dpr; };
    fit(); addEventListener('resize', fit, { passive: true });
    // örnek bul (ikili arama) ve id eşleşen kutuları t'ye göre interpolasyonla üret
    const at = (t) => {
      let lo = 0, hi = F.length - 1;
      while (lo < hi) { const m = (lo + hi + 1) >> 1; if (F[m].t <= t) lo = m; else hi = m - 1; }
      const a = F[lo], b = F[Math.min(lo + 1, F.length - 1)];
      const k = b.t > a.t ? clamp((t - a.t) / (b.t - a.t), 0, 1) : 0;
      const map = new Map(b.b.map(x => [x[6], x]));
      return a.b.map(x => {
        const y = x[6] >= 0 ? map.get(x[6]) : null;
        if (!y) return x;
        return [0, 1, 2, 3].map(i => x[i] + (y[i] - x[i]) * k).concat([x[4], x[5], x[6]]);
      });
    };
    const drawBoxes = () => {
      const boxes = at(v.currentTime);
      // object-fit:cover ölçeği
      const s = Math.max(c.width / data.w, c.height / data.h);
      const ox = (c.width - data.w * s) / 2, oy = (c.height - data.h * s) / 2;
      cx.clearRect(0, 0, c.width, c.height);
      cx.lineWidth = 1.5 * dpr; cx.font = `${10 * dpr}px Sora, sans-serif`; cx.textBaseline = 'top';
      const say = [0, 0, 0, 0];
      boxes.forEach(([x1, y1, x2, y2, cls, conf]) => {
        // gürültü süzgeci: dev kutular (sahne %35+) ve düşük güvenli araçlar
        if ((x2 - x1) * (y2 - y1) > 0.35 * data.w * data.h) return;
        if (cls !== 0 && conf < 0.5) return;
        if (yoksay(x1, y1, x2, y2)) return;
        say[cls]++;
        const X = ox + x1 * s, Y = oy + y1 * s, W = (x2 - x1) * s, H = (y2 - y1) * s;
        cx.strokeStyle = cls === 0 ? '#00E87A' : cls === 3 ? '#7dd3fc' : '#ffd166';
        const kucuk = H < 30 * dpr;
        cx.lineWidth = (kucuk ? 1 : 1.5) * dpr; cx.strokeRect(X, Y, W, H);
        if (kucuk) return;
        const L = 6 * dpr; cx.lineWidth = 2.5 * dpr; // köşe vurguları (logo dili)
        cx.beginPath(); cx.moveTo(X, Y + L); cx.lineTo(X, Y); cx.lineTo(X + L, Y); cx.moveTo(X + W - L, Y); cx.lineTo(X + W, Y); cx.lineTo(X + W, Y + L);
        cx.moveTo(X, Y + H - L); cx.lineTo(X, Y + H); cx.lineTo(X + L, Y + H); cx.moveTo(X + W - L, Y + H); cx.lineTo(X + W, Y + H); cx.lineTo(X + W, Y + H - L); cx.stroke();
        cx.lineWidth = 1.5 * dpr;
        if (W > 24 * dpr && H > 30 * dpr) { // küçük kutularda (kalabalık) etiket yok, sadece çerçeve
          const txt = `${I18N.t('etiket')[cls]} ${conf.toFixed(2)}`; const tw = cx.measureText(txt).width + 8 * dpr;
          const ly = Y - 14 * dpr < 0 ? Y + 2 * dpr : Y - 14 * dpr; // üst kenara sığmazsa içeri
          cx.fillStyle = 'rgba(10,10,10,.75)'; cx.fillRect(X, ly, tw, 13 * dpr);
          cx.fillStyle = cx.strokeStyle; cx.fillText(txt, X + 4 * dpr, ly + 1.5 * dpr);
        }
      });
      cnt.forEach(el => { el.textContent = say[+el.dataset.c]; });
    };
    let raf; const loop = () => { drawBoxes(); raf = requestAnimationFrame(loop); };
    const tio = new IntersectionObserver((es) => es.forEach(e => {
      if (e.isIntersecting) { v.play().catch(() => {}); cancelAnimationFrame(raf); loop(); }
      else { v.pause(); cancelAnimationFrame(raf); }
    }), { threshold: 0.3 });
    tio.observe(tile);
    v.addEventListener('loadeddata', drawBoxes);
  });

  /* ---------- FORM ---------- */
  $('#demoForm').addEventListener('submit', (e) => {
    // Şimdilik mailto; gerçek backend/Formspree bağlanınca burası değişir.
    const b = e.target.querySelector('button'); b.textContent = I18N.t('formSent');
  });
})();
