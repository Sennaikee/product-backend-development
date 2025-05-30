const jwt = require("jsonwebtoken");
const {
  signupSchema,
  signinSchema,
  acceptCodeSchema,
} = require("../middleware/validatorMiddleware");
const User = require("../models/userModel");
const { doHash, doHashValidation} = require("../utils/hashing");
const transport = require("../utils/sendMail");
const {
  generateVerificationCode,
  generateToken,
} = require("../utils/jwtUtils");
const { addToBlacklist } = require("../utils/blacklist");

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    //validate the request body
    const { error, value } = signupSchema.validate({
      username,
      email,
      password,
    });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    // check if the username exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(400)
        .json({ success: false, message: "Username unavailable" });
    }

    // check if the user email exists
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // hash the password and create a new user
    const hashedPassword = await doHash(password, 12);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // set a verification code for the user
    const codeValue = generateVerificationCode();
    newUser.verificationCode = {
      code: codeValue,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Set expiration to 15 minutes from now
    };

    // save user in database
    await newUser.save();

    // send email to user
    try {
      let info = await transport.sendMail({
        from: process.env.EMAIL_CODE,
        to: newUser.email,
        subject: "verification code",
        html: "<h1>" + codeValue + "</h1>",
      });
    } catch (error) {
      console.log("Error while sending mail");
      res.status(500).json({ message: "Failed to send mail" });
    }

    // console.log(info)
    res.status(201).json({ msg: "User registered. Verification email sent." });
  } catch (error) {
    console.log("Sending verification code error", error);
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    //validate request body
    const { error, value } = signinSchema.validate({ email, password });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const existingUser = await User.findOne({ email }).select(
      "password verified email"
    );

    // check if user exists
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    // validate password
    const result = await doHashValidation(password, existingUser.password);
    if (!result) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Password" });
    }

    // if the user is not verified but registered for some reason
    if (!existingUser.verified) {
      // generate verification code
      const codeValue = generateVerificationCode();
      existingUser.verificationCode = {
        code: codeValue,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Set expiration to 5 minutes from now
      };

      // send email to user
      try {
        let info = await transport.sendMail({
          from: process.env.EMAIL_CODE,
          to: existingUser.email,
          subject: "verification code",
          html: "<h1>" + codeValue + "</h1>",
        });
      } catch (error) {
        console.log("Error while sending mail");
        res.status(500).json({ message: "Failed to send mail" });
      }
      return res
        .status(403)
        .json({
          msg: "Account not verified. Verification code sent, please verify your account.",
        });
    }

    // generate token for user
    const payload = {
      userId: existingUser._id,
      email: existingUser.email,
      verified: existingUser.verified,
      role: existingUser.role,
    };
    const token = generateToken(payload);
    res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    console.log("Sign in error", error);
  }
};

// const logoutUser = async (req, res) => {
//   try {
//     const token = req.header("Authorization");

//     // Check if the token is already blacklisted
//     if (blacklist.isTokenBlacklisted(token)) {
//       return res.json({ msg: "Already logged out" });
//     }

//     // Add the token to the blacklist
//     blacklist.addToBlacklist(token);

//     res.json({ msg: "Logout successful" });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ msg: "Server Error", error });
//   }
// };

// exports.signout = async (req, res) => {
//   try {
//     res
//     .clearCookie("Authorization")
//     .status(200)
//     .json({ success: true, message: "logged out successfully" });
//   } catch (error) {
//     res.status(500).json({message: "Server error"})
//     console.log("Sign out error", error)
//   }
// };

exports.signout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "No token found" });

    const decoded = jwt.decode(token);
    const expiresInSeconds = decoded.exp - Math.floor(Date.now() / 1000);

    await addToBlacklist(token, expiresInSeconds);
    res.status(200).json({ message: "Signout successful." });
  } catch (error) {
    console.error("Signout error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyVerificationCode = async (req, res) => {
  const { providedCode } = req.body;
  try {
    const { error, value } = acceptCodeSchema.validate({ providedCode });
    const user = await User.findOne({
      "verificationCode.code": providedCode,
      "verificationCode.expiresAt": { $gte: new Date() }, // Check if not expired
    });

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP for email verification" });
    }

    user.verified = true;
    user.verificationCode.code = null;
    user.verificationCode.expiresAt = null;
    await user.save();

    const payload = {
      userId: user._id,
      email: user.email,
      verified: user.verified,
    };
    const token = generateToken(payload);
    res.status(200).json({ token, msg: "Account verification successful" });
  } catch (error) {
    console.log("Verifying code error", error);
    res.status(500).json({ message: "Server error" });
  }
};
