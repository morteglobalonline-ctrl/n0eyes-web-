/* n0eyes — demo formu uç noktası (Netlify Function)
 * -------------------------------------------------
 * Formdan gelen talebi alır ve iki mail gönderir:
 *   1) info@n0eyes.com → bildirim ("Yanıtla" doğrudan talep sahibine yazar)
 *   2) talep sahibi    → karşılama maili (sayfa dili neyse o dilde)
 * Mailler Gmail SMTP ile info@n0eyes.com kimliğinden çıkar.
 *
 * Netlify'da tanımlanacak ortam değişkeni (Site settings → Environment variables):
 *   SMTP_SIFRE = Google uygulama şifresi (16 hane, boşluksuz)
 * İsteğe bağlı: SMTP_KULLANICI (varsayılan info@n0eyes.com), BILDIRIM, SITE
 */
const nodemailer = require('nodemailer');

const AYAR = {
  SMTP_SUNUCU: process.env.SMTP_SUNUCU || 'smtp.gmail.com',
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_KULLANICI: process.env.SMTP_KULLANICI || 'info@n0eyes.com',
  SMTP_SIFRE: (process.env.SMTP_SIFRE || '').replace(/\s+/g, ''),
  BILDIRIM: process.env.BILDIRIM || 'info@n0eyes.com',
  GONDEREN: process.env.GONDEREN_AD || 'n0eyes',
  SITE: process.env.SITE || 'https://n0eyes.com',
  KOKEN: (process.env.KOKEN || 'https://n0eyes.com,https://www.n0eyes.com,https://morteglobalonline-ctrl.github.io').split(','),
};

const METIN = {
  tr: {
    konu: 'Demo talebiniz bize ulaştı — n0eyes',
    baslik: 'Talebiniz bize ulaştı.',
    paragraflar: [
      'Merhaba **{ad}**, **{firma}** için gönderdiğiniz demo talebini aldık. En geç **bir iş günü** içinde sizinle iletişime geçeceğiz.',
      '**Bundan sonra ne oluyor?**',
      '1. 30 dakikalık keşif görüşmesi: kameralarınız, izlemek istediğiniz alanlar ve raporlama ihtiyacınız.',
      '2. Kısa pilot: mevcut kameralarınızdan alınan görüntüyle gerçek ölçüm.',
      '3. Sonuç sunumu: işletmenizin kör noktaları sayıya dönüşmüş hâlde.',
      'Bu arada sistemin ne yaptığını sitede görebilirsiniz:',
    ],
    dugme: { yazi: 'n0eyes.com', adres: 'https://n0eyes.com' },
    altNot: 'Bu e-posta, n0eyes.com üzerinden gönderdiğiniz demo talebi üzerine otomatik oluşturuldu. Yanıtlarsanız doğrudan ekibimize ulaşır.',
  },
  en: {
    konu: 'Your n0eyes demo request has reached us',
    baslik: 'Your request has reached us.',
    paragraflar: [
      'Hi **{ad}**, we received the demo request for **{firma}**. We will get in touch within **one business day**.',
      '**What happens next?**',
      '1. A 30-minute discovery call: your cameras, the areas you want watched, your reporting needs.',
      '2. A short pilot: real measurement from your existing cameras.',
      '3. The results: your blind spots turned into numbers.',
      'In the meantime you can see what the system does on our site:',
    ],
    dugme: { yazi: 'n0eyes.com', adres: 'https://n0eyes.com' },
    altNot: 'This message was generated automatically after your demo request on n0eyes.com. Replying reaches our team directly.',
  },
};
const kacis = (x) => String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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
  const m = METIN[d.dil === 'en' ? 'en' : 'tr'];
  const doldur = (x) => kacis(x).replace(/\{ad\}/g, kacis(d.ad)).replace(/\{firma\}/g, kacis(d.firma))
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${MARKA.beyaz};">$1</strong>`);
  let govde = '';
  let adimAcik = false;
  m.paragraflar.forEach((p) => {
    const adim = /^\s*(\d+)[.)]\s+/.exec(p);
    if (adim) {
      if (!adimAcik) { govde += '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 14px;">'; adimAcik = true; }
      govde += `<tr><td style="padding:0 10px 10px 0;vertical-align:top;font:700 13px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${MARKA.yesil};">${adim[1]}</td>`
             + `<td style="padding:0 0 10px;">${doldur(p.replace(/^\s*\d+[.)]\s+/, ''))}</td></tr>`;
      return;
    }
    if (adimAcik) { govde += '</table>'; adimAcik = false; }
    govde += `<p style="margin:0 0 14px;">${doldur(p)}</p>`;
  });
  if (adimAcik) govde += '</table>';
  const dugme = m.dugme && m.dugme.adres
    ? `<a href="${m.dugme.adres}" style="display:inline-block;background:${MARKA.yesil};color:#052614;text-decoration:none;font:600 14px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:12px 22px;border-radius:999px;">${kacis(m.dugme.yazi)}</a>`
    : '';
  const icerik = `<h1 style="margin:0 0 14px;font:700 24px/1.25 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${MARKA.beyaz};letter-spacing:-0.5px;">${kacis(m.baslik)}</h1>${govde}${dugme}`;
  const gizlilik = d.dil === 'en'
    ? `Footage never leaves your building · No identity data · <a href="${AYAR.SITE}/kvkk.html" style="color:${MARKA.gri};">Data Protection Notice</a>`
    : `Görüntü binanızdan çıkmaz · Kimlik verisi tutulmaz · <a href="${AYAR.SITE}/kvkk.html" style="color:${MARKA.gri};">KVKK Aydınlatma Metni</a>`;
  return kabuk(icerik, `${kacis(m.altNot)}<br>${gizlilik}`);
}

