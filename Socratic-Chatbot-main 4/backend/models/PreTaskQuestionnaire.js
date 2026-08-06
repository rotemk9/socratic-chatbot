// Import the Mongoose library for defining and working with MongoDB models
const mongoose = require("mongoose");

// Define the structure of a pre-task questionnaire document
const preTaskQuestionnaireSchema = new mongoose.Schema(
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

    // Store whether the student agreed to participate
    consent: {
      // The consent answer must be a string
      type: String,

      // Require the student to provide a consent answer
      required: true,
    },

    // Store the student's gender
    gender: {
      // The gender value must be a string
      type: String,

      // Require the student to provide a gender value
      required: true,
    },

    // Store the student's age
    age: {
      // The age value is stored as a string
      type: String,

      // Require the student to provide an age
      required: true,
    },

    // Store the student's educational background
    education: {
      // The education value must be a string
      type: String,

      // Use an empty string when no education information is provided
      default: "",
    },

    // Store whether the student has worked in software engineering
    workedInSE: {
      // The answer must be a string
      type: String,

      // Require the student to answer this question
      required: true,
    },

    // Store the student's software-engineering role and experience
    roleAndExperience: {
      // The role and experience value must be a string
      type: String,

      // Use an empty string when no information is provided
      default: "",
    },

    // Store whether the student has studied software engineering
    studiedSE: {
      // The answer must be a string
      type: String,

      // Require the student to answer this question
      required: true,
    },

    // Store whether the student has previously used a Socratic chatbot
    usedSocraticBot: {
      // The answer must be a string
      type: String,

      // Require the student to answer this question
      required: true,
    },

    // Store details about the student's previous Socratic chatbot experience
    socraticBotExperience: {
      // The experience description must be a string
      type: String,

      // Use an empty string when no experience information is provided
      default: "",
    },

    // This Map catches all 27 Likert scale answers dynamically
    likertAnswers: {
      // Store the Likert-scale answers as a Map
      type: Map,

      // Require every value inside the Map to be a string
      of: String,

      // Require all Likert-scale answers to be submitted
      required: true,
    },

    // Store the student's answer to the first open-ended question
    openQ1: {
      // The answer must be a string
      type: String,

      // Require the student to answer the question
      required: true,
    },

    // Store the student's answer to the second open-ended question
    openQ2: {
      // The answer must be a string
      type: String,

      // Require the student to answer the question
      required: true,
    },
  },
  {
    // Automatically create createdAt and updatedAt fields
    timestamps: true,
  }
);

// Create and export the PreTaskQuestionnaire model using the defined schema
module.exports = mongoose.model(
  "PreTaskQuestionnaire",
  preTaskQuestionnaireSchema
);