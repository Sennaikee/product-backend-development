const express = require("express");
const app = express();
const productRoute = require("./routes/productRoute.js");
const authRoute = require("./routes/authRoute.js");
const userRoute = require("./routes/userRoute.js");
const adminRoute = require("./routes/adminRoute.js");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/dbConnection.js");

require("dotenv").config();

//database
connectDB();

//middleware
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api/products", productRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);

module.exports = app;