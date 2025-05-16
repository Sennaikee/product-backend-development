const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
const productRoute = require("./routes/productRoute.js");
const authRoute = require("./routes/authRoute.js")
const userRoute = require("./routes/userRoute.js")
const cookieParser = require("cookie-parser");

//middleware
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api/products", productRoute);
app.use("/api/auth", authRoute)
app.use("/api/user", userRoute);


app.get("/", (req, res) => {
  res.send("Hello You");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => console.log("Connection failed"));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
