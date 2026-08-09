// Import the Mongoose library for defining and working with MongoDB models
const mongoose = require("mongoose");

/*
  User represents one participant in the research experiment.

  Relationships:
  - One User can have many Sessions.
  - One User can have many Chats.
  - One User has one StudentProgress document.
*/

// Define the structure of a user document
const userSchema = new mongoose.Schema(
  {
    // Pseudonymous participant code — a one-way hash of the ID the participant
    // typed. The real ID is NEVER stored; this code only lets a returning
    // participant's data stay linked and gives each participant a reference.
    studentId: {
      type: String,
      default: "",
      index: true,
    },

    // Store the participant's name.
    // Optional and NOT persisted for real participants — we do not save personal
    // identifiers (name / ID / email). Kept only for backward compatibility.
    name: {
      // The name must be a string
      type: String,

      // Use an empty string when no name is provided
      default: "",
    },

    // Store the participant's email address.
    // Optional and NOT unique — nothing is ever sent to it, and the same
    // person may enter again with the same (or no) email without being blocked.
    email: {
      // The email must be a string
      type: String,

      // Use an empty string when no email is provided
      default: "",
    },

    // Store the user's role in the system
    role: {
  // The role must be a string
  type: String,

  // Allow only student, researcher, or admin roles
  enum: ["student", "researcher", "admin"],

  // Assign the student role when no role is provided
  default: "student",
},

    // Store the research group assigned to the participant
    group: {
      // The group value must be a string
      type: String,

      // Allow the experimental group, control group, or an unassigned (pending) state
      enum: ["Experimental Group", "Control Group", "Pending"],

      // Default new users to Pending until the researcher assigns a group
      default: "Pending",
    },
  },
  {
    // Automatically create createdAt and updatedAt fields
    timestamps: true
  }
);

// Create and export the User model using the defined schema
module.exports = mongoose.model("User", userSchema);