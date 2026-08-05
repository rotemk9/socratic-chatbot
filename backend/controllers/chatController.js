// Import the Chat model for working with chat records
const Chat = require("../models/Chat");

// Import the Session model for accessing and updating learning sessions
const Session = require("../models/Session");

// Import the Message model for storing and retrieving chat messages
const Message = require("../models/Message");

// Import the ControlGroupLog model for saving control-group student messages
const ControlGroupLog = require("../models/ControlGroupLog");

// Import the StudentProgress model for tracking student progress and hint usage
const StudentProgress = require("../models/StudentProgress");

// Import the functions responsible for generating Socratic AI responses and hints
const {
  generateSocraticResponse,
  generateSocraticHint,
} = require("../services/openaiService");

// Import the function responsible for evaluating a student's message
const {
  evaluateStudentMessage,
} = require("../services/aiEvaluationService");

// Retrieve all messages belonging to a specific chat
async function getChatMessages(req, res) {
  try {
    // Extract the chat ID from the URL parameters
    const { chatId } = req.params;

    // Find all messages for the chat and sort them from oldest to newest
    const messages = await Message.find({ chatId }).sort({ timestamp: 1 });

    // Return the messages to the client
    res.json(messages);
  } catch (error) {
    // Return a server error if the messages cannot be loaded
    res.status(500).json({
      message: "Failed to load messages",
      error: error.message,
    });
  }
}

// Handle a new message sent by a student
async function sendMessage(req, res) {
  try {
    // Extract the chat ID from the URL parameters
    const { chatId } = req.params;

    // Extract the session ID, student ID, and message text from the request body
    const { sessionId, studentId, text } = req.body;

    // Find the related learning session
    const session = await Session.findById(sessionId);

    // Return an error if the session does not exist
    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // Save the student's message in the database
    const userMessage = await Message.create({
      chatId,
      sessionId,
      studentId,
      sender: "user",
      text,
      layer: session.currentLayer,
    });

    // Handle students who belong to the control group
    if (session.group === "Control Group") {
      // Save the student's message in the control-group log
      await ControlGroupLog.create({
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

      // Return the result without generating an AI response
      return res.json({
        userMessage,
        botMessage: null,
        session: updatedSession,
        controlGroup: true,
      });
    }

    // Retrieve the full chat history and sort it from oldest to newest
    const chatHistory = await Message.find({ chatId }).sort({ timestamp: 1 });

    // Retrieve the student's progress document for the current session
    const progressDoc = await StudentProgress.findOne({ sessionId });

    // Generate a Socratic response based on the student's message and session data
    const botText = await generateSocraticResponse({
      studentMessage: text,
      currentLayer: session.currentLayer,
      chatHistory,
      unlockedGates: session.unlockedGates,
      progress: progressDoc?.progress || 0,
      hintsUsed: session.hintsUsed,
      lastBotQuestions: session.lastBotQuestions,
    });

    // Save the generated AI response as a new message
    const botMessage = await Message.create({
      chatId,
      sessionId,
      studentId,
      sender: "bot",
      text: botText,
      layer: session.currentLayer,
    });

    // Initialize the previous bot questions array if it does not exist
    if (!session.lastBotQuestions) {
      session.lastBotQuestions = [];
    }

    // Add the latest bot response to the list of previous bot questions
    session.lastBotQuestions.push(botText);

    // Keep only the ten most recent bot questions
    if (session.lastBotQuestions.length > 10) {
      session.lastBotQuestions.shift();
    }

    // Save the updated session
    await session.save();

    // Evaluate the student's message and update the learning progress
    const updatedSession = await evaluateStudentMessage({
      studentId,
      sessionId,
      messageText: text,
    });

    // Return the student message, bot response, and updated session
    res.json({
      userMessage,
      botMessage,
      session: updatedSession,
      controlGroup: false,
    });
  } catch (error) {
    // Return a server error if the message cannot be processed
    res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
}

// Generate and return an AI hint for a student
async function getHint(req, res) {
  try {
    // Extract the chat ID from the URL parameters
    const { chatId } = req.params;

    // Extract the session ID and student ID from the request body
    const { sessionId, studentId } = req.body;

    // Find the related learning session
    const session = await Session.findById(sessionId);

    // Return an error if the session does not exist
    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // Prevent control-group students from using AI-generated hints
    if (session.group === "Control Group") {
      return res.status(403).json({
        message: "Control group cannot use AI hints",
      });
    }

    // Generate a Socratic hint based on the current session state
    const hintText = await generateSocraticHint({
      currentLayer: session.currentLayer,
      hintsUsed: session.hintsUsed,
      unlockedGates: session.unlockedGates,
    });

    // Increase the number of hints used in the session
    session.hintsUsed += 1;

    // Save the updated session
    await session.save();

    // Save the generated hint as a bot message
    const hintMessage = await Message.create({
      chatId,
      sessionId,
      studentId,
      sender: "bot",
      text: hintText,
      layer: session.currentLayer,
    });

    // Update the number of hints used in the student's progress document
    await StudentProgress.findOneAndUpdate(
      { sessionId },
      {
        hintsUsed: session.hintsUsed,
      },
      { new: true }
    );

    // Return the generated hint and updated session
    res.json({
      hintMessage,
      session,
    });
  } catch (error) {
    // Return a server error if the hint cannot be generated
    res.status(500).json({
      message: "Failed to generate hint",
      error: error.message,
    });
  }
}

// Export the controller functions so they can be used in the chat routes
module.exports = {
  getChatMessages,
  sendMessage,
  getHint,
};