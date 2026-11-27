(function () {
  "use strict";

  var S = window.SITE;
  var app = document.getElementById("app");
  var yearSelect = document.getElementById("year-select");
  var CLASSES = {};
  S.classes.forEach(function (c) { CLASSES[c.id] = c; });

  var TERMS = { 1: "الفصل الأول", 2: "الفصل الثاني", 3: "الفصل الثالث" };

  /* ---------- Icons ---------- */
  var I = {
    chevron: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
    math: '<svg viewBox="0 0 24 24"><path d="M5 7h6M8 4v6M14 7h5M5 17l5-5M10 17l-5-5M14 15h5M14 19h5"/></svg>',
    computer: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M8 9l-2 2 2 2M16 9l2 2-2 2"/></svg>',
    file: '<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
    checkDoc: '<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 14l2 2 4-4"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    download: '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
    share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7M5 10v10h14V10"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'
  };

  /* ---------- Helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function yearLabel(id) { return "\u2066" + String(id).replace("-", "\u00a0/\u00a0") + "\u2069"; }
  function getYear(id) { return S.years.filter(function (y) { return y.id === id; })[0]; }
  function href() { return "#/" + Array.prototype.map.call(arguments, encodeURIComponent).join("/"); }
  function classIcon(c) { return /إعلام/.test(c.subject) ? I.computer : I.math; }
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
  function className(c) { return c.level + " — " + c.stream; }

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

  function crumbs(items) {
    return '<nav class="crumbs" aria-label="مسار التنقل">' + items.map(function (it, i) {
      var last = i === items.length - 1;
      var sep = i > 0 ? I.chevron : "";
      return sep + (last ? '<span aria-current="page">' + esc(it[0]) + "</span>" : '<a href="' + it[1] + '">' + esc(it[0]) + "</a>");
    }).join("") + "</nav>";
  }

  function statusChips(exam) {
    var s = files(exam.subject).length, c = files(exam.solution).length;
    if (c) return '<span class="chip ok">' + I.check + "التصحيح متاح</span>";
    if (s) return '<span class="chip ok">' + I.check + 'الموضوع متاح</span><span class="chip wait"><span class="pulse"></span>التصحيح قريباً</span>';
    return '<span class="chip wait"><span class="pulse"></span>يُنشر قريباً</span>';
  }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  function copyLink(url) {
    function done() { toast("تم نسخ الرابط ✓"); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(done, fallback);
    } else fallback();
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = url; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { prompt("انسخ الرابط:", url); }
      document.body.removeChild(ta);
    }
  }

  function shareButtons(title) {
    var h = '<div class="share-row">';
    if (navigator.share) h += '<button class="btn sm" data-share="' + esc(title) + '">' + I.share + "مشاركة</button>";
    h += '<button class="btn sm" data-copy>' + I.link + "نسخ الرابط</button></div>";
    return h;
  }

  /* ---------- Views ---------- */
  function viewHome(year) {
    var ids = Object.keys(year.classes);
    var cards = ids.map(function (cid) {
      var c = CLASSES[cid];
      if (!c) return "";
      var exams = year.classes[cid] || [];
      var ready = exams.filter(function (e) { return files(e.solution).length; }).length;
      var meta = '<span class="chip subj">' + esc(c.subject) + "</span>";
      if (exams.length) {
        meta += ready
          ? '<span class="chip ok">' + I.check + ready + " / " + exams.length + " تصحيح متاح</span>"
          : '<span class="chip wait"><span class="pulse"></span>التصحيح قريباً</span>';
      }
      return '<a class="card class-card" style="--c:' + esc(c.color) + '" href="' + href(year.id, cid) + '">' +
        '<span class="class-icon" aria-hidden="true">' + classIcon(c) + "</span>" +
        '<span class="class-body"><span class="class-level">' + esc(c.level) + "</span>" +
        '<span class="class-stream" style="display:block">' + esc(c.stream) + "</span>" +
        '<span class="class-meta">' + meta + "</span></span>" +
        '<span class="class-go" aria-hidden="true">' + I.chevron + "</span></a>";
    }).join("");

    document.title = S.title + " — " + yearLabel(year.id);
    return '<section class="hero">' +
      '<span class="eyebrow">' + I.calendar + "السنة الدراسية " + esc(yearLabel(year.id)) + "</span>" +
      "<h1>مواضيع الاختبارات وتصحيحاتها النموذجية</h1>" +
      "<p>اختر قسمك للاطلاع على مواضيع الاختبارات والتصحيح النموذجي لكل منها.</p></section>" +
      (cards ? '<div class="grid">' + cards + "</div>" : emptyBox("لا توجد أقسام", "لم تُضف أقسام لهذه السنة الدراسية بعد."));
  }

  function viewClass(year, cid) {
    var c = CLASSES[cid];
    var exams = (year.classes[cid] || []).slice();
    var groups = {};
    exams.forEach(function (e) { var t = e.term || 0; (groups[t] = groups[t] || []).push(e); });
    var termKeys = Object.keys(groups).sort();

    var list = termKeys.map(function (t) {
      return '<section class="term"><h2 class="term-title">' + esc(TERMS[t] || "أخرى") + '</h2><div class="exam-list">' +
        groups[t].map(function (e) {
          return '<a class="card exam-row" href="' + examHref(year.id, cid, e) + '">' +
            '<span class="ic" aria-hidden="true">' + I.file + "</span>" +
            '<span class="body"><h3>' + esc(e.title) + "</h3>" +
            '<span class="class-meta">' + statusChips(e) + (e.date ? '<span class="date">' + esc(fmtDate(e.date)) + "</span>" : "") + "</span></span>" +
            '<span class="go" aria-hidden="true">' + I.chevron + "</span></a>";
        }).join("") + "</div></section>";
    }).join("");

    document.title = c.stream + " — " + S.title;
    return crumbs([["الرئيسية", href(year.id)], [c.stream]]) +
      '<div class="class-head" style="--c:' + esc(c.color) + '">' +
      '<span class="class-icon" aria-hidden="true">' + classIcon(c) + "</span>" +
      '<div class="t"><h1>' + esc(c.stream) + "</h1><p>" + esc(c.level) + " · مادة " + esc(c.subject) + " · " + esc(yearLabel(year.id)) + "</p></div></div>" +
      (list || emptyBox("لا توجد اختبارات بعد", "ستظهر هنا مواضيع الاختبارات وتصحيحاتها فور نشرها.")) +
      shareButtons(c.stream);
  }

  function docCard(kind, exam) {
    var fs = files(exam[kind]);
    var isSol = kind === "solution";
    var title = isSol ? "التصحيح النموذجي" : "موضوع الاختبار";
    if (!fs.length) {
      var msg = isSol
        ? (files(exam.subject).length
          ? "التصحيح النموذجي قيد الإعداد، وسيُنشر هنا في أقرب الآجال. يُرجى العودة لاحقاً."
          : "سيُنشر التصحيح النموذجي هنا مباشرةً بعد إجراء الاختبار. يُرجى العودة لاحقاً.")
        : "سيُتاح موضوع الاختبار هنا بعد إجرائه.";
      return '<article class="card doc pending"><div class="doc-top"><span class="ic" aria-hidden="true">' + I.clock + "</span>" +
        "<div><h2>" + title + '</h2><span class="chip wait"><span class="pulse"></span>يُنشر قريباً</span></div></div>' +
        '<p class="doc-note">' + msg + "</p></article>";
    }
    var actions = fs.map(function (f) {
      var url = encodeURI(f.href);
      return '<div class="doc-file">' + (f.label ? '<span class="lbl">' + esc(f.label) + "</span>" : "") +
        '<a class="btn primary" href="' + esc(url) + '" target="_blank" rel="noopener">' + I.eye + "عرض</a>" +
        '<a class="btn" href="' + esc(url) + '" download>' + I.download + "تحميل</a></div>";
    }).join("");
    return '<article class="card doc ready"><div class="doc-top"><span class="ic" aria-hidden="true">' + (isSol ? I.checkDoc : I.file) + "</span>" +
      "<div><h2>" + title + '</h2><span class="chip ok">' + I.check + "متاح</span></div></div>" +
      '<div class="doc-actions">' + actions + "</div></article>";
  }

  function viewExam(year, cid, exam) {
    var c = CLASSES[cid];
    document.title = exam.title + " — " + c.stream;
    return crumbs([["الرئيسية", href(year.id)], [c.stream, href(year.id, cid)], [exam.title]]) +
      '<header class="exam-head"><span class="eyebrow" style="--brand:' + esc(c.color) + ";background:color-mix(in srgb," + esc(c.color) + ' 10%,white)">' +
      esc(c.subject) + " · " + esc(TERMS[exam.term] || "") + "</span>" +
      "<h1>" + esc(exam.title) + "</h1>" +
      '<div class="sub"><span>' + I.users + esc(className(c)) + "</span>" +
      '<span>' + I.calendar + (exam.date ? esc(fmtDate(exam.date)) : "السنة الدراسية " + esc(yearLabel(year.id))) + "</span></div></header>" +
      '<div class="docs">' + docCard("subject", exam) + docCard("solution", exam) + "</div>" +
      (exam.note ? '<div class="notice">' + I.info + "<span>" + esc(exam.note) + "</span></div>" : "") +
      shareButtons(exam.title + " — " + c.stream);
  }

  function emptyBox(h, p, withHome) {
    return '<div class="card empty"><div class="ic" aria-hidden="true">' + I.search + "</div><h2>" + esc(h) + "</h2><p>" + esc(p) + "</p>" +
      (withHome ? '<a class="btn primary" href="#/">' + I.home + "العودة إلى الرئيسية</a>" : "") + "</div>";
  }

  function notFound() {
    document.title = "الصفحة غير موجودة — " + S.title;
    return emptyBox("الصفحة غير موجودة", "الرابط الذي فتحته غير صحيح أو لم يعد متاحاً.", true);
  }

  /* ---------- Router ---------- */
  function parse() {
    return location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(function (p) {
      try { return decodeURIComponent(p); } catch (e) { return p; }
    });
  }

  var lastYear = S.currentYear;

  function render() {
    var p = parse();
    var yid = p[0] || S.currentYear;
    var year = getYear(yid);
    var html;

    if (!year) html = notFound();
    else if (!p[1]) html = viewHome(year);
    else if (!CLASSES[p[1]] || !year.classes[p[1]]) html = notFound();
    else if (!p[2]) html = viewClass(year, p[1]);
    else {
      var exam = findExam(year, p[1], p[2], p[3], p[4]);
      html = exam ? viewExam(year, p[1], exam) : notFound();
    }

    if (year) { lastYear = year.id; yearSelect.value = year.id; }
    app.innerHTML = '<div class="fade-in">' + html + "</div>";
    window.scrollTo(0, 0);
  }

  /* ---------- Init ---------- */
  document.getElementById("site-title").textContent = S.title;
  document.getElementById("site-sub").textContent = [S.teacher, S.school].filter(Boolean).join(" · ");
  document.getElementById("footer-text").textContent =
    "© " + yearLabel(S.currentYear) + (S.teacher ? " · " + S.teacher : "") + (S.school ? " · " + S.school : "");

  yearSelect.innerHTML = S.years.map(function (y) {
    return '<option value="' + esc(y.id) + '">' + esc(yearLabel(y.id)) + "</option>";
  }).join("");
  yearSelect.addEventListener("change", function () {
    var p = parse();
    var y = getYear(yearSelect.value);
    // keep the same class when switching year, if it exists there
    location.hash = p[1] && y.classes[p[1]] ? href(y.id, p[1]) : href(y.id);
  });

  app.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-copy")) copyLink(location.href);
    if (b.hasAttribute("data-share")) {
      navigator.share({ title: b.getAttribute("data-share"), url: location.href }).catch(function () {});
    }
  });

  window.addEventListener("hashchange", render);
  render();
})();
