// Import the User model for creating and retrieving student records
const User = require("../models/User");

// Import the Chat model for creating and retrieving student chats
const Chat = require("../models/Chat");

// Import the Session model for creating and retrieving learning sessions
const Session = require("../models/Session");

// Import the StudentProgress model for tracking student progress
const StudentProgress = require("../models/StudentProgress");

/*
  This helper creates default data for development.

  In a real login system, we would get the logged-in user from authentication.
  For this academic project, we create one default student automatically.

  Created documents:
  1. User
  2. Chat
  3. Session
  4. StudentProgress

  MongoDB references:
  - Chat.studentId points to User._id
  - Session.studentId points to User._id
  - Session.chatId points to Chat._id
  - StudentProgress.studentId points to User._id
*/

// Randomly assign the default student to one of the two research groups
function assignRandomGroup() {
  // Use a 50% probability for each research group
  return Math.random() < 0.5 ? "Experimental Group" : "Control Group";
}

// Retrieve the default development data or create it when it does not exist
async function getDefaultData() {
  // Search for the default student using the predefined email address
  let student = await User.findOne({ email: "student01@example.com" });

  // Create the default student if no matching user exists
  if (!student) {
    student = await User.create({
      name: "Student 01",
      email: "student01@example.com",
      role: "student",

      // Randomly assign the student to a research group
      group: assignRandomGroup(),
    });
  }

  // Search for a chat belonging to the default student
  let chat = await Chat.findOne({ studentId: student._id });

  // Create a new chat if the student does not already have one
  if (!chat) {
    chat = await Chat.create({
      // Connect the chat to the default student
      studentId: student._id,

      // Set the default chat title
      title: "Systems Thinking Chat",
    });
  }

  // Search for a session connected to the student and chat
  let session = await Session.findOne({
    studentId: student._id,
    chatId: chat._id,
  });

  // Create a new session if no matching session exists
  if (!session) {
    session = await Session.create({
      // Connect the session to the default student
      studentId: student._id,

      // Connect the session to the student's chat
      chatId: chat._id,

      // Use the same research group assigned to the student
      group: student.group,

      // Start the student at the first learning layer
      currentLayer: "Broad Context",

      // Start with no hints used
      hintsUsed: 0,

      // Start with no completed gates
      unlockedGates: [],

      // Set the initial session time to twenty minutes
      remainingTime: "20:00",
    });
  }

  // Search for an existing progress record belonging to the student
  let progress = await StudentProgress.findOne({ studentId: student._id });

  // Create an initial progress record if one does not exist
  if (!progress) {
    progress = await StudentProgress.create({
      // Connect the progress record to the default student
      studentId: student._id,

      // Copy the current layer from the student's session
      currentLayer: session.currentLayer,

      // Copy the number of used hints from the session
      hintsUsed: session.hintsUsed,

      // Set the initial progress percentage
      progress: 25,

      // Set the initial progress status
      status: "Active",

      // Use the same research group assigned to the student
      group: student.group,
    });
  }

  // Return all default documents together
  return {
    student,
    chat,
    session,
    progress,
  };
}

// Export the helper function so it can be used in other files
module.exports = getDefaultData;