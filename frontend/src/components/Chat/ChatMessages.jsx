// Import the React hooks used for scrolling and storing element references
import { useLayoutEffect, useRef } from "react";

// Import the component that displays each individual chat message
import ChatMessage from "./ChatMessage";

// Display the story card, chat messages, greeting, and typing indicator
function ChatMessages({ messages, isTyping, gender }) {
  // Build the opening greeting in the participant's grammatical gender
  const greeting =
    gender === "female"
      ? "שלום! תארי כיצד את מבינה מה מתרחש בשדה התעופה בבוקר הזה, ומה לדעתך עשוי לקרות בהמשך."
      : "שלום! תאר כיצד אתה מבין מה מתרחש בשדה התעופה בבוקר הזה, ומה לדעתך עשוי לקרות בהמשך.";

  // Store a reference to the element at the bottom of the chat
  const messagesEndRef = useRef(null);

  // Scroll to the bottom whenever the messages or typing status change
  useLayoutEffect(() => {
    // Run the scroll action during the next browser animation frame
    requestAnimationFrame(() => {
      // Scroll the referenced bottom element into view
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    });
  }, [messages, isTyping]); 

  // Use an empty array if messages is null or undefined
  const safeMessages = messages || [];

  return (
    // Main scrollable container for the story and conversation
    <div className="flex-1 space-y-6 overflow-y-auto bg-slate-100/50 p-4 sm:p-5 dark:bg-[#0f121b]/40">
      
      {/* 1. THE PERMANENT STORY CARD */}
      {/* Display the case-study story permanently above the chat */}
      <div className="mx-auto mb-6 sm:mb-8 mt-2 flex w-full max-w-full sm:max-w-[95%] flex-col rounded-2xl border border-indigo-200 bg-indigo-50 p-5 sm:p-6 shadow-md backdrop-blur-md dark:border-indigo-500/20 dark:bg-indigo-950/30 dark:shadow-xl" dir="rtl">
        {/* Display the story title */}
        <h3 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-extrabold tracking-tight text-indigo-700 dark:text-indigo-400">סיפור הרקע</h3>

        {/* Display the first part of the case-study description */}
        <p className="mb-2 text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
          יום שישי בבוקר, שעת שיא. נוסעים מגיעים לטרמינל 3 כשעתיים לפני הטיסה, ועוברים דרך צ'ק-אין, מסירת מזוודות, בידוק ביטחוני, ביקורת דרכונים ועלייה למטוס. מבחינת הנוסעים, מדובר במעבר פשוט מתחנה לתחנה.
        </p>

        {/* Describe only the first disruption; the other events are introduced
            gradually inside the chat as the session progresses */}
        <p className="mb-5 sm:mb-6 text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
          באותו בוקר מתרחש אירוע שהנוסעים כלל אינם מודעים אליו: מערכת מיון המזוודות האוטומטית מאטה ל-60% מהקצב בגלל תקלה במסוע. במהלך השיחה עשויים להתווסף אירועים נוספים בשדה התעופה.
        </p>

        {/* Highlight the main task that the student must solve */}
        <div className="mb-5 sm:mb-6 rounded-xl border border-indigo-200 bg-white/60 p-4 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:shadow-inner">
          <p className="text-base sm:text-lg font-bold leading-snug text-indigo-800 dark:text-indigo-300">
            המשימה: לנתח את המתרחש מתוך ראייה מערכתית כוללת, תוך התייחסות לגבולות המערכת ולגורמים שאינם הנדסיים, ולבחון את ההשלכות האפשריות של שינויים במערכת.
          </p>
        </div>
      </div>

      {/* 2. INITIAL AI GREETING */}
      {/* Show the initial AI greeting only when there are no messages */}
      {safeMessages.length === 0 && !isTyping && (
        <div className="flex w-full justify-start animate-in fade-in duration-700 mb-6" dir="ltr">
          {/* Limit the width of the greeting message */}
          <div className="flex w-fit max-w-[90%] sm:max-w-[80%] items-end gap-2">
            {/* Display the greeting inside an AI message bubble */}
            <div className="rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4 shadow-md dark:border-white/5 dark:bg-[#2a2f42]">
              {/* Display the AI assistant name */}
              <p className="mb-1 sm:mb-2 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                SystemThinker AI
              </p>

              {/* Display the initial Socratic question in the correct gender */}
              <p className="text-sm sm:text-[15px] leading-relaxed text-slate-800 dark:text-slate-200" dir="rtl">
                {greeting}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. THE REAL CHAT HISTORY */}
      {/* Display one ChatMessage component for every message */}
      {safeMessages.map((message) => (
        <ChatMessage key={message._id} message={message} />
      ))}
      
      {/* 4. THE TYPING INDICATOR */}
      {/* Show animated dots while the AI is preparing a response */}
      {isTyping && (
        <div className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2 duration-300" dir="ltr">
          {/* Container for the animated typing dots */}
          <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4 shadow-md dark:border-white/5 dark:bg-[#2a2f42]">
            {/* First typing dot */}
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-bounce rounded-full bg-purple-600 dark:bg-purple-400"></span>

            {/* Second typing dot with a short animation delay */}
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-bounce rounded-full bg-purple-600 dark:bg-purple-400" style={{ animationDelay: '0.15s' }}></span>

            {/* Third typing dot with a longer animation delay */}
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-bounce rounded-full bg-purple-600 dark:bg-purple-400" style={{ animationDelay: '0.3s' }}></span>
          </div>
        </div>
      )}

      {/* Mark the bottom of the chat for automatic scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
}

// Export the component so it can be used in other files
export default ChatMessages;
