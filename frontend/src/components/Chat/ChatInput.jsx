// Display the message input field and send button
function ChatInput({ input, setInput, sendMessage }) {
  return (
    // Main input-area container
    <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-white/5 dark:bg-[#1e2333]/50">
      {/* Arrange the input and send button vertically on small screens and horizontally on larger screens */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* Input field container */}
        <div className="relative flex-1">
          {/* Display the writing icon inside the input field */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>

          {/* Text input used for writing the student's message */}
          <input
            className="w-full rounded-xl border border-slate-200 bg-white py-3 sm:py-4 pl-12 pr-16 text-sm sm:text-base text-slate-900 placeholder-slate-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-transparent dark:bg-[#2a2f42] dark:text-white dark:placeholder-gray-400"
            type="text"
            placeholder="Write your reasoning here..."
            value={input}

            // Limit the message to 500 characters
            maxLength={500}

            // Update the input state whenever the user types
            onChange={(event) => setInput(event.target.value)}

            // Send the message when the Enter key is pressed
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                sendMessage();
              }
            }}
          />

          {/* Display the current character count */}
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs font-medium text-slate-400 dark:text-slate-500">
            {input.length} / 500
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