// The four guidance stages the student progresses through during the session.
// The "key" matches the backend "currentLayer" value; the Hebrew fields are
// what the student sees in the side panel.
const STAGES = [
  {
    key: "Broad Context",
    title: "הקשר רחב",
    description: "מטרת המערכת, מחזיקי עניין וגבולות.",
  },
  {
    key: "Structure",
    title: "מבנה",
    description: "פירוק לתת-מערכות וזיהוי הקשרים ביניהן.",
  },
  {
    key: "Dynamics",
    title: "דינמיקה",
    description: "לולאות משוב, עיכובים ומצב עומס מול מצב רגיל.",
  },
  {
    key: "Evaluation",
    title: "הערכה",
    description: "פשרות, נקודות מינוף והשלכות בלתי-מכוונות.",
  },
];

// Displays the guidance-strategy roadmap and highlights the student's current
// stage, so the student can see which stages they need to pass.
function StagesPanel({ currentLayer }) {
  // Find the index of the stage the student is currently on
  const currentIndex = STAGES.findIndex((stage) => stage.key === currentLayer);

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-md backdrop-blur-xl transition-colors sm:p-6 dark:border-white/5 dark:bg-[#1e2333]/80 dark:shadow-xl"
      dir="rtl"
    >
      {/* Panel title */}
      <h2 className="mb-4 text-lg font-extrabold tracking-tight text-slate-900 sm:mb-5 sm:text-xl dark:text-white">
        שלבי החשיבה המערכתית
      </h2>

      {/* Render the four stages in order */}
      <ol className="flex flex-col gap-3">
        {STAGES.map((stage, index) => {
          // A stage before the current one is considered done
          const isDone = currentIndex > -1 && index < currentIndex;

          // The stage matching the current layer is the active one
          const isCurrent = index === currentIndex;

          return (
            <li
              key={stage.key}
              className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                isCurrent
                  ? "border-purple-300 bg-purple-50 dark:border-purple-500/40 dark:bg-purple-500/10"
                  : "border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-[#2a2f42]/40"
              }`}
            >
              {/* Stage number / status marker */}
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isCurrent
                    ? "bg-purple-600 text-white"
                    : isDone
                    ? "bg-green-500 text-white"
                    : "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                }`}
              >
                {isDone ? "✓" : index + 1}
              </span>

              {/* Stage title and short description */}
              <div className="min-w-0">
                <p
                  className={`text-sm font-bold ${
                    isCurrent
                      ? "text-purple-700 dark:text-purple-300"
                      : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {stage.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {stage.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// Export the component for use in the side panel
export default StagesPanel;
