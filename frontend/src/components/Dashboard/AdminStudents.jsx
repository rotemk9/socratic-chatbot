// Import React hooks for state, refs, and the polling effect
import { useEffect, useState, useCallback, useRef } from "react";

// Import the API helpers for listing, assigning, completing, and deleting students
import {
  getAllStudents,
  assignSessionGroup,
  deleteStudent,
  deleteAllStudents,
  completeSession,
} from "../../services/sessionService";

// Human-readable Hebrew label for each group value
const GROUP_LABEL = {
  "Experimental Group": "ניסוי",
  "Control Group": "ביקורת",
  Pending: "ממתין לאישור",
};

// Badge colors for each group value
const GROUP_BADGE = {
  "Experimental Group":
    "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  "Control Group":
    "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  Pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200",
};

/*
  AdminStudents is the researcher's participant-management panel.

  It lists every registered student with their status and assigned group, and
  lets the admin approve/assign each student to the Experimental or Control
  group (or move them back to "waiting"). The list auto-refreshes so new
  entrants and status changes appear without a manual reload.
*/
function AdminStudents() {
  // Store the full list of students
  const [students, setStudents] = useState([]);

  // Track which session is being updated (to disable its buttons briefly)
  const [busyId, setBusyId] = useState(null);

  // A short-lived banner shown when a student has just finished the chat
  const [notice, setNotice] = useState(null);

  // Remember which sessions were already completed, so we only alert on NEW
  // completions (null means the first load hasn't happened yet).
  const knownCompletedRef = useRef(null);

  // A friendly display name for a participant
  const displayName = (s) =>
    s.studentName?.trim() ? s.studentName : `משתתף ${s.studentId || "—"}`;

  // Load all students from the backend and detect newly completed sessions
  const load = useCallback(async () => {
    try {
      const data = await getAllStudents();
      const list = Array.isArray(data) ? data : [];
      setStudents(list);

      // Detect sessions that have just switched to "completed" since last poll
      const completedIds = new Set(
        list.filter((s) => s.status === "completed").map((s) => s.sessionId)
      );

      if (knownCompletedRef.current === null) {
        // First load — just record the current state, do not alert
        knownCompletedRef.current = completedIds;
      } else {
        const newlyDone = list.filter(
          (s) => s.status === "completed" && !knownCompletedRef.current.has(s.sessionId)
        );
        if (newlyDone.length > 0) {
          const names = newlyDone.map(displayName).join(", ");
          setNotice(
            `🔔 ${newlyDone.length === 1 ? "סטודנט סיים" : "סטודנטים סיימו"} את השיחה: ${names}`
          );
        }
        knownCompletedRef.current = completedIds;
      }
    } catch (err) {
      console.error("failed to load students:", err);
    }
  }, []);

  // Poll the student list every 4 seconds so it stays current
  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [load]);

  // Automatically dismiss the "student finished" banner after a few seconds
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 12000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Permanently delete ALL participants after a strong confirmation
  async function removeAll() {
    if (students.length === 0) return;
    if (!window.confirm(`אזהרה: פעולה זו תמחק לצמיתות את כל ${students.length} המשתתפים וכל הנתונים שלהם. לא ניתן לבטל. להמשיך?`)) {
      return;
    }
    try {
      setBusyId("__all__");
      await deleteAllStudents();
      setStudents([]);
      await load();
    } catch (err) {
      console.error("failed to delete all:", err);
      load();
    } finally {
      setBusyId(null);
    }
  }

  // Permanently delete a participant after confirmation, then refresh
  async function removeStudent(s) {
    const name = s.studentName || "המשתתף";
    if (!window.confirm(`למחוק לצמיתות את ${name} (ת״ז ${s.studentId || "—"}) וכל הנתונים שלו? לא ניתן לבטל.`)) {
      return;
    }
    try {
      setBusyId(s.sessionId);
      setStudents((prev) => prev.filter((x) => x.sessionId !== s.sessionId));
      await deleteStudent(s.sessionId);
      await load();
    } catch (err) {
      console.error("failed to delete student:", err);
      load();
    } finally {
      setBusyId(null);
    }
  }

  // Assign a student to a group (or back to Pending), then refresh
  async function setGroup(sessionId, group) {
    try {
      setBusyId(sessionId);
      // Optimistically update the row for a snappy UI
      setStudents((prev) =>
        prev.map((s) => (s.sessionId === sessionId ? { ...s, group } : s))
      );
      await assignSessionGroup(sessionId, group);
      await load();
    } catch (err) {
      console.error("failed to set group:", err);
      // Reload to recover the correct state if the request failed
      load();
    } finally {
      setBusyId(null);
    }
  }

  // Manually mark a participant's session as completed (e.g., if they closed the
  // browser before the timer ended, so it never auto-completed).
  async function markComplete(s) {
    try {
      setBusyId(s.sessionId);
      // Optimistically show it as completed for a snappy UI
      setStudents((prev) =>
        prev.map((x) => (x.sessionId === s.sessionId ? { ...x, status: "completed" } : x))
      );
      await completeSession(s.sessionId);
      await load();
    } catch (err) {
      console.error("failed to complete session:", err);
      load();
    } finally {
      setBusyId(null);
    }
  }

  // Small counts for the summary line
  const counts = {
    pending: students.filter((s) => s.group === "Pending").length,
    experimental: students.filter((s) => s.group === "Experimental Group").length,
    control: students.filter((s) => s.group === "Control Group").length,
    completed: students.filter((s) => s.status === "completed").length,
  };

  // A single action button (highlighted when it is the current group)
  function ActionButton({ student, group, label, activeClass }) {
    const isActive = student.group === group;
    return (
      <button
        onClick={() => setGroup(student.sessionId, group)}
        disabled={busyId === student.sessionId || isActive}
        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-60 ${
          isActive
            ? activeClass
            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-[#1e2333]"
      dir="rtl"
    >
      {/* Title and summary */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          ניהול משתתפים
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-yellow-100 px-3 py-0.5 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200">
            ממתינים: {counts.pending}
          </span>
          <span className="rounded-full bg-purple-100 px-3 py-0.5 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
            ניסוי: {counts.experimental}
          </span>
          <span className="rounded-full bg-slate-200 px-3 py-0.5 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300">
            ביקורת: {counts.control}
          </span>
          <span className="rounded-full bg-green-100 px-3 py-0.5 text-green-800 dark:bg-green-500/20 dark:text-green-200">
            הושלמו: {counts.completed}
          </span>
          <button
            onClick={removeAll}
            disabled={busyId === "__all__" || students.length === 0}
            className="rounded-lg bg-red-600 px-3 py-1 font-bold text-white transition-all hover:bg-red-700 disabled:opacity-50"
          >
            מחק הכל
          </button>
        </div>
      </div>

      {/* Notification: a student has just finished the chat */}
      {notice && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200">
          <span>{notice}</span>
          <button
            onClick={() => setNotice(null)}
            className="rounded-md px-2 py-0.5 text-green-700 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-500/20"
            aria-label="סגור התראה"
          >
            ✕
          </button>
        </div>
      )}

      {/* Empty state */}
      {students.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-gray-400">
          עדיין אין משתתפים. כשסטודנט ייכנס, הוא יופיע כאן.
        </p>
      ) : (
        <ul className="space-y-3">
          {students.map((s) => (
            <li
              key={s.sessionId}
              className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${
                s.status === "completed"
                  ? "border-green-300 bg-green-50 dark:border-green-500/30 dark:bg-green-500/5"
                  : s.group === "Pending"
                  ? "border-yellow-300 bg-yellow-50 dark:border-yellow-500/30 dark:bg-yellow-500/5"
                  : "border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-[#2a2f42]"
              }`}
            >
              {/* Identity + status + current group */}
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {s.studentName?.trim() ? s.studentName : `משתתף ${s.studentId || "—"}`}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${GROUP_BADGE[s.group]}`}
                  >
                    {GROUP_LABEL[s.group] || s.group}
                  </span>
                  {/* Completion status badge */}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      s.status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200"
                        : "bg-slate-200 text-slate-600 dark:bg-white/5 dark:text-slate-300"
                    }`}
                  >
                    {s.status === "completed" ? "✓ הושלם" : "בתהליך"}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-gray-400">
                  ת״ז: {s.studentId || "—"}
                </span>
              </div>

              {/* Group assignment (permanent). Only shown while Pending; once a
                  group is assigned it is locked and cannot be changed or reset. */}
              <div className="flex flex-wrap items-center gap-2">
                {s.group === "Pending" ? (
                  <>
                    <ActionButton
                      student={s}
                      group="Experimental Group"
                      label="ניסוי"
                      activeClass="bg-purple-600 text-white"
                    />
                    <ActionButton
                      student={s}
                      group="Control Group"
                      label="ביקורת"
                      activeClass="bg-slate-600 text-white"
                    />
                  </>
                ) : (
                  <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:bg-white/5 dark:text-slate-400">
                    🔒 נעול
                  </span>
                )}
                {/* Manual "mark as completed" — useful if the student closed the
                    browser before the timer ended and it never auto-completed */}
                {s.status !== "completed" && (
                  <button
                    onClick={() => markComplete(s)}
                    disabled={busyId === s.sessionId}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-green-700 disabled:opacity-60"
                  >
                    סמן כהושלם
                  </button>
                )}
                <button
                  onClick={() => removeStudent(s)}
                  disabled={busyId === s.sessionId}
                  className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition-all hover:bg-red-200 disabled:opacity-60 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25"
                >
                  מחק
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Export the component for use in the dashboard
export default AdminStudents;
