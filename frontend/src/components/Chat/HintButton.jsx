import { useState } from "react";
import { getChatHint } from "../../services/chatService";

function HintButton({ chatId, sessionId, studentId, onHint }) {
  // Tracks whether a hint request is currently in progress
  const [loading, setLoading] = useState(false);

  // Requests a hint from the backend
  async function handleGetHint() {
    // Prevents the request if required data is missing
    if (!chatId || !sessionId || !studentId) {
      console.error("Missing data for hint:", { chatId, sessionId, studentId });
      return;
    }

    try {
      // Activates the loading state
      setLoading(true);

      // Sends the chat, session, and student IDs to the backend
      const response = await getChatHint(chatId, { sessionId, studentId });

      // Sends the new hint and updated session to the parent component
      onHint(response.hintMessage, response.session);
    } catch (error) {
      // Displays an error if the hint request fails
      console.error("Failed to get hint", error);
    } finally {
      // Deactivates the loading state after the request finishes
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleGetHint}
      disabled={loading}
      className="mb-2 flex w-fit items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-purple-700 transition-all hover:bg-purple-100 disabled:opacity-50 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20"
    >
      {/* Lightbulb icon */}
      <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>

      {/* Displays different text while the hint is loading */}
      {loading ? "Generating hint..." : "Need a hint?"}
    </button>
  );
}

export default HintButton;