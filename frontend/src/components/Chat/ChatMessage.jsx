// Display a single chat message based on the sender
function ChatMessage({ message }) {
  // Check whether the message was sent by the user
  const isUser = message.sender === "user";

  // Check whether the message is a system notification
  const isSystem = message.sender === "system";

  // Display system messages in the center of the chat
  if (isSystem) {
    return (
      <div className="my-4 flex w-full justify-center">
        {/* Display the system message inside a rounded notification */}
        <span className="rounded-full border border-slate-200 bg-slate-100 px-4 py-1.5 text-[10px] sm:text-xs font-medium tracking-wide text-slate-500 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          ⏱️ {message.text}
        </span>
      </div>
    );
  }

  // Display a regular user or AI message
  return (
    // Align user messages to the right and AI messages to the left
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        // Apply different bubble styles according to the message sender
        className={`relative max-w-[90%] sm:max-w-[85%] px-4 sm:px-5 py-3 sm:py-3.5 shadow-md md:max-w-[75%] ${
          isUser
            ? "rounded-2xl rounded-br-sm bg-gradient-to-br from-purple-600 to-indigo-600 text-white"
            : "rounded-2xl rounded-bl-sm border border-slate-200 bg-white text-slate-800 dark:border-white/5 dark:bg-[#2a2f42] dark:text-slate-200"
        }`}
      >
        {/* Display the name of the message sender */}
        <p className={`mb-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isUser ? "text-purple-200" : "text-purple-600 dark:text-purple-400"}`}>
          {isUser ? "You" : "SystemThinker AI"}
        </p>

        {/* Display the message text. dir="auto" lets the browser detect the
            language and align punctuation correctly (Hebrew right-to-left,
            English left-to-right), so a trailing "?" sits at the right place. */}
        <p className="text-sm sm:text-[15px] leading-relaxed tracking-wide whitespace-pre-wrap" dir="auto">
          {message.text}
        </p>
      </div>
    </div>
  );
}

// Export the component so it can be used in other files
export default ChatMessage;
