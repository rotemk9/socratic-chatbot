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

// Retrieve the list of students who are waiting for a manual group assignment
export function getPendingSessions() {
  return apiGet("/session/pending");
}

// Retrieve every registered student for the admin management panel
export function getAllStudents() {
  return apiGet("/session/students");
}

// Let the researcher assign a waiting student to a research group
export function assignSessionGroup(sessionId, group) {
  return apiPost("/session/assign-group", { sessionId, group });
}

// Permanently delete a participant (and all of their data) by session ID
export function deleteStudent(sessionId) {
  return apiPost("/session/delete", { sessionId });
}