/*
 * ============================================================
 *  ملف الإعدادات — هذا هو الملف الوحيد الذي تحتاج لتعديله
 * ============================================================
 *
 *  • لإضافة موضوع أو تصحيح: ضع الملف داخل مجلد files/ ثم اكتب مساره
 *    مكان null.   مثال:  solution: "files/2026-2027/2as-se/t1-solution.pdf"
 *  • ما دامت القيمة null يظهر للتلاميذ: «سيُنشر قريباً».
 *  • لسنة دراسية جديدة: انسخ كتلة السنة وغيّر id ثم غيّر currentYear.
 *  • يمكن أن تكون القيمة قائمة ملفات (مثلاً صور عدة صفحات):
 *      solution: [
 *        { label: "الصفحة 1", href: "files/.../p1.jpg" },
 *        { label: "الصفحة 2", href: "files/.../p2.jpg" }
 *      ]
 */

window.SITE = {
  title: "تصحيح الاختبارات",
  teacher: "",            // اسم الأستاذ(ة) — اتركه فارغاً لإخفائه
  school: "",             // اسم الثانوية — اتركه فارغاً لإخفائه
  currentYear: "2026-2027",

  // الأقسام (تُعرَّف مرة واحدة وتُستعمل في كل السنوات)
  classes: [
    { id: "2as-se",  level: "السنة الثانية ثانوي", stream: "علوم تجريبية",              subject: "رياضيات",   color: "#2563eb" },
    { id: "2as-lph", level: "السنة الثانية ثانوي", stream: "آداب وفلسفة",              subject: "رياضيات",   color: "#9333ea" },
    { id: "1as-l",   level: "السنة الأولى ثانوي",  stream: "جذع مشترك آداب",            subject: "رياضيات",   color: "#ea580c" },
    { id: "1as-st",  level: "السنة الأولى ثانوي",  stream: "جذع مشترك علوم وتكنولوجيا", subject: "إعلام آلي", color: "#0d9488" }
  ],

  // السنوات الدراسية — الأحدث أولاً
  years: [
    {
      id: "2026-2027",
      classes: {
        "2as-se": [
          { id: "t1-exam", term: 1, title: "اختبار الفصل الأول", date: "", subject: null, solution: null }
        ],
        "2as-lph": [
          { id: "t1-exam", term: 1, title: "اختبار الفصل الأول", date: "", subject: null, solution: null }
        ],
        "1as-l": [
          { id: "t1-exam", term: 1, title: "اختبار الفصل الأول", date: "", subject: null, solution: null }
        ],
        "1as-st": [
          { id: "t1-exam", term: 1, title: "اختبار الفصل الأول", date: "", subject: null, solution: null }
        ]
      }
    }
  ]
};
