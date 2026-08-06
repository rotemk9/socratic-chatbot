// Import the Mongoose library for defining and working with MongoDB models
const mongoose = require("mongoose");

// Define the structure of a message document
const messageSchema = new mongoose.Schema(
  {
    // Reference to the chat that contains the message
    chatId: {
      // Store the ID of a document from the Chat collection
      type: mongoose.Schema.Types.ObjectId,

      // Connect this field to the Chat model
      ref: "Chat",

      // Require every message to belong to a chat
      required: true,
    },

    // Reference to the learning session connected to the message
    sessionId: {
      // Store the ID of a document from the Session collection
      type: mongoose.Schema.Types.ObjectId,

      // Connect this field to the Session model
      ref: "Session",

      // Require every message to belong to a session
      required: true,
    },

    // Reference to the student connected to the message
    studentId: {
      // Store the ID of a document from the User collection
      type: mongoose.Schema.Types.ObjectId,

      // Connect this field to the User model
      ref: "User",

      // Require every message to belong to a student
      required: true,
    },

    // Store the type of sender who created the message
    sender: {
      // The sender value must be a string
      type: String,

      // Allow only user, bot, or system as sender values
      enum: ["user", "bot", "system"],

      // Require every message to specify its sender
      required: true,
    },

    // Store the content of the message
    text: {
      // The message content must be a string
      type: String,

      // Require every message to contain text
      required: true,
    },

    // Store the learning layer connected to the message
    layer: {
      // The layer value must be a string
      type: String,

      // Allow only the four defined learning layers
      enum: ["Broad Context", "Structure", "Dynamics", "Evaluation"],

      // Require every message to specify its learning layer
      required: true,
    },

    // Store the date and time when the message was sent
    timestamp: {
      // The timestamp must be a Date value
      type: Date,

      // Automatically use the current date and time
      default: Date.now,
    },
  },
  {
    // Automatically create createdAt and updatedAt fields
    timestamps: true,
  }
);

// Create and export the Message model using the defined schema
module.exports = mongoose.model("Message", messageSchema);