const mongoose = require("mongoose");
const connect = async() => {
  await mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => console.log("Connection failed"));
} 
module.exports = connect