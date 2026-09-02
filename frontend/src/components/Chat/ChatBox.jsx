// Import React hooks for managing state, side effects, and persistent references
import { useEffect, useState, useRef } from "react";

// Import functions for loading messages, sending messages, and saving events
import { getChatMessages, sendChatMessage, saveEventMessage } from "../../services/chatService";

// Import the chat interface components
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import HintButton from "./HintButton";

// Import the custom hook used to access and update the current session
import { useSession } from "../../Context/SessionContext";

// Gradual reveal of the airport events. The first event is shown as soon as the
// chat opens; the events below are added to the conversation on a timer measured
// from the moment the chat opens. To change the pacing, edit the "afterMs" values
// (7 * 60 * 1000 = 7 minutes, 14 * 60 * 1000 = 14 minutes).
const REVEAL_SCHEDULE = [
  {
    afterMs: 7 * 60 * 1000,
    text:
      "⚠️ עדכון מצב בשדה התעופה: כעת התווסף אירוע נוסף — שתי עמדות בידוק ביטחוני מתוך שמונה נסגרות עקב מחסור בכוח אדם. כיצד אירוע זה משפיע על הניתוח המערכתי שלך עד כה?",
  },
  {
    afterMs: 14 * 60 * 1000,
    text:
      "⚠️ עדכון מצב בשדה התעופה: התווסף אירוע שלישי — חברת תעופה מקדימה את שער העלייה של טיסה גדולה, ומושכת בבת אחת המון נוסעים לאזור אחד בטרמינל. כיצד הוא משתלב עם מה שכבר זיהית?",
  },
  {
    afterMs: 21 * 60 * 1000,
    text:
      "⚠️ עדכון מצב בשדה התעופה: התווסף אירוע רביעי — עקב מזג האוויר הסוער וכמות המטוסים הרבה שנמצאת כרגע במנחת, זמן ההעברה של המטוסים לכיוון המסלול הראשי מתעכב בכ-20 דקות, ופוגע בלוח הזמנים של מטוסים אחרים הממתינים לנחות ולהמריא. כיצד אירוע זה משתלב עם התמונה המערכתית שזיהית עד כה?",
  },
];

// Display and manage the main chat interface
function ChatBox() {
  // Retrieve the current session data and session update functions
  const { sessionInfo, updateAfterMessage, finishSession } = useSession();

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

  // Track how many airport events have been revealed to the student so far.
  // Starts at 1 (only the first event is visible when the chat opens); each
  // scheduled reveal increases it, and it is sent to the backend with every
  // message so the bot only references events the student can already see.
  const [revealedCount, setRevealedCount] = useState(1);

  // Create a stable fallback start time that remains unchanged between renders.
  // This also serves as the moment the chat opened, used to time event reveals.
  const stableFallbackTime = useRef(Date.now()).current;

  // Track how many events have already been revealed (a ref so the interval
  // always sees the latest value without needing to re-subscribe).
  const revealedRef = useRef(1);

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

  // Reveal the additional airport events once enough time has passed since the
  // chat opened. We check on a short interval (instead of one long setTimeout)
  // so the reveal stays reliable even if the browser throttles background timers
  // or the component re-renders during the session.
  useEffect(() => {
    // Reveal a single event: persist it, show it, and unlock it for the AI
    async function revealEvent(reveal, eventNumber) {
      // Mark it as revealed immediately so it can never fire twice
      revealedRef.current = eventNumber;
      setRevealedCount((count) => Math.max(count, eventNumber));

      // Use the most recent valid session for the IDs
      const session = safeSessionRef.current;

      // Persist the event as a real bot message so it becomes part of the saved
      // transcript and appears in the PDF and Excel exports. If saving fails,
      // still show it locally so the student's experience is unaffected.
      let savedMessage = null;
      try {
        if (session?.chatId && session?.sessionId && session?.userId) {
          const response = await saveEventMessage(session.chatId, {
            sessionId: session.sessionId,
            studentId: session.userId,
            text: reveal.text,
          });
          savedMessage = response?.eventMessage || null;
        }
      } catch (error) {
        console.error("Failed to save event message", error);
      }

      // Add the reveal to the conversation (saved message if available)
      setMessages((prev) => [
        ...prev,
        savedMessage || {
          _id: `reveal-${eventNumber}`,
          sender: "bot",
          text: reveal.text,
          createdAt: new Date().toISOString(),
        },
      ]);
    }

    // Every few seconds, reveal any event whose time has arrived
    const interval = setInterval(() => {
      const elapsed = Date.now() - stableFallbackTime;

      REVEAL_SCHEDULE.forEach((reveal, index) => {
        const eventNumber = index + 2; // event 2, event 3, ...

        // Skip events that are not due yet or were already revealed
        if (elapsed < reveal.afterMs || revealedRef.current >= eventNumber) return;

        // Reveal this event
        revealEvent(reveal, eventNumber);
      });
    }, 5000);

    // Stop checking when the chat closes
    return () => clearInterval(interval);
    // Run once when the chat opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        // Tell the backend which events the student has already seen
        revealedCount,
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

  // Mark the session as completed when the timer reaches zero. This both
  // switches the UI to the end screen and persists the completion to the
  // database (so the admin panel and exports show the student as finished).
  function handleTimeUp() {
    if (finishSession) {
      finishSession();
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
        isTyping={isTyping}
        gender={safeSession.gender}
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
