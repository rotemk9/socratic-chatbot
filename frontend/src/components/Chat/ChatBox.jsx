// Import React hooks for managing state, side effects, and persistent references
import { useEffect, useState, useRef } from "react";

// Import functions for loading messages and sending new chat messages
import { getChatMessages, sendChatMessage } from "../../services/chatService";

// Import the chat interface components
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import HintButton from "./HintButton";

// Import the custom hook used to access and update the current session
import { useSession } from "../../Context/SessionContext";

// Display and manage the main chat interface
function ChatBox() {
  // Retrieve the current session data and session update functions
  const { sessionInfo, updateAfterMessage, updateSessionStatus } = useSession();

  // Keep the latest valid session information even during temporary re-renders
  const safeSessionRef = useRef(sessionInfo);

  // Update the stored reference whenever valid session information is available
  if (sessionInfo) {
    safeSessionRef.current = sessionInfo;
  }

  // Use the current session or the most recently stored valid session
  const safeSession = sessionInfo || safeSessionRef.current;

  // Store all messages displayed in the chat
  const [messages, setMessages] = useState([]);

  // Store the text currently entered by the user
  const [input, setInput] = useState("");

  // Store the timer reminder message displayed above the chat
  const [reminderBanner, setReminderBanner] = useState(null);

  // Track whether the AI is currently generating a response
  const [isTyping, setIsTyping] = useState(false);

  // Create a stable fallback start time that remains unchanged between renders
  const stableFallbackTime = useRef(Date.now()).current;

  // Extract the required IDs from the current session
  const chatId = safeSession?.chatId;
  const sessionId = safeSession?.sessionId;
  const userId = safeSession?.userId;

  // Load the existing messages whenever the chat ID changes
  useEffect(() => {
    // Retrieve all messages belonging to the current chat
    async function loadMessages() {
      // Stop if no chat ID is available
      if (!chatId) return;

      try {
        // Request the chat messages from the backend
        const data = await getChatMessages(chatId);

        // Store the retrieved messages in the component state
        setMessages(data);
      } catch (error) {
        // Print an error if the messages cannot be loaded
        console.error("Failed to load messages", error);
      }
    }

    // Run the message-loading function
    loadMessages();
  }, [chatId]);

  // Send the user's message to the backend
  async function sendMessage() {
    // Prevent empty or whitespace-only messages from being sent
    if (!input.trim()) return;

    // Stop if the required session information is unavailable
    if (!chatId || !sessionId || !userId) return;

    // Save the entered text before clearing the input
    const textToSend = input;

    // Clear the input field immediately
    setInput("");

    // Create a temporary ID for the optimistic message
    const tempId = "temp-" + Date.now();

    // Create a temporary message that appears before the server responds
    const tempUserMessage = {
      _id: tempId,
      sender: "user",
      text: textToSend,
      createdAt: new Date().toISOString(),
    };

    // Immediately display the temporary message in the chat
    setMessages((prev) => [...prev, tempUserMessage]);

    // Show the AI typing indicator
    setIsTyping(true);

    try {
      // Send the message and session information to the backend
      const response = await sendChatMessage(chatId, {
        sessionId,
        studentId: userId,
        text: textToSend,
      });

      // Replace the temporary message with the messages returned by the backend
      setMessages((prev) => {
        // Remove the temporary optimistic message
        const filtered = prev.filter((m) => m._id !== tempId);

        // Create a new messages array
        const updated = [...filtered];
        
        // Add the saved user message returned by the backend
        if (response.userMessage) {
          updated.push(response.userMessage);
        } else {
          // Keep the temporary message if no saved user message was returned
          updated.push(tempUserMessage); 
        }

        // Add the AI message when one was generated
        if (response.botMessage) {
          updated.push(response.botMessage);
        }
        
        // Return the updated messages array
        return updated;
      });

      // Update the session information after the student's message is evaluated
      updateAfterMessage(response.session);
    } catch (error) {
      // Print an error if the message cannot be sent
      console.error("Failed to send message", error);

      // Remove the temporary message from the chat
      setMessages((prev) => prev.filter((m) => m._id !== tempId));

      // Restore the unsent text to the input field
      setInput(textToSend);
    } finally {
      // Hide the AI typing indicator after the request finishes
      setIsTyping(false);
    }
  }

  // Display a temporary timer reminder banner
  function handleTimerReminder(messageText) {
    // Show the reminder message
    setReminderBanner(messageText);

    // Remove the reminder after eight seconds
    setTimeout(() => {
      setReminderBanner(null);
    }, 8000);
  }

  // Mark the session as completed when the timer reaches zero
  function handleTimeUp() {
    // Make sure the update function exists before calling it
    if (updateSessionStatus) {
      updateSessionStatus("completed");
    }
  }

  // Do not render the chat until session information is available
  if (!safeSession) return null;

  return (
    // Main chat container
    <section className="relative flex h-[75vh] min-h-[500px] sm:h-[650px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-xl backdrop-blur-xl transition-colors dark:border-white/5 dark:bg-[#1e2333]/80 dark:shadow-2xl">
      {/* Display the chat header and session timer */}
      <ChatHeader 
        startTime={safeSession?.createdAt || stableFallbackTime} 
        onTimeUp={handleTimeUp} 
        onReminder={handleTimerReminder} 
      />

      {/* Display the timer reminder banner when a reminder exists */}
      {reminderBanner && (
        <div className="absolute left-0 right-0 top-24 z-50 mx-auto w-[90%] max-w-sm animate-in fade-in slide-in-from-top-4 duration-500 sm:w-fit">
          <div className="rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-center text-xs font-medium text-purple-700 shadow-lg backdrop-blur-md sm:px-6 sm:text-sm dark:border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-200">
            ⚠️ {reminderBanner}
          </div>
        </div>
      )}

      {/* Display the conversation messages and AI typing indicator */}
      <ChatMessages 
        messages={messages} 
        isTyping={safeSession.group === "Control Group" ? false : isTyping} 
      />

      {/* Display group-specific information or the hint button */}
      <div className="px-4 pt-2 sm:px-5">
        {safeSession.group !== "Control Group" && (
          // Allow experimental-group students to request AI hints
          <HintButton
            chatId={chatId}
            sessionId={sessionId}
            studentId={userId}
            onHint={(hintMessage, updatedSession) => {
              // Add the generated hint to the displayed messages
              setMessages((prev) => [...prev, hintMessage]);

              // Update the session after the hint is used
              updateAfterMessage(updatedSession);
            }}
          />
        )}
      </div>

      {/* Display the message input and send-message function */}
      <ChatInput input={input} setInput={setInput} sendMessage={sendMessage} />
    </section>
  );
}

// Export the ChatBox component for use in other files
export default ChatBox;