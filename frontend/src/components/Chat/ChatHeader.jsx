// Import the countdown timer component used in the chat header
import CountdownTimer from "../CountdownTimer/CountdownTimer";

// Display the chat title, description, status indicator, and countdown timer
function ChatHeader({ startTime, onTimeUp, onReminder }) {
  return (
    // Main header container
    <div className="relative z-10 flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:border-white/5 dark:bg-[#2a2f42]/50">
      {/* Chat information section */}
      <div>
        {/* Display the active AI assistant status */}
        <div className="flex items-center gap-2">
          {/* Animated online-status indicator */}
          <span className="relative flex h-2.5 w-2.5">
            {/* Animated outer circle */}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>

            {/* Solid inner circle */}
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-purple-500"></span>
          </span>

          {/* Display the assistant type */}
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            AI Learning Assistant
          </p>
        </div>

        {/* Display the chat title */}
        <h2 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          SystemThinker Chat
        </h2>

        {/* Explain the purpose of the chatbot */}
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          The bot guides the student with reflective questions.
        </p>
      </div>

      {/* TIMER BLOCK */}
      {/* Display the remaining session time */}
      <div className="flex w-fit flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm sm:px-5 sm:py-2.5 dark:border-white/5 dark:bg-slate-950/40 dark:shadow-inner">
        {/* Timer label */}
        <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Time Remaining
        </span>

        {/* Countdown timer configured for a twenty-minute session */}
        <CountdownTimer 
          startTime={startTime} 
          initialMinutes={20} 
          onTimeUp={onTimeUp} 
          onReminder={onReminder} 
        />
      </div>
    </div>
  );
}

// Export the ChatHeader component for use in other files
export default ChatHeader;