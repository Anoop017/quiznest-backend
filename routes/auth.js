import express from "express"
import User from "../models/User.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const router = express.Router();

// Signup endpoint
router.post("/signup", async (req, res) => {
    const { email, pin } = req.body;

    try {
        // Validate email
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: "Please provide a valid email address" });
        }

        // Validate PIN format (exactly 4 digits)
        if (!pin || !/^\d{4}$/.test(pin)) {
            return res.status(400).json({ message: "PIN must be exactly 4 digits" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user
        const user = new User({ email, pin });
        await user.save();

        // Return success message (user will be redirected to login)
        res.status(201).json({ message: "User created successfully" });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Login endpoint
router.post("/login", async (req, res) => {
    const { email, pin } = req.body;

    try {
        // Validate email
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: "Please provide a valid email address" });
        }

        // Validate PIN format (exactly 4 digits)
        if (!pin || !/^\d{4}$/.test(pin)) {
            return res.status(400).json({ message: "PIN must be exactly 4 digits" });
        }

        const user = await User.findOne({ email });
        
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(pin, user.pin);
        if (!isMatch) return res.status(400).json({ message: "Incorrect PIN" });

        // Generate JWT token
        const payload = { id: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Remove PIN before sending user data
        const { pin: _p, ...userWithoutPin } = user._doc;

        return res.json({ message: "Login Success", token, user: userWithoutPin });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

export default router;

