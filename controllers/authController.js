const jwt = require('jsonwebtoken')
const { signupSchema, signinSchema, acceptCodeSchema } = require("../middleware/validator");
const User = require("../models/userModel");
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");
const transport = require('../utils/sendMail');
const {generateVerificationCode, generateToken} = require("../utils/jwtUtils")

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    //validate the request body
    const { error, value } = signupSchema.validate({ username, email, password });
    if (error) {
      return res.status(401).json({ success: false, message: error.details[0].message });
    }

    // check if the username exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(401).json({ success: false, message: "Username unavailable" });
    }

    // check if the user email exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({ success: false, message: "User already exists" });
    }

    // hash the password and create a new user
    const hashedPassword = await doHash(password, 12);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // set a verification code for the user
    const codeValue = generateVerificationCode()
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
      console.log("Error while sending mail")
      res.status(500).json({message: "Failed to send mail"})
    }
    
    // console.log(info)
    res.status(201).json({ msg: "User registered. Verification email sent." });
  } catch (error) {
    console.log("Sending verification code error", error);
  }
};

// exports.signup = async (req, res) => {
//   const { username, email, password } = req.body;
//   try {
//     const { error, value } = signupSchema.validate({ username, email, password });
//     if (error) {
//       return res
//         .status(401)
//         .json({ success: false, message: error.details[0].message });
//     }

//     const existingUsername = await User.findOne({username})
//     if (existingUsername) {
//       return res.status(401).json({success: false, message:"Username unavailable"})
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res
//         .status(401)
//         .json({ success: false, message: "User already exists" });
//     }

//     const hashedPassword = await doHash(password, 12);

//     const newUser = new User({
//       username,
//       email,
//       password: hashedPassword, 
//     });

//     const result = await newUser.save();
//     result.password = undefined; 

//     res
//       .status(201)
//       .json({ success: true, message: "Account created successfully", result });
//   } catch (error) {
//     console.log("Signup error: ", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };


exports.signin = async(req, res) => {
    const {email, password} = req.body;
    try {
      //validate request body
        const {error, value} = signinSchema.validate({email, password})
        if (error) {
          return res
            .status(401)
            .json({ success: false, message: error.details[0].message });
        }
        const existingUser = await User.findOne({ email }).select(
          "password verified email"
        );

        // check if user exists
        if (!existingUser) {
          return res
            .status(401)
            .json({ success: false, message: "User does not exist" });
        }

        // validate password
        const result = await doHashValidation(password, existingUser.password)
        if (!result){
            return res
            .status(401)
            .json({ success: false, message: "Invalid Password" });       
        }

        // if the user is not verified but registered for some reason
        if (!existingUser.verified) {
          // generate verification code
          const codeValue = generateVerificationCode();
          existingUser.verificationCode = {
            code: codeValue,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Set expiration to 15 minutes from now
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
        return res.status(401).json({ msg: "Account not verified. Verification code sent, please verify your account." });  
        } 
        
        // generate token for user
        const payload = {
          userId: existingUser._id,
          email: existingUser.email,
          verified: existingUser.verified,
        };
        const token = generateToken(payload);
        res.json({ token, message: "Login successful" });
          
        // console.log(existingUser.verified);
        // const token = jwt.sign({
        //     userId: existingUser._id,
        //     email: existingUser.email,
        //     verified: existingUser.verified
        // }, process.env.SECRET_KEY, {expiresIn: '8h'});
        // res.cookie("Authorization", "Bearer " + token, {
        //     expires: new Date(Date.now() + 8 * 3600000),
        //     httpOnly: process.env.NODE_ENV === "production",
        //     secure: process.env.NODE_ENV === "production",
        //   })
        //   .json({
        //     success: true,
        //     token,
        //     message: "logged in successfully",
        //   });
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

// exports.sendVerificationCode = async (req, res) => {
//   const { email } = req.body;
//   try {
//     const existingUser = await User.findOne({ email });
//     if (!existingUser) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User does not exists!" });
//     }
//     if (existingUser.verified) {
//       return res
//         .status(400)
//         .json({ success: false, message: "You are already verified!" });
//     }

//     const codeValue = Math.floor(Math.random() * 1000000).toString();
//     let info = await transport.sendMail({
//       from: process.env.EMAIL_CODE,
//       to: existingUser.email,
//       subject: "verification code",
//       html: "<h1>" + codeValue + "</h1>",
//     });

//     if (info.accepted[0] === existingUser.email) {
//       const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VER_CODE);
//       existingUser.verificationCode = hashedCodeValue;
//       existingUser.verificationCodeValidation = Date.now();
//       await existingUser.save();
//       return res.status(200).json({ success: true, message: "Code sent!" });
//     }
//     res.status(400).json({ success: false, message: "Code sent failed!" });
//   } catch (error) {
//     console.log("Sending verification code error", error);
//   }
// };


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
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }


    if (!user) {
      return res
        .status(401)
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

    res.json({ token, msg: "Account verification successful" });

    // const codeValue = providedCode.toString();
    // const existingUser = await User.findOne({ email }).select(
    //   "+verificationCode +verificationCodeValidation"
    // );
    // console.log("verificationCode:", existingUser.verificationCode);
    // console.log(
    //   "verificationCodeValidated:",
    //   existingUser.verificationCodeValidated
    // );

    // if (!existingUser) {
    //   return res
    //     .status(401)
    //     .json({ success: false, message: "User does not exists!" });
    // }
    // if (existingUser.verified) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "you are already verified!" });
    // }

    // if (
    //   !existingUser.verificationCode ||
    //   !existingUser.verificationCodeValidation
    // ) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "something is wrong with the code!" });
    // }

    // if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "code has been expired!" });
    // }

    // const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VER_CODE);

    // if (hashedCodeValue === existingUser.verificationCode) {
    //   existingUser.verified = true;
    //   existingUser.verificationCode = undefined;
    //   existingUser.verificationCodeValidation = undefined;
    //   await existingUser.save();
    //   return res
    //     .status(200)
    //     .json({ success: true, message: "your account has been verified!" });
    // }
    // return res
    //   .status(400)
    //   .json({ success: false, message: "unexpected occured!!" });
  } catch (error) {
    console.log("Verifying code error", error);
  }
};




