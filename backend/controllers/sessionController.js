// Import the User model for creating and retrieving student accounts
const User = require("../models/User");

// Import the Session model for managing learning sessions
const Session = require("../models/Session");

// Import the Chat model for creating a chat connected to each session
const Chat = require("../models/Chat");

// Import the StudentProgress model for tracking student progress
const StudentProgress = require("../models/StudentProgress");

// Randomly assign a student to either the experimental group or control group
function assignRandomGroup() {
  return Math.random() < 0.5 ? "Experimental Group" : "Control Group";
}

// Start a new session or return an existing active session
async function startSession(req, res) {
  try {
    // Extract the user's information from the request body
    const { name, studentId, email , role } = req.body;

    // Prevent researchers from using the student session endpoint
if (role === "researcher") {
  return res.status(403).json({
    message: "Researchers must login through researcher login endpoint",
  });
}

    // Validate that the required student information was provided
    if (!name || !studentId) {
      return res.status(400).json({
        message: "Name and student ID are required",
      });
    }

    // Search for an existing user using the student ID
    let user = await User.findOne({ studentId });

    // Create a new user if no matching user was found
    if (!user) {
     user = await User.create({
  name,
  studentId,
  email,
  role: role || "student",

  // Assign researchers to the experimental group or randomly assign students
  group: role === "researcher" ? "Experimental Group" : assignRandomGroup(),
});
    }

    // Search for an active session belonging to the user
    let session = await Session.findOne({
      studentId: user._id,
      status: "active",
    });

    // Create a new session if the user does not already have an active session
    if (!session) {
      session = await Session.create({
        studentId: user._id,
        group: user.group,
      });

      // Create a chat connected to the new session
      const chat = await Chat.create({
        studentId: user._id,
        sessionId: session._id,
        title: `${user.name} - SystemThinker Chat`,
      });

      // Connect the created chat to the session
      session.chatId = chat._id;

      // Save the updated session
      await session.save();

      // Create the initial progress record for the student
      await StudentProgress.create({
        studentId: user._id,
        sessionId: session._id,
        currentLayer: session.currentLayer,
        progress: 0,
        hintsUsed: 0,
        group: user.group,
      });
    }

    // Return the formatted user and session information
    res.json(formatSessionResponse(user, session));
  } catch (error) {
    // Return a server error if the session cannot be started
    res.status(500).json({
      message: "Failed to start session",
      error: error.message,
    });
  }
}

// Retrieve an existing session using its ID
async function getSession(req, res) {
  try {
    // Find the session and replace the studentId reference with the user document
    const session = await Session.findById(req.params.sessionId).populate("studentId");

    // Return an error if the session does not exist
    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // Return the formatted user and session information
    res.json(formatSessionResponse(session.studentId, session));
  } catch (error) {
    // Return a server error if the session cannot be retrieved
    res.status(500).json({
      message: "Failed to get session",
      error: error.message,
    });
  }
}

// Increase the number of hints used in a session
async function increaseHint(req, res) {
  try {
    // Extract the session ID from the request body
    const { sessionId } = req.body;

    // Find the session and retrieve its connected student information
    const session = await Session.findById(sessionId).populate("studentId");

    // Return an error if the session does not exist
    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // Increase the session's hint counter
    session.hintsUsed += 1;

    // Save the updated session
    await session.save();

    // Update the hint count in the student's progress record
    await StudentProgress.findOneAndUpdate(
      { sessionId: session._id },
      { hintsUsed: session.hintsUsed },
      { new: true }
    );

    // Return the updated user and session information
    res.json(formatSessionResponse(session.studentId, session));
  } catch (error) {
    // Return a server error if the hint count cannot be increased
    res.status(500).json({
      message: "Failed to increase hint",
      error: error.message,
    });
  }
}

// Format the user and session data into one consistent response object
function formatSessionResponse(user, session) {
  return {
    // Database ID of the user
    userId: user._id,

    // Student's identification number
    studentId: user.studentId,

    // Student's name
    studentName: user.name,

    // Student's email address
    email: user.email,

    // Database ID of the session
    sessionId: session._id,

    // Chat connected to the session
    chatId: session.chatId,

    // Research group assigned to the student
    group: session.group,

    // Student's current learning layer
    currentLayer: session.currentLayer,

    // Number of hints used during the session
    hintsUsed: session.hintsUsed,

    // Requirements already completed by the student
    unlockedGates: session.unlockedGates,

    // Time remaining in the session
    remainingTime: session.remainingTime,

    // Current status of the session
    status: session.status,

    // Role assigned to the user
    role: user.role,
  };
}

// Export the controller functions so they can be used in the session routes
module.exports = {
  startSession,
  getSession,
  increaseHint,
};