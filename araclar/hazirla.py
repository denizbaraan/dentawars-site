# -*- coding: utf-8 -*-
"""DentaWars sitesi — görsel ve font varlıklarını marka klasöründen hazırlar.
Çalıştır: python3 araclar/hazirla.py   (Site/ klasöründen)
- Logo/maskot SVG'leri ../marka/assets'ten kopyalanır (tek kaynak marka klasörüdür).
- Fontlar Latin + Türkçe karakterlere indirgenip WOFF'a çevrilir (dış font servisi yok).
- Favicon / apple-touch ikonları onaylı app ikonundan, paylaşım görseli (og.png) Brave ile basılır.
"""
import shutil, subprocess
from pathlib import Path
from PIL import Image
from fontTools import subset

SITE = Path(__file__).resolve().parent.parent
DW = SITE.parent
IMG, FONTS = SITE / "assets" / "img", SITE / "assets" / "fonts"
BRAVE = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"

# 1 · SVG'ler
for ad in ("logo-yatay", "logo-dikey", "arma", "ikon",
           "maskot-solo", "maskot-duello", "maskot-savunma", "maskot-klinik", "maskot-lig"):
    shutil.copy(DW / "marka" / "assets" / f"{ad}.svg", IMG / f"{ad}.svg")

# 2 · Fontlar — Basic Latin + Latin-1 + Türkçe (ğĞıİşŞ) + tipografik işaretler
UNI = "U+0020-007E,U+00A0-00FF,U+011E-011F,U+0130-0131,U+015E-015F,U+2013-2014,U+2018-201E,U+2022,U+2026,U+20BA"
LIB = Path.home() / "Library" / "Fonts"
for src, out in ((DW / "marka" / "fonts" / "LilitaOne-Regular.ttf", "lilita-one.woff"),
                 (LIB / "Poppins-Medium.ttf", "poppins-500.woff"),
                 (LIB / "Poppins-SemiBold.ttf", "poppins-600.woff"),
                 (LIB / "Poppins-Bold.ttf", "poppins-700.woff"),
                 (LIB / "Poppins-ExtraBold.ttf", "poppins-800.woff")):
    subset.main([str(src), f"--unicodes={UNI}", "--flavor=woff", "--layout-features=*",
                 f"--output-file={FONTS / out}"])

# 3 · İkonlar
ikon = Image.open(DW / "marka" / "png" / "ikon" / "dentawars-app-ikon-1024.png").convert("RGBA")
for n, ad in ((180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png"),
              (48, "favicon-48.png"), (32, "favicon-32.png")):
    ikon.resize((n, n), Image.LANCZOS).save(IMG / ad, optimize=True)

# 4 · Paylaşım görseli 1200×630 (WhatsApp, LinkedIn, X önizlemesi)
tmp = SITE / "araclar" / "og.html"
subprocess.run([BRAVE, "--headless", "--disable-gpu", "--allow-file-access-from-files", "--hide-scrollbars",
                "--virtual-time-budget=5000", "--force-device-scale-factor=2", "--window-size=1200,630",
                f"--screenshot={IMG / 'og@2x.png'}", f"file://{tmp}"], capture_output=True, timeout=90)
og = Image.open(IMG / "og@2x.png").convert("RGB")
assert og.size == (2400, 1260), og.size
og.resize((1200, 630), Image.LANCZOS).save(IMG / "og.png", optimize=True)
(IMG / "og@2x.png").unlink()
# 5 · Kahraman bölümündeki canlı logo (index.html içine gömülür)
subprocess.run(["python3", str(SITE / "araclar" / "hero_logo.py")], check=True)
print("hazır")
