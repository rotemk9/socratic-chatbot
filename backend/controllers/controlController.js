// Import the Session model for accessing learning session data
const Session = require("../models/Session");

// Import the ControlGroupLog model for storing control-group student messages
const ControlGroupLog = require("../models/ControlGroupLog");

// Import the function used to evaluate the student's message
const { evaluateStudentMessage } = require("../services/aiEvaluationService");

// Save a message written by a student in the control group
async function saveControlLog(req, res) {
  try {
    // Extract the student ID, session ID, and message text from the request body
    const { studentId, sessionId, text } = req.body;

    // Find the learning session using its ID
    const session = await Session.findById(sessionId);

    // Return an error if the session does not exist
    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // Prevent students outside the control group from using this endpoint
    if (session.group !== "Control Group") {
      return res.status(403).json({
        message: "Only control group students can use this endpoint",
      });
    }

    // Save the student's message in the control-group log
    const log = await ControlGroupLog.create({
      studentId,
      sessionId,
      text,
    });

    // Evaluate the student's message and update the session progress
    const updatedSession = await evaluateStudentMessage({
      studentId,
      sessionId,
      messageText: text,
    });

    // Return the created log and the updated session
    res.status(201).json({
      log,
      session: updatedSession,
    });
  } catch (error) {
    // Return a server error if the control-group log cannot be saved
    res.status(500).json({
      message: "Failed to save control group log",
      error: error.message,
    });
  }
}

// Export the controller function so it can be used in the control-group routes
module.exports = {
  saveControlLog,
};