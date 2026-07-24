const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const OTPVerification = require("../models/OTPVerification");
const { sendOTPEmail, sendWelcomeEmail } = require("../utils/emailService");

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Input Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    if (role && !["student", "instructor"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either 'student' or 'instructor'"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    // Send welcome email in background
    sendWelcomeEmail(email, name).catch((err) => {
      console.error("[WELCOME] Failed to send welcome email in background:", err.message);
    });

    res.status(201).json({
      message: "User Registered Successfully",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 2. Input Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password"
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Helper for generating secure 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// =======================
// SEND OTP
// =======================
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Verify user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address" });
    }

    // Generate secure random 6-digit OTP
    const otp = generateOTP();

    // Hash the OTP using bcrypt
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Invalidate any previous OTPs for this email
    await OTPVerification.deleteMany({ email });

    // Store secure OTP in database
    await OTPVerification.create({
      email,
      otpHash,
      expiresAt,
      attempts: 0
    });

    // Send the OTP via email service
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =======================
// VERIFY OTP
// =======================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP code are required" });
    }

    // Find the active OTP request
    const otpRecord = await OTPVerification.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: "No active OTP request found for this email" });
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      await OTPVerification.deleteMany({ email });
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Check max attempts (limit of 5)
    if (otpRecord.attempts >= 5) {
      await OTPVerification.deleteMany({ email });
      return res.status(400).json({ message: "Too many failed attempts. Please request a new OTP." });
    }

    // Compare hashed OTP
    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      const updatedAttempts = otpRecord.attempts + 1;
      const remainingAttempts = 5 - updatedAttempts;

      if (remainingAttempts <= 0) {
        await OTPVerification.deleteMany({ email });
        return res.status(400).json({ message: "Maximum verification attempts exceeded. Please request a new OTP." });
      }

      await OTPVerification.findOneAndUpdate({ email }, { attempts: updatedAttempts });
      return res.status(400).json({
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        attemptsRemaining: remainingAttempts
      });
    }

    // Clear OTP record on success to prevent reuse
    await OTPVerification.deleteMany({ email });

    // Retrieve user and generate JWT token
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =======================
// RESEND OTP
// =======================
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Verify user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address" });
    }

    // Generate new secure 6-digit OTP
    const otp = generateOTP();

    // Hash the OTP using bcrypt
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Invalidate any previous OTPs for this email
    await OTPVerification.deleteMany({ email });

    // Store new OTP in database
    await OTPVerification.create({
      email,
      otpHash,
      expiresAt,
      attempts: 0
    });

    // Send the new OTP
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;