// Import the reusable card used to display each session detail
import InfoCard from "./InfoCard";

// Displays information about the current student session
function SessionInfo({ sessionInfo }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-md backdrop-blur-xl transition-colors sm:p-6 dark:border-white/5 dark:bg-[#1e2333]/80 dark:shadow-xl">
      {/* Section title */}
      <h2 className="mb-4 text-lg font-extrabold tracking-tight text-slate-900 sm:mb-5 sm:text-xl dark:text-white">
        Session Info
      </h2>

      {/* Mobile: 2 columns. Tablet: 3 columns. Desktop Sidebar: 1 column */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-1">
        {/* Display the student's name. The research group is intentionally
            NOT displayed to the participant (research blinding). */}
        <InfoCard title="Student" value={sessionInfo.userName || sessionInfo.studentName} />

        {/* Display the student's current learning layer */}
        <InfoCard title="Current Layer" value={sessionInfo.currentLayer} />

        {/* Display the number of hints used during the session */}
        <InfoCard title="Hints Used" value={sessionInfo.hintsUsed} />
      </div>
    </div>
  );
}

// Export the component for use in other files
export default SessionInfo;