// DentaWars — "Neden varız" kaydırma hikâyesi.
// Bölüm ekrana sabitlenir; kaydırma oranı (0–1) altı sahneyi kare kare hesaplar (render(p) saf fonksiyon,
// geri kaydırınca sahne geri sarılır). Sahneler: A tavla · B kartlar · C düello · D defter · E merdiven · F klinik.
(function () {
  var sec = document.getElementById("neden"), svg = document.getElementById("storyStage");
  if (!sec || !svg) return;
  var NS = "http://www.w3.org/2000/svg";
  var $ = function (id) { return document.getElementById(id); };
  var cl = function (x, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a || 0, x)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var seg = function (t, a, b) { return cl((t - a) / (b - a)); };
  var eOut = function (x) { return 1 - Math.pow(1 - x, 3); };
  var eIn = function (x) { return x * x * x; };
  var eBack = function (x, s) { s = s || 1.8; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
  var eBounce = function (x) {
    var n = 7.5625, d = 2.75;
    if (x < 1 / d) return n * x * x;
    if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
    if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
    return n * (x -= 2.625 / d) * x + 0.984375;
  };
  var tr = function (el, s) { el.setAttribute("transform", s); };
  var op = function (el, o) { el.setAttribute("opacity", (+o).toFixed(3)); };
  var at = function (x, y, s, r) { return "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")" + (r ? " rotate(" + r.toFixed(2) + ")" : "") + " scale(" + Math.max(0, s).toFixed(3) + ")"; };

  var N = 6, scenes = ["scA", "scB", "scC", "scD", "scE", "scF"].map($);

  // C · kıvılcımlar
  var sparks = [];
  for (var k = 0; k < 10; k++) {
    var sp = document.createElementNS(NS, "path"); sp.setAttribute("d", "M0 -22 L6 0 L0 22 L-6 0Z");
    $("cSparks").appendChild(sp); sparks.push({ p: sp, a: k / 10 * Math.PI * 2 + 0.3 * (k % 2), v: 120 + 40 * (k % 3) });
  }
  // E · merdiven basamakları + lig armaları
  var LIG = ["fantom", "amalgam", "kompozit", "porselen", "zirkonya", "altin"], steps = [];
  LIG.forEach(function (name, i) {
    var g = document.createElementNS(NS, "g"), x = 140 + i * 125, y = 470 - i * 52;
    var r = document.createElementNS(NS, "rect");
    r.setAttribute("x", -56); r.setAttribute("y", 0); r.setAttribute("width", 112); r.setAttribute("height", 560 - y);
    r.setAttribute("rx", 12); r.setAttribute("fill", i % 2 ? "#FFB547" : "#FF8A2B"); r.setAttribute("stroke", "#2A1406"); r.setAttribute("stroke-width", 6);
    var im = document.createElementNS(NS, "image");
    im.setAttribute("href", "/assets/img/lig/lig-" + (i + 1) + "-" + name + ".webp");
    im.setAttribute("x", -46); im.setAttribute("y", -96); im.setAttribute("width", 92); im.setAttribute("height", 92);
    g.appendChild(r); g.appendChild(im); $("eSteps").appendChild(g);
    steps.push({ g: g, im: im, x: x, y: y });
  });
  // F · ışınlar
  for (var j = 0; j < 14; j++) {
    var a0 = j / 14 * Math.PI * 2, a1 = a0 + 0.17, ray = document.createElementNS(NS, "path");
    ray.setAttribute("d", "M0 0 L" + (900 * Math.cos(a0)).toFixed(0) + " " + (900 * Math.sin(a0)).toFixed(0) + " L" + (900 * Math.cos(a1)).toFixed(0) + " " + (900 * Math.sin(a1)).toFixed(0) + "Z");
    $("fRays").appendChild(ray);
  }

  function render(p) {
    var f = cl(p) * N, idx = Math.min(N - 1, Math.floor(f)), q;
    // sahne görünürlüğü: girerken açılır, çıkarken söner (son sahne sönmez)
    scenes.forEach(function (sc, i) {
      var lq = f - i, vis = (lq > -0.02 && lq < 1.02) || (i === N - 1 && lq >= 1);
      var inn = seg(lq, 0, 0.18), out = i === N - 1 ? 0 : seg(lq, 0.86, 1);
      op(sc, vis ? inn * (1 - out) : 0);
      sc.style.display = vis ? "" : "none";
    });
    op($("stHalo"), 0.35 + 0.2 * Math.sin(p * 30));

    // A · tavla, zarlar yuvarlanır
    q = cl(f - 0);
    var bIn = eBack(seg(q, 0, 0.3));
    $("aBoard").setAttribute("transform", "translate(500 350) scale(" + bIn.toFixed(3) + ") translate(-500 -350)");
    var d1 = eBounce(seg(q, 0.12, 0.5)), d2 = eBounce(seg(q, 0.2, 0.58));
    tr($("aDie1"), at(lerp(300, 430, seg(q, 0.12, 0.5)), lerp(-120, 330, d1), 1, lerp(-260, 14, seg(q, 0.12, 0.5))));
    tr($("aDie2"), at(lerp(720, 575, seg(q, 0.2, 0.58)), lerp(-160, 345, d2), 1, lerp(300, -18, seg(q, 0.2, 0.58))));

    // B · zarlar kartlara döner, yelpaze açılır
    q = cl(f - 1);
    [[330, 300, -12], [500, 276, 0], [670, 300, 12]].forEach(function (c, i) {
      var e = eBack(seg(q, 0.05 + i * 0.08, 0.4 + i * 0.08), 1.6), fl = Math.sin(p * 40 + i) * 4 * seg(q, 0.5, 0.6);
      tr($("bCard" + i), at(lerp(500, c[0], e), lerp(440, c[1], e) + fl, lerp(0.25, 1, e), lerp(0, c[2], e)));
    });

    // C · iki oyuncu çarpışır, kıvılcım, skor
    q = cl(f - 2);
    var ce = eBack(seg(q, 0.04, 0.34), 1.4), hit = seg(q, 0.34, 0.6);
    var shake = q > 0.34 && q < 0.5 ? Math.sin(q * 160) * 10 * (1 - seg(q, 0.34, 0.5)) : 0;
    tr($("cLeft"), at(lerp(-180, 300, ce) + shake, 270, 1, lerp(-30, 0, ce)));
    tr($("cRight"), at(lerp(1180, 700, ce) - shake, 270, 1, lerp(30, 0, ce)));
    tr($("cVs"), at(500, 270, eBack(seg(q, 0.34, 0.52), 2.6) * 1.4, -6));
    sparks.forEach(function (s) {
      if (hit <= 0 || hit >= 1) { op(s.p, 0); return; }
      var r = eOut(hit) * s.v; op(s.p, 1);
      tr(s.p, at(500 + Math.cos(s.a) * r, 270 + Math.sin(s.a) * r, (1 - hit) * 1.4, s.a * 57.3 + 90));
    });
    tr($("cScore"), at(500, 470, eBack(seg(q, 0.55, 0.72), 2.2), 0));

    // D · yanlış kart deftere düşer, 3 · 7 · 21 gün, doğru olarak geri gelir
    q = cl(f - 3);
    tr($("dBook"), at(500, 380, eBack(seg(q, 0, 0.22)), 0));
    var fall = eIn(seg(q, 0.12, 0.36)), rise = eBack(seg(q, 0.66, 0.86), 1.6);
    var cy = q < 0.66 ? lerp(120, 380, fall) : lerp(380, 160, rise), cs = q < 0.66 ? lerp(1, 0.2, fall) : lerp(0.2, 1, rise);
    tr($("dCard"), at(500, cy, cs, q < 0.66 ? lerp(-8, 0, fall) : lerp(0, 6, rise)));
    op($("dMarkX"), q < 0.66 ? 1 : 0); op($("dMarkOk"), q < 0.66 ? 0 : 1);
    [380, 500, 620].forEach(function (x, i) { tr($("dDay" + i), at(x, 515, eBack(seg(q, 0.38 + i * 0.08, 0.52 + i * 0.08), 2.2), 0)); });

    // E · basamaklar belirir, Dento armadan armaya hoplar
    q = cl(f - 4);
    steps.forEach(function (s, i) {
      var e = eBack(seg(q, 0.02 + i * 0.05, 0.22 + i * 0.05), 1.4);
      tr(s.g, "translate(" + s.x + " " + lerp(620, s.y, e).toFixed(1) + ")");
    });
    var hp = seg(q, 0.36, 0.96) * 5, hi = Math.min(4, Math.floor(hp)), ht = hp - hi;
    var A = steps[hi], B = steps[Math.min(5, hi + 1)], hpAll = seg(q, 0.36, 0.96) >= 1;
    var dx = hpAll ? B.x : lerp(A.x, B.x, ht), dy = hpAll ? B.y : lerp(A.y, B.y, ht) - Math.sin(ht * Math.PI) * 60;
    $("eDento").setAttribute("x", (dx - 75).toFixed(1));
    $("eDento").setAttribute("y", (dy - 96 - 108).toFixed(1));
    op($("eDento"), seg(q, 0.3, 0.38));

    // F · ışınlar, diş, yıldızlar
    q = cl(f - 5, 0, 2);
    tr($("fRays"), "translate(500 270) rotate(" + (p * 220).toFixed(1) + ")");
    tr($("fTooth"), at(500, 260, eBack(seg(q, 0.05, 0.35), 1.8) * 0.82, Math.sin(p * 25) * 2));
    [[300, 150, -14, 0.8], [500, 70, 0, 1.05], [700, 150, 14, 0.8]].forEach(function (s, i) {
      tr($("fStar" + i), at(s[0], s[1], eBack(seg(q, 0.3 + i * 0.07, 0.48 + i * 0.07), 2.4) * s[3], s[2] + Math.sin(p * 30 + i) * 6));
    });
    return idx;
  }

  // ses: yalnız ileri giderken, sahneye girildiğinde
  function cue(i) {
    var S = window.DWSfx; if (!S) return;
    if (i === 0) { S.play("tick", 0.05, { f0: 1600, gain: 0.12 }); S.play("tick", 0.16, { f0: 1300, gain: 0.12 }); S.play("tick", 0.3, { f0: 1500, gain: 0.1 }); }
    if (i === 1) { S.play("whoosh", 0, { dur: 0.3, f0: 600, f1: 3600, gain: 0.3 }); S.play("pop", 0.15); }
    if (i === 2) { S.play("whoosh", 0, { dur: 0.25, pan: -0.6, gain: 0.3 }); S.play("whoosh", 0.02, { dur: 0.25, pan: 0.6, gain: 0.3 }); S.play("clang", 0.25, { gain: 0.28 }); }
    if (i === 3) { S.play("bonk", 0.1); S.play("sparkle", 0.6, { gain: 0.18 }); }
    if (i === 4) { for (var k = 0; k < 5; k++) S.play("pop", 0.2 + k * 0.12, { f0: 300 + k * 60, f1: 800 + k * 120, gain: 0.22 }); }
    if (i === 5) { S.play("fanfare", 0.1, { gain: 0.22 }); }
  }

  var caps = Array.prototype.slice.call(document.querySelectorAll("#storyCaps .cap"));
  var dots = Array.prototype.slice.call(sec.querySelectorAll(".story__dots button"));
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // dar ekranda kenar boşluklarını kırp: çizimler büyüsün
  function fit() { svg.setAttribute("viewBox", window.innerWidth < 600 ? "105 -10 790 560" : "0 -30 1000 600"); }
  fit(); window.addEventListener("resize", fit);

  if (reduce) { sec.classList.add("is-static"); render(1); caps.forEach(function (c) { c.classList.add("is-on"); }); return; }

  // Zamanla oynar: bölüm ekrana girince başlar, çıkınca durur, sayfa kaydırması hiç tutulmaz.
  var SCENE = 2.6, DUR = SCENE * N;           // sahne başına 2,6 sn → 15,6 sn
  var cur = 0, last = -1, t0 = 0, playing = false, visible = false, done = false;
  function paint(p) {
    cur = p;
    var idx = render(p);
    if (idx !== last) {
      caps.forEach(function (c, i) { c.classList.toggle("is-on", i === idx); });
      dots.forEach(function (d, i) { d.classList.toggle("is-on", i <= idx); d.setAttribute("aria-current", i === idx ? "step" : "false"); });
      if (playing && idx > last) cue(idx);
      last = idx;
    }
  }
  function loop(now) {
    if (!playing) return;
    var p = (now - t0) / 1000 / DUR;
    if (p >= 1) { p = 1; playing = false; done = true; sec.classList.add("is-done"); }
    paint(p);
    if (playing) requestAnimationFrame(loop);
  }
  function play(from) {
    from = cl(from || 0);
    t0 = performance.now() - from * DUR * 1000;
    last = Math.floor(from * N) - 1;            // başlanan sahnenin sesi de çalsın
    done = false; sec.classList.remove("is-done");
    if (!playing) { playing = true; requestAnimationFrame(loop); }
  }
  dots.forEach(function (d, i) { d.addEventListener("click", function () { play(i / N + 0.001); }); });
  document.getElementById("storyReplay").addEventListener("click", function () { play(0); });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      visible = e[0].isIntersecting;
      if (visible && !playing && !done) play(cur);
      else if (!visible && playing) playing = false;  // ekrandan çıkınca dur; dönünce kaldığı yerden
    }, { threshold: 0.45 }).observe(svg);
  } else { paint(1); }
  paint(0);
  window.DWStory = { render: render, play: play };
})();
