// Import the Express framework for creating routes
const express = require("express");

// Import the controller functions used by the dashboard routes
const {
  getDashboardData,
  getResearchAnalytics,
} = require("../controllers/dashboardController");

// Create a new Express router
const router = express.Router();

// Retrieve detailed dashboard data for all students
router.get("/", getDashboardData);

// Retrieve general research statistics and analytics
router.get("/analytics", getResearchAnalytics);

// Export the router so it can be used in the main application
module.exports = router;