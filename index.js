const express = require("express");
require("dotenv").config();
const app = express();
const productRoute = require("./routes/productRoute.js");
const authRoute = require("./routes/authRoute.js")
const userRoute = require("./routes/userRoute.js")
const adminRoute = require("./routes/adminRoute.js")
const cookieParser = require("cookie-parser");
const connectDB = require("./dbConnection.js")


//database
connectDB();

//middleware
app.use(express.json());
app.use(cookieParser());


//routes
app.use("/api/products", productRoute);
app.use("/api/auth", authRoute)
app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);


app.get("/", (req, res) => {
  res.send("Hello You");
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
