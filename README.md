# n0eyes — web sitesi

Saf HTML/CSS/JS, framework yok. Tek sayfa, TR/EN.

**Canlı:** https://n0eyes.com  (yedek adres: https://morteglobalonline-ctrl.github.io/n0eyes-web-/)
**Alan adı:** Namecheap · DNS GitHub Pages'e bakıyor · repo kökündeki `CNAME` dosyası bunu sabitler
**Kod:** https://github.com/morteglobalonline-ctrl/n0eyes-web- (GitHub Pages, `main` dalı kök dizin)

Yayına almak: değişikliği `main`'e push et → Pages 1–2 dk içinde günceller.
```bash
git add -A && git commit -m "..." && git push
```

## Çalıştırma
```bash
cd ~/Desktop/n0eyes-web
python3 -m http.server 8090
# tarayıcı: http://localhost:8090
```
(`index.html`'i çift tıklayarak açmak da çalışır; video kaydırma için sunucu daha sağlıklı.)

## Giriş videosu = kare dizisi (canvas)
`<video>` ile kaydırarak arama (seek) takılıyordu; Apple tarzı **kare dizisi** kullanılıyor:
`assets/frames/f_0001..f_0213.webp` (VD-1 0–9.5 sn + VD-2 0.3–8.55 sn, 12 fps, 1440 px, ~11 MB).
İlk 30 kare öncelikli yüklenir (yükleniyor çubuğu), sonra kalanlar arka planda; kaydırma anında çizilir.

Kareleri yeniden üretmek (kaynak: `~/Desktop/n0eyes VD-1.mp4`, `VD-2.mp4`):
```bash
ffmpeg -i "n0eyes VD-1.mp4" -t 9.5 -vf "fps=12,scale=1440:-2" -q:v 2 /tmp/n0f/a_%04d.jpg
ffmpeg -ss 0.3 -i "n0eyes VD-2.mp4" -t 8.25 -vf "fps=12,scale=1440:-2" -q:v 2 /tmp/n0f/b_%04d.jpg
# sonra a_*, b_* sırayla f_0001.. olarak cwebp -q 78 ile assets/frames/ içine
```
Kare sayısı değişirse `index.html` → `<canvas data-frames="...">` güncelle.

| Dosya | Ne |
|---|---|
| `assets/video/demo-rampa.mp4` | "Canlı Analiz" bölümü — gerçek pilot klibi (yüzler bulanık) |
| `assets/video/demo-gece.mp4` | Yedek gece klibi (henüz kullanılmıyor) |
| `assets/img/hero-2-last.jpg` | Site hero arka planı (VD-2 son kare, parantezler) |

## Giriş (intro) akışı
Sayfa açılınca sadece video (`.intro`, fixed overlay): sağ üstte logo, sol altta şirket satırları, ortada "KAYDIR".
Kaydırma mesafesi `.intro-spacer` (520vh) ile verilir; ilerleme %98.5'e gelince kısa yeşil flaş → intro kaybolur →
sayfa en baştan (menü + statik hero) açılır. "Siteye geç" düğmesi / Esc / Enter aynı şeyi yapar.
Alt yazılar `js/main.js` içindeki `CAPTIONS` dizisinde (ilerleme eşiği, metin).

## Test kancaları
- `?hp=0.7` → intro'yu %70 ilerlemede sabitler
- `?site=1` → intro atlanır, site doğrudan açılır
- `?flat=1` → intro atlanır + tüm reveal'lar açık (tam sayfa ekran görüntüsü)
- `?only=tanima` → yalnız o bölüm görünür · `?rp=0.6` → tanıma bölümünü o ilerlemede sabitler

## Tanıma bölümü (VD-3, #tanima)
"Nasıl Çalışır" bölümünün yerini aldı; kurulum hattı + "önemli ayrım" kutusu **Tesis** bölümünün altına taşındı.
Kaydırdıkça video sağa akar (girişteki kare-dizisi tekniği): `assets/frames-vd3/f_0001..f_0112.webp`
(VD-3, 12 fps; 1600 px 1x + 2560 px @2x). Giriş kareleri de 1280 px / 2048 px iki set; retina ve geniş ekranda @2x yüklenir, canvas dpr 2 çizer.. Bölüm görünüme yaklaşınca yüklenir, yalnız görünürken çizer.
Kaynakta iki düzeltme yapıldı: sondaki **"HAMER" arabası kesildi** (kare 113+) ve **köpeğin yüz kutusu**
temizlendi (yeşil bileşen kümesi tespiti + inpaint).
Alt yazı grupları ve 14 etiketlik şerit `js/i18n.js` → `recoGroups` / `recoLabels`.
Kareleri yeniden üretmek: `ffmpeg -i "n0eyes website VD-3.MP4" -vf "fps=12,scale=1600:-2" -q:v 2 /tmp/vd3/f_%04d.jpg`
→ `cwebp -q 76` ile `assets/frames-vd3/`. Kare sayısı değişirse `index.html` → `<canvas data-frames>`.

## Dünya akışı (şehir kameraları)
`assets/video/sokak/*.mp4` — evo'daki n0eyes panelinin halka açık YouTube canlı yayınlarından (`servis/kameralar_canli.json`)
24 sn'lik kesitler (Shibuya: youtube dfVK7ld38Ys, panelde yok) (yt-dlp güncel sürümü `/tmp/n0web/ytv` venv'inde; sistemdeki eski). Tespit: `tools/tespit_json.py`
(yolo11n + ByteTrack, 8 fps örnek) → `assets/data/<ad>.json`; kutular tarayıcıda canvas'a çizilir, id ile yumuşatılır.
**Telif:** EarthCam vb. yayınlar üçüncü taraf; demo/prototip için uygundur, yayına çıkmadan lisans ya da kendi kamera görüntüsü gerekir.
Kalabalık ABD gündüzü için evo'da zamanlanmış çekimler: `n0web-cek-1230` / `n0web-cek-1800` (Chicago saati) → `/tmp/n0web/*_HHMM.mp4`.

