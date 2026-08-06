// Import the model used to store pre-task questionnaire responses
const PreTaskQuestionnaire = require("../models/PreTaskQuestionnaire");

// Import the model used to store post-task questionnaire responses
const PostTaskQuestionnaire = require("../models/PostTaskQuestionnaire");

// Handle the submission of a pre-task questionnaire
async function submitPreTask(req, res) {
  try {
    // Extract the student ID from the request body
    const { studentId } = req.body;

    // Check if this student already submitted the pre-task survey
    const existingSurvey = await PreTaskQuestionnaire.findOne({ studentId });

    // Prevent the student from submitting the pre-task questionnaire more than once
    if (existingSurvey) {
      return res.status(400).json({
        message: "Pre-task questionnaire already submitted for this session.",
      });
    }

    // Create and save a new pre-task questionnaire using the submitted data
    const questionnaire = await PreTaskQuestionnaire.create(req.body);

    // Return the created questionnaire with a 201 Created status
    res.status(201).json(questionnaire);
  } catch (error) {
    // Print the pre-task questionnaire error on the server
    console.error("PreTask Error:", error);

    // Return a server error if the questionnaire cannot be saved
    res.status(500).json({
      message: "Failed to save pre-task questionnaire",
      error: error.message,
    });
  }
}

// Handle the submission of a post-task questionnaire
async function submitPostTask(req, res) {
  try {
    // Create and save a new post-task questionnaire using the submitted data
    const questionnaire = await PostTaskQuestionnaire.create(req.body);

    // Return the created questionnaire with a 201 Created status
    res.status(201).json(questionnaire);
  } catch (error) {
    // Print the post-task questionnaire error on the server
    console.error("PostTask Error:", error);

    // Return a server error if the questionnaire cannot be saved
    res.status(500).json({
      message: "Failed to save post-task questionnaire",
      error: error.message,
    });
  }
}

// Export the controller functions so they can be used in the questionnaire routes
module.exports = {
  submitPreTask,
  submitPostTask,
};