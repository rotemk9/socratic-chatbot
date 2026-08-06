// Import the Express framework for creating routes
const express = require("express");

// Import the controller function used to save control-group logs
const { saveControlLog } = require("../controllers/controlController");

// Create a new Express router
const router = express.Router();

// Save a new message or activity log for a control-group student
router.post("/log", saveControlLog);

// Export the router so it can be used in the main application
module.exports = router;