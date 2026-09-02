// This router is intentionally empty. The control-group logic lives inside
// chatController.js (the /chat/:chatId/message endpoint), so no separate
// control routes are needed. Kept as a valid empty router so any existing
// import in server.js keeps working.
const express = require("express");
const router = express.Router();

module.exports = router;
