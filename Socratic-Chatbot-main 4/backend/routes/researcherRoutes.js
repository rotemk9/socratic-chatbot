// Import the Express framework for creating routes
const express = require("express");

// Import the controller function used for researcher authentication
const { researcherLogin } = require("../controllers/researcherController");

// Create a new Express router
const router = express.Router();

// Handle researcher login requests
router.post("/login", researcherLogin);

// Export the router so it can be used in the main application
module.exports = router;