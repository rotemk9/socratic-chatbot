// Handle the researcher login request
async function researcherLogin(req, res) {
  try {
    // Extract the username and access code from the request body
    const { username, accessCode } = req.body;

    // Compare the submitted credentials with the values stored in environment variables
    if (
      username !== process.env.RESEARCHER_USERNAME ||
      accessCode !== process.env.RESEARCHER_ACCESS_CODE
    ) {
      // Return an unauthorized response when the credentials are incorrect
      return res.status(401).json({
        message: "Invalid researcher credentials",
      });
    }

    // Return the researcher information after a successful login
    res.json({
      role: "researcher",
      researcherName: username,
      isResearcher: true,
    });
  } catch (error) {
    // Return a server error if the researcher login process fails
    res.status(500).json({
      message: "Researcher login failed",
      error: error.message,
    });
  }
}

// Export the login function so it can be used in the researcher routes
module.exports = {
  researcherLogin,
};