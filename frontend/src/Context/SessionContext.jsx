// Import React Context and state-management hooks
import { createContext, useContext, useState } from "react";

// Import the backend services used to create and update student sessions
import {
  startSession,
  getSessionById,
  increaseHintCounter,
  completeSession,
} from "../services/sessionService";

// Create a shared context for session information and session actions
const SessionContext = createContext();

// Provides session data and functions to all nested components
export function SessionProvider({ children }) {
  // Store the current student's session information
  const [sessionInfo, setSessionInfo] = useState(null);

  // Track dashboard updates so dashboard components can reload their data
  const [dashboardVersion, setDashboardVersion] = useState(0);

  // Create a new student session and save the returned session data
  async function startStudentSession(formData) {
    const data = await startSession(formData);
    setSessionInfo(data);

    // Notify dashboard components that the data has changed
    setDashboardVersion((prev) => prev + 1);

    return data;
  }

  // Retrieve the latest session information from the backend
  async function refreshSession() {
    // Stop when there is no active session ID
    if (!sessionInfo?.sessionId) return;

    const data = await getSessionById(sessionInfo.sessionId);
    setSessionInfo(data);

    return data;
  }

  // Increase the current session's hint counter
  async function increaseHintsUsed() {
    // Stop when there is no active session ID
    if (!sessionInfo?.sessionId) return;

    const data = await increaseHintCounter(sessionInfo.sessionId);
    setSessionInfo(data);

    // Notify dashboard components that the hint count has changed
    setDashboardVersion((prev) => prev + 1);

    return data;
  }

  // Merge session updates received after a student sends a message
  function updateAfterMessage(updatedSession) {
    // Stop when no updated session data is provided
    if (!updatedSession) return;

    setSessionInfo((prev) => ({
      ...prev,
      ...updatedSession,
    }));

    // Notify dashboard components that the session data has changed
    setDashboardVersion((prev) => prev + 1);
  }

  // Force dashboard components to reload their data
  function refreshDashboard() {
    setDashboardVersion((prev) => prev + 1);
  }

  // --- NEW FUNCTION: Updates the status locally to trigger App.jsx routing ---
  function updateSessionStatus(newStatus) {
    setSessionInfo((prev) => {
      // Keep the current value when no active session exists
      if (!prev) return prev;

      return { ...prev, status: newStatus };
    });
  }

  // Mark the session as completed BOTH locally (to switch the UI to the end
  // screen) and on the backend (so the admin panel and the Excel/PDF exports
  // show the participant as finished, not active).
  async function finishSession() {
    // Immediately switch the UI to the completed state
    updateSessionStatus("completed");

    // Persist the completion to the database (best-effort)
    const id = sessionInfo?.sessionId;
    if (!id) return;
    try {
      const data = await completeSession(id);
      setSessionInfo(data);
      setDashboardVersion((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to persist session completion", error);
    }
  }

  // Remove the active session and reset the dashboard version
  function clearSession() {
    setSessionInfo(null);
    setDashboardVersion(0);
  }

  return (
    <SessionContext.Provider
      value={{
        sessionInfo,
        dashboardVersion,
        startStudentSession,
        refreshSession,
        increaseHintsUsed,
        updateAfterMessage,
        refreshDashboard,
        updateSessionStatus, // Don't forget to expose it here!
        finishSession,
        clearSession,
      }}
    >
      {/* Make the session context available to all nested components */}
      {children}
    </SessionContext.Provider>
  );
}

// Custom hook for accessing the session context
export function useSession() {
  return useContext(SessionContext);
}
