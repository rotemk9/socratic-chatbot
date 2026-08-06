// Import the Mongoose library for defining and working with MongoDB models
const mongoose = require("mongoose");

// Define the structure of a control-group log document
const controlGroupLogSchema = new mongoose.Schema(
  {
    // Reference to the student who created the log
    studentId: {
      // Store the ID of a document from the User collection
      type: mongoose.Schema.Types.ObjectId,

      // Connect this field to the User model
      ref: "User",

      // Require every log to belong to a student
      required: true,
    },

    // Reference to the learning session connected to the log
    sessionId: {
      // Store the ID of a document from the Session collection
      type: mongoose.Schema.Types.ObjectId,

      // Connect this field to the Session model
      ref: "Session",

      // Require every log to belong to a session
      required: true,
    },

    // Store the text written by the control-group student
    text: {
      // The log content must be a string
      type: String,

      // Require every log to contain text
      required: true,
    },

    // Store the date and time when the log was recorded
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

// Create and export the ControlGroupLog model using the defined schema
module.exports = mongoose.model("ControlGroupLog", controlGroupLogSchema);