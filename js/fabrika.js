/* n0eyes — #79 fabrika canlandırması: gerçek izlerin GÖRÜNTÜSÜZ oynatımı (şema v1, n0eyes deposu tools/site_iz_disa.py).
   Kütüphane yok. JSON: kaynak · bolgeler (0-1 poligon) · izler (p = [t sn, x, y, w, h], kutu merkezi/boyutu 0-1) · alarm · isi.
   Zemin: JSON'da "zemin" (çizgi çizimi dosyası, JSON'a göre yol) varsa o, yoksa soyut ızgara. Metinler I18N.t('fabrika').
   Test kancası: ?ft=412 → o saniyede sabit kare (azaltılmış hareket ile aynı yol). */
(() => {
  const bolum = document.getElementById('fabrika'); if (!bolum) return;
  const fig = bolum.querySelector('.fab'), sahne = fig.querySelector('.fab__sahne'), cv = sahne.querySelector('canvas'), cx = cv.getContext('2d');
  const rozet = fig.querySelector('.fab__rozet'), saat = fig.querySelector('.fab__saat'), cipler = fig.querySelector('.fab__bolgeler'), balon = fig.querySelector('.fab__alarm');
  const tespitSay = bolum.querySelector('#fabTespit');
  const ft = new URLSearchParams(location.search).get('ft');
  const sabit = matchMedia('(prefers-reduced-motion: reduce)').matches || ft !== null;
  const YESIL = '0,232,122', SARI = '255,209,102', MAVI = '125,211,252', TURUNCU = '255,106,61';
  const renk = (s) => s === 'insan' ? YESIL : s === 'forklift' ? MAVI : SARI;
  const KUYRUK = 20, BOSLUK = 3;                     // sn: iz kuyruğu · bu kadar boşlukta interpolasyon yok
  const M = () => I18N.t('fabrika');
  let veri, zemin = null, zeminCv, isiCv = {}, dpr = 1, W = 0, H = 0, t = 0, hiz = 1, raf = 0, son = 0, gorunur = false, sonDom = -1;

  const ara = (p, t) => { let lo = 0, hi = p.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (p[m][0] <= t) lo = m; else hi = m - 1; } return lo; };
  const konum = (z, t) => {                        // → [x, y, w, h] (y = ayak) ya da null
    const p = z.p; if (t < p[0][0] || t > p[p.length - 1][0]) return null;
    const i = ara(p, t), a = p[i], b = p[Math.min(i + 1, p.length - 1)];
    if (b[0] - a[0] > BOSLUK) return t - a[0] < 1 ? [a[1], a[2] + a[4] / 2, a[3], a[4]] : null;
    const k = b[0] > a[0] ? (t - a[0]) / (b[0] - a[0]) : 0, L = (j) => a[j] + (b[j] - a[j]) * k;
    return [L(1), L(2) + L(4) / 2, L(3), L(4)];
  };
  const icinde = (x, y, P) => { let ic = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ic = !ic; } return ic; };
  const saatBicim = (s) => { s = ((Math.floor(s) % 86400) + 86400) % 86400; return [s / 3600 | 0, (s / 60 | 0) % 60, s % 60].map(n => String(n).padStart(2, '0')).join(':'); };
  const basSn = () => { const m = /(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(veri.kaynak.bas_yerel || ''); return m ? +m[1] * 3600 + +m[2] * 60 + +(m[3] || 0) : 0; };
  const yasakMi = (b) => /yasak/i.test(b.tip || '');
  const adBicim = (s) => String(s).replace(/_/g, ' ').toUpperCase();   // adlar ASCII katlanmis (hatti → HATTI; tr yerel ayari HATTİ yapardi)
  const bolgeAd = (b) => adBicim(I18N.lang === 'en' && b.ad_en ? b.ad_en : b.ad);   // JSON'da istege bagli ad_en (yoksa TR ad)
  const kac = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);   // JSON metni innerHTML'e kacirilarak

  /* ---- sabit katmanlar: zemin (çizim ya da ızgara) + bölgeler; ısı haritası (gün) ---- */
  const zeminCiz = () => {
    zeminCv = zeminCv || document.createElement('canvas'); zeminCv.width = W; zeminCv.height = H;
    const z = zeminCv.getContext('2d');
    z.fillStyle = '#07090b'; z.fillRect(0, 0, W, H);
    if (zemin) { z.globalAlpha = .55; z.drawImage(zemin, 0, 0, W, H); z.globalAlpha = 1; }
    else {
      const a = Math.max(18 * dpr, W / 28); z.strokeStyle = 'rgba(255,255,255,.055)'; z.lineWidth = 1;
      z.beginPath(); for (let x = a / 2; x < W; x += a) { z.moveTo(x, 0); z.lineTo(x, H); } for (let y = a / 2; y < H; y += a) { z.moveTo(0, y); z.lineTo(W, y); } z.stroke();
    }
    const g = z.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); z.fillStyle = g; z.fillRect(0, 0, W, H);
    z.font = `600 ${10 * dpr}px Sora, sans-serif`; z.textBaseline = 'bottom';
    (veri.bolgeler || []).forEach((b) => {
      const P = b.poligon, r = yasakMi(b) ? TURUNCU : YESIL; if (!P || P.length < 3) return;
      z.beginPath(); P.forEach(([x, y], i) => i ? z.lineTo(x * W, y * H) : z.moveTo(x * W, y * H)); z.closePath();
      z.fillStyle = `rgba(${r},.05)`; z.fill(); z.setLineDash([6 * dpr, 5 * dpr]); z.strokeStyle = `rgba(${r},.38)`; z.lineWidth = 1.2 * dpr; z.stroke(); z.setLineDash([]);
      const lx = Math.min(...P.map(q => q[0])), ly = Math.min(...P.map(q => q[1]));     // etiket: bolgenin sol ust kosesi
      z.fillStyle = `rgba(${r},.75)`; z.fillText(bolgeAd(b), Math.min(lx * W + 6 * dpr, W - 80 * dpr), Math.max(ly * H - 4 * dpr, 12 * dpr));
    });
  };
  const isiHazirla = () => {
    const I = veri.isi; if (!I || !I.sinif) return;
    Object.entries(I.sinif).forEach(([s, h]) => {
      const c = document.createElement('canvas'); c.width = I.en; c.height = I.boy; const k = c.getContext('2d');
      const mx = Math.max(1, ...h.map(q => q[2]));
      h.forEach(([x, y, n]) => { k.fillStyle = `rgba(${renk(s)},${(Math.pow(n / mx, .55) * .5).toFixed(3)})`; k.fillRect(x, y, 1, 1); });
      isiCv[s] = c;
    });
  };

  /* ---- bir kare ---- */
  const ciz = (t, tumIz) => {
    cx.drawImage(zeminCv, 0, 0);
    const isiA = sabit ? 1 : .25 + .75 * (t / veri.kaynak.sure_sn);     // gün boyu biriken: döngü ilerledikçe koyulaşır
    cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high'; cx.globalAlpha = isiA;
    Object.values(isiCv).forEach(c => cx.drawImage(c, 0, 0, W, H)); cx.globalAlpha = 1;
    const al = veri.alarm, alAktif = al && t >= al.t && t <= al.t + Math.max(al.sure_sn || 0, 1);
    if (alAktif) (veri.bolgeler || []).filter(yasakMi).forEach((b) => {
      cx.beginPath(); b.poligon.forEach(([x, y], i) => i ? cx.lineTo(x * W, y * H) : cx.moveTo(x * W, y * H)); cx.closePath();
      cx.fillStyle = `rgba(${TURUNCU},${.08 + .06 * Math.sin(performance.now() / 180)})`; cx.fill(); cx.strokeStyle = `rgba(${TURUNCU},.85)`; cx.lineWidth = 1.6 * dpr; cx.stroke();
    });
    const say = { kisi: 0, arac: 0, b: (veri.bolgeler || []).map(() => 0) };
    cx.lineCap = 'round'; cx.lineJoin = 'round';
    veri.izler.forEach((z) => {
      const p = z.p, r = renk(z.sinif);
      if (tumIz) {                                   // sabit kare: tüm iz yolu soluk
        cx.strokeStyle = `rgba(${r},.16)`; cx.lineWidth = 1.2 * dpr; cx.beginPath();
        p.forEach((q, i) => { const x = q[1] * W, y = (q[2] + q[4] / 2) * H; i && q[0] - p[i - 1][0] <= BOSLUK ? cx.lineTo(x, y) : cx.moveTo(x, y); }); cx.stroke();
      }
      const k = konum(z, t); if (!k) return;
      const i1 = ara(p, t), i0 = ara(p, t - KUYRUK), n = i1 - i0;
      if (n > 0) for (let d = 0; d < 4; d++) {      // kuyruk: 4 dilim, eskisi soluk
        const a = i0 + Math.floor(n * d / 4), b = i0 + Math.floor(n * (d + 1) / 4); if (b <= a) continue;
        cx.strokeStyle = `rgba(${r},${(.12 + .18 * d).toFixed(2)})`; cx.lineWidth = (z.sinif === 'insan' ? 1.6 : 2.4) * dpr; cx.beginPath();
        for (let j = a; j <= b; j++) { const q = p[j], x = q[1] * W, y = (q[2] + q[4] / 2) * H; j > a && q[0] - p[j - 1][0] <= BOSLUK ? cx.lineTo(x, y) : cx.moveTo(x, y); }
        if (d === 3) cx.lineTo(k[0] * W, k[1] * H); cx.stroke();
      }
      const [x, y, w, h] = k, X = x * W, Y = y * H;
      if (z.sinif === 'insan') {
        say.kisi++;
        cx.fillStyle = `rgba(${r},.18)`; cx.beginPath(); cx.arc(X, Y, 7 * dpr, 0, 7); cx.fill();
        cx.fillStyle = `rgb(${r})`; cx.beginPath(); cx.arc(X, Y, 3.2 * dpr, 0, 7); cx.fill();
      } else {
        say.arac++;
        const bw = Math.max(w * W, 10 * dpr), bh = Math.max(h * H, 8 * dpr);
        cx.fillStyle = `rgba(${r},.12)`; cx.strokeStyle = `rgb(${r})`; cx.lineWidth = 1.5 * dpr;
        cx.beginPath(); cx.rect(X - bw / 2, Y - bh, bw, bh); cx.fill(); cx.stroke();
      }
      (veri.bolgeler || []).forEach((b, bi) => { if (b.poligon && icinde(x, y, b.poligon)) say.b[bi]++; });
    });
    return { say, alAktif };
  };

  /* ---- HUD (DOM, ~5 Hz) ---- */
  const cipKur = () => {
    const m = M();
    cipler.innerHTML = [`<span class="fab__cip"><i>${m.kisi}</i><b data-k="kisi">0</b></span>`, `<span class="fab__cip"><i>${m.arac}</i><b data-k="arac">0</b></span>`]
      .concat((veri.bolgeler || []).map((b, i) => `<span class="fab__cip${yasakMi(b) ? ' fab__cip--yasak' : ''}"><i>${kac(bolgeAd(b))}</i><b data-b="${i}">0</b></span>`)).join('');
    rozet.textContent = veri.kaynak.sentetik ? m.sentetik : m.rozet; rozet.classList.toggle('is-sentetik', !!veri.kaynak.sentetik);
    const al = veri.alarm;
    if (al) {
      const gb = al.geri_bildirim, ok = gb === 'dogru' || gb === 'normal', yan = gb === 'kisi_yok' || gb === 'yanlis';
      balon.innerHTML = `<b>${m.tur[al.tur] || kac(adBicim(al.tur || ''))} · ${saatBicim(basSn() + al.t).slice(0, 5)}</b>`
        + `<span class="fab__gb"><span class="${ok ? 'is-on' : ''}">${ok ? '✓ ' : ''}${m.dogru}</span><span class="${yan ? 'is-on is-yan' : ''}">${yan ? '✓ ' : ''}${m.yanlis}</span></span><small>${m.not}</small>`;
    }
  };
  const balonYer = () => {                         // balon yasak bolgenin YANINA (olayi ortmesin), sahne ve ust cubuk icinde kalir
    const y = (veri.bolgeler || []).find(yasakMi); if (!y || balon.hidden) return;
    const sw = sahne.clientWidth, sh = sahne.clientHeight, bw = balon.offsetWidth, ust = fig.querySelector('.fab__top');
    const xs = y.poligon.map(q => q[0]), sag = (Math.min(...xs) + Math.max(...xs)) / 2 > .5;
    const x = sag ? Math.min(...xs) * sw - bw - 14 : Math.max(...xs) * sw + 14;
    balon.style.left = `${Math.max(8, Math.min(x, sw - bw - 8))}px`;
    balon.style.top = `${Math.max(Math.min(...y.poligon.map(q => q[1])) * sh, ust.offsetTop + ust.offsetHeight + 8)}px`;
    balon.classList.add('is-yer');
  };
  const domGuncelle = (t, r) => {
    saat.textContent = saatBicim(basSn() + t);
    cipler.querySelectorAll('b[data-k]').forEach(el => { el.textContent = r.say[el.dataset.k]; });
    cipler.querySelectorAll('b[data-b]').forEach(el => { el.textContent = r.say.b[+el.dataset.b]; });
    balon.hidden = !r.alAktif; balonYer();
  };

  /* ---- döngü ---- */
  const olcekle = () => {
    const r = sahne.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = Math.max(1, Math.round(r.width * dpr)); H = cv.height = Math.max(1, Math.round(r.height * dpr));
    if (veri) { zeminCiz(); if (sabit) sabitCiz(); }
  };
  const sabitCiz = () => { const t0 = ft !== null ? +ft : veri.alarm ? veri.alarm.t + 2 : veri.kaynak.sure_sn / 2; domGuncelle(t0, ciz(t0, true)); };
  const adim = (now) => {
    const dt = Math.min(.1, (now - (son || now)) / 1000); son = now;
    const S = veri.kaynak.sure_sn, al = veri.alarm, taban = Math.max(1, S / 70);
    const hedef = al && t >= al.t - 6 && t <= al.t + Math.max(al.sure_sn || 0, 8) ? Math.min(taban, 3) : taban;   // alarm anında yavaşla
    hiz += (hedef - hiz) * Math.min(1, dt * 3); t += dt * hiz; if (t > S) t = 0;
    const r = ciz(t, false);
    if (now - sonDom > 200) { sonDom = now; domGuncelle(t, r); }
    raf = gorunur ? requestAnimationFrame(adim) : 0;
  };
  const basla = () => { if (!raf && gorunur && !sabit) { son = 0; raf = requestAnimationFrame(adim); } };

  const yukle = async () => {
    try { veri = await (await fetch(fig.dataset.json)).json(); } catch { return; }
    if (veri.surum !== 1 || !Array.isArray(veri.izler)) { console.warn('fabrika: desteklenmeyen sema', veri.surum); veri = null; return; }
    veri.izler = veri.izler.filter(z => z.p && z.p.length);
    if (tespitSay) tespitSay.textContent = veri.izler.reduce((s, z) => s + z.p.length, 0).toLocaleString(I18N.lang === 'tr' ? 'tr-TR' : 'en-US');
    if (veri.zemin) zemin = await new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = new URL(veri.zemin, new URL(fig.dataset.json, location.href)).href; });
    // en-boy: zemin cizgi ciziminin dogal orani, yoksa 16:9 — kaynak.kare (704x576 alt akis) ANAMORFIK, gercek goruntu 16:9; x,y zaten 0-1
    sahne.style.aspectRatio = zemin ? `${zemin.naturalWidth}/${zemin.naturalHeight}` : '16/9';
    isiHazirla(); cipKur(); olcekle(); basla();
    if (!sabit) domGuncelle(0, ciz(0, false));
  };
  addEventListener('langchange', () => { if (!veri) return; cipKur(); zeminCiz(); if (tespitSay) tespitSay.textContent = veri.izler.reduce((s, z) => s + z.p.length, 0).toLocaleString(I18N.lang === 'tr' ? 'tr-TR' : 'en-US'); if (sabit) sabitCiz(); });
  (window.ResizeObserver ? new ResizeObserver(olcekle).observe(sahne) : addEventListener('resize', olcekle, { passive: true }));
  let istendi = false;
  new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting && !istendi) { istendi = true; yukle(); }
  }), { rootMargin: '600px 0px' }).observe(fig);
  new IntersectionObserver((es) => es.forEach((e) => {
    gorunur = e.isIntersecting; if (gorunur && veri) basla();
  }), { threshold: .15 }).observe(sahne);
})();
