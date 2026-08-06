// Displays the selected student's questionnaire data inside a modal
function StudentModal({ student, onClose }) {
  // Do not render the modal when no student is selected
  if (!student) return null;

  return (
    // Full-screen overlay behind the modal
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-black/60">
      {/* Modal Container */}
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1e2333]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4 sm:p-6 dark:border-white/10 dark:bg-[#2a2f42]/80">
          {/* Display the selected student's name, group, and ID */}
          <div className="pr-4">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">{student.studentName}</h2>
            <p className="mt-1 text-xs text-purple-600 sm:text-sm dark:text-purple-400">{student.group} | ID: {student.studentId}</p>
          </div>

          {/* Close the modal */}
          <button 
            onClick={onClose}
            className="flex-shrink-0 rounded-full bg-slate-200 p-2 text-slate-500 transition hover:bg-red-100 hover:text-red-600 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-red-500/20 dark:hover:text-red-400"
            aria-label="Close modal"
          >
            {/* Close icon */}
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="overflow-y-auto p-4 sm:p-6" dir="rtl">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            
            {/* PRE-TASK SURVEY DATA */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-white/5 dark:bg-[#2a2f42]/40">
              <h3 className="mb-4 text-base font-bold text-indigo-600 sm:text-lg dark:text-indigo-300">שאלון טרום-משימה (Pre-Task)</h3>

              {/* Display the pre-task answers when they are available */}
              {student.preTask ? (
                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                  <p><span className="font-medium text-slate-500 dark:text-slate-400">מגדר:</span> {student.preTask.gender}</p>
                  <p><span className="font-medium text-slate-500 dark:text-slate-400">גיל:</span> {student.preTask.age}</p>
                  <p><span className="font-medium text-slate-500 dark:text-slate-400">ניסיון קודם ב-SE:</span> {student.preTask.workedInSE}</p>
                  <p><span className="font-medium text-slate-500 dark:text-slate-400">ניסיון עם בוט סוקרטי:</span> {student.preTask.usedSocraticBot}</p>

                  {/* Display the student's first open-ended answer */}
                  <div className="mt-3 border-t border-slate-200 pt-3 dark:border-white/10">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">שאלה פתוחה 1:</p>
                    <p className="mt-2 rounded-lg bg-slate-200/50 p-3 italic dark:bg-black/20">{student.preTask.openQ1}</p>
                  </div>
                </div>
              ) : (
                // Display a message when the pre-task questionnaire is unavailable
                <p className="text-sm font-medium text-slate-500 dark:text-slate-500">טרם מולא (Not completed yet)</p>
              )}
            </div>

            {/* POST-TASK SURVEY DATA */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-white/5 dark:bg-[#2a2f42]/40">
              <h3 className="mb-4 text-base font-bold text-green-600 sm:text-lg dark:text-green-300">שאלון פוסט-משימה (Post-Task)</h3>

              {/* Display the post-task answers when they are available */}
              {student.postTask ? (
                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                  <p><span className="font-medium text-slate-500 dark:text-slate-400">מאמץ נתפס:</span> {student.postTask.perceivedEffort} / 5</p>
                  <p><span className="font-medium text-slate-500 dark:text-slate-400">שביעות רצון:</span> {student.postTask.satisfaction} / 5</p>
                  <p><span className="font-medium text-slate-500 dark:text-slate-400">השאלות עזרו לחשוב:</span> {student.postTask.didQuestionsHelpThinking} / 5</p>

                  {/* Display the manipulation-check result only for the experimental group */}
                  {student.group === "Experimental Group" && (
                    <p><span className="font-medium text-slate-500 dark:text-slate-400">בדיקת מניפולציה:</span> {student.postTask.didBotGiveAnswers ? "כן" : "לא"}</p>
                  )}

                  {/* Display the student's written feedback */}
                  <div className="mt-3 border-t border-slate-200 pt-3 dark:border-white/10">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">משוב פתוח:</p>
                    <p className="mt-2 rounded-lg bg-slate-200/50 p-3 italic dark:bg-black/20">{student.postTask.feedback || "אין משוב"}</p>
                  </div>
                </div>
              ) : (
                // Display a message when the post-task questionnaire is unavailable
                <p className="text-sm font-medium text-slate-500 dark:text-slate-500">טרם מולא (Not completed yet)</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Export the component so it can be used in other files
export default StudentModal;