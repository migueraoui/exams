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
  // Year shown left-to-right everywhere: «2026 / 2027» (2026 first, on the left)
  function yearLabel(id) { var y = String(id).split("-"); return "⁦" + y[0] + " / " + y[1] + "⁩"; }
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
    return '<span class="countdown"><i class="fa-solid fa-hourglass-half"></i>' + txt + "</span>";
  }

  /* ---------- Toast / copy / share ---------- */
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById("toast");
    t.innerHTML = '<i class="fa-solid fa-circle-check"></i>' + esc(msg);
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
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

  var shareTitle = "";
  function share() {
    if (navigator.share) {
      navigator.share({ title: shareTitle, text: shareTitle, url: location.href }).catch(function () {});
    } else {
      copyLink(location.href);
    }
  }

  /* ---------- Hero ---------- */
  var SYMBOLS = {
    math: ["∑", "π", "√", "∫", "∞", "Δ", "÷", "×", "≈", "θ", "f(x)", "x²", "%", "≠", "α", "±", "λ", "∈"],
    info: ["</>", "{ }", "01", "10", "#", "if", "()", ";", "[ ]", "=>", "&&", "0x", "≠", "<>", "1", "0", "fn", "//"]
  };
  function symbols(mod) {
    var set = SYMBOLS[mod] || SYMBOLS.math;
    var n = window.innerWidth < 640 ? 12 : 20, h = "";
    for (var i = 0; i < n; i++) {
      h += '<span style="left:' + (Math.random() * 94).toFixed(1) + "%;font-size:" + (16 + Math.round(Math.random() * 26)) + "px;" +
        "animation-duration:" + (12 + Math.random() * 14).toFixed(1) + "s;" +
        "animation-delay:-" + (Math.random() * 20).toFixed(1) + "s;" +
        "--r:" + (Math.random() < .5 ? -1 : 1) * (20 + Math.round(Math.random() * 50)) + 'deg">' +
        esc(set[i % set.length]) + "</span>";
    }
    return '<div class="hero-sym" aria-hidden="true">' + h + "</div>";
  }

  function hero(c, opts) {
    return '<section class="hero">' + symbols(c.module) +
      '<div class="hero-top"><span class="site-name"><span class="logo">' + (c.module === "info" ? "&lt;/&gt;" : "∑") + "</span>" + esc(S.title) + "</span>" +
      '<button type="button" class="pill-btn" data-share><i class="fa-solid fa-share-nodes"></i>مشاركة الرابط</button></div>' +
      '<div class="hero-body"><div class="hero-text">' +
      '<div class="tags">' + opts.tags.map(function (t, i) { return '<span class="tag' + (i === 0 ? " light" : "") + '">' + t + "</span>"; }).join("") + "</div>" +
      "<h1>" + opts.title + "</h1>" +
      '<p class="sub">' + opts.sub + "</p>" + (opts.extra || "") +
      "</div></div></section>";
  }

  /* ---------- Views ---------- */
  function status(kind, v) {
    var ok = files(v).length > 0;
    var name = kind === "solution" ? "التصحيح" : "الموضوع";
    return '<div class="st ' + (ok ? "ok" : "wait") + '"><i class="fa-solid ' + (ok ? "fa-check" : "fa-hourglass-half") + '"></i>' +
      name + ": " + (ok ? "متاح" : (kind === "solution" ? "يُنشر قريباً" : "لم يُنشر بعد")) + "</div>";
  }

  function viewClass(year, cid) {
    var c = CLASSES[cid];
    var exams = (year.classes[cid] || []).slice().sort(function (a, b) { return (a.term || 0) - (b.term || 0); });
    var done = exams.filter(function (e) { return files(e.solution).length; }).length;
    var pct = exams.length ? Math.round(done / exams.length * 100) : 0;

    var cards = exams.map(function (e) {
      return '<a class="exam-card" href="' + examHref(year.id, cid, e) + '">' +
        '<div class="ec-top"><span class="ec-term">' + esc(TERMS[e.term] || "") + "</span>" +
        (e.date ? '<span class="ec-date">' + esc(fmtDate(e.date)) + "</span>" : "") + "</div>" +
        "<h3>" + esc(e.title) + "</h3>" +
        (countdown(e.date) ? '<div style="margin:-4px 0 10px">' + countdown(e.date) + "</div>" : "") +
        '<div class="ec-status">' + status("subject", e.subject) + status("solution", e.solution) + "</div>" +
        '<div class="ec-go">افتح الاختبار <i class="fa-solid fa-arrow-left"></i></div></a>';
    }).join("");

    document.title = c.stream + " — " + S.title;
    shareTitle = "مواضيع وتصحيحات " + c.stream + " — " + c.subject;
    return hero(c, {
        tags: [esc(c.subject), "السنة الدراسية " + esc(yearLabel(year.id))],
        title: esc(c.stream),
        sub: esc(c.level),
        extra: exams.length ? '<div class="progress"><div class="lbl"><span>التصحيحات المنشورة</span><span>' + done + " / " + exams.length + "</span></div>" +
          '<div class="bar"><span style="--p:' + pct + '%"></span></div></div>' : ""
      }) +
      '<h2 class="section-title"><i class="fa-solid fa-file-pen"></i>الاختبارات</h2>' +
      (cards ? '<div class="cards">' + cards + "</div>"
        : '<div class="empty"><i class="fa-solid fa-folder-open"></i><h3>لا توجد اختبارات بعد</h3><p>ستظهر هنا فور نشرها.</p></div>');
  }

  function docCard(kind, exam) {
    var fs = files(exam[kind]);
    var isSol = kind === "solution";
    var title = isSol ? "التصحيح النموذجي" : "موضوع الاختبار";
    if (!fs.length) {
      var msg = isSol
        ? "سيُنشر التصحيح النموذجي هنا بعد انتهاء الاختبار. عُد إلى هذه الصفحة لاحقاً."
        : "سيُنشر موضوع الاختبار هنا بعد إجرائه.";
      return '<section class="doc-card wait"><div class="dc-head"><span class="dc-icon"><i class="fa-solid fa-hourglass-half"></i></span>' +
        "<div><h2>" + title + '</h2><span class="badge wait"><span class="dot"></span>قريباً</span></div></div>' +
        "<p>" + msg + '</p><div class="loader"></div></section>';
    }
    var rows = fs.map(function (f, i) {
      var url = esc(encodeURI(f.href));
      var lbl = f.label || (fs.length > 1 ? "الجزء " + (i + 1) : "");
      return (lbl ? '<div class="file-lbl">' + esc(lbl) + "</div>" : "") +
        '<div class="file-row"><a class="btn primary" href="' + url + '" target="_blank" rel="noopener"><i class="fa-solid fa-eye"></i>عرض</a>' +
        '<a class="btn ghost" href="' + url + '" download><i class="fa-solid fa-download"></i>تحميل</a></div>';
    }).join("");
    return '<section class="doc-card ok"><div class="dc-head"><span class="dc-icon"><i class="fa-solid ' + (isSol ? "fa-square-check" : "fa-file-lines") + '"></i></span>' +
      "<div><h2>" + title + '</h2><span class="badge ok"><i class="fa-solid fa-check"></i>متاح الآن</span></div></div>' +
      '<div class="files">' + rows + "</div></section>";
  }

  function viewExam(year, cid, exam) {
    var c = CLASSES[cid];
    document.title = exam.title + " — " + c.stream;
    shareTitle = exam.title + " — " + c.stream + " (" + c.subject + ")";
    return '<a class="back" href="' + href(year.id, cid) + '"><i class="fa-solid fa-arrow-right"></i>كل اختبارات القسم</a>' +
      hero(c, {
        tags: [esc(c.subject), esc(TERMS[exam.term] || ""), exam.date ? esc(fmtDate(exam.date)) : "السنة الدراسية " + esc(yearLabel(year.id))],
        title: esc(exam.title),
        sub: esc(c.level) + " — " + esc(c.stream),
        extra: countdown(exam.date) ? "<div>" + countdown(exam.date) + "</div>" : ""
      }) +
      '<div class="docs">' + docCard("subject", exam) + docCard("solution", exam) + "</div>" +
      (exam.note ? '<div class="note"><i class="fa-solid fa-circle-info"></i><span>' + esc(exam.note) + "</span></div>" : "");
  }

  function notFound() {
    document.title = "الصفحة غير موجودة — " + S.title;
    return '<section class="lost"><div class="big">∅</div><h1>الصفحة غير موجودة</h1>' +
      "<p>الرابط غير صحيح. تأكّد من الرابط الذي أرسله لك الأستاذ.</p></section>";
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
    var html;

    // No home page: only a full class link (year/class/...) shows anything.
    if (!year || !p[1] || !CLASSES[p[1]] || !year.classes[p[1]]) html = notFound();
    else if (!p[2]) html = viewClass(year, p[1]);
    else {
      var exam = findExam(year, p[1], p[2], p[3], p[4]);
      html = exam ? viewExam(year, p[1], exam) : notFound();
    }

    var c = year && CLASSES[p[1]];
    var root = document.documentElement.style;
    root.setProperty("--accent", c ? c.color : "#2563eb");
    root.setProperty("--accent-2", c ? (c.color2 || c.color) : "#7c3aed");

    app.innerHTML = '<div class="enter">' + html + "</div>";
    window.scrollTo(0, 0);
  }

  /* ---------- Init ---------- */
  document.getElementById("footer-text").textContent =
    [S.teacher, S.school].filter(Boolean).concat(["السنة الدراسية " + yearLabel(S.currentYear)]).join(" · ");

  app.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-copy")) copyLink(location.href);
    if (b.hasAttribute("data-share")) share();
  });

  window.addEventListener("hashchange", render);
  render();
})();
