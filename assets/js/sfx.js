// DentaWars — ses efektleri. Tamamı WebAudio sentezi: ses dosyası, lisans, dış servis yok.
// Motion videosundaki seslerin (motion/ses_uret.py) tarayıcı karşılığı: whoosh · impact · clang · pop · boing · sparkle.
// Ses varsayılan KAPALI. Tarayıcılar kullanıcı dokunmadan ses çaldırmaz; açma düğmesi aynı zamanda izin jestidir.
(function () {
  var KEY = "dw-ses";
  var ctx = null, master = null, noiseBuf = null;
  var on = false;
  try { on = localStorage.getItem(KEY) === "1"; } catch (e) {}

  function init() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    // tepe kırpmasın: hafif kompresör + ana kazanç
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 4;
    comp.attack.value = 0.003; comp.release.value = 0.2;
    master = ctx.createGain(); master.gain.value = 0.55;
    master.connect(comp); comp.connect(ctx.destination);
    var n = ctx.sampleRate * 1.5;
    noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  function out(pan) {
    var g = ctx.createGain();
    if (pan && ctx.createStereoPanner) {
      var p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(master);
    } else g.connect(master);
    return g;
  }
  function env(g, t, peak, atk, dec) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + atk + dec);
  }
  function osc(type, f, t) { var o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); return o; }
  function noise(t, dur) {
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
    s.start(t, Math.random() * 0.5, dur + 0.05); return s;
  }

  var S = {
    // hava sesi — parça savrulurken
    whoosh: function (t, o) {
      o = o || {}; var dur = o.dur || 0.35;
      var src = noise(t, dur), f = ctx.createBiquadFilter(), g = out(o.pan);
      f.type = "bandpass"; f.Q.value = 1.2;
      f.frequency.setValueAtTime(o.f0 || 350, t);
      f.frequency.exponentialRampToValueAtTime(o.f1 || 2800, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime((o.gain || 0.5), t + dur * 0.75);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g);
    },
    // gövdeli darbe — kalkan iner, WARS çakılır
    impact: function (t, o) {
      o = o || {}; var g = out(o.pan), k = osc("sine", o.f0 || 120, t);
      k.frequency.exponentialRampToValueAtTime(o.f1 || 38, t + 0.25);
      env(g, t, o.gain || 0.9, 0.004, 0.55); k.connect(g); k.start(t); k.stop(t + 0.7);
      var c = noise(t, 0.06), lp = ctx.createBiquadFilter(), gc = out(o.pan);
      lp.type = "lowpass"; lp.frequency.value = 1800; env(gc, t, 0.35, 0.002, 0.06);
      c.connect(lp); lp.connect(gc);
    },
    // metal çınlama — fırça ile ayna çarpışır
    clang: function (t, o) {
      o = o || {}; var f0 = o.f0 || 620, g = out(o.pan);
      env(g, t, o.gain || 0.32, 0.002, 1.0);
      [[1, 1], [2.76, 0.55], [5.4, 0.35], [8.93, 0.2]].forEach(function (p) {
        var x = osc("sine", f0 * p[0], t), gg = ctx.createGain(); gg.gain.value = p[1];
        x.connect(gg); gg.connect(g); x.start(t); x.stop(t + 1.1);
      });
    },
    // kısa yükselen "pop" — harf, düğme
    pop: function (t, o) {
      o = o || {}; var g = out(o.pan), x = osc("sine", o.f0 || 320, t);
      x.frequency.exponentialRampToValueAtTime(o.f1 || 980, t + 0.05);
      env(g, t, o.gain || 0.4, 0.003, 0.09); x.connect(g); x.start(t); x.stop(t + 0.14);
    },
    // yaylanma — taç sekmesi, Dento zıplaması
    boing: function (t, o) {
      o = o || {}; var g = out(o.pan), x = osc("triangle", o.f0 || 190, t), lfo = osc("sine", 14, t), lg = ctx.createGain();
      lg.gain.setValueAtTime((o.f0 || 190) * 0.4, t); lg.gain.exponentialRampToValueAtTime(1, t + 0.4);
      lfo.connect(lg); lg.connect(x.frequency);
      x.frequency.linearRampToValueAtTime((o.f0 || 190) * 1.35, t + 0.4);
      env(g, t, o.gain || 0.35, 0.005, 0.32);
      x.connect(g); x.start(t); x.stop(t + 0.45); lfo.start(t); lfo.stop(t + 0.45);
    },
    // ışıltı — yıldız, doğru cevap
    sparkle: function (t, o) {
      o = o || {}; var base = o.f0 || 1568, steps = o.steps || [1, 1.26, 1.5, 2];
      steps.forEach(function (r, k) {
        var tt = t + k * (o.gap || 0.05), g = out(o.pan), x = osc("sine", base * r, tt), h = osc("sine", base * r * 2.01, tt), hg = ctx.createGain();
        hg.gain.value = 0.3; h.connect(hg); hg.connect(g);
        env(g, tt, (o.gain || 0.22) * (1 - k * 0.12), 0.003, 0.45); x.connect(g);
        x.start(tt); x.stop(tt + 0.5); h.start(tt); h.stop(tt + 0.5);
      });
    },
    // yumuşak "bonk" — yanlış cevap; ceza hissi vermez
    bonk: function (t, o) {
      o = o || {}; var g = out(o.pan), x = osc("triangle", 220, t);
      x.frequency.exponentialRampToValueAtTime(140, t + 0.18);
      env(g, t, o.gain || 0.3, 0.004, 0.22); x.connect(g); x.start(t); x.stop(t + 0.3);
    },
    // saat tik — sürenin son saniyeleri
    tick: function (t, o) {
      o = o || {}; var g = out(), x = osc("square", o.f0 || 1800, t), f = ctx.createBiquadFilter();
      f.type = "highpass"; f.frequency.value = 1200;
      env(g, t, o.gain || 0.08, 0.001, 0.03); x.connect(f); f.connect(g); x.start(t); x.stop(t + 0.05);
    },
    // fanfar — tur sonu
    fanfare: function (t, o) {
      o = o || {}; [523.25, 659.25, 783.99, 1046.5].forEach(function (f, k) {
        var tt = t + k * 0.09, g = out(), x = osc("triangle", f, tt), y = osc("sine", f * 2, tt), yg = ctx.createGain();
        yg.gain.value = 0.25; y.connect(yg); yg.connect(g);
        env(g, tt, (o.gain || 0.26), 0.01, k === 3 ? 0.9 : 0.3); x.connect(g);
        x.start(tt); x.stop(tt + 1); y.start(tt); y.stop(tt + 1);
      });
    }
  };

  var api = {
    isOn: function () { return on; },
    set: function (v) {
      on = !!v;
      try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) {}
      var fire = function () { document.dispatchEvent(new CustomEvent("dw:ses", { detail: on })); };
      // bağlam askıdayken planlanan sesler sonradan topluca çalar → önce uyandır, sonra haber ver
      if (on && init()) ctx.resume().then(fire, fire); else fire();
    },
    // name: ses adı · delay: saniye · o: seçenekler
    play: function (name, delay, o) {
      if (!on || !S[name]) return;
      if (!init()) return;
      if (ctx.state !== "running") { ctx.resume(); return; }   // jest gelmeden planlama yapma
      try { S[name](ctx.currentTime + (delay || 0) + 0.01, o); } catch (e) {}
    }
  };
  // tercih "açık" kayıtlıysa ilk dokunuşta bağlamı uyandır (tarayıcı jest istiyor)
  if (on) {
    var wake = function () { if (init()) ctx.resume(); window.removeEventListener("pointerdown", wake); window.removeEventListener("keydown", wake); };
    window.addEventListener("pointerdown", wake); window.addEventListener("keydown", wake);
  }
  window.DWSfx = api;
})();
