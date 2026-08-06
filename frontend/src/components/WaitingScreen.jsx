// Import React hooks for the polling effect
import { useEffect } from "react";

// Import the session context to refresh the session and read its state
import { useSession } from "../Context/SessionContext";

/*
  WaitingScreen is shown to a student whose session is still "Pending" —
  meaning the researcher has not yet assigned them to a group.

  It polls the backend every few seconds. As soon as the researcher assigns a
  group (or the automatic fallback kicks in), sessionInfo.group changes and
  App.jsx automatically moves the student on to the questionnaire / chat.
*/
function WaitingScreen() {
  // Get the session data and the refresh function
  const { sessionInfo, refreshSession } = useSession();

  // Poll the backend every 3 seconds until a group is assigned
  useEffect(() => {
    // Ask the backend for the latest session state
    const interval = setInterval(() => {
      refreshSession().catch((err) => console.error("waiting poll failed:", err));
    }, 3000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [refreshSession]);

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-16" dir="rtl">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-[#1e2333]/80">
        {/* Animated spinner */}
        <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />

        {/* Waiting title */}
        <h2 className="mb-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          שלום {sessionInfo?.studentName || ""}, כמעט מתחילים
        </h2>

        {/* Waiting explanation */}
        <p className="text-sm sm:text-[15px] leading-relaxed text-slate-500 dark:text-gray-400">
          החוקר מסיים את הכנת הסשן שלך. המסך יתקדם אוטומטית תוך רגע — אין צורך לרענן.
        </p>
      </section>
    </div>
  );
}

// Export the component for use in the routing logic
export default WaitingScreen;
