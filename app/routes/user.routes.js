const express = require("express");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ResetToken = require("../models/ResetToken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

dotenv.config();
const router = express.Router();

console.log("testing env", process.env.ACCESS_TOKEN_SECRET);

// !ALL_USERS_ROUTE
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });

    res.json(users);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

// !GET_USER_BY_ID_ROUTE
router.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch the user by ID from the database
    const user = await User.findById(userId, { password: 0 }); // Exclude password field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user as a response
    res.json(user);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

// !LOGIN_ROUTE
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ message: "User Not found." });
//     }

//     const passwordIsValid = bcrypt.compareSync(password, user.password);
//     if (!passwordIsValid) {
//       return res
//         .status(401)
//         .json({ accessToken: null, message: "Invalid Password!" });
//     }

//     const token = jwt.sign(
//       { _id: user._id, role: user.role },
//       process.env.ACCESS_TOKEN_SECRET || "",
//       {
//         expiresIn: 86400,
//       }
//     );

//     res.status(200).json({
//       _id: user._id,
//       username: user.username,
//       email: user.email,
//       role: user.role,
//       phone_number: user.phone_number,
//       accessToken: token,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });
// !LOGIN_ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User Not found." });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res
        .status(401)
        .json({ accessToken: null, message: "Invalid Password!" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET || "",
      {
        expiresIn: 86400,
      }
    );

    // Check if the logged-in user is an admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Only admins are allowed." });
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      phone_number: user.phone_number,
      accessToken: token,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// !REGISTER_ROUTE
// router.post("/register", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     console.log("🚀 ~ router.post ~ req.body:", req.body);

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       email,
//       password: hashedPassword,
//     });

//     await newUser.save();

//     const token = jwt.sign(
//       { _id: newUser._id, role: newUser.role },
//       process.env.ACCESS_TOKEN_SECRET || "",
//       {
//         expiresIn: 86400,
//       }
//     );

//     res.status(201).json({
//       _id: newUser._id,
//       username: newUser.username,
//       email: newUser.email,
//       role: newUser.role,
//       phone_number: newUser.phone_number,
//       accessToken: token,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// !REGISTER_ROUTE
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if there are any existing users with admin role
    const existingAdmin = await User.findOne({ role: 'admin' });

    // Determine the role for the new user
    const role = existingAdmin ? 'user' : 'admin';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      role, // Assign role to the new user
    });

    await newUser.save();

    const token = jwt.sign(
      { _id: newUser._id, role: newUser.role },
      process.env.ACCESS_TOKEN_SECRET || "",
      {
        expiresIn: 86400,
      }
    );

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      phone_number: newUser.phone_number,
      accessToken: token,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// !FORGOT-PASSWORD_ROUTE
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    const userId = existingUser._id.toString();
    const resetToken = new ResetToken({ token, expiry, email, userId });

    await resetToken.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: "noreply@yourdomain.com",
      to: email,
      subject: "Forgot Password",
      text: `Click here to reset your password: http://localhost:3000/reset-password/${token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

// !RESET-PASSWORD_ROUTE
router.post("/reset-password", async (req, res) => {
  try {
    const { password, token } = req.body;

    const resetToken = await ResetToken.findOne({ token });
    console.log("🚀 ~ router.post ~ resetToken:", resetToken);

    if (!resetToken || resetToken.used || resetToken.expiry < new Date()) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    resetToken.used = true;
    await resetToken.save();

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = resetToken.userId;
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

// !DELETE_USER_ROUTE
router.delete("/delete-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

// !UPDATE_USER_ROUTE
router.put("/update-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, password, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email) {
      user.email = email;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    if (phone) {
      user.phone = phone;
    }

    // Save the updated user
    await user.save();

    return res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;
