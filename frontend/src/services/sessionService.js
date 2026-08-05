// Import the shared API helper functions
import { apiGet, apiPost } from "./api";

// Create a new student session using the provided student data
export function startSession(studentData) {
  return apiPost("/session/start", studentData);
}

// Retrieve a specific session using its unique session ID
export function getSessionById(sessionId) {
  return apiGet(`/session/${sessionId}`);
}

// Increase the number of hints used in a specific session
export function increaseHintCounter(sessionId) {
  return apiPost("/session/increase-hint", { sessionId });
}