function karsilamaDuz(d) {
  const m = METIN[d.dil === 'en' ? 'en' : 'tr'];
  const sade = (x) => x.replace(/\{ad\}/g, d.ad).replace(/\{firma\}/g, d.firma).replace(/\*\*/g, '');
  return `${sade(m.baslik)}\n\n${m.paragraflar.map(sade).join('\n\n')}\n\n${m.dugme ? m.dugme.adres : ''}\n\nn0eyes — Plug. Install. See More.`;
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

/* --------------------------- uç nokta --------------------------- */
const basliklar = (koken) => {
  const h = { 'Content-Type': 'application/json; charset=utf-8' };
  if (AYAR.KOKEN.includes(koken)) { h['Access-Control-Allow-Origin'] = koken; h['Vary'] = 'Origin'; }
  return h;
};
const gecerliMail = (x) => /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(x);

exports.handler = async (event) => {
  const koken = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const h = basliklar(koken);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { ...h, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' }, body: '' };
  }
  if (event.httpMethod === 'GET') {
    return { statusCode: 200, headers: h, body: JSON.stringify({ ok: true, servis: 'n0eyes form', smtp: !!AYAR.SMTP_SIFRE }) };
  }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: h, body: JSON.stringify({ ok: false }) };

  try {
    const p = new URLSearchParams(event.body || '');
    const al = (k) => (p.get(k) || '').trim().slice(0, 2000);
    if (al('sirket')) return { statusCode: 200, headers: h, body: JSON.stringify({ ok: true }) };   // bal küpü: bot
    const d = { ad: al('ad'), firma: al('firma'), eposta: al('eposta'), telefon: al('telefon'),
                mesaj: al('mesaj'), kaynak: al('kaynak'), dil: al('dil') === 'en' ? 'en' : 'tr' };
    if (!d.ad || !d.firma || !gecerliMail(d.eposta)) return { statusCode: 400, headers: h, body: JSON.stringify({ ok: false, hata: 'eksik' }) };
    if (!AYAR.SMTP_SIFRE) return { statusCode: 500, headers: h, body: JSON.stringify({ ok: false, hata: 'smtp_yok' }) };

    const posta = nodemailer.createTransport({
      host: AYAR.SMTP_SUNUCU, port: AYAR.SMTP_PORT, secure: AYAR.SMTP_PORT === 465,
      auth: { user: AYAR.SMTP_KULLANICI, pass: AYAR.SMTP_SIFRE },
    });
    const kimden = `"${AYAR.GONDEREN}" <${AYAR.SMTP_KULLANICI}>`;

    await posta.sendMail({
      from: kimden, to: AYAR.BILDIRIM, replyTo: d.eposta,
      subject: `Demo talebi — ${d.firma} (${d.ad})`,
      html: bildirimHtml(d),
      text: `Demo talebi\n\nAd: ${d.ad}\nFirma: ${d.firma}\nE-posta: ${d.eposta}\nTelefon: ${d.telefon}\n\n${d.mesaj}`,
    });
    await posta.sendMail({
      from: kimden, to: d.eposta, replyTo: AYAR.BILDIRIM,
      subject: METIN[d.dil].konu, html: karsilamaHtml(d), text: karsilamaDuz(d),
    });
    return { statusCode: 200, headers: h, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error('form hatasi', e);
    return { statusCode: 500, headers: h, body: JSON.stringify({ ok: false, hata: 'sunucu' }) };
  }
};
