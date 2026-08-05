// Import the shared API helper used to send POST requests
import { apiPost } from "./api";

// Send the researcher credentials to the backend for authentication
export function loginResearcher(data) {
  return apiPost("/researcher/login", data);
}