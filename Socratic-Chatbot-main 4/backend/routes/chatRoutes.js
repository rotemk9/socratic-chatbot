// Import the Express framework for creating routes
const express = require("express");

// Import the controller functions used by the chat routes
const {
  getChatMessages,
  sendMessage,
  getHint,
} = require("../controllers/chatController");

// Create a new Express router
const router = express.Router();

// Retrieve all messages belonging to a specific chat
router.get("/:chatId", getChatMessages);

// Send a new student message in a specific chat
router.post("/:chatId/message", sendMessage);

// Generate a hint for a student in a specific chat
router.post("/:chatId/hint", getHint);

// Export the router so it can be used in the main application
module.exports = router;