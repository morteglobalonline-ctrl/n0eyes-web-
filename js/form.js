/* n0eyes — demo formu gönderimi.
   Uç nokta: Google Apps Script web uygulaması (mailler info@n0eyes.com'dan çıkar).
   Kurulum: sunucu/form.gs dosyasındaki adımlar → çıkan URL'yi aşağıdaki UC satırına yapıştır. */
(() => {
  const UC = 'https://n0eyes-form.netlify.app/api/form';   // Netlify Function (boşsa form mailto'ya düşer)
  const f = document.querySelector('#demoForm'); if (!f) return;
  const dugme = f.querySelector('button[type="submit"]');
  const T = {
    tr: { gonderiliyor: 'Gönderiliyor…', ok: 'Talebiniz bize ulaştı', okAlt: 'Bir iş günü içinde dönüş yapıyoruz. Onay e-postası yolda.',
          hata: 'Gönderilemedi — lütfen tekrar deneyin ya da info@n0eyes.com adresine yazın.', yeni: 'Yeni talep gönder',
          epostaHata: 'E-posta adresini kontrol edin — bu adrese ulaşamıyoruz.' },
    en: { gonderiliyor: 'Sending…', ok: 'Your request has reached us', okAlt: 'We reply within one business day. A confirmation e-mail is on its way.',
          hata: 'Could not send — please try again or write to info@n0eyes.com.', yeni: 'Send another request',
          epostaHata: 'Please check the e-mail address — we can’t reach it.' },
  };
  const dil = () => (document.documentElement.lang === 'en' ? 'en' : 'tr');
  const t = (k) => T[dil()][k];

  // bal küpü: botlar doldurur, insan görmez
  const tuzak = document.createElement('input');
  Object.assign(tuzak, { type: 'text', name: 'sirket', tabIndex: -1, autocomplete: 'off' });
  tuzak.setAttribute('aria-hidden', 'true');
  tuzak.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
  f.appendChild(tuzak);

  const basarili = () => {
    const kutu = document.createElement('div');
    kutu.className = 'form__ok';
    kutu.innerHTML = `<div class="form__okIcon">✓</div><b>${t('ok')}</b><span>${t('okAlt')}</span>
      <button type="button" class="form__again">${t('yeni')}</button>`;
    f.replaceWith(kutu);
    kutu.querySelector('.form__again').addEventListener('click', () => { kutu.replaceWith(f); f.reset(); kur(); });
  };

  let gonderiliyor = false;
  const gonder = async (e) => {
    e.preventDefault();
    if (gonderiliyor) return;
    if (!UC) { location.href = `mailto:info@n0eyes.com?subject=${encodeURIComponent('Demo talebi')}&body=${encodeURIComponent([...new FormData(f)].map(([k, v]) => `${k}: ${v}`).join('\n'))}`; return; }
    gonderiliyor = true;
    const eski = dugme.textContent; dugme.textContent = t('gonderiliyor'); dugme.disabled = true;
    const veri = new FormData(f);
    veri.append('dil', dil()); veri.append('kaynak', location.pathname + location.search);
    try {
      // Apps Script yönlendirmeli yanıt verir; basit istek (no preflight) için URLSearchParams kullanılır
      const r = await fetch(UC, { method: 'POST', body: new URLSearchParams([...veri]) });
      const j = await r.json().catch(() => ({ ok: r.ok }));
      if (!j.ok) throw new Error(j.hata || 'hata');
      basarili();
    } catch (err) {
      dugme.textContent = eski; dugme.disabled = false; gonderiliyor = false;
      let uyari = f.querySelector('.form__err');
      if (!uyari) { uyari = document.createElement('p'); uyari.className = 'form__err form__full'; f.appendChild(uyari); }
      uyari.textContent = err && err.message === 'eposta_alani' ? t('epostaHata') : t('hata');
    }
  };
  const kur = () => { f.removeEventListener('submit', gonder); f.addEventListener('submit', gonder); gonderiliyor = false; };
  kur();
})();
