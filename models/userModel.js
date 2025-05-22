const mongoose = require('mongoose');
const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter a username"],
      trim: true,
      unique: [true, "Email must be unique"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: [true, "Email must be unique"],
      minLength: [6, "Email must have 6 characters!"],
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      select: false,
      minLength: [6, "Password must have 6 characters!"],
    },

    role: {
      type: String,
      enum: ["superadmin", "admin", "user"],
      default: "user",
    },

    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      code: { type: Number },
      expiresAt: { type: Date },
    },
    // forgotPasswordCode: {
    //   type: String,
    //   select: false,
    // },
    // forgotPasswordCodeValidation: {
    //   type: Number,
    //   select: false,
    // },
  },
  { timestamps: true }
);


const User = mongoose.model("User", UserSchema);

module.exports = User;
