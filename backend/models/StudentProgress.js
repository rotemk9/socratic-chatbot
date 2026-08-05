// Import the Mongoose library for defining and working with MongoDB models
const mongoose = require("mongoose");

// Define the structure of a student progress document
const studentProgressSchema = new mongoose.Schema(
  {
    // Reference to the student whose progress is being tracked
    studentId: {
      // Store the ID of a document from the User collection
      type: mongoose.Schema.Types.ObjectId,

      // Connect this field to the User model
      ref: "User",

      // Require every progress record to belong to a student
      required: true,
    },

    // Reference to the learning session connected to this progress record
    sessionId: {
      // Store the ID of a document from the Session collection
      type: mongoose.Schema.Types.ObjectId,

      // Connect this field to the Session model
      ref: "Session",

      // Require every progress record to belong to a session
      required: true,
    },

    // Store the student's current learning layer
    currentLayer: {
      // The layer value must be a string
      type: String,

      // Allow only the four defined learning layers
      enum: ["Broad Context", "Structure", "Dynamics", "Evaluation"],

      // Start every student at the Broad Context layer
      default: "Broad Context",
    },

    // Store the student's overall progress percentage
    progress: {
      // The progress value must be a number
      type: Number,

      // Start the student's progress at zero
      default: 0,

      // Prevent the progress value from being lower than zero
      min: 0,

      // Prevent the progress value from being higher than one hundred
      max: 100,
    },

    // Store the current state of the student's progress
    status: {
      // The status value must be a string
      type: String,

      // Allow only active, completed, or needs work as status values
      enum: ["active", "completed", "needs work"],

      // Mark every new progress record as active
      default: "active",
    },

    // Store the number of hints used by the student
    hintsUsed: {
      // The hint counter must be a number
      type: Number,

      // Start the hint counter at zero
      default: 0,
    },

    // Store the research group assigned to the student
    group: {
      // The group value must be a string
      type: String,

      // Allow only the experimental group or control group
      enum: ["Experimental Group", "Control Group"],

      // Require every student progress record to have an assigned group
      required: true,
    },
  },
  {
    // Automatically create createdAt and updatedAt fields
    timestamps: true,
  }
);

// Create and export the StudentProgress model using the defined schema
module.exports = mongoose.model("StudentProgress", studentProgressSchema);