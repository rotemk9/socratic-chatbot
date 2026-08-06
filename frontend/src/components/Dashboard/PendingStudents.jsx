// Import React hooks for state and the polling effect
import { useEffect, useState, useCallback } from "react";

// Import the API helpers for listing and assigning waiting students
import { getPendingSessions, assignSessionGroup } from "../../services/sessionService";

/*
  PendingStudents is the researcher's live control panel.

  It shows every student who has entered and is waiting for a group. For each
  student the researcher chooses "ניסוי" (Experimental) or "ביקורת" (Control).
  Once assigned, that student's waiting screen advances automatically.
*/
function PendingStudents() {
  // Store the list of waiting students
  const [pending, setPending] = useState([]);

  // Track which session is currently being assigned (to disable its buttons)
  const [assigningId, setAssigningId] = useState(null);

  // Load the current list of waiting students from the backend
  const load = useCallback(async () => {
    try {
      const data = await getPendingSessions();
      setPending(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("failed to load pending students:", err);
    }
  }, []);

  // Poll the waiting list every 3 seconds
  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load]);

  // Assign a waiting student to the chosen group, then refresh the list
  async function handleAssign(sessionId, group) {
    try {
      setAssigningId(sessionId);
      await assignSessionGroup(sessionId, group);
      // Remove the student immediately for a snappy UI, then reload
      setPending((prev) => prev.filter((s) => s.sessionId !== sessionId));
      await load();
    } catch (err) {
      console.error("failed to assign group:", err);
    } finally {
      setAssigningId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-[#1e2333]" dir="rtl">
      {/* Panel title with a live count */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          סטודנטים ממתינים לשיוך
        </h3>
        <span className="rounded-full bg-purple-100 px-3 py-0.5 text-sm font-semibold text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
          {pending.length}
        </span>
      </div>

      {/* Empty state */}
      {pending.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-gray-400">
          אין כרגע סטודנטים ממתינים. כשסטודנט ייכנס, הוא יופיע כאן לבחירת קבוצה.
        </p>
      ) : (
        <ul className="space-y-3">
          {pending.map((s) => (
            <li
              key={s.sessionId}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/5 dark:bg-[#2a2f42] sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Student identity */}
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {s.studentName || "ללא שם"}
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  ת״ז: {s.studentId || "—"}
                </p>
              </div>

              {/* Assignment buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAssign(s.sessionId, "Experimental Group")}
                  disabled={assigningId === s.sessionId}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-purple-700 disabled:opacity-50"
                >
                  ניסוי
                </button>
                <button
                  onClick={() => handleAssign(s.sessionId, "Control Group")}
                  disabled={assigningId === s.sessionId}
                  className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-slate-700 disabled:opacity-50"
                >
                  ביקורת
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
export default PendingStudents;
