// Import the shared API helper used to send POST requests
import { apiPost } from "./api";

// Send text written by a control-group student to the backend log
export function logControlGroupText(text) {
  // Send the text inside the request body
  return apiPost("/control/log", { text });
}