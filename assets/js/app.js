(function () {
  "use strict";

  var S = window.SITE;
  var app = document.getElementById("app");
  var CLASSES = {};
  S.classes.forEach(function (c) { CLASSES[c.id] = c; });

  var TERMS = { 1: "الفصل الأول", 2: "الفصل الثاني", 3: "الفصل الثالث" };

  /* ---------- Helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  // Arabic reading order: first year on the right → reads «2026 / 2027»
  function yearLabel(id) { var y = String(id).split("-"); return "\u2067" + y[0] + "\u00a0\u200f/\u200f\u00a0" + y[1] + "\u2069"; }
  function getYear(id) { return S.years.filter(function (y) { return y.id === id; })[0]; }
  function href() { return "#/" + Array.prototype.map.call(arguments, encodeURIComponent).join("/"); }

  function moduleOf(c, e) { return (e && e.module) || c.module; }
  function examHref(yid, cid, e) {
    var parts = [yid, cid, moduleOf(CLASSES[cid], e), "fasl-" + (e.term || 1)];
    if (e.id && e.id !== "exam") parts.push(e.id);
    return href.apply(null, parts);
  }
  function findExam(year, cid, mod, fasl, id) {
    var m = /^fasl-(\d)$/.exec(fasl || "");
    if (!m) return null;
    var c = CLASSES[cid];
    var list = (year.classes[cid] || []).filter(function (e) {
      return moduleOf(c, e) === mod && String(e.term || 1) === m[1];
    });
    if (id) return list.filter(function (e) { return e.id === id; })[0] || null;
    return list.filter(function (e) { return !e.id || e.id === "exam"; })[0] || list[0] || null;
  }

  function files(v) {
    if (!v) return [];
    if (typeof v === "string") return [{ label: "", href: v }];
    if (Array.isArray(v)) return v.filter(function (f) { return f && f.href; });
    if (v.href) return [v];
    return [];
  }

  function fmtDate(d) {
    if (!d) return "";
    try {
      var dt = new Date(d + "T00:00:00");
      if (isNaN(dt)) return d;
      return new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "long", year: "numeric", numberingSystem: "latn" }).format(dt);
    } catch (e) { return d; }
  }

  function fileLinks(v, emptyText) {
    var fs = files(v);
    if (!fs.length) return '<span class="na"><i class="pulse"></i>' + emptyText + "</span>";
    return fs.map(function (f, i) {
      return '<a href="' + esc(encodeURI(f.href)) + '" target="_blank" rel="noopener">' +
        "✓ " + esc(f.label || (fs.length > 1 ? "الجزء " + (i + 1) : "متاح — تحميل")) + "</a>";
    }).join(" · ");
  }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2000);
  }

  function copyLink(url) {
    function done() { toast("تم نسخ الرابط"); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = url; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { prompt("انسخ الرابط:", url); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done, fallback);
    else fallback();
  }

  function tools(title) {
    return '<p class="tools"><button type="button" data-copy>نسخ رابط الصفحة</button>' +
      (navigator.share ? '<span class="sep">|</span><button type="button" data-share="' + esc(title) + '">مشاركة</button>' : "") +
      "</p>";
  }

  /* ---------- Lively bits ---------- */
  function daysUntil(d) {
    if (!d) return null;
    var t = new Date(d + "T00:00:00"); if (isNaN(t)) return null;
    var now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.round((t - now) / 86400000);
  }
  function countdown(d) {
    var n = daysUntil(d);
    if (n === null || n < 0) return "";
    var txt = n === 0 ? "الاختبار اليوم — بالتوفيق!"
      : n === 1 ? "الاختبار غداً"
      : n === 2 ? "الاختبار بعد يومين"
      : "الاختبار بعد " + n + (n <= 10 ? " أيام" : " يوماً");
    return '<span class="countdown">' + txt + "</span>";
  }

  function art(mod) {
    if (mod === "info") {
      return '<div class="term-art" aria-hidden="true" dir="ltr">' +
        '<div class="term-bar"><i></i><i></i><i></i></div>' +
        '<div class="term-body"><div class="l l1"><span class="p">&gt;</span> python exam.py</div>' +
        '<div class="l l2">Loading<span class="dots"></span></div>' +
        '<div class="l l3 ok" dir="rtl">✓ بالتوفيق للجميع</div><span class="cur"></span></div></div>';
    }
    return '<svg class="math-art" viewBox="0 0 220 120" aria-hidden="true">' +
      '<path class="ax" d="M10 60H212M110 8V114"/>' +
      '<path class="ax tick" d="M40 57v6M75 57v6M145 57v6M180 57v6M107 25h6M107 95h6"/>' +
      '<path id="curve" class="curve" d="M10 60 C 27 15, 43 15, 60 60 S 93 105, 110 60 S 143 15, 160 60 S 193 105, 210 60"/>' +
      '<path class="curve2" d="M30 112 Q 110 -40 190 112"/>' +
      '<circle class="dot" r="4"><animateMotion dur="6s" repeatCount="indefinite" rotate="auto"><mpath href="#curve"/></animateMotion></circle>' +
      '<text x="200" y="76">x</text><text x="116" y="16">y</text></svg>';
  }

  function hero(c, title, meta) {
    return '<section class="hero">' +
      '<div class="hero-text"><span class="kicker">' + esc(c.subject) + "</span>" +
      "<h1>" + title + "</h1>" + '<p class="meta">' + meta + "</p></div>" + art(c.module) + "</section>";
  }

  /* ---------- Views ---------- */
  function viewClass(year, cid) {
    var c = CLASSES[cid];
    var groups = {};
    (year.classes[cid] || []).forEach(function (e) { var t = e.term || 0; (groups[t] = groups[t] || []).push(e); });

    var body = Object.keys(groups).sort().map(function (t) {
      return '<h2 class="term">' + esc(TERMS[t] || "أخرى") + "</h2>" +
        '<table class="exams"><thead><tr><th>الاختبار</th><th>التاريخ</th><th>الموضوع</th><th>التصحيح</th></tr></thead><tbody>' +
        groups[t].map(function (e) {
          return "<tr>" +
            '<td class="title"><a href="' + examHref(year.id, cid, e) + '">' + esc(e.title) + ' <span class="go">←</span></a></td>' +
            '<td class="date" data-label="التاريخ">' + (e.date ? esc(fmtDate(e.date)) + " " + countdown(e.date) : "—") + "</td>" +
            '<td data-label="الموضوع">' + fileLinks(e.subject, "لم يُنشر بعد") + "</td>" +
            '<td data-label="التصحيح">' + fileLinks(e.solution, "يُنشر قريباً") + "</td></tr>";
        }).join("") + "</tbody></table>";
    }).join("");

    document.title = c.stream + " — " + S.title;
    return hero(c, esc(c.level) + " — " + esc(c.stream), "السنة الدراسية " + esc(yearLabel(year.id))) +
      (body || '<p class="empty">لا توجد اختبارات منشورة بعد. ستظهر هنا فور نشرها.</p>') +
      tools(c.stream);
  }

  function docSection(kind, exam) {
    var fs = files(exam[kind]);
    var isSol = kind === "solution";
    var h = "<h2>" + (isSol ? "التصحيح النموذجي" : "موضوع الاختبار") + "</h2>";
    if (!fs.length) {
      var msg = isSol
        ? "لم يُنشر التصحيح بعد. سيكون متاحاً على هذه الصفحة بعد انتهاء الاختبار."
        : "لم يُنشر الموضوع بعد. سيكون متاحاً على هذه الصفحة بعد إجراء الاختبار.";
      return '<section class="doc wait">' + h + '<p class="status"><span class="hourglass" aria-hidden="true"></span>' + msg + "</p></section>";
    }
    return '<section class="doc ready">' + h + '<div class="files">' + fs.map(function (f, i) {
      var url = esc(encodeURI(f.href));
      var lbl = f.label || (fs.length > 1 ? "الجزء " + (i + 1) : "");
      return '<div class="file">' + (lbl ? '<span class="lbl">' + esc(lbl) + "</span>" : "") +
        '<a class="btn primary" href="' + url + '" target="_blank" rel="noopener">عرض</a>' +
        '<a class="btn" href="' + url + '" download>تحميل</a></div>';
    }).join("") + "</div></section>";
  }

  function viewExam(year, cid, exam) {
    var c = CLASSES[cid];
    document.title = exam.title + " — " + c.stream;
    var meta = [c.level + " — " + c.stream, "مادة " + c.subject];
    meta.push(exam.date ? fmtDate(exam.date) : yearLabel(year.id));
    return '<p class="back"><a href="' + href(year.id, cid) + '">العودة إلى كل اختبارات القسم</a></p>' +
      hero(c, esc(exam.title), meta.map(esc).join(" · ") + (exam.date ? " " + countdown(exam.date) : "")) +
      docSection("subject", exam) + docSection("solution", exam) +
      (exam.note ? '<p class="note">' + esc(exam.note) + "</p>" : "") +
      tools(exam.title + " — " + c.stream);
  }

  function notFound() {
    document.title = "الصفحة غير موجودة — " + S.title;
    return "<h1>الصفحة غير موجودة</h1>" +
      '<p class="lead">الرابط غير صحيح. تأكّد من الرابط الذي أرسله لك الأستاذ.</p>';
  }

  /* ---------- Floating symbols background ---------- */
  var SYMBOLS = {
    math: ["∑", "π", "√", "∫", "∞", "Δ", "÷", "×", "≈", "θ", "f(x)", "x²", "%", "≠", "α", "±", "λ", "∈"],
    info: ["</>", "{ }", "01", "10", "#", "if", "()", ";", "[ ]", "=>", "&&", "0x", "≠", "<>", "1", "0", "fn", "//"]
  };
  var bg = document.createElement("div");
  bg.className = "bg-sym";
  bg.setAttribute("aria-hidden", "true");
  document.body.insertBefore(bg, document.body.firstChild);
  var bgMod = null;

  function symbols(mod) {
    if (mod === bgMod) return;
    bgMod = mod;
    var set = SYMBOLS[mod] || SYMBOLS.math;
    var n = window.innerWidth < 640 ? 14 : 24;
    var h = "";
    for (var i = 0; i < n; i++) {
      var size = 18 + Math.round(Math.random() * 30);
      h += '<span style="left:' + (Math.random() * 96).toFixed(1) + "%;font-size:" + size + "px;" +
        "animation-duration:" + (22 + Math.random() * 26).toFixed(1) + "s;" +
        "animation-delay:-" + (Math.random() * 40).toFixed(1) + "s;" +
        "--r:" + (Math.random() < .5 ? -1 : 1) * (20 + Math.round(Math.random() * 40)) + 'deg">' +
        esc(set[i % set.length]) + "</span>";
    }
    bg.innerHTML = h;
  }

  /* ---------- Router ---------- */
  function parse() {
    return location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(function (p) {
      try { return decodeURIComponent(p); } catch (e) { return p; }
    });
  }

  function render() {
    var p = parse();
    var year = getYear(p[0]);
    var html, mod = "math";

    // No home page: only a full class link (year/class/...) shows anything.
    if (!year || !p[1] || !CLASSES[p[1]] || !year.classes[p[1]]) html = notFound();
    else if (!p[2]) html = viewClass(year, p[1]);
    else {
      var exam = findExam(year, p[1], p[2], p[3], p[4]);
      html = exam ? viewExam(year, p[1], exam) : notFound();
    }

    if (year && CLASSES[p[1]]) {
      mod = CLASSES[p[1]].module;
      document.documentElement.style.setProperty("--accent", CLASSES[p[1]].color);
    }
    symbols(mod);
    app.innerHTML = '<div class="enter">' + html + "</div>";
    window.scrollTo(0, 0);
  }

  /* ---------- Init ---------- */
  document.getElementById("site-title").textContent = S.title;
  document.getElementById("site-sub").textContent = [S.teacher, S.school].filter(Boolean).join(" — ");
  document.getElementById("footer-text").textContent =
    [S.teacher, S.school].filter(Boolean).join(" — ") || ("السنة الدراسية " + yearLabel(S.currentYear));

  app.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-copy")) copyLink(location.href);
    if (b.hasAttribute("data-share")) navigator.share({ title: b.getAttribute("data-share"), url: location.href }).catch(function () {});
  });

  window.addEventListener("hashchange", render);
  render();
})();
