// DentaWars — site etkileşimleri. Bağımlılık yok.
// JS çalışmazsa sayfa eksiksiz görünür: gizleme sınıfları yalnızca <html class="js"> varken uygulanır.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var S = window.DWSfx || { isOn: function () { return false; }, set: function () {}, play: function () {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---------- yıl ----------
  var yil = $("[data-yil]"); if (yil) yil.textContent = new Date().getFullYear();

  // ---------- ses düğmesi ----------
  var snd = $("#snd"), hint = $("#sndHint");
  function paintSnd() {
    var on = S.isOn();
    snd.setAttribute("aria-pressed", on ? "true" : "false");
    snd.setAttribute("aria-label", on ? "Sesi kapat" : "Sesi aç");
    snd.classList.toggle("is-on", on);
  }
  if (snd) {
    paintSnd();
    snd.addEventListener("click", function () {
      var on = !S.isOn();
      S.set(on);
      paintSnd();
      if (hint) hint.hidden = true;
    });
    // ses açıldığında logo sesli olarak yeniden kurulur — en etkili ilk an
    document.addEventListener("dw:ses", function (e) {
      if (e.detail) {
        S.play("pop", 0, { gain: 0.35 });
        var hero = $("#hero");
        if (window.DWIntro && hero && hero.getBoundingClientRect().bottom > 80) window.DWIntro.play(true);
      }
    });
    // ilk ziyarette, kuruluş bitince küçük bir ipucu
    var seen = false; try { seen = localStorage.getItem("dw-ipucu") === "1"; } catch (e) {}
    if (!seen && !S.isOn() && hint) {
      setTimeout(function () {
        if (S.isOn()) return;
        hint.hidden = false;
        try { localStorage.setItem("dw-ipucu", "1"); } catch (e) {}
        setTimeout(function () { hint.hidden = true; }, 6000);
      }, 3000);
    }
  }

  // ---------- düğme sesleri ----------
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-sfx]");
    if (el) S.play(el.getAttribute("data-sfx"), 0, { gain: 0.35 });
  });
  if (hover) {
    $$(".btn, .mode, .hero__stage").forEach(function (el) {
      el.addEventListener("pointerenter", function () { S.play("tick", 0, { f0: 2400, gain: 0.05 }); });
    });
  }

  // ---------- kahraman: logoya tıkla → yeniden kur ----------
  var stage = $("#heroStage");
  if (stage) stage.addEventListener("click", function () {
    if (window.DWIntro && !window.DWIntro.busy()) window.DWIntro.play(true);
  });

  // ---------- kahraman: uçuşan altın toz ----------
  var dust = $("#dust");
  if (dust && !reduce) {
    for (var i = 0; i < 18; i++) {
      var d = document.createElement("i");
      d.style.left = (Math.random() * 100).toFixed(1) + "%";
      d.style.setProperty("--s", (0.5 + Math.random() * 0.9).toFixed(2));
      d.style.setProperty("--dur", (7 + Math.random() * 8).toFixed(1) + "s");
      d.style.setProperty("--del", (-Math.random() * 12).toFixed(1) + "s");
      d.style.setProperty("--x", ((Math.random() - 0.5) * 120).toFixed(0) + "px");
      dust.appendChild(d);
    }
  }

  // ---------- kahraman: fareyle hafif derinlik ----------
  var hero = $("#hero");
  if (hero && hover && !reduce) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty("--px", x.toFixed(3));
      hero.style.setProperty("--py", y.toFixed(3));
    });
    hero.addEventListener("pointerleave", function () { hero.style.setProperty("--px", 0); hero.style.setProperty("--py", 0); });
  }

  // ---------- üst bar: kaydırınca incelir ----------
  var top = $("#top");
  var onScroll = function () { top.classList.toggle("is-scrolled", window.scrollY > 24); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // ---------- kartlarda 3B eğim ----------
  if (hover && !reduce) {
    $$(".tilt, .mode").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--rx", (-y * 8).toFixed(2) + "deg");
        el.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
      });
      el.addEventListener("pointerleave", function () { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
    });
  }

  // ---------- mod kartı: Dento zıplar ----------
  $$(".mode").forEach(function (el) {
    el.addEventListener("click", function () {
      el.classList.remove("jump"); void el.offsetWidth; el.classList.add("jump");
    });
  });

  // ---------- kaydırınca giriş: reveal · stamp (damga) · flip (kart açılışı) · pop-in ----------
  var items = $$(".reveal, .stamp, .flip, .pop-in");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var groups = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; io.unobserve(el);
        var sibs = groups.get(el.parentElement) || 0; groups.set(el.parentElement, sibs + 1);
        var delay = sibs * 0.12;
        el.style.transitionDelay = el.style.animationDelay = delay + "s";
        el.classList.add("is-in");
        if (el.classList.contains("stamp")) S.play("impact", delay + 0.18, { f0: 160, f1: 60, gain: 0.35 });
        else if (el.classList.contains("flip")) S.play("whoosh", delay, { dur: 0.22, f0: 900, f1: 3500, gain: 0.18 });
        else if (el.classList.contains("pop-in")) S.play("boing", delay + 0.1, { f0: 240, gain: 0.3 });
        // giriş bitince animasyon sınıfını bırak: kart 3B eğime ve hover geçişine geri dönsün
        if (el.classList.contains("flip") || el.classList.contains("stamp")) {
          setTimeout(function () { el.classList.remove("flip", "stamp"); }, (delay + 1.1) * 1000);
        }
        setTimeout(function () { groups.set(el.parentElement, Math.max(0, (groups.get(el.parentElement) || 1) - 1)); }, 900);
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  // ---------- konfeti (kendi kodu, canvas) ----------
  var cv = $("#confetti"), cx = cv && cv.getContext ? cv.getContext("2d") : null, bits = [], raf = 0;
  var COLORS = ["#FF6B00", "#FFB547", "#F2B21E", "#FFD24A", "#FFFFFF", "#5FAFE6"];
  function sizeCv() { var dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function confetti(x, y, n) {
    if (!cx || reduce) return;
    sizeCv();
    for (var i = 0; i < (n || 90); i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 1.9, v = 7 + Math.random() * 9;
      bits.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4,
                  w: 7 + Math.random() * 7, h: 4 + Math.random() * 5, c: COLORS[i % COLORS.length], life: 0 });
    }
    if (!raf) raf = requestAnimationFrame(step);
  }
  function step() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    bits = bits.filter(function (b) { return b.life < 160 && b.y < innerHeight + 40; });
    bits.forEach(function (b) {
      b.life++; b.vy += 0.32; b.vx *= 0.985; b.x += b.vx; b.y += b.vy; b.r += b.vr;
      cx.save(); cx.translate(b.x, b.y); cx.rotate(b.r); cx.scale(1, Math.cos(b.life * 0.18));
      cx.fillStyle = b.c; cx.strokeStyle = "#2A1406"; cx.lineWidth = 1.5;
      cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); cx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h); cx.restore();
    });
    raf = bits.length ? requestAnimationFrame(step) : 0;
    if (!raf) cx.clearRect(0, 0, innerWidth, innerHeight);
  }
  function burstFrom(el, n) { var r = el.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2, n); }
  $$("[data-confetti]").forEach(function (el) { el.addEventListener("click", function () { burstFrom(el, 110); S.play("sparkle", 0.05); }); });

  // ---------- mini tur ----------
  // Sorular ders kitabı düzeyinde, tartışmasız temel bilgiler. Uygulamanın soru setinden değil; örnek amaçlı.
  var BANK = [
    { q: "Daimi dentisyonda kaç diş bulunur?", o: ["28", "30", "32", "36"], a: 2 },
    { q: "Süt dişi dentisyonunda kaç diş bulunur?", o: ["16", "20", "24", "28"], a: 1 },
    { q: "Vücudun en sert dokusu hangisidir?", o: ["Dentin", "Diş minesi", "Sement", "Kortikal kemik"], a: 1 },
    { q: "Halk arasında “yirmi yaş dişi” denen diş hangisidir?", o: ["Kanin", "İkinci küçük azı", "Birinci büyük azı", "Üçüncü büyük azı"], a: 3 },
    { q: "En büyük tükürük bezi hangisidir?", o: ["Parotis", "Submandibular", "Sublingual", "Minör tükürük bezleri"], a: 0 }
  ];
  var LETTERS = ["A", "B", "C", "D"];
  var quiz = $("#quiz");
  if (quiz) {
    var TIME = 15, round = [], idx = 0, right = 0, streak = 0, timer = 0, tStart = 0, locked = false, lastTick = -1;
    var screens = $$(".quiz__screen", quiz);
    function show(name) {
      screens.forEach(function (s) { s.classList.toggle("is-on", s.getAttribute("data-screen") === name); });
    }
    function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function start() { round = shuffle(BANK).slice(0, 3); idx = 0; right = 0; streak = 0; show("q"); ask(); }
    function ask() {
      locked = false; lastTick = -1;
      var item = round[idx];
      $("#qCount").textContent = (idx + 1) + " / " + round.length;
      $("#qText").textContent = item.q;
      var box = $("#qOpts"); box.innerHTML = "";
      item.o.forEach(function (txt, i) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "opt";
        b.innerHTML = '<span class="opt__k">' + LETTERS[i] + '</span><span class="opt__t"></span>';
        b.querySelector(".opt__t").textContent = txt;
        b.style.animationDelay = (i * 0.06) + "s";
        b.addEventListener("click", function () { answer(i, b); });
        box.appendChild(b);
      });
      quiz.classList.remove("is-shake", "is-win");
      tStart = performance.now(); cancelAnimationFrame(timer); timer = requestAnimationFrame(tickLoop);
    }
    function tickLoop(now) {
      var left = TIME - (now - tStart) / 1000;
      $("#qBar").style.transform = "scaleX(" + Math.max(0, left / TIME).toFixed(4) + ")";
      $("#qBar").parentElement.classList.toggle("is-low", left < 4);
      var whole = Math.ceil(left);
      if (left < 3.5 && whole !== lastTick && whole > 0) { lastTick = whole; S.play("tick", 0, { gain: 0.09 }); }
      if (left <= 0) { answer(-1, null); return; }
      if (!locked) timer = requestAnimationFrame(tickLoop);
    }
    function answer(i, btn) {
      if (locked) return; locked = true; cancelAnimationFrame(timer);
      var item = round[idx], opts = $$(".opt", quiz);
      opts.forEach(function (o, k) { o.disabled = true; if (k === item.a) o.classList.add("is-right"); });
      if (i === item.a) {
        right++; streak++;
        quiz.classList.add("is-win");
        S.play("sparkle", 0, { f0: streak > 1 ? 1760 : 1568 });
        if (btn) { burstFrom(btn, 40); flyText(btn, "+" + (20 + (streak > 1 ? 10 : 0))); }
      } else {
        streak = 0;
        if (btn) btn.classList.add("is-wrong");
        quiz.classList.add("is-shake");
        S.play("bonk", 0);
      }
      var st = $("#qStreak"); st.hidden = streak < 2; if (streak >= 2) st.textContent = "Seri ×" + streak;
      setTimeout(function () { idx++; if (idx < round.length) ask(); else end(); }, i === item.a ? 1100 : 1700);
    }
    function flyText(el, txt) {
      var r = el.getBoundingClientRect(), f = document.createElement("span");
      f.className = "fly"; f.textContent = txt;
      f.style.left = (r.right - 40) + "px"; f.style.top = (r.top + window.scrollY) + "px";
      document.body.appendChild(f); setTimeout(function () { f.remove(); }, 1000);
    }
    function end() {
      show("end");
      // sonuç ekranı asla 0 göstermez, "kaybettin" demez (uygulamanın dil kuralı)
      var T = ["Isınma turu tamam.", "İyi başlangıç.", "Güzel tur.", "Tam isabet."];
      var X = ["Doğru cevaplar gösterildi. Bir tur daha at, hepsi aklında kalsın.",
               "Bir doğru cevap, iki yeni bilgi. Bir tur daha at, hepsi aklında kalsın.",
               "İki doğru cevap. Bir tur daha atarsan üçüncü yıldız senin.",
               "Üç soruda üç doğru. Uygulamada seni daha zorları bekliyor."];
      $("#qEndTitle").textContent = T[right];
      $("#qEndText").textContent = X[right];
      $$("#qStars svg").forEach(function (s, k) {
        s.classList.remove("is-lit"); void s.getBoundingClientRect();
        if (k < Math.max(1, right)) { s.style.animationDelay = (0.15 + k * 0.18) + "s"; s.classList.add("is-lit"); }
      });
      S.play("fanfare", 0.1);
      if (right === 3) setTimeout(function () { burstFrom($("#qStars"), 140); }, 600);
    }
    $("#quizStart").addEventListener("click", start);
    $("#quizAgain").addEventListener("click", start);
  }
})();
