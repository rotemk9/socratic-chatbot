// Import the shared API helper used to send POST requests
import { apiPost } from "./api";

// Submit the student's pre-task questionnaire data
export function submitPreTask(data) {
  return apiPost("/questionnaires/pre-task", data);
}

// Submit the student's post-task questionnaire data
export function submitPostTask(data) {
  return apiPost("/questionnaires/post-task", data);
}