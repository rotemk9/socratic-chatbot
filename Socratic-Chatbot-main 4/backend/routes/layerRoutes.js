// Import the Express framework for creating routes
const express = require("express");

// Import the controller functions used by the layer routes
const {
  getLayers,
  checkLayer,
} = require("../controllers/layerController");

// Create a new Express router
const router = express.Router();

// Retrieve the complete list of learning layers and their requirements
router.get("/", getLayers);

// Check whether the current layer of a session has been completed
router.post("/check", checkLayer);

// Export the router so it can be used in the main application
module.exports = router;