// Import the Express framework for creating routes
const express = require("express");

// Import the controller functions used to submit questionnaires
const {
  submitPreTask,
  submitPostTask,
} = require("../controllers/questionnaireController");

// Create a new Express router
const router = express.Router();

// Submit and save a student's pre-task questionnaire
router.post("/pre-task", submitPreTask);

// Submit and save a student's post-task questionnaire
router.post("/post-task", submitPostTask);

// Export the router so it can be used in the main application
module.exports = router;