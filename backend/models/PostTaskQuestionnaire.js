// Import the Mongoose library for defining and working with MongoDB models
const mongoose = require("mongoose");

// Define the structure of a post-task questionnaire document
const postTaskQuestionnaireSchema = new mongoose.Schema(
  {
    // Reference to the student who submitted the questionnaire
    studentId: {
      // Store the ID of a document from the User collection
      type: mongoose.Schema.Types.ObjectId,

      // Connect this field to the User model
      ref: "User",

      // Require every questionnaire to belong to a student
      required: true,
    },

    // NEW: Stores the 27 systems thinking questions.
    // Using a Map allows dynamic keys (like "0", "1", "2") with String values
    likertAnswers: {
      // Store the questionnaire answers as a Map
      type: Map,

      // Require every value inside the Map to be a string
      of: String, 

      // Require the systems-thinking answers to be provided
      required: true,
    },

    // FIX: Removed 'required: true' because the Control Group 
    // does not answer this question and sends 'null'.
    didBotGiveAnswers: {
      // Store whether the student felt that the bot directly provided answers
      type: Boolean,

      // Use null when this question does not apply to the student
      default: null,
    },

    // Store how much the questions helped the student's thinking
    didQuestionsHelpThinking: {
      // The answer must be a number
      type: Number,

      // Set the minimum allowed rating
      min: 1,

      // Set the maximum allowed rating
      max: 5,

      // Require the student to answer this question
      required: true,
    },

    // Store the amount of effort perceived by the student
    perceivedEffort: {
      // The answer must be a number
      type: Number,

      // Set the minimum allowed rating
      min: 1,

      // Set the maximum allowed rating
      max: 5,

      // Require the student to answer this question
      required: true,
    },

    // Store the student's satisfaction rating
    satisfaction: {
      // The answer must be a number
      type: Number,

      // Set the minimum allowed rating
      min: 1,

      // Set the maximum allowed rating
      max: 5,

      // Require the student to answer this question
      required: true,
    },

    // Store optional written feedback from the student
    feedback: {
      // The feedback must be a string
      type: String,

      // Use an empty string when no feedback is provided
      default: "",
    },
  },
  {
    // Automatically create createdAt and updatedAt fields
    timestamps: true,
  }
);

// Create and export the PostTaskQuestionnaire model using the defined schema
module.exports = mongoose.model(
  "PostTaskQuestionnaire",
  postTaskQuestionnaireSchema
);