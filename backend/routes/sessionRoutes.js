// Import the Express framework for creating routes
const express = require("express");

// Import the controller functions used by the session routes
const {
  startSession,
  getSession,
  increaseHint,
  getPendingSessions,
  getAllStudents,
  assignGroup,
  deleteStudent,
  deleteAllStudents,
  completeSession,
} = require("../controllers/sessionController");

// Create a new Express router
const router = express.Router();

// Start a new student session or return an existing active session
router.post("/start", startSession);

// Increase the number of hints used in a session
router.post("/increase-hint", increaseHint);

// Let the researcher list students who are waiting for a group assignment.
// This must be declared before the "/:sessionId" route so "pending" is not
// mistakenly treated as a session ID.
router.get("/pending", getPendingSessions);

// Let the admin list every registered student for the management panel.
// Declared before "/:sessionId" for the same reason as above.
router.get("/students", getAllStudents);

// Let the researcher manually assign a session to a research group
router.post("/assign-group", assignGroup);

// Permanently delete a participant and all of their data
router.post("/delete", deleteStudent);

// Permanently delete ALL participants (reset before a study)
router.post("/delete-all", deleteAllStudents);

// Mark a session as completed (called when the session timer reaches zero)
router.post("/complete", completeSession);

// Retrieve a specific session using its session ID
router.get("/:sessionId", getSession);

// Export the router so it can be used in the main application
module.exports = router;
