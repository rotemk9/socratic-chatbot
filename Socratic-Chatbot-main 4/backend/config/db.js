// Import the Mongoose library to connect the application to MongoDB
const mongoose = require("mongoose");

// Define an asynchronous function for connecting to the MongoDB database
async function connectDB() {
  try {
    // Connect to MongoDB using the connection string stored in the environment variables
    await mongoose.connect(process.env.MONGO_URI);

    // Display a success message when the database connection is established
    console.log("MongoDB connected successfully");
  } catch (error) {
    // Display an error message if the database connection fails
    console.error("MongoDB connection failed:", error.message);

    // Stop the application with an error status code
    process.exit(1);
  }
}

// Export the connectDB function so it can be used in other files
module.exports = connectDB;