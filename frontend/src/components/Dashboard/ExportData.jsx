import { useEffect, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { getDashboardData } from "../../services/dashboardService";
import { getChatMessages } from "../../services/chatService";
import { deleteStudent, deleteAllStudents } from "../../services/sessionService";

// Read a questionnaire's Likert answers (a map "0".."26") in order as [label, value] rows
function likertRows(questionnaire) {
  const map = (questionnaire && questionnaire.likertAnswers) || {};
  return Object.keys(map)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => [`פריט ${Number(k) + 1}`, map[k]]);
}

// Escape text so it is safe to place inside the printable HTML
function esc(v) {
  const s = v === null || v === undefined ? "" : String(v);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Human-readable label for a chat message sender
function senderLabel(sender) {
  const s = (sender || "").toLowerCase();
  if (s.includes("bot") || s.includes("ai") || s.includes("assistant")) return "בוט";
  return "משתתף";
}

// Render a questionnaire's Likert answers (stored as a map) as readable lines
function likertHtml(questionnaire) {
  const map = (questionnaire && questionnaire.likertAnswers) || {};
  const keys = Object.keys(map).sort((a, b) => Number(a) - Number(b));
  if (keys.length === 0) return "<p>לא נענה.</p>";
  return (
    "<ol>" +
    keys.map((k) => `<li>${esc(map[k])}</li>`).join("") +
    "</ol>"
  );
}

// Build a full, readable HTML report section for one student
function studentReportHtml(s, messages) {
  const pre = s.preTask;
  const post = s.postTask;

  const gates =
    s.gateEvents && s.gateEvents.length
      ? "<ul>" + s.gateEvents.map((g) => `<li>${esc(g.gate || g.name || "")}</li>`).join("") + "</ul>"
      : "<p>לא נפתחו שערים.</p>";

  const preHtml = pre
    ? `
      <p><b>הסכמה:</b> ${esc(pre.consent)} &nbsp; <b>מגדר:</b> ${esc(pre.gender)} &nbsp; <b>גיל:</b> ${esc(pre.age)}</p>
      <p><b>השכלה:</b> ${esc(pre.education)}</p>
      <p><b>עבד בהנדסת תוכנה:</b> ${esc(pre.workedInSE)} &nbsp; <b>תפקיד וניסיון:</b> ${esc(pre.roleAndExperience)}</p>
      <p><b>למד הנדסת תוכנה:</b> ${esc(pre.studiedSE)} &nbsp; <b>השתמש בבוט סוקרטי:</b> ${esc(pre.usedSocraticBot)}</p>
      <p><b>ניסיון קודם עם בוט:</b> ${esc(pre.socraticBotExperience)}</p>
      <p><b>תשובות סולם (חשיבה מערכתית — לפני):</b></p>
      ${likertHtml(pre)}
      <p><b>שאלה פתוחה 1:</b> ${esc(pre.openQ1)}</p>
      <p><b>שאלה פתוחה 2:</b> ${esc(pre.openQ2)}</p>`
    : "<p>השאלון המקדים לא הושלם.</p>";

  const postHtml = post
    ? `
      <p><b>תשובות סולם (חשיבה מערכתית — אחרי):</b></p>
      ${likertHtml(post)}
      <p><b>הבוט נתן תשובות ישירות:</b> ${esc(post.didBotGiveAnswers)}</p>
      <p><b>השאלות עזרו לחשיבה (1-5):</b> ${esc(post.didQuestionsHelpThinking)}</p>
      <p><b>מאמץ נתפס (1-5):</b> ${esc(post.perceivedEffort)}</p>
      <p><b>שביעות רצון (1-5):</b> ${esc(post.satisfaction)}</p>
      <p><b>משוב חופשי:</b> ${esc(post.feedback)}</p>`
    : "<p>השאלון המסכם לא הושלם.</p>";

  const chatHtml =
    messages && messages.length
      ? messages
          .map(
            (m) =>
              `<p class="msg"><b>${esc(senderLabel(m.sender))}:</b> ${esc(m.text)}</p>`
          )
          .join("")
      : "<p>אין הודעות.</p>";

  return `
    <section class="student">
      <h2>${esc(s.studentName?.trim() ? s.studentName : "משתתף " + (s.studentNumber || "—"))}</h2>
      <p class="meta">ת״ז: ${esc(s.studentNumber || "—")} | קבוצה: ${esc(s.group)} | סטטוס: ${esc(
    s.status
  )}</p>

      <h3>התקדמות במשימה</h3>
      <p>שכבה נוכחית: ${esc(s.currentLayer)} | התקדמות: ${esc(s.progress)}% | רמזים בשימוש: ${esc(
    s.hintsUsed
  )}</p>
      <p><b>שערים שנפתחו:</b></p>
      ${gates}

      <h3>שאלון מקדים</h3>
      ${preHtml}

      <h3>שאלון מסכם</h3>
      ${postHtml}

      <h3>שיחת הצ'אט</h3>
      ${chatHtml}
    </section>`;
}

// Wrap one or more student report sections into a full printable HTML page
function printablePage(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<style>
  body { font-family: Arial, "Helvetica Neue", sans-serif; color: #1e293b; margin: 32px; line-height: 1.5; }
  h1 { font-size: 22px; border-bottom: 2px solid #6d28d9; padding-bottom: 8px; }
  h2 { font-size: 19px; margin-top: 4px; color: #4c1d95; }
  h3 { font-size: 15px; margin-top: 18px; color: #6d28d9; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  p { margin: 5px 0; font-size: 13px; }
  .meta { color: #64748b; }
  .msg { background: #f8fafc; border-radius: 6px; padding: 6px 10px; margin: 4px 0; }
  ol, ul { font-size: 13px; }
  .student { page-break-after: always; }
  .student:last-child { page-break-after: auto; }
  @media print { body { margin: 12mm; } }
</style>
</head>
<body>
  <h1>${esc(title)}</h1>
  ${bodyHtml}
</body>
</html>`;
}

// Open the HTML in a new window and trigger the browser's print / Save-as-PDF
function openPrint(html) {
  const w = window.open("", "_blank");
  if (!w) {
    alert("החלון נחסם. אפשר חלונות קופצים (pop-ups) עבור האתר ונסה שוב.");
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  // Give the new window a moment to render before printing
  setTimeout(() => w.print(), 400);
}

function ExportData() {
  const [students, setStudents] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getDashboardData();
      setStudents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("export load failed", e);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Export one student's full record as a printable PDF
  async function exportStudent(s) {
    try {
      setBusy(true);
      let messages = [];
      if (s.chatId) {
        try {
          messages = await getChatMessages(s.chatId);
        } catch (e) {
          console.error("messages fetch failed", e);
        }
      }
      openPrint(
        printablePage(
          `דוח משתתף — ${s.studentName?.trim() ? s.studentName : "משתתף " + (s.studentNumber || "—")}`,
          studentReportHtml(s, messages)
        )
      );
    } finally {
      setBusy(false);
    }
  }

  // Export one participant's full record as a structured Excel (.xlsx) file.
  // Reuses the same dashboard data + chat messages as the PDF export; it only
  // READS data and never modifies or deletes anything.
  async function exportStudentExcel(s) {
    try {
      setBusy(true);

      // Fetch the participant's chat transcript (read-only)
      let messages = [];
      if (s.chatId) {
        try {
          messages = await getChatMessages(s.chatId);
        } catch (e) {
          console.error("messages fetch failed", e);
        }
      }

      const displayName = s.studentName?.trim()
        ? s.studentName
        : `משתתף ${s.studentNumber || "—"}`;

      // Build a workbook with a sheet per data category
      const wb = XLSX.utils.book_new();

      // 1) Overview: identity, group, status, progress, timestamps
      const overview = [
        ["שדה", "ערך"],
        ["שם", s.studentName || ""],
        ["ת״ז / קוד", s.studentNumber || ""],
        ["קבוצה", s.group || ""],
        ["סטטוס", s.status === "completed" ? "סיים" : "פעיל"],
        ["שכבה נוכחית", s.currentLayer || ""],
        ["התקדמות (%)", s.progress ?? ""],
        ["רמזים בשימוש", s.hintsUsed ?? ""],
        ["שערים שנפתחו", (s.gateEvents || []).length],
        ["עודכן", s.updatedAt || ""],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overview), "סקירה");

      // 2) Pre-task questionnaire (if completed)
      if (s.preTask) {
        const pre = s.preTask;
        const preRows = [
          ["שאלה", "תשובה"],
          ["הסכמה", pre.consent],
          ["מגדר", pre.gender],
          ["גיל", pre.age],
          ["השכלה", pre.education],
          ["עבד בהנדסת תוכנה", pre.workedInSE],
          ["תפקיד וניסיון", pre.roleAndExperience],
          ["למד הנדסת תוכנה", pre.studiedSE],
          ["השתמש בבוט סוקרטי", pre.usedSocraticBot],
          ["ניסיון קודם עם בוט", pre.socraticBotExperience],
          ["שאלה פתוחה 1", pre.openQ1],
          ["שאלה פתוחה 2", pre.openQ2],
          ...likertRows(pre),
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(preRows), "שאלון מקדים");
      }

      // 3) Post-task questionnaire (if completed)
      if (s.postTask) {
        const post = s.postTask;
        const postRows = [
          ["שאלה", "תשובה"],
          ["הבוט נתן תשובות ישירות", post.didBotGiveAnswers],
          ["השאלות עזרו לחשיבה (1-5)", post.didQuestionsHelpThinking],
          ["מאמץ נתפס (1-5)", post.perceivedEffort],
          ["שביעות רצון (1-5)", post.satisfaction],
          ["משוב חופשי", post.feedback],
          ...likertRows(post),
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(postRows), "שאלון מסכם");
      }

      // 4) Chat transcript with timestamps
      const chatRows = [["דובר", "הודעה", "זמן"]];
      (messages || []).forEach((m) => {
        chatRows.push([senderLabel(m.sender), m.text || "", m.createdAt || ""]);
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(chatRows), "שיחה");

      // Download the file, clearly named for this participant
      XLSX.writeFile(wb, `participant-${s.studentNumber || s.studentId || "unknown"}.xlsx`);
    } finally {
      setBusy(false);
    }
  }

  // Export every student's record as one printable PDF
  async function exportAll() {
    try {
      setBusy(true);
      const sections = await Promise.all(
        students.map(async (s) => {
          let messages = [];
          if (s.chatId) {
            try {
              messages = await getChatMessages(s.chatId);
            } catch (e) {
              console.error("messages fetch failed", e);
            }
          }
          return studentReportHtml(s, messages);
        })
      );
      openPrint(printablePage("דוח כלל המשתתפים", sections.join("")));
    } finally {
      setBusy(false);
    }
  }

  // Permanently delete ALL participants after a strong confirmation
  async function removeAll() {
    if (students.length === 0) return;
    if (!window.confirm(`אזהרה: פעולה זו תמחק לצמיתות את כל ${students.length} המשתתפים וכל הנתונים שלהם. לא ניתן לבטל. להמשיך?`)) {
      return;
    }
    try {
      setBusy(true);
      await deleteAllStudents();
      setStudents([]);
      await load();
    } catch (e) {
      console.error("failed to delete all", e);
      load();
    } finally {
      setBusy(false);
    }
  }

  // Permanently delete a single participant after confirmation
  async function removeStudent(s) {
    const label = s.studentName?.trim() ? s.studentName : `משתתף ${s.studentNumber || "—"}`;
    if (!window.confirm(`למחוק לצמיתות את ${label} וכל הנתונים שלו? לא ניתן לבטל.`)) {
      return;
    }
    try {
      setBusy(true);
      setStudents((prev) => prev.filter((x) => x.sessionId !== s.sessionId));
      await deleteStudent(s.sessionId);
      await load();
    } catch (e) {
      console.error("failed to delete student", e);
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-[#1e2333]" dir="rtl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">ייצוא דוחות (PDF)</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportAll}
            disabled={busy || students.length === 0}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
          >
            ייצא דוח של כל המשתתפים
          </button>
          <button
            onClick={removeAll}
            disabled={busy || students.length === 0}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-700 disabled:opacity-50"
          >
            מחק הכל
          </button>
        </div>
      </div>

      <p className="mb-3 text-xs text-slate-500 dark:text-gray-400">
        לחיצה פותחת חלון הדפסה — בחר/י "שמור כ-PDF" כדי לקבל קובץ.
      </p>

      {students.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-gray-400">אין נתונים עדיין.</p>
      ) : (
        <ul className="space-y-2">
          {students.map((s) => (
            <li
              key={s.progressId || s.studentId}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/5 dark:bg-[#2a2f42]"
            >
              <span className="text-sm text-slate-800 dark:text-slate-200">
                {s.studentName?.trim() ? s.studentName : `משתתף ${s.studentNumber || "—"}`} · {s.group}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => exportStudent(s)}
                  disabled={busy}
                  className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-slate-700 disabled:opacity-50"
                >
                  הורד PDF
                </button>
                <button
                  onClick={() => exportStudentExcel(s)}
                  disabled={busy}
                  className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-green-800 disabled:opacity-50"
                >
                  הורד Excel
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ExportData;
