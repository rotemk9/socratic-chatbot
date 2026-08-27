// Import hooks used to auto-grow the textarea
import { useRef, useEffect } from "react";

// Display the message input field and send button
function ChatInput({ input, setInput, sendMessage }) {
  // Reference to the textarea so we can measure and resize it
  const textareaRef = useRef(null);

  // Auto-grow the textarea to fit its content (starts ~2 lines, grows up to a cap)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    // Reset the height first so it can shrink as well as grow
    el.style.height = "auto";
    // Grow to fit the content, capped so it never takes over the screen
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  return (
    // Main input-area container
    <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-white/5 dark:bg-[#1e2333]/50">
      {/* Arrange the input and send button vertically on small screens and horizontally on larger screens */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* Input field container */}
        <div className="relative flex-1">
          {/* Display the writing icon inside the input field (top-aligned for multiline) */}
          <div className="absolute left-4 top-4 text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>

          {/* Multiline text area used for writing the student's message.
              It starts ~2 lines tall, wraps automatically, and grows as the
              participant types. dir="auto" keeps Hebrew (RTL) and English (LTR)
              both readable. */}
          <textarea
            ref={textareaRef}
            dir="auto"
            rows={2}
            className="w-full resize-none overflow-y-auto rounded-xl border border-slate-200 bg-white py-3 sm:py-4 pl-12 pr-16 text-sm sm:text-base leading-relaxed text-slate-900 placeholder-slate-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-transparent dark:bg-[#2a2f42] dark:text-white dark:placeholder-gray-400"
            placeholder="Write your reasoning here..."
            value={input}

            // Limit the message to 1000 characters
            maxLength={1000}

            // Update the input state whenever the user types
            onChange={(event) => setInput(event.target.value)}

            // Enter sends the message; Shift+Enter inserts a new line
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
          />

          {/* Display the current character count (top-aligned for multiline) */}
          <span className="absolute right-4 top-4 text-[10px] sm:text-xs font-medium text-slate-400 dark:text-slate-500">
            {input.length} / 1000
          </span>
        </div>

        {/* Button used to send the message */}
        <button
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 sm:py-4 font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] hover:shadow-purple-500/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:hover:scale-100 dark:focus:ring-offset-[#1e2333]"

          // Send the message when the button is clicked
          onClick={sendMessage}

          // Disable the button when the input is empty or contains only spaces
          disabled={!input.trim()}
        >
          {/* Send button text */}
          <span>Send</span>

          {/* Send arrow icon */}
          <svg className="h-4 w-4 rotate-90" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Export the ChatInput component for use in other files
export default ChatInput;
