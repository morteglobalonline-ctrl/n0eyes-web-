/**
 * n0eyes — demo formu uç noktası (Google Apps Script)
 * ---------------------------------------------------
 * Ne yapar: siteden gelen form gönderisini alır, Google E-Tablo'ya yazar,
 *   1) info@n0eyes.com adresine BİLDİRİM maili,
 *   2) talebi gönderen kişiye otomatik KARŞILAMA maili gönderir.
 * Mailler Google Workspace hesabından, yani info@n0eyes.com adresinden çıkar.
 *
 * KURULUM (yaklaşık 5 dakika, info@n0eyes.com ile oturum açmışken):
 *   1. https://script.google.com → Yeni proje. Adı: "n0eyes form".
 *   2. Bu dosyanın tamamını Code.gs içine yapıştır.
 *   3. AYAR bölümündeki SHEET_ID'yi doldur (boş bırakırsan tabloya yazmaz, yalnız mail atar).
 *      Tablo için: yeni bir Google E-Tablo aç, adresindeki /d/<SHEET_ID>/edit kısmını kopyala.
 *   4. Dağıt → Yeni dağıtım → Tür: Web uygulaması
 *        Yürüten: Ben (info@n0eyes.com)   |   Erişim: Herkes
 *      → Dağıt → izinleri onayla → çıkan "Web uygulaması URL"sini kopyala.
 *   5. O URL'yi siteye gir:  js/form.js içindeki UC = '...'  satırına yapıştır → commit + push.
 *
 * Not: Apps Script günlük mail kotası Workspace'te 1.500/gün; demo formu için fazlasıyla yeterli.
 */

/* ----------------------------- AYAR ----------------------------- */
const AYAR = {
  BILDIRIM: 'info@n0eyes.com',   // talepler buraya düşer
  GONDEREN: 'n0eyes',            // maillerde görünen ad
  SHEET_ID: '',                  // isteğe bağlı: gönderilerin yazılacağı E-Tablo kimliği
  SITE: 'https://n0eyes.com',
};
/* ---------------------------------------------------------------- */

function doPost(e) {
  try {
    const v = (e && e.parameter) || {};
    if (v.sirket) return cevap({ ok: true });                       // bal küpü doluysa: sessizce yut (bot)
    const ad = kirp(v.ad), firma = kirp(v.firma), eposta = kirp(v.eposta);
    const telefon = kirp(v.telefon), mesaj = kirp(v.mesaj), dil = v.dil === 'en' ? 'en' : 'tr';
    if (!ad || !firma || !eposta || !gecerliMail(eposta)) return cevap({ ok: false, hata: 'eksik' });

    tabloyaYaz([new Date(), ad, firma, eposta, telefon, mesaj, dil, kirp(v.kaynak)]);
    MailApp.sendEmail({
      to: AYAR.BILDIRIM, replyTo: eposta, name: AYAR.GONDEREN,
      subject: `Demo talebi — ${firma} (${ad})`,
      htmlBody: bildirimHtml({ ad, firma, eposta, telefon, mesaj, dil }),
      body: `Demo talebi\n\nAd: ${ad}\nFirma: ${firma}\nE-posta: ${eposta}\nTelefon: ${telefon}\n\n${mesaj}`,
    });
    MailApp.sendEmail({
      to: eposta, name: AYAR.GONDEREN, replyTo: AYAR.BILDIRIM,
      subject: dil === 'en' ? 'Your n0eyes demo request has reached us' : 'Demo talebiniz bize ulaştı — n0eyes',
      htmlBody: karsilamaHtml({ ad, firma, dil }),
      body: dil === 'en'
        ? `Hi ${ad},\n\nYour demo request has reached us. We reply within one business day.\n\nn0eyes — Plug. Install. See More.`
        : `Merhaba ${ad},\n\nDemo talebiniz bize ulaştı. En geç bir iş günü içinde dönüş yapıyoruz.\n\nn0eyes — Plug. Install. See More.`,
    });
    return cevap({ ok: true });
  } catch (err) {
    return cevap({ ok: false, hata: String(err) });
  }
}

