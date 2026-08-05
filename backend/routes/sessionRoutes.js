// Import the Express framework for creating routes
const express = require("express");

// Import the controller functions used by the session routes
const {
  startSession,
  getSession,
  increaseHint,
} = require("../controllers/sessionController");

// Create a new Express router
const router = express.Router();

// Start a new student session or return an existing active session
router.post("/start", startSession);

// Retrieve a specific session using its session ID
router.get("/:sessionId", getSession);

// Increase the number of hints used in a session
router.post("/increase-hint", increaseHint);

// Prevent students from manually selecting their research group
router.post("/assign-group", (req, res) => {
  // Return an error explaining that group assignment is automatic
  res.status(400).json({
    message:
      "Group assignment is automatic when starting a session. Students cannot choose their group manually.",
  });
});

// Export the router so it can be used in the main application
module.exports = router;