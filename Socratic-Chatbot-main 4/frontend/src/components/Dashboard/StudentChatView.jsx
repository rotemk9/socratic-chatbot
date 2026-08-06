// Import React hooks for managing state and loading data
import { useState, useEffect } from "react";

// Import the service function used to retrieve chat messages
import { getChatMessages } from "../../services/chatService"; 

// Displays the complete chat history of a selected student
function StudentChatView({ student, onBack }) {
  // Store the chat messages returned by the backend
  const [messages, setMessages] = useState([]);

  // Track whether the chat history is currently loading
  const [loading, setLoading] = useState(true);

  // Load the selected student's chat history
  useEffect(() => {
    async function fetchTranscript() {
      // Stop loading if the student does not have a chat ID
      if (!student.chatId) {
        setLoading(false);
        return;
      }

      try {
        // Retrieve the chat messages from the backend
        const data = await getChatMessages(student.chatId);

        // Save the retrieved messages in the component state
        setMessages(data);
      } catch (error) {
        // Display an error if the chat history cannot be loaded
        console.error("Failed to load transcript", error);
      } finally {
        // Stop the loading state after the request finishes
        setLoading(false);
      }
    }

    fetchTranscript();
  }, [student.chatId]);

  // Convert a stored date into a readable time
  const formatTime = (dateString) => {
    // Return an empty value when no date is available
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <section className="mt-4 flex h-[75vh] min-h-[500px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-xl backdrop-blur-xl animate-in fade-in duration-300 sm:mt-6 sm:h-[800px] dark:border-white/5 dark:bg-[#1e2333]/80 dark:shadow-2xl">
      
      {/* Header */}
      <div className="flex flex-shrink-0 flex-col items-start gap-4 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-white/10 dark:bg-[#2a2f42]/80">
        <div className="w-full">
          {/* Return to the main dashboard */}
          <button 
            onClick={onBack}
            className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600 sm:mb-4 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            {/* Back arrow icon */}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>

            Back to Dashboard
          </button>

          {/* Display the selected student's name */}
          <h2 className="break-words text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white">Chat: {student.studentName}</h2>

          {/* Display the total number of chat messages */}
          <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400">Total Messages: {messages.length}</p>
        </div>
      </div>

      {/* Chat Log Body */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-100/50 p-4 sm:space-y-6 sm:p-6 dark:bg-black/20">
        {loading ? (
          // Display a spinner while the messages are loading
          <div className="flex h-full items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-600 dark:border-indigo-500 dark:border-t-transparent"></span>
          </div>
        ) : messages.length === 0 ? (
          // Display a message when no chat history exists
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-500 sm:text-lg dark:text-slate-500">No chat history available for this session.</p>
          </div>
        ) : (
          // Display every message in the student's chat history
          messages.map((msg, idx) => {
            // Check whether the message was sent by the student
            const isUser = msg.sender === "user";

            // Check whether the message is a system notification
            const isSystem = msg.sender === "system";

            // Display system messages in the center
            if (isSystem) {
              return (
                <div key={idx} className="my-4 flex w-full justify-center sm:my-6">
                  <span className="rounded-full border border-slate-200 bg-slate-200/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 backdrop-blur-sm sm:px-6 sm:py-2 sm:text-xs dark:border-white/5 dark:bg-white/5 dark:text-slate-400">
                    ⏱️ {msg.text}
                  </span>
                </div>
              );
            }

            // Display regular student or AI messages
            return (
              <div key={idx} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`min-w-[200px] max-w-[85%] px-4 py-3 shadow-md sm:max-w-[70%] sm:px-6 sm:py-4 ${
                  isUser 
                    ? "rounded-2xl rounded-br-sm bg-gradient-to-br from-indigo-600 to-purple-600 text-white" 
                    : "rounded-2xl rounded-bl-sm border border-slate-200 bg-white text-slate-800 dark:border-white/5 dark:bg-[#2a2f42] dark:text-slate-200"
                }`}>
                  {/* Display the sender name and message time */}
                  <div className={`mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider sm:text-xs ${
                    isUser ? "text-indigo-200" : "text-purple-600 dark:text-purple-400"
                  }`}>
                    <span>{isUser ? "Student" : "SystemThinker AI"}</span>

                    <span className="ml-4 font-normal tracking-normal opacity-70">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>

                  {/* Display the message content */}
                  <p className="break-words text-sm leading-relaxed sm:text-[15px]" dir="auto">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

// Export the component for use in other files
export default StudentChatView;