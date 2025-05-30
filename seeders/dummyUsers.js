const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();


// 1. Define your Mongoose schema (you can replace this with your actual User model)
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  verified: Boolean,
  role: { type: String, default: "user" },
  verificationCode: {
    code: { type: Number, default: null },
    expiresAt: { type: Date, default: null },
  },
});

const User = mongoose.model("User", userSchema);


const connect = async() => {
  await mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => console.log("Connection failed"));
} 
module.exports = connect
// 2. Connect to MongoDB
// const connect = async() => {
//   await mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("Connected to database!");
//   })
//   .catch(() => console.log("Connection failed"));
// } 
const mongoUri = process.env.MONGO_URI; // replace with your DB
mongoose
  .connect(mongoUri)
  .then(async () => {
    console.log("MongoDB connected");

    // 3. Dummy users data
    const dummyUsers = [
    //   {
    //     username: "testuser1",
    //     email: "test1@example.com",
    //     password: "password",
    //   },
    //   {
    //     username: "testuser2",
    //     email: "test2@example.com",
    //     password: "password",
    //   },
    //   {
    //     username: "testuser3",
    //     email: "test3@example.com",
    //     password: "password",
    //   },
    //   {
    //     username: "testuser4",
    //     email: "test4@example.com",
    //     password: "password",
    //   },
    //   {
    //     username: "testuser8",
    //     email: "test8@example.com",
    //     password: "password",
    //   },
    //   {
    //     username: "testuser9",
    //     email: "test9@example.com",
    //     password: "password",
    //   },
      {
        username: "testuser11",
        email: "test11@example.com",
        password: "Password@1234",
      },
    ];

    // 4. Hash passwords and insert users
    for (const user of dummyUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      await User.create({
        username: user.username,
        email: user.email,
        password: hashedPassword,
        verified: true,
        role: "user",
        verificationCode: { code: null, expiresAt: null },
      });
      console.log(`Inserted user: ${user.username}`);
    }

    mongoose.disconnect();
    console.log("Seeding complete. Disconnected from MongoDB.");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
