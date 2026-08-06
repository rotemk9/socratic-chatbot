// Import the StudentProgress model for accessing students' learning progress
const StudentProgress = require("../models/StudentProgress");

// Import the GateEvent model for accessing gate-trigger events
const GateEvent = require("../models/GateEvent");

// Import the Message model for counting the messages stored in the system
const Message = require("../models/Message");

// Import the Session model for accessing session information
const Session = require("../models/Session");

// Import the pre-task questionnaire model
const PreTask = require("../models/PreTaskQuestionnaire");   

// Import the post-task questionnaire model
const PostTask = require("../models/PostTaskQuestionnaire"); 

// Retrieve the students' information needed for the research dashboard
async function getDashboardData(req, res) {
  try {
    // Retrieve all student progress records
    const progressData = await StudentProgress.find()
      // Replace the studentId reference with the related student document
      .populate("studentId")
      // Sort the records from the most recently updated to the oldest
      .sort({ updatedAt: -1 })
      // Return plain JavaScript objects instead of Mongoose documents
      .lean();

    // Build the dashboard data for all students
    const dashboard = await Promise.all(
      progressData
        // Remove progress records that do not have a valid student
        .filter((item) => item.studentId)
        // Create a dashboard object for each student
        .map(async (item) => {
          
          // Retrieve the session connected to the student's progress record
          const session = await Session.findById(item.sessionId).lean();
          
          // Retrieve the student's pre-task questionnaire
          const preTask = await PreTask.findOne({ studentId: item.studentId._id }).lean();

          // Retrieve the student's post-task questionnaire
          const postTask = await PostTask.findOne({ studentId: item.studentId._id }).lean();

          // NEW: Fetch only THIS student's gate triggers for this session
          const gateEvents = await GateEvent.find({ 
            // Match the gate events with the current student
            studentId: item.studentId._id,

            // Match the gate events with the current session
            sessionId: item.sessionId
          }).sort({ createdAt: 1 }).lean(); // Sorted oldest to newest to show progression

          // Return the combined dashboard data for the current student
          return {
            // ID of the student's progress record
            progressId: item._id,

            // Database ID of the student
            studentId: item.studentId._id,

            // Student's name
            studentName: item.studentId.name,

            // Student's identification number
            studentNumber: item.studentId.studentId,

            // Research group assigned to the student
            group: item.group,

            // Current learning layer reached by the student
            currentLayer: item.currentLayer,

            // Student's progress percentage
            progress: item.progress,

            // Number of hints used by the student
            hintsUsed: item.hintsUsed,

            // Date and time of the latest progress update
            updatedAt: item.updatedAt,
            
            // Session status, or "unknown" if the session does not exist
            status: session ? session.status : "unknown",

            // Chat ID connected to the session
            chatId: session ? session.chatId : null,

            // Remaining session time
            remainingTime: session ? session.remainingTime : "00:00",

            // Student's pre-task questionnaire data
            preTask: preTask || null,

            // Student's post-task questionnaire data
            postTask: postTask || null,

            // Student's gate-trigger events for this session
            gateEvents: gateEvents || [], // <--- Attached directly to the student!
          };
        })
    );

    // Return the completed dashboard data to the client
    res.json(dashboard);
  } catch (error) {
    // Print the complete dashboard error on the server
    console.error("🔥 Dashboard Fetch Error:", error);

    // Return a server error if the dashboard data cannot be loaded
    res.status(500).json({
      message: "Failed to load dashboard",
      error: error.message,
    });
  }
}

// Calculate and return general research statistics
async function getResearchAnalytics(req, res) {
  try {
    // Retrieve all student progress records
    const progresses = await StudentProgress.find();

    // Calculate the total number of students
    const totalStudents = progresses.length;

    // Count students who completed the session or reached 100% progress
    const completedStudents = progresses.filter(
      (p) => p.status === "completed" || p.progress === 100
    ).length;

    // Retrieve progress records belonging to the experimental group
    const experimental = progresses.filter(
      (p) => p.group === "Experimental Group"
    );

    // Retrieve progress records belonging to the control group
    const control = progresses.filter(
      (p) => p.group === "Control Group"
    );

    // Calculate the average number of hints used by all students
    const averageHints =
      totalStudents === 0
        // Avoid division by zero when no students exist
        ? 0
        // Add all used hints and divide by the total number of students
        : progresses.reduce((sum, p) => sum + p.hintsUsed, 0) / totalStudents;

    // Count all gate-trigger events in the system
    const totalGateEvents = await GateEvent.countDocuments();

    // Count all messages in the system
    const totalMessages = await Message.countDocuments();

    // Return the calculated research statistics
    res.json({
      // Total number of students
      totalStudents,

      // Number of students who completed the learning process
      completedStudents,

      // Calculate the completion percentage
      completionRate:
        totalStudents === 0
          // Return zero when no students exist
          ? 0
          // Calculate and round the completion rate
          : Math.round((completedStudents / totalStudents) * 100),

      // Number of experimental-group students
      experimentalCount: experimental.length,

      // Number of control-group students
      controlCount: control.length,

      // Round the average number of hints to one decimal place
      averageHints: Math.round(averageHints * 10) / 10,

      // Total number of gate-trigger events
      totalGateEvents,

      // Total number of chat messages
      totalMessages,
    });
  } catch (error) {
    // Print the complete analytics error on the server
    console.error("🔥 Analytics Fetch Error:", error);

    // Return a server error if the analytics cannot be loaded
    res.status(500).json({
      message: "Failed to load research analytics",
      error: error.message,
    });
  }
}

// Export the controller functions so they can be used in the dashboard routes
module.exports = {
  getDashboardData,
  getResearchAnalytics,
};