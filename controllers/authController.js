const jwt = require('jsonwebtoken')
const { signupSchema, signinSchema, acceptCodeSchema } = require("../middleware/validator");
const User = require("../models/userModel");
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");
const transport = require('../middleware/sendMail');

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const { error, value } = signupSchema.validate({ username, email, password });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const existingUsername = await User.findOne({username})
    if (existingUsername) {
      return res.status(401).json({success: false, message:"Username unavailable"})
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await doHash(password, 12);

    const newUser = new User({
      username,
      email,
      password: hashedPassword, 
    });

    const result = await newUser.save();
    result.password = undefined; 

    res
      .status(201)
      .json({ success: true, message: "Account created successfully", result });
  } catch (error) {
    console.log("Signup error: ", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.signin = async(req, res) => {
    const {email, password} = req.body;
    try {
        const {error, value} = signinSchema.validate({email, password})
        if (error) {
          return res
            .status(401)
            .json({ success: false, message: error.details[0].message });
        }
        const existingUser = await User.findOne({ email }).select(
          "password verified email"
        );
        if (!existingUser) {
          return res
            .status(401)
            .json({ success: false, message: "User does not exist" });
        }
        const result = await doHashValidation(password, existingUser.password)
        if (!result){
            return res
            .status(401)
            .json({ success: false, message: "Invalid Password" });
        
        }
        
        const token = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified
        }, process.env.SECRET_KEY, {expiresIn: '8h'});
        res.cookie("Authorization", "Bearer " + token, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: process.env.NODE_ENV === "production",
            secure: process.env.NODE_ENV === "production",
          })
          .json({
            success: true,
            token,
            message: "logged in successfully",
          });
    } catch (error) {
        console.log("Sign in error", error)
    } 
}

exports.signout = async (req, res) => {
  try {
    res
    .clearCookie("Authorization")
    .status(200)
    .json({ success: true, message: "logged out successfully" });
  } catch (error) {
    console.log("Sign out error", error)
  } 
};

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exists!" });
    }
    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: "You are already verified!" });
    }

    const codeValue = Math.floor(Math.random() * 1000000).toString();
    let info = await transport.sendMail({
      from: process.env.EMAIL_CODE,
      to: existingUser.email,
      subject: "verification code",
      html: "<h1>" + codeValue + "</h1>",
    });

    if (info.accepted[0] === existingUser.email) {
      const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VER_CODE);
      existingUser.verificationCode = hashedCodeValue;
      existingUser.verificationCodeValidation = Date.now();
      await existingUser.save();
      return res.status(200).json({ success: true, message: "Code sent!" });
    }
    res.status(400).json({ success: false, message: "Code sent failed!" });
  } catch (error) {
    console.log("Sending verification code error", error);
  }
};


exports.verifyVerificationCode = async (req, res) => {
  const { email, providedCode } = req.body;
  try {
    const { error, value } = acceptCodeSchema.validate({ email, providedCode });
    
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const codeValue = providedCode.toString();
    const existingUser = await User.findOne({ email }).select(
      "+verificationCode +verificationCodeValidation"
    );
    console.log("verificationCode:", existingUser.verificationCode);
    console.log(
      "verificationCodeValidated:",
      existingUser.verificationCodeValidated
    );

    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exists!" });
    }
    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: "you are already verified!" });
    }

    if (
      !existingUser.verificationCode ||
      !existingUser.verificationCodeValidation
    ) {
      return res
        .status(400)
        .json({ success: false, message: "something is wrong with the code!" });
    }

    if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
      return res
        .status(400)
        .json({ success: false, message: "code has been expired!" });
    }

    const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VER_CODE);

    if (hashedCodeValue === existingUser.verificationCode) {
      existingUser.verified = true;
      existingUser.verificationCode = undefined;
      existingUser.verificationCodeValidation = undefined;
      await existingUser.save();
      return res
        .status(200)
        .json({ success: true, message: "your account has been verified!" });
    }
    return res
      .status(400)
      .json({ success: false, message: "unexpected occured!!" });
  } catch (error) {
    console.log("Verifying code error", error);
  }
};

exports.makeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    
    user.role = "admin"; // or user.isAdmin = true;

    await user.save();
    res.json({ success: true, message: "User promoted to admin" });
  } catch (error) {
    console.log("Error adding admin", error)
  }
};


