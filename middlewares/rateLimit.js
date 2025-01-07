const rateLimit = require("express-rate-limit");

// LIMIT  requests from same IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later after 15 minutes.",
});
module.exports = limiter;
