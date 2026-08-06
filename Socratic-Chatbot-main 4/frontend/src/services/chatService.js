// Import the shared API helper functions
import { apiGet, apiPost } from "./api";

// Retrieve all messages for a specific chat
export function getChatMessages(chatId) {
  return apiGet(`/chat/${chatId}`);
}

// Send a new message to a specific chat
export function sendChatMessage(chatId, messageData) {
  return apiPost(`/chat/${chatId}/message`, messageData);
}

// Request a hint for a specific chat
export function getChatHint(chatId, hintData) {
  return apiPost(`/chat/${chatId}/hint`, hintData);
}