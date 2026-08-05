// Import the Session model for accessing learning-session data
const Session = require("../models/Session");

// Define the learning layers and their completion requirements
const layers = [
  {
    // Name of the first learning layer
    name: "Broad Context",

    // Position of the layer in the learning process
    order: 1,

    // Requirements that must be completed in this layer
    requirements: [
      "Goal defined",
      "Three stakeholders identified",
      "Opponent identified",
      "System boundaries defined",
      "Assumption stated",
    ],
  },
  {
    // Name of the second learning layer
    name: "Structure",

    // Position of the layer in the learning process
    order: 2,

    // Requirements that must be completed in this layer
    requirements: [
      "Three components identified",
      "Influence chain created",
    ],
  },
  {
    // Name of the third learning layer
    name: "Dynamics",

    // Position of the layer in the learning process
    order: 3,

    // Requirements that must be completed in this layer
    requirements: [
      "Normal scenario described",
      "Stress scenario described",
      "Feedback loop identified",
      "Delay identified",
    ],
  },
  {
    // Name of the fourth learning layer
    name: "Evaluation",

    // Position of the layer in the learning process
    order: 4,

    // Requirements that must be completed in this layer
    requirements: [
      "Three metrics defined",
      "Target values defined",
      "Two alternatives compared",
      "Tradeoff identified",
      "Risk identified",
      "Mitigation suggested",
    ],
  },
];

// Return the complete list of learning layers
async function getLayers(req, res) {
  // Send the layers array to the client as a JSON response
  res.json(layers);
}

// Check whether the student's current learning layer is completed
async function checkLayer(req, res) {
  try {
    // Extract the session ID from the request body
    const { sessionId } = req.body;

    // Find the learning session using its ID
    const session = await Session.findById(sessionId);

    // Return an error if the session does not exist
    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // Find the layer that matches the session's current layer
    const currentLayer = layers.find(
      (layer) => layer.name === session.currentLayer
    );

    // Check whether every requirement of the current layer is unlocked
    const completed = currentLayer.requirements.every((requirement) =>
      session.unlockedGates.includes(requirement)
    );

    // Return the current layer's completion information
    res.json({
      // Name of the student's current layer
      currentLayer: session.currentLayer,

      // Requirements already completed by the student
      unlockedGates: session.unlockedGates,

      // Indicates whether all requirements of the layer are completed
      completed,

      // Full list of requirements for the current layer
      requirements: currentLayer.requirements,
    });
  } catch (error) {
    // Return a server error if the layer cannot be checked
    res.status(500).json({
      message: "Failed to check layer",
      error: error.message,
    });
  }
}

// Export the controller functions so they can be used in the layer routes
module.exports = {
  getLayers,
  checkLayer,
};