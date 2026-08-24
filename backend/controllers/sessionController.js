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

// How long a session may stay Pending before the system assigns a group automatically.
// Defaults to 2 minutes; can be overridden with the AUTO_ASSIGN_AFTER_MS env variable.
const AUTO_ASSIGN_AFTER_MS = Number(process.env.AUTO_ASSIGN_AFTER_MS) || 120000;

// Apply a research group to a session and keep the user and progress records in sync
async function applyGroup(session, group) {
  // Update the group on the session itself
  session.group = group;
  await session.save();

  // Resolve the user id whether studentId is populated or a raw ObjectId
  const userId = session.studentId?._id || session.studentId;

  // Keep the user record and the progress record on the same group
  await User.findByIdAndUpdate(userId, { group });
  await StudentProgress.findOneAndUpdate({ sessionId: session._id }, { group });
}

// Start a new session or return an existing active session
async function startSession(req, res) {
  try {
    // Extract the user's information from the request body
    const { name, studentId, email , role } = req.body;

    // Researcher test account: entering ID "1234567" with name "Admin" skips the
    // waiting room (goes straight to the experimental group) and enables the
    // "skip questionnaire" shortcut in the UI.
    const isTestUser =
      String(studentId || "").trim() === "1234567" &&
      String(name || "").trim().toLowerCase() === "admin";

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

    // Find an existing participant by their student ID, or create a new one
    let user = await User.findOne({ studentId });

    // Create a new user if no matching user was found
    if (!user) {
      user = await User.create({
        name,
        studentId,
        email,
        // Tag the researcher test account by role so the UI can recognize it
        // (it enables the "skip questionnaire" shortcut).
        role: isTestUser ? "admin" : "student",

        // The researcher test account goes straight to the experimental group;
        // everyone else waits for the researcher to assign the group (Pending).
        group: isTestUser ? "Experimental Group" : "Pending",
      });
    }

    // A NEW run must ALWAYS start a completely clean chat. Archive any previous
    // active session for this participant (its chat/messages/questionnaires stay
    // in the database as historical records — they are NOT deleted), then create
    // a brand-new session, chat, and progress record below.
    await Session.updateMany(
      { studentId: user._id, status: "active" },
      { status: "completed" }
    );

    // Create a brand-new active session. It inherits the participant's group,
    // which stays locked (Pending participants still wait for assignment).
    const session = await Session.create({
      studentId: user._id,
      group: user.group,
    });

    // Create a fresh, EMPTY chat connected to the new session so the conversation
    // starts from the beginning with no previous messages.
    const chat = await Chat.create({
      studentId: user._id,
      sessionId: session._id,
      title: `${user.name} - SystemThinker Chat`,
    });

    // Connect the created chat to the session and save
    session.chatId = chat._id;
    await session.save();

    // Create a fresh progress record for this new session
    await StudentProgress.create({
      studentId: user._id,
      sessionId: session._id,
      currentLayer: session.currentLayer,
      progress: 0,
      hintsUsed: 0,
      group: user.group,
    });

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

    // NOTE: There is intentionally NO automatic group assignment. A participant
    // stays in "Pending" (on the waiting screen) until the researcher manually
    // assigns them a group in the admin panel — full manual control.

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

// Return every session that is still waiting for a manual group assignment
async function getPendingSessions(req, res) {
  try {
    // Find active sessions that have not yet been assigned a group
    const sessions = await Session.find({ group: "Pending", status: "active" })
      .populate("studentId")
      .sort({ createdAt: 1 });

    // Format a lightweight list for the researcher dashboard
    const pending = sessions.map((s) => ({
      sessionId: s._id,
      studentName: s.studentId?.name,
      studentId: s.studentId?.studentId,
      email: s.studentId?.email,
      createdAt: s.createdAt,
    }));

    // Return the list of waiting students
    res.json(pending);
  } catch (error) {
    // Return a server error if the pending list cannot be retrieved
    res.status(500).json({
      message: "Failed to get pending sessions",
      error: error.message,
    });
  }
}

// Let the researcher manually assign a session to a research group.
// The assignment is PERMANENT: it can only be made while the session is still
// "Pending", and can never be changed, switched, or reset afterwards. This lock
// lives in the data layer, so it also protects against any other UI/API path.
async function assignGroup(req, res) {
  try {
    // Extract the session ID and the chosen group from the request body
    const { sessionId, group } = req.body;

    // Only the two real research groups may be assigned (no reset to Pending)
    if (!["Experimental Group", "Control Group"].includes(group)) {
      return res.status(400).json({
        message: "Group must be 'Experimental Group' or 'Control Group'",
      });
    }

    // Find the session together with its connected student
    const session = await Session.findById(sessionId).populate("studentId");

    // Return an error if the session does not exist
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // LOCK: once a group has been assigned it is permanent and cannot change.
    if (session.group !== "Pending") {
      return res.status(409).json({
        message: "Group already assigned and locked; it cannot be changed.",
        group: session.group,
      });
    }

    // Apply the chosen group across the session, user, and progress records
    await applyGroup(session, group);

    // Return the updated session information
    res.json(formatSessionResponse(session.studentId, session));
  } catch (error) {
    // Return a server error if the assignment fails
    res.status(500).json({
      message: "Failed to assign group",
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

// Return every registered student (one row per session) for the admin panel
async function getAllStudents(req, res) {
  try {
    // Load all sessions together with their student, newest first
    const sessions = await Session.find()
      .populate("studentId")
      .sort({ createdAt: -1 });

    // Build a management-friendly list for the admin dashboard
    const students = sessions
      // Ignore sessions whose student record is missing
      .filter((s) => s.studentId)
      .map((s) => ({
        sessionId: s._id,
        studentName: s.studentId.name,
        studentId: s.studentId.studentId,
        email: s.studentId.email,
        group: s.group,
        status: s.status,
        createdAt: s.createdAt,
      }));

    // Return the full list of students
    res.json(students);
  } catch (error) {
    // Return a server error if the student list cannot be retrieved
    res.status(500).json({
      message: "Failed to get students",
      error: error.message,
    });
  }
}

// Permanently delete a participant and ALL of their related data
async function deleteStudent(req, res) {
  try {
    // Identify the participant from the given session
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    const studentId = session.studentId;

    // Load the remaining related models
    const Message = require("../models/Message");
    const GateEvent = require("../models/GateEvent");
    const PreTask = require("../models/PreTaskQuestionnaire");
    const PostTask = require("../models/PostTaskQuestionnaire");
    const ControlGroupLog = require("../models/ControlGroupLog");

    // Remove every record that belongs to this participant
    await Promise.all([
      Session.deleteMany({ studentId }),
      Chat.deleteMany({ studentId }),
      Message.deleteMany({ studentId }),
      GateEvent.deleteMany({ studentId }),
      StudentProgress.deleteMany({ studentId }),
      PreTask.deleteMany({ studentId }),
      PostTask.deleteMany({ studentId }),
      ControlGroupLog.deleteMany({ studentId }),
    ]);

    // Finally remove the participant's user record
    await User.findByIdAndDelete(studentId);

    // Confirm the deletion
    res.json({ message: "Student deleted", studentId });
  } catch (error) {
    // Return a server error if the deletion fails
    res.status(500).json({
      message: "Failed to delete student",
      error: error.message,
    });
  }
}

// Permanently delete ALL participants and their data (e.g., to reset before a study)
async function deleteAllStudents(req, res) {
  try {
    // Load the remaining related models
    const Message = require("../models/Message");
    const GateEvent = require("../models/GateEvent");
    const PreTask = require("../models/PreTaskQuestionnaire");
    const PostTask = require("../models/PostTaskQuestionnaire");
    const ControlGroupLog = require("../models/ControlGroupLog");

    // Wipe every participant-related collection. The researcher/admin login is
    // based on environment variables, so it is unaffected by this reset.
    await Promise.all([
      Session.deleteMany({}),
      Chat.deleteMany({}),
      Message.deleteMany({}),
      GateEvent.deleteMany({}),
      StudentProgress.deleteMany({}),
      PreTask.deleteMany({}),
      PostTask.deleteMany({}),
      ControlGroupLog.deleteMany({}),
      User.deleteMany({}),
    ]);

    // Confirm the reset
    res.json({ message: "All students deleted" });
  } catch (error) {
    // Return a server error if the reset fails
    res.status(500).json({
      message: "Failed to delete all students",
      error: error.message,
    });
  }
}

// Export the controller functions so they can be used in the session routes
module.exports = {
  startSession,
  getSession,
  increaseHint,
  getPendingSessions,
  getAllStudents,
  assignGroup,
  deleteStudent,
  deleteAllStudents,
};
