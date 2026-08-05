// Import Express to create the backend server and API routes
const express = require("express");

// Import CORS to allow requests from the frontend
const cors = require("cors");

// Import dotenv to load environment variables from the .env file
const dotenv = require("dotenv");

// Import the function responsible for connecting to MongoDB
const connectDB = require("./config/db");

// Import the session-related routes
const sessionRoutes = require("./routes/sessionRoutes");

// Import the chat-related routes
const chatRoutes = require("./routes/chatRoutes");

// Import the dashboard-related routes
const dashboardRoutes = require("./routes/dashboardRoutes");

// Import the learning-layer routes
const layerRoutes = require("./routes/layerRoutes");

// Import the questionnaire-related routes
const questionnaireRoutes = require("./routes/questionnaireRoutes");

// Import the control-group routes
const controlRoutes = require("./routes/controlRoutes");

// Import the researcher authentication routes
const researcherRoutes = require("./routes/researcherRoutes");

// Load the environment variables from the .env file
dotenv.config();

// Connect the application to the MongoDB database
connectDB();

// Create the Express application
const app = express();

// Configure CORS permissions for incoming frontend requests
app.use(
  cors({
    // Allow requests from any origin
    origin: "*",

    // Allow these HTTP request methods
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// Define a basic route for checking whether the backend is running
app.get("/", (req, res) => {
  // Return a simple server status message
  res.send("SystemThinker AI Backend is running");
});

// Connect the session routes to the /api/session URL
app.use("/api/session", sessionRoutes);

// Connect the chat routes to the /api/chat URL
app.use("/api/chat", chatRoutes);

// Connect the dashboard routes to the /api/dashboard URL
app.use("/api/dashboard", dashboardRoutes);

// Connect the learning-layer routes to the /api/layers URL
app.use("/api/layers", layerRoutes);

// Connect the questionnaire routes to the /api/questionnaires URL
app.use("/api/questionnaires", questionnaireRoutes);

// Connect the control-group routes to the /api/control URL
app.use("/api/control", controlRoutes);

// Connect the researcher routes to the /api/researcher URL
app.use("/api/researcher", researcherRoutes);

// Use the port stored in the environment variables, or port 5000 by default
const PORT = process.env.PORT || 5000;

// Start the backend server and listen for incoming requests
app.listen(PORT, () => {
  // Display the server port after the server starts successfully
  console.log(`Backend server running on port ${PORT}`);
});