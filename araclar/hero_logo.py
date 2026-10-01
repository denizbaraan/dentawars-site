# -*- coding: utf-8 -*-
"""Kahraman bölümündeki canlı logo: logo-dikey.svg'yi katmanlarına ayırıp index.html'e gömer.
intro.js bu id'leri oynatır: #hBrush #hMirror #hShield #hCrown #hL0..#hL8 #hRing #hSparks #hStars.
Çalıştır: python3 araclar/hero_logo.py  (hazirla.py da çağırır)
"""
import re
from pathlib import Path
import xml.etree.ElementTree as ET

SITE = Path(__file__).resolve().parent.parent
SRC = SITE.parent / "marka" / "assets" / "logo-dikey.svg"
NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS)
BAS, BIT = "<!-- HERO-LOGO:BAŞLA -->", "<!-- HERO-LOGO:BİTİR -->"

def ser(e):
    return ET.tostring(e, encoding="unicode").replace(f' xmlns="{NS}"', "")

k = list(ET.parse(SRC).getroot())
tags = [e.tag.split("}")[1] for e in k]
assert len(k) == 43 and tags[2] == tags[3] == tags[4] == "g", "logo-dikey yapısı değişmiş; dizinleri yeniden kontrol et"
defs = ser(k[0]) + ser(k[1]) + ser(k[15])
brush, mirror, shield = ser(k[2]), ser(k[3]), ser(k[4])
crown = "".join(ser(e) for e in k[5:15])
letters = []
for i in range(9):
    cx, cy = re.search(r"rotate\([-\d.]+ ([\d.]+) ([\d.]+)\)", k[25 + i].get("transform")).groups()
    letters.append(f'<g id="hL{i}" class="hl" data-cx="{cx}" data-cy="{cy}">'
                   + ser(k[16 + i]) + ser(k[25 + i]) + ser(k[34 + i]) + "</g>")

svg = (f'<svg class="hero__logo" id="heroLogo" viewBox="-60 -60 1240 1230" role="img" '
       f'aria-label="DentaWars logosu: taçlı kalkanın ortasında bandanalı diş Dento, altında DENTA WARS yazısı" '
       f'xmlns="http://www.w3.org/2000/svg">{defs}'
       f'<circle id="hRing" cx="560" cy="380" r="0" fill="none" stroke="#FFF3E4" stroke-width="18" opacity="0"/>'
       f'<g id="hCam"><g id="hArma">'
       f'<g id="hBrush">{brush}</g><g id="hMirror">{mirror}</g><g id="hShield">{shield}</g><g id="hCrown">{crown}</g>'
       f'</g><g id="hText">{"".join(letters)}</g>'
       f'<g id="hSparks" fill="#FFD24A" stroke="#2A1406" stroke-width="5" stroke-linejoin="round"></g>'
       f'<g id="hStars"></g></g></svg>')

idx = SITE / "index.html"
s = idx.read_text()
a, b = s.index(BAS) + len(BAS), s.index(BIT)
idx.write_text(s[:a] + "\n" + svg + "\n" + s[b:])
print("kahraman logosu gömüldü:", len(svg) // 1024, "KB")
