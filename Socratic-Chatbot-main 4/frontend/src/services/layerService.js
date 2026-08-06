// Import the shared API helper functions
import { apiGet, apiPost } from "./api";

// Retrieve all available system-thinking layers from the backend
export function getLayers() {
  return apiGet("/layers");
}

// Ask the backend to check whether the current layer conditions are satisfied
export function checkLayer() {
  return apiPost("/layers/check");
}