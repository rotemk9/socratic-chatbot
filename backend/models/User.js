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
    // Store the participant's name
    name: {
      // The name must be a string
      type: String,

      // Require every user to have a name
      required: true,

      // Use this value when no name is provided
      default: "Student 01",
    },

    // Store the participant's email address
    email: {
      // The email must be a string
      type: String,

      // Require every user to have an email address
      required: true,

      // Prevent multiple users from having the same email address
      unique: true,
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

      // Allow only the experimental group or control group
      enum: ["Experimental Group", "Control Group"],

      // Require every user to have an assigned research group
      required: true,
    },
  },
  {
    // Automatically create createdAt and updatedAt fields
    timestamps: true
  }
);

// Create and export the User model using the defined schema
module.exports = mongoose.model("User", userSchema);