function doGet() { return cevap({ ok: true, servis: 'n0eyes form' }); }

/* --------------------------- yardımcılar -------------------------- */
function kirp(x) { return String(x == null ? '' : x).trim().slice(0, 2000); }
function gecerliMail(x) { return /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(x); }
function cevap(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function kacis(x) { return String(x || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function tabloyaYaz(satir) {
  if (!AYAR.SHEET_ID) return;
  try {
    const sh = SpreadsheetApp.openById(AYAR.SHEET_ID).getSheets()[0];
    if (sh.getLastRow() === 0) sh.appendRow(['Tarih', 'Ad', 'Firma', 'E-posta', 'Telefon', 'Mesaj', 'Dil', 'Kaynak']);
    sh.appendRow(satir);
  } catch (err) { console.warn('tabloya yazilamadi', err); }
}

/* --------------------------- mail şablonları ---------------------- */
const MARKA = {
  siyah: '#0A0A0A', grafit: '#1A1D22', yesil: '#00E87A', beyaz: '#FFFFFF', gri: '#A7AFB7', cizgi: '#262B30',
};

function kabuk(icerik, altNot) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:${MARKA.siyah};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${MARKA.siyah};padding:32px 16px;">
 <tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${MARKA.grafit};border:1px solid ${MARKA.cizgi};border-radius:16px;overflow:hidden;">
   <tr><td style="padding:26px 28px 0;">
     <span style="font:800 22px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${MARKA.beyaz};letter-spacing:-0.5px;">n<span style="color:${MARKA.yesil};">0</span>eyes</span>
     <span style="font:600 9px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${MARKA.gri};letter-spacing:3px;padding-left:10px;">AI VISION SYSTEM</span>
   </td></tr>
   <tr><td style="padding:22px 28px 28px;font:400 15px/1.65 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${MARKA.gri};">
     ${icerik}
   </td></tr>
   <tr><td style="padding:18px 28px;border-top:1px solid ${MARKA.cizgi};font:400 12px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#6B7280;">
     ${altNot}
   </td></tr>
  </table>
  <div style="font:600 11px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#4B5563;padding-top:16px;letter-spacing:1px;">PLUG. INSTALL. SEE MORE.</div>
 </td></tr>
</table></body></html>`;
}

function karsilamaHtml(d) {
  const tr = d.dil !== 'en';
  const icerik = tr ? `
    <h1 style="margin:0 0 14px;font:700 24px/1.25 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${MARKA.beyaz};letter-spacing:-0.5px;">Talebiniz bize ulaştı.</h1>
    <p style="margin:0 0 16px;">Merhaba <strong style="color:${MARKA.beyaz};">${kacis(d.ad)}</strong>, <strong style="color:${MARKA.beyaz};">${kacis(d.firma)}</strong> için gönderdiğiniz demo talebini aldık. En geç <strong style="color:${MARKA.beyaz};">bir iş günü</strong> içinde size dönüyoruz.</p>
    <p style="margin:0 0 10px;color:${MARKA.beyaz};font-weight:600;">Bundan sonra ne oluyor?</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
      ${['30 dakikalık keşif görüşmesi: kameralarınız, izlemek istediğiniz alanlar ve raporlama ihtiyacınız.',
         'Kısa pilot: mevcut kameralarınızdan alınan görüntüyle gerçek ölçüm.',
         'Sonuç sunumu: işletmenizin kör noktaları sayıya dönüşmüş hâlde.'
        ].map((x, i) => `<tr><td style="padding:0 10px 10px 0;vertical-align:top;font:700 13px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${MARKA.yesil};">${i + 1}</td><td style="padding:0 0 10px;">${x}</td></tr>`).join('')}
    </table>
    <p style="margin:0 0 18px;">Bu arada sistemin ne yaptığını sitede görebilirsiniz:</p>
    <a href="${AYAR.SITE}" style="display:inline-block;background:${MARKA.yesil};color:#052614;text-decoration:none;font:600 14px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:12px 22px;border-radius:999px;">n0eyes.com</a>`
  : `
    <h1 style="margin:0 0 14px;font:700 24px/1.25 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${MARKA.beyaz};letter-spacing:-0.5px;">Your request has reached us.</h1>
    <p style="margin:0 0 16px;">Hi <strong style="color:${MARKA.beyaz};">${kacis(d.ad)}</strong>, we received the demo request for <strong style="color:${MARKA.beyaz};">${kacis(d.firma)}</strong>. We reply within <strong style="color:${MARKA.beyaz};">one business day</strong>.</p>
    <p style="margin:0 0 10px;color:${MARKA.beyaz};font-weight:600;">What happens next?</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
      ${['A 30-minute discovery call: your cameras, the areas you want watched, your reporting needs.',
         'A short pilot: real measurement from your existing cameras.',
         'The results: your blind spots turned into numbers.'
        ].map((x, i) => `<tr><td style="padding:0 10px 10px 0;vertical-align:top;font:700 13px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${MARKA.yesil};">${i + 1}</td><td style="padding:0 0 10px;">${x}</td></tr>`).join('')}
    </table>
    <a href="${AYAR.SITE}" style="display:inline-block;background:${MARKA.yesil};color:#052614;text-decoration:none;font:600 14px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:12px 22px;border-radius:999px;">n0eyes.com</a>`;
  const alt = tr
    ? `Bu e-posta, ${AYAR.SITE} üzerinden gönderdiğiniz demo talebi üzerine otomatik oluşturuldu. Yanıtlarsanız doğrudan ekibimize ulaşır.<br>Görüntü binanızdan çıkmaz · Kimlik verisi tutulmaz · <a href="${AYAR.SITE}/kvkk.html" style="color:${MARKA.gri};">KVKK Aydınlatma Metni</a>`
    : `This message was generated automatically after your demo request on ${AYAR.SITE}. Replying reaches our team directly.<br>Footage never leaves your building · No identity data · <a href="${AYAR.SITE}/kvkk.html" style="color:${MARKA.gri};">Data Protection Notice</a>`;
  return kabuk(icerik, alt);
}

function bildirimHtml(d) {
  const satir = (k, v) => v ? `<tr><td style="padding:7px 14px 7px 0;color:#6B7280;white-space:nowrap;">${k}</td><td style="padding:7px 0;color:${MARKA.beyaz};">${kacis(v)}</td></tr>` : '';
  const icerik = `
    <p style="margin:0 0 6px;font:600 11px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${MARKA.yesil};letter-spacing:2px;">YENİ DEMO TALEBİ</p>
    <h1 style="margin:0 0 18px;font:700 22px/1.25 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${MARKA.beyaz};">${kacis(d.firma)}</h1>
    <table role="presentation" cellpadding="0" cellspacing="0" style="font:400 14px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      ${satir('Ad Soyad', d.ad)}${satir('E-posta', d.eposta)}${satir('Telefon', d.telefon)}${satir('Dil', d.dil === 'en' ? 'English' : 'Türkçe')}
    </table>
    ${d.mesaj ? `<p style="margin:16px 0 0;padding:14px 16px;background:${MARKA.siyah};border-left:2px solid ${MARKA.yesil};border-radius:8px;color:${MARKA.beyaz};">${kacis(d.mesaj).replace(/\n/g, '<br>')}</p>` : ''}
    <p style="margin:18px 0 0;"><a href="mailto:${kacis(d.eposta)}" style="display:inline-block;background:${MARKA.yesil};color:#052614;text-decoration:none;font:600 14px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:11px 20px;border-radius:999px;">Yanıtla</a></p>`;
  return kabuk(icerik, 'Bu bildirim n0eyes.com demo formundan geldi. Yanıtla düğmesi doğrudan talep sahibine yazar.');
}
