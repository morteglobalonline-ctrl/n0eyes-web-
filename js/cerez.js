/* n0eyes — çerez/depolama bilgilendirmesi ve tercihi.
   Site reklam/takip çerezi kullanmaz; tek saklanan şey dil tercihidir.
   "Kabul": tercih tarayıcıda kalıcı saklanır.  "Reddet": hiçbir şey kalıcı yazılmaz,
   dil seçimi yalnız o sekme açıkken geçerli olur. Karar da bu tercihe göre saklanır. */
(() => {
  const K = 'n0eyes-cerez';
  const oku = () => { try { return localStorage.getItem(K) || sessionStorage.getItem(K) || ''; } catch { return ''; } };
  window.n0Riza = () => oku() === 'kabul';          // i18n / sayfa scriptleri bunu sorar

  if (oku()) return;                                 // karar verilmiş: şerit gösterme

  const dil = (() => { try { return localStorage.getItem('n0eyes-lang') === 'en' ? 'en' : 'tr'; } catch { return 'tr'; } })();
  const M = {
    tr: { m: 'Bu sitede reklam ve takip çerezi kullanılmaz. Yalnızca seçtiğiniz dili hatırlamak için tarayıcınıza küçük bir kayıt yazılır.',
          k: 'Kabul et', r: 'Reddet', p: 'Çerez Politikası' },
    en: { m: 'This site uses no advertising or tracking cookies. We only store your language choice in your browser.',
          k: 'Accept', r: 'Decline', p: 'Cookie Policy' },
  }[dil];

  const kok = document.createElement('div');
  kok.className = 'cerez';
  kok.innerHTML = `<p>${M.m} <a href="cerez.html">${M.p}</a></p>
    <div class="cerez__bt"><button type="button" data-k="red">${M.r}</button><button type="button" data-k="kabul" class="cerez__ok">${M.k}</button></div>`;
  const ekle = () => { document.body.appendChild(kok); requestAnimationFrame(() => kok.classList.add('is-in')); };
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', ekle) : ekle();

  kok.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const karar = b.dataset.k;
    try {
      if (karar === 'kabul') localStorage.setItem(K, 'kabul');
      else { sessionStorage.setItem(K, 'red'); localStorage.removeItem('n0eyes-lang'); }  // reddedince kalıcı kayıt bırakma
    } catch {}
    kok.classList.remove('is-in');
    setTimeout(() => kok.remove(), 320);
  });
})();
