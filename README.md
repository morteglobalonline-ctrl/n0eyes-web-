# n0eyes — web sitesi

Saf HTML/CSS/JS, framework yok. Tek sayfa, TR/EN.

**Canlı:** https://morteglobalonline-ctrl.github.io/n0eyes-web-/
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
(VD-3, 12 fps, 1600 px, ~3.6 MB). Bölüm görünüme yaklaşınca yüklenir, yalnız görünürken çizer.
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

## Dil (TR / EN)
`js/i18n.js`: sözlük **TR innerHTML** ile anahtarlı — HTML'e `data-i18n` eklemeye gerek yok; çalışma anında eşleşen
öğeler değiştirilir (dinamik sayı içeren öğelerde kelimeler `<span>` içinde olmalı). JS'ten üretilen metinler
(`captions`, `events`, `etiket`, `brief`, `title`) `I18N.js` tablosunda. Seçim: `?lang=en` > localStorage > tr.
Yeni metin eklerken: TR'yi HTML'e yaz, `P` listesine `[TR, EN]` çifti ekle. Eşleşmeyen metin TR kalır (kırılmaz).

## Kimlik
Renkler/fontlar `css/style.css` başındaki `:root` tokenlarında (kimlik belgesiyle birebir).

## Yapılacaklar
- [x] Gerçek hero videoları (VD-1 + VD-2, 15.09.2026)
- [ ] Form backend (şu an `mailto:`)
- [ ] Adres/telefon doğrulama (footer'daki adres kimlik belgesindeki örnek)
- [ ] KVKK aydınlatma metni sayfası
- [ ] Ek B-roll: kendi kamera kayıtları tercih; stok gerekirse Pexels (ücretsiz lisans)
