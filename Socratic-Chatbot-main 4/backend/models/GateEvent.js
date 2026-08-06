// Import the Mongoose library for defining and working with MongoDB models
const mongoose = require("mongoose");

// Define the structure of a gate event document
const gateEventSchema = new mongoose.Schema(
  {
    // Reference to the student who unlocked the gate
    studentId: {
      // Store the ID of a document from the User collection
      type: mongoose.Schema.Types.ObjectId,

      // Connect this field to the User model
      ref: "User",

      // Require every gate event to belong to a student
      required: true,
    },

    // Reference to the learning session in which the gate was unlocked
    sessionId: {
      // Store the ID of a document from the Session collection
      type: mongoose.Schema.Types.ObjectId,

      // Connect this field to the Session model
      ref: "Session",

      // Require every gate event to belong to a session
      required: true,
    },

    // Store the learning layer connected to the gate
    layer: {
      // The layer name must be a string
      type: String,

      // Require every gate event to specify a layer
      required: true,
    },

    // Store the name of the requirement or gate that was unlocked
    gateName: {
      // The gate name must be a string
      type: String,

      // Require every gate event to specify a gate name
      required: true,
    },

    // Store the student response or condition that triggered the gate
    trigger: {
      // The trigger value must be a string
      type: String,

      // Require every gate event to include its trigger
      required: true,
    },

    // Store the date and time when the gate was unlocked
    unlockedAt: {
      // The unlocking time must be a Date value
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

// Create and export the GateEvent model using the defined schema
module.exports = mongoose.model("GateEvent", gateEventSchema);