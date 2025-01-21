const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());

// SET security HTTP headers
const helmet = require("helmet");
app.use(helmet());

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// BODY-PARSER, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Set Pug as the template engine
app.set("view engine", "pug");

// Set the views directory
app.set("views", path.join(__dirname, "views"));

//Data sanitization against NoSQL query injection
const mongoSanitize = require("express-mongo-sanitize");
app.use(mongoSanitize());

// Data sanitization against XSS
const xss = require("xss-clean");
app.use(xss());

// Prevent parameter pollution
const hpp = require("hpp");
app.use(hpp());
// app.use(hpp({whitelist: ['']}));

const port = process.env.PORT || 3000;
mongoose.connect(process.env.DATABASE_LOCAL).then(() => {
  console.log("MongoDB Connect");
});

const rateLimit = require("./middlewares/rateLimit");
app.use("/", rateLimit);

const productRoutes = require("./routes/productRoute");
const userRoutes = require("./routes/userRoute");
app.use("/product", productRoutes);
app.use("/user", userRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
