import { useEffect, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { getDashboardData } from "../../services/dashboardService";
import { getChatMessages } from "../../services/chatService";
import { deleteStudent, deleteAllStudents } from "../../services/sessionService";

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

// Hebrew label for a systems-thinking stage (layer) stored on each message
function layerLabel(layer) {
  const map = {
    "Broad Context": "הקשר רחב",
    Structure: "מבנה",
    Dynamics: "דינמיקה",
    Evaluation: "הערכה",
  };
  return map[layer] || layer || "";
}

// Build a full, readable HTML report section for one student
function studentReportHtml(s, messages) {
  const gates =
    s.gateEvents && s.gateEvents.length
      ? "<ul>" + s.gateEvents.map((g) => `<li>${esc(g.gate || g.name || "")}</li>`).join("") + "</ul>"
      : "<p>לא נפתחו שערים.</p>";

  // Human-readable gender label
  const genderLabel = s.gender === "male" ? "זכר" : s.gender === "female" ? "נקבה" : "—";

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
      <p class="meta">ת״ז: ${esc(s.studentNumber || "—")} | מין: ${esc(genderLabel)} | קבוצה: ${esc(s.group)} | סטטוס: ${esc(
    s.status
  )}</p>

      <h3>התקדמות במשימה</h3>
      <p>שכבה נוכחית: ${esc(s.currentLayer)} | התקדמות: ${esc(s.progress)}% | רמזים בשימוש: ${esc(
    s.hintsUsed
  )}</p>
      <p><b>שערים שנפתחו:</b></p>
      ${gates}

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

// Format a date as DD.MM.YYYY (Gregorian). We use dots, not slashes, because
// "/" is not allowed in file names. Falls back to today's date if none given.
function formatDateForFile(value) {
  const d = value ? new Date(value) : new Date();
  const safe = isNaN(d.getTime()) ? new Date() : d;
  const dd = String(safe.getDate()).padStart(2, "0");
  const mm = String(safe.getMonth() + 1).padStart(2, "0");
  const yyyy = safe.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

// Remove characters that are illegal in file names on Windows/macOS
function sanitizeFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();
}

// A participant-specific Excel file name: "<name> - <ID> - <date>.xlsx".
// The ID part is included only if the participant entered one at login.
function excelFileName(s) {
  const namePart = s.studentName?.trim() ? s.studentName.trim() : "משתתף";
  const idPart = String(s.studentNumber || "").trim()
    ? ` - ${String(s.studentNumber).trim()}`
    : "";
  const datePart = formatDateForFile(s.updatedAt);
  return `${sanitizeFileName(`${namePart}${idPart} - ${datePart}`)}.xlsx`;
}

// Build a participant's Excel workbook (overview + full chat transcript). Shared
// by the single-file export and the "all participants" ZIP export.
function buildStudentWorkbook(s, messages) {
  const wb = XLSX.utils.book_new();

  // 1) Overview: identity, group, status, progress, timestamps
  const overview = [
    ["שדה", "ערך"],
    ["שם", s.studentName || ""],
    ["ת״ז / קוד", s.studentNumber || ""],
    ["מין", s.gender === "male" ? "זכר" : s.gender === "female" ? "נקבה" : ""],
    ["קבוצה", s.group || ""],
    ["סטטוס", s.status === "completed" ? "סיים" : "פעיל"],
    ["שכבה נוכחית", s.currentLayer || ""],
    ["התקדמות (%)", s.progress ?? ""],
    ["רמזים בשימוש", s.hintsUsed ?? ""],
    ["שערים שנפתחו", (s.gateEvents || []).length],
    ["עודכן", s.updatedAt || ""],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overview), "סקירה");

  // 2) Full chat transcript — every message the participant exchanged with the
  // chatbot, in order, with the stage (layer) each message belongs to and a
  // timestamp. The "שלב" column shows when the student moved between stages.
  const chatRows = [["דובר", "הודעה", "שלב", "זמן"]];
  (messages || []).forEach((m) => {
    chatRows.push([senderLabel(m.sender), m.text || "", layerLabel(m.layer), m.createdAt || ""]);
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(chatRows), "שיחה");

  return wb;
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

  // Fetch a participant's chat transcript (read-only). Returns [] on failure.
  async function fetchMessages(s) {
    if (!s.chatId) return [];
    try {
      return await getChatMessages(s.chatId);
    } catch (e) {
      console.error("messages fetch failed", e);
      return [];
    }
  }

  // Export one participant's full record as a structured Excel (.xlsx) file.
  // Reuses the same dashboard data + chat messages as the PDF export; it only
  // READS data and never modifies or deletes anything.
  async function exportStudentExcel(s) {
    try {
      setBusy(true);
      const messages = await fetchMessages(s);
      const wb = buildStudentWorkbook(s, messages);
      // Download the file, clearly named for this participant
      XLSX.writeFile(wb, excelFileName(s));
    } finally {
      setBusy(false);
    }
  }

  // Export EVERY participant's Excel file at once, bundled into a single ZIP so
  // the researcher gets all reports in one download (extract it into a folder).
  async function exportAllExcel() {
    if (students.length === 0) return;
    try {
      setBusy(true);
      const zip = new JSZip();
      const usedNames = new Set();

      // Build one .xlsx per participant and add it to the archive
      for (const s of students) {
        const messages = await fetchMessages(s);
        const wb = buildStudentWorkbook(s, messages);

        // Write the workbook to bytes (no per-file download)
        const bytes = XLSX.write(wb, { bookType: "xlsx", type: "array" });

        // Ensure a unique file name inside the ZIP
        let name = excelFileName(s);
        let i = 2;
        while (usedNames.has(name)) {
          name = excelFileName(s).replace(/\.xlsx$/, `-${i}.xlsx`);
          i += 1;
        }
        usedNames.add(name);

        zip.file(name, bytes);
      }

      // Generate the ZIP and trigger a single download
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "participants-excel.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
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
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">ייצוא דוחות</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportAll}
            disabled={busy || students.length === 0}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
          >
            ייצא PDF של כל המשתתפים
          </button>
          <button
            onClick={exportAllExcel}
            disabled={busy || students.length === 0}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-green-800 disabled:opacity-50"
          >
            ייצא Excel של כל המשתתפים (ZIP)
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
        PDF: לחיצה פותחת חלון הדפסה — בחר/י "שמור כ-PDF". &nbsp; Excel של כל המשתתפים יורד כקובץ ZIP אחד — חלץ/י אותו לתיקייה כדי לקבל קובץ לכל משתתף.
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
