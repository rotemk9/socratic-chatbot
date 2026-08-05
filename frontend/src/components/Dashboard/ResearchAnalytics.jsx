// Import React hooks for loading analytics data and managing component state
import { useEffect, useState } from "react";

// Import the service function that retrieves research analytics from the backend
import { getResearchAnalytics } from "../../services/dashboardService";

// Import the session context used to detect dashboard updates
import { useSession } from "../../Context/SessionContext";

function ResearchAnalytics() {
  // Get the dashboard version so analytics reload when dashboard data changes
  const { dashboardVersion } = useSession();

  // Store the analytics data returned by the backend
  const [analytics, setAnalytics] = useState(null);

  // Load the research analytics when the component opens or dashboardVersion changes
  useEffect(() => {
    async function loadAnalytics() {
      // Request the analytics data from the backend
      const data = await getResearchAnalytics();

      // Save the returned analytics data in the component state
      setAnalytics(data);
    }

    loadAnalytics();
  }, [dashboardVersion]);

  // Do not display the analytics section until the data has been loaded
  if (!analytics) return null;

  // Reusable card component for displaying one analytics value
  const StatCard = ({ title, value, highlight = false }) => (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:-translate-y-1 hover:bg-slate-100 hover:shadow-md sm:p-6 dark:border-white/5 dark:bg-[#2a2f42]/50 dark:hover:bg-[#2a2f42]/80 dark:hover:shadow-lg ${highlight ? 'shadow-purple-500/10 dark:shadow-purple-500/10' : ''}`}>
      {/* Display a decorative effect when the card is highlighted */}
      {highlight && <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-purple-500/10 blur-xl dark:bg-purple-500/20"></div>}

      {/* Display the statistic title */}
      <p className="text-xs font-semibold text-slate-500 sm:text-sm dark:text-slate-400">{title}</p>

      {/* Display the statistic value */}
      <h3 className={`mt-1 text-2xl font-extrabold sm:mt-2 sm:text-3xl lg:text-4xl ${highlight ? 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-400' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </h3>
    </div>
  );

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-xl backdrop-blur-xl transition-colors sm:p-6 lg:p-8 dark:border-white/5 dark:bg-[#1e2333]/80 dark:shadow-2xl">
      {/* Display the analytics section title */}
      <h2 className="mb-4 text-lg font-bold text-slate-900 sm:mb-6 sm:text-xl dark:text-white">
        Research Analytics Overview
      </h2>

      {/* Grid: 2 columns on mobile, 3 on tablets, 6 on large monitors */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {/* Display the total number of students */}
        <StatCard title="Total Students" value={analytics.totalStudents} highlight />

        {/* Display the percentage of students who completed the activity */}
        <StatCard title="Completion Rate" value={`${analytics.completionRate}%`} />

        {/* Display the average number of hints used */}
        <StatCard title="Average Hints" value={analytics.averageHints} />

        {/* Display the number of students in the experimental group */}
        <StatCard title="Experimental" value={analytics.experimentalCount} />

        {/* Display the number of students in the control group */}
        <StatCard title="Control" value={analytics.controlCount} />

        {/* Display the total number of unlocked gate events */}
        <StatCard title="Gate Events" value={analytics.totalGateEvents} />
      </div>
    </section>
  );
}

// Export the component so it can be used in other files
export default ResearchAnalytics;