## Fabrika canlandırması (#79, `#fabrika`)
Üçüncü taraf sokak videolarının (Dünya akışı) yerine: gerçek bir tekstil fabrikasında n0eyes'ın **gerçek tespitlerinin görüntüsüz**
oynatımı. `js/fabrika.js` (kütüphane yok, canvas) → `<figure class="fab" data-json="assets/data/...json">`.
Veri: n0eyes deposunda `tools/site_iz_disa.py` (şema v1: `kaynak` · `bolgeler` 0-1 poligon · `izler` p=[t sn, x, y, w, h] kutu merkezi/boyutu 0-1 ·
`alarm` (geri_bildirim dogru|normal → Doğru, kisi_yok|yanlis → Yanlış) · `isi` günlük ızgara · opsiyonel `zemin` = çizgi çizimi dosyası, JSON'a göre yol;
yoksa soyut ızgara). Komut ve git sürümü JSON'un `kaynak` alanında.
**`assets/data/fabrika_sentetik.json` SENTETİKTİR** (`kaynak.sentetik: true` → köşe rozeti "SENTETİK ÖRNEK VERİ · YAYIN İÇİN DEĞİL");
gerçek JSON gelince dosya ve `data-json` değişir. Sayı şeridi yalnız kaynaklı sayılar (K-69, OLCUMLER §43, §6, JSON'un kendisi).
Test kancası: `?ft=412` → o saniyede sabit kare (`prefers-reduced-motion` ile aynı yol: tüm iz yolları soluk, ısı haritası tam).

## Dil (TR / EN)
`js/i18n.js`: sözlük **TR innerHTML** ile anahtarlı — HTML'e `data-i18n` eklemeye gerek yok; çalışma anında eşleşen
öğeler değiştirilir (dinamik sayı içeren öğelerde kelimeler `<span>` içinde olmalı). JS'ten üretilen metinler
(`captions`, `events`, `etiket`, `brief`, `title`) `I18N.js` tablosunda. Seçim: `?lang=en` > localStorage > tr.
Yeni metin eklerken: TR'yi HTML'e yaz, `P` listesine `[TR, EN]` çifti ekle. Eşleşmeyen metin TR kalır (kırılmaz).

## Demo formu ve e-posta  ← KURULUM GEREKİYOR
Form `mailto:` değil, gerçek bir uç noktaya gönderir; oradan iki mail çıkar:
- **info@n0eyes.com** → "Demo talebi — <Firma> (<Ad>)" bildirimi; *Yanıtla* düğmesi doğrudan talep sahibine yazar.
- **Talep sahibi** → marka kimliğinde karşılama maili, sayfa dilinde (TR/EN).

Mailler **Gmail SMTP** ile `info@n0eyes.com` kimliğinden çıkar (SPF kaydı zaten Google'ı gösteriyor, spam'e düşmez).

### Seçilen yol: Netlify Functions (ücretsiz, ticari kullanıma açık, 125k çağrı/ay)
Site GitHub Pages'te kalır; Netlify yalnızca `/api/form` ucunu yayınlar.
Dosyalar: `netlify/functions/form.js`, `netlify.toml`, `package.json`.

**Kurulum (Ömer, ~10 dk):**
1. Google uygulama şifresi: `myaccount.google.com` → Güvenlik → **Uygulama şifreleri** → ad `n0eyes form` → 16 haneli kodu kopyala.
2. `netlify.com` → **Log in with GitHub** → **Add new site → Import an existing project** → `n0eyes-web-` reposunu seç → **Deploy** (ayarlar `netlify.toml`'dan otomatik gelir).
3. **Site configuration → Environment variables → Add**: `SMTP_SIFRE` = 16 haneli şifre. (Şifre Netlify'da kalır, repoya yazılmaz.)
4. **Deploys → Trigger deploy** (değişkeni tanıması için).
5. Site adresini (`xxx.netlify.app`) ilet → `js/form.js` içindeki `UC` oraya ayarlanır: `https://xxx.netlify.app/api/form`.

Sağlık kontrolü: `https://xxx.netlify.app/api/form` tarayıcıda → `{"ok":true,"servis":"n0eyes form","smtp":true}`
(`smtp:false` görünüyorsa 3. adımdaki değişken eksik ya da deploy tazelenmemiş.)

### Mail metnini değiştirmek
`netlify/functions/form.js` başındaki **METIN** bloğu (TR/EN ayrı). Düz metin yaz, tasarım otomatik kurulur:
her satır bir paragraf · `**kalın**` beyaz vurgu · `{ad}` `{firma}` formdan dolar · `1. ` ile başlayanlar
yeşil numaralı adım olur · `dugme: { yazi, adres }` alttaki yeşil düğme.

### Diğer iki hazır seçenek (şu an kullanılmıyor)
- `sunucu/form.gs` — Google Apps Script sürümü. **Çalışmadı:** Workspace, kuruluş dışına açık Apps Script
  dağıtımlarını engelliyor (anonim erişimde "Erişim Reddedildi — Drive"). Admin Console'da dış paylaşım
  açılırsa kullanılabilir.
- `~/n0eyes-form/` (evo, `n0eyes-form.service`) — aynı işi yapan Python servisi, şu an yalnız localhost'ta
  çalışıyor. İnternete açmak için `tailscale funnel` gerekir; evo üretim makinesi olduğu için açılmadı.

## Çerez / gizlilik teknik durumu
- **Dış istek yok:** yazı tipleri `assets/fonts/` içinde yerel barındırılır (`css/fonts.css`), Google Fonts çağrısı kaldırıldı.
  Böylece ziyaretçinin IP'si üçüncü tarafa gitmez — çerez rızasının asıl tartışmalı noktası buydu.
- **Tek saklanan şey** dil tercihidir (`n0eyes-lang`). Reklam/takip çerezi yoktur.
- `js/cerez.js`: alt şerit. **Kabul** → tercih `localStorage`'da kalıcı. **Reddet** → kalıcı hiçbir şey yazılmaz,
  dil yalnız o sekmede geçerli olur (`sessionStorage`). Karar `n0eyes-cerez` anahtarında tutulur ve
  `window.n0Riza()` ile i18n/sayfa scriptleri tarafından sorulur.

## Yasal / bilgi sayfaları
`sss.html`, `kvkk.html`, `gizlilik.html`, `cerez.html`, `kosullar.html` — footer'daki **Yasal** ve **Şirket**
sütunlarından açılır. Her sayfa TR ve EN bloğu içerir (`[data-dil]`), dil ana siteyle ortak (`localStorage`).
Şablon ve içerik üretimi: bu sayfalar elle düzenlenebilir düz HTML'dir; ortak stil `css/sayfa.css`, script `js/sayfa.js`.
**Uyarı:** metinler genel bilgilendirmedir, hukuk danışmanına gözden geçirtilmelidir. Ticari unvan/adres/vergi bilgisi
eklenecekse KVKK ve Kullanım Koşulları sayfalarına yazılmalı.

## Kaldırılanlar (2026-09-25)
- "Nasıl Çalışır" bölümü → yerine **Tanıma** (VD-3); kurulum hattı da kaldırıldı.
- Ana sayfadaki **Gizlilik & KVKK** bölümü (sabah brifi kartıyla birlikte) — bilgi fazla detaylıydı; özü footer
  rozetlerinde (KVKK · GDPR · Yüz tanıma yok) ve yasal sayfalarda duruyor.
- Footer'daki açık adres satırı.

## Kimlik
Renkler/fontlar `css/style.css` başındaki `:root` tokenlarında (kimlik belgesiyle birebir).

## Yapılacaklar
- [x] Gerçek hero videoları (VD-1 + VD-2, 15.09.2026)
- [ ] Form backend (şu an `mailto:`)
- [ ] Adres/telefon doğrulama (footer'daki adres kimlik belgesindeki örnek)
- [ ] KVKK aydınlatma metni sayfası
- [ ] Ek B-roll: kendi kamera kayıtları tercih; stok gerekirse Pexels (ücretsiz lisans)
