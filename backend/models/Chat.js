// Import the Mongoose library for defining and working with MongoDB models
const mongoose = require("mongoose");

// Define the structure of a chat document in MongoDB
const chatSchema = new mongoose.Schema(
  {
    // Reference to the student who owns the chat
    studentId: {
      // Store the ID of a document from the User collection
      type: mongoose.Schema.Types.ObjectId,

      // Connect this field to the User model
      ref: "User",

      // Require every chat to have a student
      required: true,
    },

    // Reference to the learning session connected to the chat
    sessionId: {
      // Store the ID of a document from the Session collection
      type: mongoose.Schema.Types.ObjectId,

      // Connect this field to the Session model
      ref: "Session",

      // Require every chat to belong to a session
      required: true,
    },

    // Store the title displayed for the chat
    title: {
      // The title must be a string
      type: String,

      // Use this title when no title is provided
      default: "SystemThinker AI Chat",
    },
  },
  {
    // Automatically create createdAt and updatedAt fields
    timestamps: true,
  }
);

// Create and export the Chat model using the chat schema
module.exports = mongoose.model("Chat", chatSchema);