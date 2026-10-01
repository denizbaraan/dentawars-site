// DentaWars — kahraman logosunun kuruluş animasyonu.
// motion/sablon.html'deki render(t) mantığının siteye uyarlaması: her kare zamandan saf olarak hesaplanır.
// Sahne (sn): 0–0,35 kalkan düşer · 0,4–0,75 fırça/ayna savrulup çarpışır · 0,8–1,3 taç seker ·
//             1,3 yıldızlar · 1,45 DENTA harf harf · 1,8 WARS çakılır · 2,6 sonrası dinlenme.
(function () {
  var svg = document.getElementById("heroLogo");
  if (!svg) return;
  var NS = "http://www.w3.org/2000/svg";
  var $ = function (id) { return document.getElementById(id); };
  var cl = function (x, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a || 0, x)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var seg = function (t, a, b) { return cl((t - a) / (b - a)); };
  var eOut = function (x) { return 1 - Math.pow(1 - x, 3); };
  var eIn = function (x) { return x * x * x; };
  var eBack = function (x, s) { s = s || 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
  var eBounce = function (x) {
    var n = 7.5625, d = 2.75;
    if (x < 1 / d) return n * x * x;
    if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
    if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
    return n * (x -= 2.625 / d) * x + 0.984375;
  };
  var tr = function (el, s) { el.setAttribute("transform", s); };
  var op = function (el, o) { el.setAttribute("opacity", o); };

  var cam = $("hCam"), shield = $("hShield"), brush = $("hBrush"), mirror = $("hMirror"), crown = $("hCrown"), ring = $("hRing");
  var PX = 560, PY = 369.5;                                     // armanın döndürme merkezi (logo-dikey)
  var letters = [];
  for (var i = 0; i < 9; i++) { var g = $("hL" + i); letters.push({ g: g, cx: +g.dataset.cx, cy: +g.dataset.cy }); }

  var sparks = [];
  for (var k = 0; k < 12; k++) {
    var p = document.createElementNS(NS, "path"); p.setAttribute("d", "M0 -26 L7 0 L0 26 L-7 0Z"); op(p, 0);
    $("hSparks").appendChild(p); sparks.push({ p: p, a: k / 12 * Math.PI * 2 + 0.2 * (k % 3), v: 230 + 60 * (k % 4) });
  }
  var STAR = "M0 -40 L11 -12 L40 -11 L17 7 L25 36 L0 19 L-25 36 L-17 7 L-40 -11 L-11 -12Z";
  var stars = [[-1, 205, 70, 0.7], [0, 560, -22, 0.95], [1, 915, 70, 0.7]].map(function (d) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", STAR); p.setAttribute("fill", "#FFD24A"); p.setAttribute("stroke", "#2A1406");
    p.setAttribute("stroke-width", "7"); p.setAttribute("stroke-linejoin", "round"); op(p, 0);
    $("hStars").appendChild(p); return { p: p, k: d[0], x: d[1], y: d[2], s: d[3] };
  });

  var END = 2.6;
  function render(t) {
    // sarsıntı: kalkan inişi, çarpışma, WARS inişi
    var sh = 0;
    [[0.35, 16], [0.75, 9], [2.3, 13]].forEach(function (h) {
      var d = t - h[0]; if (d > 0 && d < 0.35) sh += h[1] * Math.exp(-d * 14) * Math.sin(d * 90);
    });
    tr(cam, "translate(" + sh.toFixed(2) + " " + (sh * 0.6).toFixed(2) + ")");

    // kalkan: yukarıdan büyük düşer, iner, ezilip toparlanır
    var sd = seg(t, 0, 0.35), sq = seg(t, 0.35, 0.62);
    var sy = t < 0.35 ? lerp(-1100, 0, eIn(sd)) : 0;
    var ss = t < 0.35 ? lerp(1.45, 1, sd) : 1 + 0.12 * Math.sin(sq * Math.PI) * (1 - sq);
    var sy2 = t < 0.35 ? 1 : 1 - 0.1 * Math.sin(sq * Math.PI) * (1 - sq);
    tr(shield, "translate(" + PX + " " + PY + ") translate(0 " + sy.toFixed(1) + ") scale(" + ss.toFixed(3) + " " + (ss * sy2).toFixed(3) + ") translate(" + -PX + " " + -PY + ")");
    op(shield, 1);

    // şok halkası
    var rg = seg(t, 0.35, 0.85);
    ring.setAttribute("r", (60 + eOut(rg) * 520).toFixed(1));
    ring.setAttribute("stroke-width", (24 * (1 - rg) + 2).toFixed(1));
    op(ring, rg > 0 && rg < 1 ? ((1 - rg) * 0.85).toFixed(3) : 0);

    // fırça soldan, ayna sağdan
    var bw = eBack(seg(t, 0.4, 0.75), 2.2);
    tr(brush, "translate(" + lerp(-760, 0, bw).toFixed(1) + " " + lerp(260, 0, bw).toFixed(1) + ") rotate(" + lerp(-120, 0, bw).toFixed(2) + " " + PX + " " + PY + ")");
    tr(mirror, "translate(" + lerp(760, 0, bw).toFixed(1) + " " + lerp(260, 0, bw).toFixed(1) + ") rotate(" + lerp(120, 0, bw).toFixed(2) + " " + PX + " " + PY + ")");
    op(brush, t < 0.4 ? 0 : 1); op(mirror, t < 0.4 ? 0 : 1);

    // kıvılcım (çarpışma noktası armanın üst ortası)
    var kp = seg(t, 0.75, 1.2);
    sparks.forEach(function (s) {
      if (kp <= 0 || kp >= 1) { op(s.p, 0); return; }
      var r = eOut(kp) * s.v, sc = (1 - kp) * 1.3; op(s.p, 1);
      tr(s.p, "translate(" + (PX + Math.cos(s.a) * r).toFixed(1) + " " + (250 + Math.sin(s.a) * r).toFixed(1) + ") rotate(" + (s.a * 57.3 + 90).toFixed(1) + ") scale(" + sc.toFixed(3) + ")");
    });

    // taç: yukarıdan sekerek iner; dinlenmede arada bir hoplar
    var cd = seg(t, 0.8, 1.3), hop = 0;
    if (t > END) { var c = (t - END) % 7; if (c > 6) hop = Math.sin((c - 6) * Math.PI) * 26; }
    tr(crown, "translate(0 " + (lerp(-640, 0, eBounce(cd)) - hop).toFixed(1) + ")");
    op(crown, t < 0.8 ? 0 : 1);

    // yıldızlar: belirir, sonra hafifçe salınır
    stars.forEach(function (s) {
      var pr = eBack(seg(t, 1.3 + (s.k + 1) * 0.08, 1.62 + (s.k + 1) * 0.08), 2.4);
      var tw = t > END ? 1 + 0.08 * Math.sin(t * 2.4 + s.k * 1.7) : 1;
      op(s.p, pr > 0 ? 1 : 0);
      tr(s.p, "translate(" + s.x + " " + s.y + ") rotate(" + (s.k * 14 + Math.sin(t * 1.6 + s.k) * 7).toFixed(1) + ") scale(" + (pr * s.s * tw).toFixed(3) + ")");
    });

    // DENTA harf harf, WARS çakılır
    letters.forEach(function (L, i) {
      var s, y = 0, r = 0, o = 1, p, q;
      if (i < 5) {
        p = seg(t, 1.45 + i * 0.06, 1.78 + i * 0.06); s = eBack(p, 2.6); y = lerp(-80, 0, eOut(p)); o = p > 0 ? 1 : 0;
      } else {
        p = seg(t, 1.8 + (i - 5) * 0.07, 2.08 + (i - 5) * 0.07);
        s = lerp(2.6, 1, eIn(p)); r = lerp(-16, 0, p); o = p > 0 ? Math.min(1, p * 3) : 0;
        q = seg(t, 2.08 + (i - 5) * 0.07, 2.3 + (i - 5) * 0.07); if (p >= 1) s = 1 - 0.12 * Math.sin(q * Math.PI) * (1 - q);
      }
      tr(L.g, "translate(" + L.cx + " " + (L.cy + y) + ") rotate(" + r + ") scale(" + Math.max(0, s).toFixed(3) + ") translate(" + -L.cx + " " + -L.cy + ")");
      op(L.g, o);
    });
  }

  // ses planı — sahne zamanlarıyla birebir
  function sounds() {
    var S = window.DWSfx; if (!S || !S.isOn()) return;
    S.play("whoosh", 0.0, { dur: 0.35, f0: 200, f1: 2600, gain: 0.45 });
    S.play("impact", 0.35, { gain: 0.9 });
    S.play("whoosh", 0.4, { dur: 0.32, f0: 500, f1: 4200, pan: -0.7, gain: 0.35 });
    S.play("whoosh", 0.42, { dur: 0.32, f0: 500, f1: 4000, pan: 0.7, gain: 0.35 });
    S.play("clang", 0.75, { f0: 610, pan: -0.15 });
    S.play("clang", 0.755, { f0: 647, pan: 0.15, gain: 0.26 });
    S.play("boing", 0.98, { f0: 200 });
    S.play("sparkle", 1.32, {});
    for (var i = 0; i < 5; i++) S.play("pop", 1.47 + i * 0.06, { f0: 300 + i * 40, f1: 900 + i * 90, gain: 0.3 });
    S.play("whoosh", 1.8, { dur: 0.3, f0: 2600, f1: 300, gain: 0.3 });
    S.play("impact", 2.3, { f0: 140, f1: 42, gain: 0.85 });
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t0 = 0, running = false, visible = true;
  function frame(now) {
    var t = (now - t0) / 1000;
    render(t);
    if (t < END || visible) requestAnimationFrame(frame); else running = false;
  }
  function play(withSound) {
    if (reduce) { render(END); document.documentElement.classList.add("hero-go"); return; }
    t0 = performance.now();
    document.documentElement.classList.add("hero-go");
    if (withSound) sounds();
    if (!running) { running = true; requestAnimationFrame(frame); }
  }
  function busy() { return running && (performance.now() - t0) / 1000 < END; }

  // ekrandan çıkınca dinlenme döngüsünü durdur
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      visible = e[0].isIntersecting;
      if (visible && !running && !reduce) { running = true; requestAnimationFrame(frame); }
    }).observe(svg);
  }

  render(0);
  document.documentElement.classList.add("hero-ready");
  window.DWIntro = { play: play, busy: busy, render: render };   // render: tek kare denetimi için
  // fontlar yüklenince başla (yazılar zaten yol, ama düzen kaymasın)
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { play(true); });
})();
