/* n0eyes — TR/EN. Statik HTML: sözlük TR innerHTML ile anahtarlı (HTML'e data-i18n eklemeye gerek yok).
   JS'ten üretilen metinler: I18N.js[lang]. Dil: localStorage 'n0eyes-lang' > ?lang= > tr. */
window.I18N = (() => {
  // [TR innerHTML, EN innerHTML] — boşluklar normalize edilerek eşleşir
  const P = [
    // intro
    [`Yükleniyor`, `Loading`],
    [`<b>n0eyes</b> · AI Vision System`, `<b>n0eyes</b> · AI Vision System`],
    [`Mevcut kameralarınızı yapay zekâ ile izler`, `Watches your existing cameras with AI`],
    [`Görüntü binanızdan çıkmaz · Kimlik verisi tutulmaz`, `Footage never leaves your building · No identity data`],
    [`İstanbul, Türkiye · <span class="g">Plug. Install. See More.</span>`, `Istanbul, Türkiye · <span class="g">Plug. Install. See More.</span>`],
    [`KAYDIR`, `SCROLL`], [`<span></span>KAYDIR`, `<span></span>SCROLL`],
    [`Siteye geç <i>→</i>`, `Skip to site <i>→</i>`],
    // tanıma (VD-3)
    [`AYNI MOTOR · FARKLI ANLAM`, `ONE ENGINE · MANY MEANINGS`],
    [`Hepsini görür. <span class="g">Hangisi olduğunu bilir.</span>`, `It sees them all. <span class="g">It knows which is which.</span>`],
    [`Bir kamera için hepsi hareket eden bir lekedir. n0eyes gemiyi tekneden, kamyonu forkliftten, doktoru güvenlik görevlisinden ayırır — çünkü asıl iş görmek değil, neyin nerede ne işe yaradığını bilmek.`,
     `To a plain camera they are all just moving shapes. n0eyes tells a cargo ship from a yacht, a truck from a forklift, a doctor from a security guard — because the job isn't seeing, it's knowing what a thing is and what it means where it stands.`],
    [`SINIFLANDIRMA`, `CLASSIFICATION`], [`<span class="dot"></span>SINIFLANDIRMA`, `<span class="dot"></span>CLASSIFICATION`],
    [`SINIF`, `CLASSES`],
    [`Tanıma`, `Recognition`], [`Neleri ayırt eder?`, `What can it tell apart?`],
    // nav
    [`Ürün`, `Product`], [`Nasıl Çalışır`, `How It Works`], [`Canlı Analiz`, `Live Analysis`], [`Dünya`, `World`],
    [`Yetenekler`, `Capabilities`], [`Tesis`, `Facility`], [`Pilot`, `Pilot`], [`Demo Talep Et`, `Request a Demo`],
    // hero
    [`CANLI ANALİZ`, `LIVE ANALYSIS`], [`<span class="dot"></span>CANLI ANALİZ`, `<span class="dot"></span>LIVE ANALYSIS`], [`<span class="dot"></span>CANLI`, `<span class="dot"></span>LIVE`],
    [`mevcut kameralar`, `existing cameras`], [`kimlik verisi tutulmuyor`, `no identity data`], [`görüntü bina dışına çıkmıyor`, `footage stays on-site`],
    [`Kameralarınızı<br>akıllı bir denetim<br>sistemine dönüştürün.`, `Turn your cameras<br>into an intelligent<br>monitoring system.`],
    [`n0eyes, mevcut kamera altyapısına ve sunucularınıza müdahale etmeden; ayrı bir bilgisayar üzerinden canlı görüntüleri izler, anlamlandırır ve yöneticiye raporlanabilir içgörü üretir. Depo, liman, hastane, mağaza — kameranız neredeyse, n0eyes orada.`,
     `n0eyes watches your live feeds from a separate computer — without touching your camera infrastructure or servers — understands what it sees and turns it into reportable insight for management. Warehouse, port, hospital, store: wherever your camera is, n0eyes is there.`],
    [`Canlı analizi izle`, `Watch live analysis`],
    // problem
    [`BUGÜNKÜ SORUN`, `THE PROBLEM TODAY`],
    [`Kameralar çoğu zaman <span class="muted">sadece kayıt alır.</span>`, `Most cameras <span class="muted">only record.</span>`],
    [`n0eyes bu pasif görüntüyü, işletmenin günlük operasyonunu anlayan aktif bir analiz katmanına dönüştürür.`, `n0eyes turns that passive footage into an active analysis layer that understands your daily operation.`],
    [`Pasif kayıt`, `Passive recording`],
    [`Kamera görüntüleri çoğu zaman olay olduktan sonra geriye dönük izlenir. Kayıt vardır, ama gözlem yoktur.`, `Footage is usually reviewed after the fact. There is a recording, but no observation.`],
    [`Manuel takip`, `Manual monitoring`],
    [`Rampa doluluğu, bekleme, güvenlik ve olağan dışı hareketler insan kontrolüne kalır. İnsan yorulur, sistem yorulmaz.`, `Dock occupancy, idle time, safety and unusual movement are left to people. People get tired; the system doesn't.`],
    [`Dağınık görünürlük`, `Scattered visibility`],
    [`Yönetici sahadaki akışı tek ekranda ve ölçülebilir şekilde göremez; kameralar arasında kaybolur.`, `Managers can't see the flow on one screen in measurable terms; they get lost between cameras.`],
    // nasıl
    [`KURULUM FELSEFESİ`, `INSTALLATION PHILOSOPHY`],
    [`Mevcut sisteme dokunmadan analiz.`, `Analysis without touching your system.`],
    [`Kamera / DVR görüntü akışı → ayrı bir n0eyes bilgisayarı → sade bir panel → yönetici aksiyonu. Dört adım, sıfır yeni kamera.`, `Camera / DVR stream → a separate n0eyes computer → a simple dashboard → management action. Four steps, zero new cameras.`],
    [`Kamera / DVR`, `Camera / DVR`], [`Mevcut görüntü akışı, olduğu gibi alınır.`, `The existing video stream is taken as is.`],
    [`n0eyes Bilgisayar`, `n0eyes Computer`], [`AI izleme katmanı. Tek GPU'lu mini PC; görüntü binadan çıkmaz.`, `The AI observation layer. A single-GPU mini PC; footage never leaves the building.`],
    [`Dashboard`, `Dashboard`], [`Rapor, uyarı ve zaman çizgisi tek panelde.`, `Reports, alerts and timeline in one panel.`],
    [`Yönetim`, `Management`], [`Aksiyon ve karar. Sabah brifi, anlık uyarı.`, `Action and decision. Morning brief, instant alerts.`],
    [`ÖNEMLİ AYRIM`, `KEY DISTINCTION`],
    [`<strong>n0eyes kamera satıcısı değildir.</strong> İşletmenin kendi kamera düzenini bozmadan, görüntüyü izleyen ve anlamlandıran bağımsız bir AI vision katmanı olarak konumlanır.`,
     `<strong>n0eyes does not sell cameras.</strong> It is an independent AI vision layer that watches and interprets footage without disturbing your existing camera setup.`],
    // canlı
    [`Bir güvenlik görevlisi gibi <span class="g">ekrandaki görüntüyü</span> okur.`, `Reads <span class="g">what's on screen</span> like a security guard would.`],
    [`Aşağıdaki görüntü gerçek bir depodan — mal kabul rampası, sabah mesaisi. Kişi kutuları, bölge çizgileri ve olaylar sistemin kendi çıktısıdır.`, `The footage below is from a real warehouse — receiving dock, morning shift. Person boxes, zone lines and events are the system's own output.`],
    [`CANLI`, `LIVE`], [`CAM 2 · MAL KABUL`, `CAM 2 · RECEIVING`],
    [`KİŞİ`, `PEOPLE`], [`HAREKETSİZ`, `IDLE`], [`RAMPA`, `DOCK`], [`DOLU`, `BUSY`], [`ARAÇ`, `VEHICLE`],
    [`OLAY AKIŞI`, `EVENT FEED`], [`Olaylar video ile eş zamanlı akar…`, `Events stream in sync with the video…`],
    [`Kimlik verisi tutulmaz`, `No identity data`], [`Görüntü dışarı çıkmaz`, `Footage stays on-site`],
    [`rampa doluluk süresi, saniye hassasiyetinde`, `dock occupancy, to the second`],
    [`adam-dakikanın hareketsiz geçen payı`, `share of man-minutes spent idle`],
    [`yanlış alarm — 30 dk boş gece sahnesinde`, `false alarms — 30 min of empty night footage`],
    [`mesai dışı varlığı yakalama süresi`, `time to catch after-hours presence`],
    [`Pilot ölçümü · Ağustos 2026 · 2 kamera, 1 saat kayıt · doğrulama setiyle elle karşılaştırıldı`, `Pilot measurement · August 2026 · 2 cameras, 1 hour of footage · checked by hand against a validation set`],
    // dünya
    [`DÜNYANIN HER YERİNDEN · AYNI MOTOR`, `ANYWHERE IN THE WORLD · SAME ENGINE`],
    [`Londra'dan Tokyo'ya, <span class="g">aynı gözle.</span>`, `From London to Tokyo, <span class="g">the same eye.</span>`],
    [`Halka açık şehir kameralarından alınmış görüntüler; kutular ve sayaçlar n0eyes'ın kendi tespit motorundan (yolo11n + ByteTrack), tarayıcıda canlı çiziliyor. Kişi, araç, motosiklet — kamera neyi görüyorsa.`,
     `Clips from public city cameras; boxes and counters come from n0eyes' own detection engine (yolo11n + ByteTrack), drawn live in your browser. People, vehicles, motorcycles — whatever the camera sees.`],
    [`LONDRA · Abbey Road`, `LONDON · Abbey Road`], [`BANGKOK · Soi 11`, `BANGKOK · Soi 11`], [`DUBLIN · Temple Bar`, `DUBLIN · Temple Bar`], [`TOKYO · Shibuya Kavşağı`, `TOKYO · Shibuya Crossing`],
    [`kişi`, `people`], [`araç`, `vehicles`],
    [`Görüntüler halka açık yayınlardan alınmış kısa örneklerdir; kimlik verisi tutulmaz, yüzler işlenmez.`, `Short samples from public streams; no identity data is kept, faces are not processed.`],
    // yetenekler
    [`ANA YETENEKLER`, `CORE CAPABILITIES`],
    [`İnsanı değil, <span class="g">akışı ve olayı</span> takip ediyoruz.`, `We track <span class="g">flow and events,</span> not individuals.`],
    [`Depo, üretim, lojistik, perakende, sağlık — kamera neredeyse aynı motor. Sistem; insan hareketi, alan kullanımı ve olağan dışı olayları yöneticinin anlayacağı sade raporlara çevirir.`,
     `Warehousing, manufacturing, logistics, retail, healthcare — wherever the camera is, the same engine. It turns movement, space usage and unusual events into plain reports a manager can act on.`],
    [`Kişi sınıflandırma`, `Person classification`], [`İşçi, misafir, müşteri ve yetkisiz giriş gibi farklı kişi tiplerini ayırmaya yönelik analiz. İsimsiz, toplu.`, `Distinguishes worker, visitor, customer and unauthorised entry. Anonymous, aggregated.`],
    [`Bekleme ve akış`, `Idle time and flow`], [`Gün içi yoğunluk, duruş, bekleme süreleri ve alan bazlı çalışma ritmini hat/bölge bazında raporlar.`, `Reports daily density, stoppages, waiting times and work rhythm per line/zone.`],
    [`Tehlike ve anomali`, `Hazards and anomalies`], [`Yasak bölgeye giriş, forklift yolunda insan, mesai dışı hareket, düşme, sahipsiz nesne — kanıt karesiyle.`, `Restricted-zone entry, person in a forklift lane, after-hours movement, falls, abandoned objects — with an evidence frame.`],
    [`Alan ve varlık takibi`, `Space and asset tracking`], [`Giriş-çıkışlar, rampa/kapı doluluğu, depo ve üretim hattı çevresindeki akış görünür olur.`, `Entries and exits, dock/door occupancy and flow around the warehouse and production line become visible.`],
    [`Canlı uyarı mantığı`, `Live alert logic`], [`Yöneticinin hızlı aksiyon alması için uyarı üretir; olayları tarih, saat ve kamera bazında kaydeder.`, `Raises alerts so managers can act fast; logs events by date, time and camera.`],
    [`Yönetici raporu`, `Management reports`], [`Teknik görüntü verisini sabah brifine, trend panellerine ve günlük raporlara dönüştürür.`, `Turns technical video data into a morning brief, trend panels and daily reports.`],
    // tesis
    [`TESİSİN HER YERİNDE`, `ACROSS THE WHOLE FACILITY`],
    [`Bütün kameralar. <span class="g">Tek bir göz.</span>`, `Every camera. <span class="g">One eye.</span>`],
    [`Otoparktan rampaya, depodan ofis girişine — mevcut her kamera n0eyes bilgisayarına bağlanır. Sistem tesisin normalini öğrenir, sapmayı bildirir.`, `From the car park to the dock, from the warehouse to the office entrance — every existing camera connects to the n0eyes computer. The system learns what's normal and reports what isn't.`],
    [`Tesis planı: kameralar n0eyes bilgisayarına bağlı`, `Facility plan: cameras connected to the n0eyes computer`],
    [`OTOPARK`, `CAR PARK`], [`DIŞ AVLU`, `YARD`], [`DEPO`, `WAREHOUSE`], [`MAL KABUL`, `RECEIVING`], [`SEVKİYAT`, `SHIPPING`], [`ÜRETİM HATTI`, `PRODUCTION LINE`], [`OFİS GİRİŞİ`, `OFFICE ENTRANCE`],
    [`DİNLENME`, `BREAK AREA`], [`kapsam dışı`, `out of scope`], [`n0eyes bilgisayarı`, `n0eyes computer`],
    [`CAM 5 · Otopark`, `CAM 5 · Car park`], [`CAM 1 · Avlu`, `CAM 1 · Yard`], [`CAM 3 · Depo içi`, `CAM 3 · Warehouse`], [`CAM 6 · Raf koridoru`, `CAM 6 · Rack aisle`],
    [`CAM 2 · Rampa`, `CAM 2 · Dock`], [`CAM 4 · Yükleme`, `CAM 4 · Loading`], [`CAM 7 · Hat başı`, `CAM 7 · Line head`], [`CAM 8 · Ofis girişi`, `CAM 8 · Office entrance`],
    [`kamera bağlı`, `cameras connected`], [`yeni kamera`, `new cameras`], [`dışarı çıkan görüntü`, `frames leaving the site`],
    // gizlilik
    [`GİZLİLİK VE KVKK`, `PRIVACY & GDPR`],
    [`"Kaydın senin <span class="g">binandan çıkmıyor.</span>"`, `"Your footage <span class="g">never leaves your building."</span>`],
    [`Kimlik, biyometri ve çalışan performansı hassas alanlardır. n0eyes bunu mimarinin en başına koyar: dışarı yalnızca sayı ve olay çıkar, görüntü asla.`, `Identity, biometrics and employee performance are sensitive. n0eyes builds that in from the start: only counts and events leave the site — never video.`],
    [`Görüntü fabrikadaki kutuda işlenir; buluta veya bize gitmez.`, `Video is processed on the box in your facility; it never goes to the cloud or to us.`],
    [`Gerçek isim sisteme hiç girmez. Yüz tanıma yok, duygu tanıma yok.`, `Real names never enter the system. No face recognition, no emotion recognition.`],
    [`Yemekhane, dinlenme ve sigara alanları analiz kapsamı dışıdır.`, `Canteens, break rooms and smoking areas are out of scope.`],
    [`Kişi bazlı "verim notu" üretilmez; ölçüm hat ve bölge bazındadır.`, `No per-person "productivity score"; measurement is per line and zone.`],
    [`Otomatik çıkarımlar karar desteğidir; kritik kararlar insan onayıyla.`, `Automated inferences are decision support; critical decisions require human approval.`],
    [`Sabah brifi · 07:00`, `Morning brief · 07:00`],
    [`Gerçek pilot çıktısı — WhatsApp / e-posta ile gelir`, `Real pilot output — delivered via WhatsApp / e-mail`],
    // pilot
    [`PİLOT PLAN`, `PILOT PLAN`],
    [`İlk amaç satmak değil; <span class="muted">kör noktaları görünür kılmak.</span>`, `The first goal isn't to sell; <span class="muted">it's to surface blind spots.</span>`],
    [`Hızlı pilot kurulumla gerçek saha verisi üzerinde değer üretiriz. Başarı ölçüsü: patronun tahmini ile gerçek arasındaki fark.`, `A quick pilot creates value on real site data. The measure of success: the gap between what the boss assumed and what's real.`],
    [`Keşif`, `Discovery`], [`Kamera noktaları, izlenecek alanlar ve raporlama ihtiyacı netleştirilir.`, `Camera positions, areas to watch and reporting needs are defined.`],
    [`Kurulum`, `Installation`], [`Ayrı n0eyes bilgisayarı konumlandırılır, görüntü izleme katmanı devreye alınır.`, `The separate n0eyes computer is placed and the observation layer goes live.`],
    [`Kalibrasyon`, `Calibration`], [`İşletmenin normal akışı öğrenilir; bölge, bekleme, risk ve alan kuralları ayarlanır.`, `The site's normal flow is learned; zone, idle, risk and area rules are tuned.`],
    [`Raporlama`, `Reporting`], [`Günlük/haftalık yönetici çıktıları ve canlı uyarılar sade panelde sunulur.`, `Daily/weekly management outputs and live alerts in a simple dashboard.`],
    [`Güvenlik`, `Safety`], [`Olağan dışı olaylar ve riskli hareketler daha erken fark edilir.`, `Unusual events and risky movement are noticed earlier.`],
    [`Verimlilik`, `Efficiency`], [`Bekleme, duruş ve alan yoğunluğu görünür hale gelir.`, `Idle time, stoppages and area density become visible.`],
    [`Şeffaflık`, `Transparency`], [`Yönetici, kameralar arasında kaybolmadan sade özetler görür.`, `Managers see plain summaries without getting lost between cameras.`],
    // cta
    [`Mevcut kameralarını bozma.<br><span class="g">Yeni bir görüntü zekâsı katmanı ekle.</span>`, `Don't rip out your cameras.<br><span class="g">Add a layer of visual intelligence.</span>`],
    [`İnsanları, alanları ve olayları daha güvenli, daha akıllı ve daha parlak bir operasyon için anlamlandır. Pilot için 30 dakikalık bir keşif görüşmesi yeterli.`, `Make sense of people, places and events for a safer, smarter, brighter operation. A 30-minute discovery call is enough to start a pilot.`],
    [`Ad Soyad<input type="text" name="ad" required autocomplete="name">`, `Full name<input type="text" name="ad" required autocomplete="name">`],
    [`Firma<input type="text" name="firma" required autocomplete="organization">`, `Company<input type="text" name="firma" required autocomplete="organization">`],
    [`E-posta<input type="email" name="eposta" required autocomplete="email">`, `E-mail<input type="email" name="eposta" required autocomplete="email">`],
    [`Telefon<input type="tel" name="telefon" autocomplete="tel">`, `Phone<input type="tel" name="telefon" autocomplete="tel">`],
    [`Kaç kameranız var, hangi alanları izlemek istersiniz?<textarea name="mesaj" rows="3"></textarea>`, `How many cameras do you have, and which areas would you like to watch?<textarea name="mesaj" rows="3"></textarea>`],
    [`Formu göndererek KVKK aydınlatma metnini okuduğunuzu kabul edersiniz.`, `By submitting you confirm you have read our privacy notice.`],
    // footer
    [`n0eyes Teknoloji A.Ş.<br>Maslak Mah. Büyükdere Cad. No:123<br>Sarıyer / İstanbul, Türkiye`, `n0eyes Teknoloji A.Ş.<br>Maslak Mah. Büyükdere Cad. No:123<br>Sarıyer / Istanbul, Türkiye`],
    [`Şirket`, `Company`], [`Tesis Haritası`, `Facility Map`], [`Pilot Plan`, `Pilot Plan`], [`Gizlilik &amp; KVKK`, `Privacy &amp; GDPR`], [`İletişim`, `Contact`],
    [`© 2026 n0eyes. Tüm hakları saklıdır.`, `© 2026 n0eyes. All rights reserved.`],
  ];
  const norm = (s) => s.replace(/=""/g, '').replace(/\s+/g, ' ').trim(); // required="" -> required
  const en = new Map(P.map(([tr, e]) => [norm(tr), e]));

  // JS'ten üretilen metinler
  const js = {
    tr: {
      captions: ['Kamera zaten orada.', 'n0eyes onu görmeye başlar.', 'Depo. Liman. Sevkiyat.', 'Hastane. Kafe. Mağaza.', 'Tek görüş. Her ortam.'],
      etiket: ['İNSAN', 'ARAÇ', 'MOTOR', 'GEMİ'],
      events: [['Rampa dolu', "Kasa kamyon rampada · 09:19'dan beri"], ['Boşaltma sürüyor', 'Kumaş topu → kafes araba döngüsü'], ['Bekleme', '4/5 kişi hareketsiz · 20 sn'], ['Akış normale döndü', '3/4 kişi aktif'], ['İş güvenliği notu', 'Kasa üstünde kişi · yüksekte çalışma'], ['Sayım', '28 adam-dk · %46 hareketsiz (pencere)']],
      recoLabels: ['KONTEYNER GEMİSİ', 'TEKNE', 'KAMYON', 'FORKLİFT', 'AMBULANS', 'OTOMOBİL', 'MOTOSİKLET', 'İNSAN', 'DOKTOR', 'GÜVENLİK GÖREVLİSİ', 'KAFE PERSONELİ', 'TEKERLEKLİ SANDALYE', 'BEBEK ARABASI', 'KÖPEK'],
      recoGroups: [
        [0.00, 'DENİZ TAŞITLARI', 'Konteyner gemisi mi, tekne mi? Biri limanın iş yükü, diğeri bir ziyaret. Aynı silüet, bambaşka operasyon.'],
        [0.216, 'AĞIR ARAÇ', 'Kamyon rampaya yanaşır ve sayaç başlar; forklift insan yolundaysa bu bir iş güvenliği olayıdır.'],
        [0.36, 'ACİL VE TRAFİK', 'Ambulans bir olaydır, otomobil bir ziyaret, motosiklet bir kurye. Sınıf değişince kural da değişir.'],
        [0.577, 'İNSAN VE ROL', 'Herkes “insan” değildir: doktor, güvenlik görevlisi, kafe personeli. Üniforma rolü söyler, rol de neyin normal olduğunu.'],
        [0.81, 'HASSAS NESNELER', 'Tekerlekli sandalye, bebek arabası, köpek — öncelik, erişim ve güvenlik kuralları bunlara göre şekillenir.'],
      ],
      formSent: 'Teşekkürler — e-posta istemciniz açılıyor',
      title: 'n0eyes — AI Vision System | Mevcut kameralarınızı yapay zekâ ile izleyin',
      desc: 'n0eyes, mevcut kamera altyapınıza dokunmadan canlı görüntüyü izler, anlamlandırır ve yöneticiye raporlanabilir içgörü üretir. Plug. Install. See More.',
      brief: `n0eyes · 22.08.2026

RAMPA · 1 araç · toplam 21dk 49sn
   09:18–09:40  (21dk 49sn)

AVLUDA ARAÇ BEKLEMESİ · 2 kez · 12dk 34sn
   09:09–09:18  (9dk 28sn) · CAM 1
   09:36–09:39  (3dk 5sn) · CAM 1

BEKLEME · 2 kez · toplam 1dk 57sn
   en uzunu 09:18 · 1dk 2sn · 2 kişi hareketsiz

İŞ GÜCÜ
   CAM 1: tepe 3 kişi · 7 adam-dk
   CAM 2: tepe 5 kişi · 28 adam-dk

Toplam 5 olay. Kimlik verisi tutulmaz.`,
    },
    en: {
      captions: ['The camera is already there.', 'n0eyes starts to see.', 'Warehouse. Port. Shipping.', 'Hospital. Café. Store.', 'One vision. Every environment.'],
      etiket: ['PERSON', 'VEHICLE', 'MOTO', 'SHIP'],
      events: [['Dock occupied', 'Box truck at the dock · since 09:19'], ['Unloading in progress', 'Fabric roll → cage trolley cycle'], ['Idle', '4/5 people idle · 20 s'], ['Flow back to normal', '3/4 people active'], ['Safety note', 'Person on truck bed · working at height'], ['Count', '28 man-min · 46% idle (window)']],
      recoLabels: ['CARGO SHIP', 'YACHT', 'TRUCK', 'FORKLIFT', 'AMBULANCE', 'CAR', 'MOTORCYCLE', 'PERSON', 'DOCTOR', 'SECURITY GUARD', 'CAFÉ STAFF', 'WHEELCHAIR', 'STROLLER', 'DOG'],
      recoGroups: [
        [0.00, 'VESSELS', 'Cargo ship or yacht? One is the port’s workload, the other a visit. Same silhouette, a whole different operation.'],
        [0.216, 'HEAVY VEHICLES', 'A truck docks and the clock starts; a forklift in a walkway is a safety event.'],
        [0.36, 'EMERGENCY & TRAFFIC', 'An ambulance is an incident, a car is a visit, a motorcycle is a courier. Change the class and the rule changes with it.'],
        [0.577, 'PEOPLE & ROLES', 'Not everyone is just “a person”: doctor, security guard, café staff. The uniform tells the role — the role tells what’s normal.'],
        [0.81, 'SENSITIVE OBJECTS', 'Wheelchair, stroller, dog — priority, access and safety rules are shaped around these.'],
      ],
      formSent: 'Thank you — opening your e-mail client',
      title: 'n0eyes — AI Vision System | Watch your existing cameras with AI',
      desc: 'n0eyes watches live feeds without touching your camera infrastructure, understands what it sees and turns it into reportable insight for management. Plug. Install. See More.',
      brief: `n0eyes · 22.08.2026

DOCK · 1 vehicle · total 21m 49s
   09:18–09:40  (21m 49s)

VEHICLE WAITING IN YARD · 2× · 12m 34s
   09:09–09:18  (9m 28s) · CAM 1
   09:36–09:39  (3m 5s) · CAM 1

IDLE · 2× · total 1m 57s
   longest 09:18 · 1m 2s · 2 people idle

WORKFORCE
   CAM 1: peak 3 people · 7 man-min
   CAM 2: peak 5 people · 28 man-min

5 events in total. No identity data kept.`,
    },
  };

  const orig = new WeakMap();      // el -> TR innerHTML
  const INLINE = new Set(['SPAN', 'B', 'STRONG', 'BR', 'I', 'EM', 'INPUT', 'TEXTAREA']);
  const leafish = (el) => [...el.childNodes].every(n => n.nodeType === 3 || (n.nodeType === 1 && INLINE.has(n.tagName) && leafish(n)));

  let lang = 'tr';
  const apply = (l) => {
    lang = l === 'en' ? 'en' : 'tr';
    document.documentElement.lang = lang;
    document.querySelectorAll('body *').forEach(el => {
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'PRE') return;
      if (!leafish(el)) return;
      if (lang === 'tr') { if (orig.has(el)) { el.innerHTML = orig.get(el); orig.delete(el); } return; }
      const key = norm(orig.get(el) ?? el.innerHTML);
      const tr = en.get(key);
      if (tr === undefined) return;
      if (!orig.has(el)) orig.set(el, el.innerHTML);
      el.innerHTML = tr;
    });
    document.title = js[lang].title;
    const md = document.querySelector('meta[name="description"]'); if (md) md.content = js[lang].desc;
    const pre = document.querySelector('.brief__body'); if (pre) pre.textContent = js[lang].brief;
    document.querySelectorAll('.lang').forEach(b => { b.textContent = lang === 'tr' ? 'EN' : 'TR'; b.setAttribute('aria-label', lang === 'tr' ? 'Switch to English' : 'Türkçeye geç'); });
    try { localStorage.setItem('n0eyes-lang', lang); } catch {}
    dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  };

  const initial = () => {
    const q = new URLSearchParams(location.search).get('lang');
    if (q) return q;
    try { const s = localStorage.getItem('n0eyes-lang'); if (s) return s; } catch {}
    return 'tr';
  };
  return { apply, initial, get lang() { return lang; }, t: (k) => js[lang][k] };
})();
