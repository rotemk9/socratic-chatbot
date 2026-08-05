/*
  api.js is the central place for all frontend API requests.

  React components should not write fetch directly.
  Instead:
  Component -> service file -> api.js -> backend

  This keeps the project clean and beginner-friendly.
*/

// This tells React: "If we are on Vercel, use the live backend URL. If we are testing locally, use localhost!"
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Sends a GET request to the provided backend endpoint
export async function apiGet(endpoint) {
  try {
    // Combine the base API URL with the requested endpoint
    const response = await fetch(`${API_URL}${endpoint}`);

    // Throw an error when the server returns an unsuccessful status
    if (!response.ok) {
      throw new Error("API GET request failed");
    }

    // Convert the JSON response into a JavaScript object
    return await response.json();
  } catch (error) {
    // Log the error and pass it back to the calling service or component
    console.error("apiGet error:", error);
    throw error;
  }
}

// Sends a POST request with JSON data to the provided backend endpoint
export async function apiPost(endpoint, data = {}) {
  try {
    // Send the data to the backend as a JSON request body
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Throw an error when the server returns an unsuccessful status
    if (!response.ok) {
      throw new Error("API POST request failed");
    }

    // Convert the JSON response into a JavaScript object
    return await response.json();
  } catch (error) {
    // Log the error and pass it back to the calling service or component
    console.error("apiPost error:", error);
    throw error;
  }
}