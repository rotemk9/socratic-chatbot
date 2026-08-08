// Import the Mongoose library to connect the application to MongoDB
const mongoose = require("mongoose");

// Define an asynchronous function for connecting to the MongoDB database
async function connectDB() {
  try {
    // Connect to MongoDB using the connection string stored in the environment variables
    await mongoose.connect(process.env.MONGO_URI);

    // Display a success message when the database connection is established
    console.log("MongoDB connected successfully");

    // Remove the legacy unique index on the users' email field, if it exists.
    // Email is now optional and non-unique, so participants can enter again with
    // the same email (or none) without being blocked. Safe to run every startup.
    try {
      const User = require("../models/User");
      await User.collection.dropIndex("email_1");
      console.log("Removed legacy unique email index");
    } catch (indexError) {
      // The index may already be gone — that is fine, so we ignore this error.
    }
  } catch (error) {
    // Display an error message if the database connection fails
    console.error("MongoDB connection failed:", error.message);

    // Stop the application with an error status code
    process.exit(1);
  }
}

// Export the connectDB function so it can be used in other files
module.exports = connectDB;