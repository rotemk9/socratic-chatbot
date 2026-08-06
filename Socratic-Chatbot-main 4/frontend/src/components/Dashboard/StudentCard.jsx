// Import the badge component used to display the student's current status
import StatusBadge from "./StatusBadge";

// Displays a summary card for one student
function StudentCard({ student, onViewAnalytics, onViewChat }) {
  return (
    // Main student card container
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-1 hover:border-purple-300 hover:bg-slate-50 hover:shadow-lg sm:p-5 dark:border-white/5 dark:bg-[#2a2f42]/40 dark:hover:border-purple-500/30 dark:hover:bg-[#2a2f42]/60 dark:hover:shadow-xl dark:hover:shadow-purple-500/10">
      <div>
        {/* Student name, research group, and status */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {student.studentName}
            </h3>
            <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
              {student.group}
            </p>
          </div>

          {/* Display the student's current status */}
          <StatusBadge status={student.status} />
        </div>

        {/* Student session information */}
        <div className="mt-5 space-y-3 text-sm">
          {/* Display the student's current learning layer */}
          <div className="flex justify-between rounded-lg bg-slate-100 p-2.5 dark:bg-black/20">
            <span className="text-slate-500 dark:text-slate-400">Current Layer:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{student.currentLayer || "N/A"}</span>
          </div>

          {/* Display the number of hints used */}
          <div className="flex justify-between rounded-lg bg-slate-100 p-2.5 dark:bg-black/20">
            <span className="text-slate-500 dark:text-slate-400">Hints Used:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{student.hintsUsed || 0}</span>
          </div>

          {/* Display the student's overall progress */}
          <div className="pt-2">
            <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
              <span>Overall Progress</span>
              <span>{student.progress || 0}%</span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${student.progress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons for opening the student's analytics and chat history */}
      <div className="mt-6 flex flex-col gap-2 xl:flex-row">
        <button 
          onClick={() => onViewAnalytics(student)}
          className="flex-1 rounded-xl bg-purple-100 py-2.5 text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-600 hover:text-white dark:bg-purple-600/20 dark:text-purple-300"
        >
          📊 Analytics
        </button>

        <button 
          onClick={() => onViewChat(student)}
          className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-transparent hover:bg-indigo-600 hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
        >
          💬 Chat Log
        </button>
      </div>
    </div>
  );
}

// Export the component so it can be used in other files
export default StudentCard;