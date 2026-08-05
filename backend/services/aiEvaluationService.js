// Import the Session model for retrieving and updating learning sessions
const Session = require("../models/Session");

// Import the StudentProgress model for updating the student's overall progress
const StudentProgress = require("../models/StudentProgress");

// Import the GateEvent model for recording newly unlocked requirements
const GateEvent = require("../models/GateEvent");

// Import the OpenAI service function used to evaluate student messages
const { evaluateLayerWithOpenAI } = require("./openaiService");

// Define the learning layers in the order students must complete them
const LAYERS = ["Broad Context", "Structure", "Dynamics", "Evaluation"];

// Map the keys returned by the AI evaluation to the gate names stored in the database
const GATE_MAP = {
  // Broad Context layer gates
  goalDefined: "Goal defined",
  threeStakeholdersIdentified: "Three stakeholders identified",
  opponentIdentified: "Opponent identified",
  systemBoundariesDefined: "System boundaries defined",
  assumptionStated: "Assumption stated",

  // Structure layer gates
  threeComponentsIdentified: "Three components identified",
  influenceChainCreated: "Influence chain created",

  // Dynamics layer gates
  normalScenarioDescribed: "Normal scenario described",
  stressScenarioDescribed: "Stress scenario described",
  feedbackLoopIdentified: "Feedback loop identified",
  delayIdentified: "Delay identified",

  // Evaluation layer gates
  threeMetricsDefined: "Three metrics defined",
  targetValuesDefined: "Target values defined",
  twoAlternativesCompared: "Two alternatives compared",
  tradeoffIdentified: "Tradeoff identified",
  riskIdentified: "Risk identified",
  mitigationSuggested: "Mitigation suggested",
};

// Evaluate a student's message and update the related session progress
async function evaluateStudentMessage({ studentId, sessionId, messageText }) {
  // Retrieve the session using its database ID
  const session = await Session.findById(sessionId);

  // Stop the evaluation if the session does not exist
  if (!session) {
    throw new Error("Session not found");
  }

  // Store the student's current learning layer
  const currentLayer = session.currentLayer;

  // Ask the AI service to evaluate the message according to the current layer
  const aiEvaluation = await evaluateLayerWithOpenAI({
    currentLayer,
    studentMessage: messageText,
  });

  // Examine every evaluation result returned by the AI
  for (const key in aiEvaluation) {
    // Continue only when the AI marks a requirement as completed
    if (aiEvaluation[key] === true) {
      // Convert the AI evaluation key into its database gate name
      const gateName = GATE_MAP[key];

      // Unlock the gate only if it is valid and has not already been unlocked
      if (gateName && !session.unlockedGates.includes(gateName)) {
        // Add the newly completed gate to the session
        session.unlockedGates.push(gateName);

        // Your Database Save Logic - Works perfectly!
        // Record when, where, and how the gate was unlocked
        await GateEvent.create({
          studentId,
          sessionId,
          layer: currentLayer,
          gateName,
          trigger: messageText,
        });
      }
    }
  }

  // Check whether all requirements of the current layer are completed
  const layerCompleted = isLayerCompleted(currentLayer, session.unlockedGates);

  // Move the student forward when the current layer is completed
  if (layerCompleted) {
    // Find the next layer in the learning sequence
    const nextLayer = getNextLayer(currentLayer);

    // Move to the next layer if another layer exists
    if (nextLayer) {
      session.currentLayer = nextLayer;
    } else {
      // Mark the session as completed after the final layer
      session.status = "completed";
    }
  }

  // Save all changes made to the session
  await session.save();

  // Calculate the student's updated progress percentage
  const progressPercent = calculateProgress(session);

  // Update the student's progress document using the latest session information
  await StudentProgress.findOneAndUpdate(
    { sessionId },
    {
      currentLayer: session.currentLayer,
      progress: progressPercent,
      status: session.status === "completed" ? "completed" : "active",
      hintsUsed: session.hintsUsed,
      group: session.group,
    },
    // Return the document after applying the update
    { returnDocument: "after" }
  );

  // Return the updated session
  return session;
}

// Check whether every required gate for a specific layer has been unlocked
function isLayerCompleted(layer, unlockedGates) {
  // Define the required gates for each learning layer
  const requirements = {
    // Requirements for completing the Broad Context layer
    "Broad Context": [
      "Goal defined",
      "Three stakeholders identified",
      "Opponent identified",
      "System boundaries defined",
      "Assumption stated",
    ],

    // Requirements for completing the Structure layer
    Structure: [
      "Three components identified",
      "Influence chain created",
    ],

    // Requirements for completing the Dynamics layer
    Dynamics: [
      "Normal scenario described",
      "Stress scenario described",
      "Feedback loop identified",
      "Delay identified",
    ],

    // Requirements for completing the Evaluation layer
    Evaluation: [
      "Three metrics defined",
      "Target values defined",
      "Two alternatives compared",
      "Tradeoff identified",
      "Risk identified",
      "Mitigation suggested",
    ],
  };

  // Return true only when every required gate exists in the unlocked gates array
  return requirements[layer].every((gate) => unlockedGates.includes(gate));
}

// Find the learning layer that comes after the current layer
function getNextLayer(currentLayer) {
  // Find the position of the current layer in the ordered layers array
  const index = LAYERS.indexOf(currentLayer);

  // Return the next layer, or null when the current layer is the final one
  return LAYERS[index + 1] || null;
}

// Calculate the student's overall progress percentage
function calculateProgress(session) {
  // Define the total number of gates across all learning layers
  const totalGates = 17;

  // Return full progress when the session has been completed
  if (session.status === "completed") {
    return 100;
  }

  // Calculate progress according to the number of unlocked gates
  return Math.min(
    // Convert the fraction of completed gates into a rounded percentage
    Math.round((session.unlockedGates.length / totalGates) * 100),

    // Prevent the returned progress value from exceeding 100
    100
  );
}

// Export the evaluation function so it can be used by other services and controllers
module.exports = {
  evaluateStudentMessage,
};