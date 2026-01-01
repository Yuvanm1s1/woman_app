const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save user
    user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// LOGIN ROUTE
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

//     // Compare passwords
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

//     // Create JWT Token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.json({ token, user: { id: user._id, username: user.username } });
//   } catch (err) {
//     res.status(500).send("Server Error");
//   }
// });
// backend/routes/auth.js
router.post('/login', async (req, res) => {
  console.log("--- Login Request Received ---");
  console.log("Body:", req.body); // Check if frontend is sending data correctly

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.trim() });
    
    if (!user) {
      console.log("❌ User not found for email:", email);
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    console.log("✅ User found in DB:", user.email);

    // Check password comparison
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match Status:", isMatch);

    if (!isMatch) {
      console.log("❌ Password does not match!");
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("🚀 Token generated successfully");
    
    res.json({ token, user: { id: user._id, username: user.username } });

  } catch (err) {
    console.error("🔥 Server Error:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;