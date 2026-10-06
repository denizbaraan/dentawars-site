# DentaWars — web sitesi (www.dentawars.com)

Kendi kodumuz: düz HTML + CSS + JS. Framework, site kurucu, CMS, dış font servisi, ses dosyası,
çerez ya da takip kodu **yok**. Fontlar ve görseller sitenin içinde (`assets/`), sesler tarayıcıda sentezleniyor.

## Hareket ve ses

| Ne | Nerede |
|---|---|
| Logonun kuruluşu (kalkan düşer → fırça/ayna çarpışır → taç seker → DENTA/WARS) | `assets/js/intro.js` — motion videosunun (`../motion/sablon.html`) site sürümü. Logoya tıklayınca yeniden oynar |
| Ses efektleri (whoosh, darbe, çınlama, pop, yay, ışıltı, fanfar…) | `assets/js/sfx.js` — WebAudio sentezi, dosya yok. **Varsayılan kapalı**; açınca logo sesli kurulur. Tercih tarayıcıda saklanır |
| Mini tur (3 soru, 15 sn, seri, yıldız, konfeti) | `assets/js/site.js` → `BANK`. Sorular ders kitabı düzeyinde temel bilgi; uygulamanın soru seti değil |
| Kaydırınca giriş (damga, kart açılışı), 3B eğim, kayan bant, altın toz | `assets/js/site.js` + `assets/css/site.css` |

"Hareketi azalt" ayarı açık cihazlarda animasyonlar kapanır, logo hazır hâliyle görünür. JS kapalıysa sayfa eksiksiz görünür.

## Degrade kuralları (site.css başında da yazılı)

1. Işık her zaman yukarıdan. 2. Degrade tek renk ailesinin içinde (300 → 500 → 700), aileler arası geçiş yok.
3. Degrade sahnede (bölüm zemini) ve kabartmada (düğme); okunan yüzeyler (kart, soru kutusu) düz. 4. Büyük degradede gren.

## Klasör

```
index.html          ana sayfa
404.html            bulunamayan sayfa
robots.txt · sitemap.xml · site.webmanifest
assets/css/site.css tasarım (renkler marka kimliği paletinden, degrade yok)
assets/js/sfx.js    ses motoru (WebAudio sentezi)
assets/js/intro.js  logo kuruluş animasyonu
assets/js/site.js   ses düğmesi, mini tur, konfeti, kaydırma girişleri, eğim
assets/fonts/       Poppins 500–800 + Lilita One (Türkçe karakterlere indirgenmiş WOFF, OFL lisanslı)
assets/img/         logo, Dento pozları (SVG), ikonlar, og.png (paylaşım önizlemesi)
araclar/            üretim betikleri (hazirla.py · hero_logo.py · og.html); sitenin çalışması için gerekmez
CNAME · .nojekyll   GitHub Pages: alan adı + dosyaları olduğu gibi sun
```

## Yerelde bakmak

```bash
cd ~/Desktop/DentaWars/Site && python3 -m http.server 8765
open -a "Brave Browser" http://localhost:8765
```
`file://` ile açılmaz: yollar `/assets/...` diye kökten başlıyor (sunucuda doğru çalışması için).

## Varlıkları yenilemek

Logo, maskot ya da font değişirse: `python3 araclar/hazirla.py` (kahraman logosunu da yeniden gömer)
(kaynak `../marka/assets/`, app ikonu `../marka/png/ikon/`, paylaşım görseli `araclar/og.html`).

## Yayına almak — GitHub Pages

1. GitHub'da depo: `dentawars-site` (ücretsiz planda Pages için depo **herkese açık** olmalı).
2. Bu klasörü gönder: `git remote add origin https://github.com/<hesap>/dentawars-site.git && git push -u origin main`
3. Depo › Settings › Pages › Source: *Deploy from a branch* › `main` / `/ (root)`.
4. Alan adı sağlayıcısında DNS:
   - `www` → **CNAME** → `<hesap>.github.io`
   - kök `dentawars.com` → **A** kayıtları `185.199.108.153` · `185.199.109.153` · `185.199.110.153` · `185.199.111.153`
5. Pages ayarında *Enforce HTTPS* işaretlenir. ✅ 06.10.2026'da yapıldı; sertifika GitHub'da (Let's Encrypt), kendisi yenilenir.
   Sertifika günlerce gelmezse: Pages ayarından alan adını kaldırıp yeniden eklemek isteği tetikliyor (bu sitede böyle çözüldü).
`CNAME` dosyası depoda hazır. Kod GitHub'a bağlı değil: başka bir statik barındırmaya olduğu gibi taşınır.

## Sayfa yapısı (v3 · 06.10.2026 · Kültür Kitabı 1.1'e göre)

Kahraman (canlı logo) · kayan bant · Bir tur dene · Neden varız (`story.js`: ekrana girince kendiliğinden oynayan 6 sahne (15,6 sn; kaydırmayı tutmaz, noktalarla sahne seçilir, sonda Tekrar oynat) — tavla → kartlar → düello → defter → lig merdiveni → klinik; her sahnede tek kısa başlık) ·
Kimin için (öğrenci · hekim · hoca) · Üç an · Sekiz oyun · Malzeme Ligleri (Fantom → Altın, 3D armalar `assets/img/lig/`) ·
Fakülteler sahnede (Fakülte Kupası · kongre · yeni oyun önce en aktif fakültede) · Sözümüz (oyuncuya 4 söz) · Gün boyu · Sık sorulanlar · Kapanış.
Kural (06.10.2026, Deniz): sitede oyuncunun bilmesi gerekmeyen bilgi olmaz — ekip içi tasarım ilkeleri, açık kararlar, iç terimler yazılmaz.
Metinler yalnızca Kültür Kitabı'nın **Onaylı** bölümlerinden alınır. Hekimlik Yolu'nun ayrıntıları açık karar olduğu için sitede yalnız
manifesto cümlesiyle geçer ("Unvanını kazanırsın. Çalışmazsan geri alınır.").

## İçerik kuralları

- Uydurma sayı, superlatif, "hekim onaylı" gibi henüz gerçekleşmemiş söz yok.
- 🔴 Onaylanan sekiz oyun adı (Düello, Terim Merdiveni…) TÜRKPATENT sınıf 9 + 28 taramasından geçmeden **sitede yazılmaz**;
  oyunlar ne yaptıklarıyla anlatılır ("Bire bir kapışma", "Günün terimleri"…). Tarama bitince `index.html` › Sekiz oyun güncellenir.
- Fiyat yazılmaz. Gelir ilkesi yazılabilir: ücretsiz oynanır, isteğe bağlı abonelik, kıdem satılmaz.
- Lilita One'da ğ ş ı İ yok → Türkçe başlık Poppins 800; Lilita yalnız rakam/ASCII.
- App Store / Google Play rozeti mağazalar açılana kadar link değil, "Yakında" etiketi.
