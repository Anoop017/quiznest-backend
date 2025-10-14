import express from "express"
import User from "../models/User.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const router = express.Router();

router.post("/login", async (req, res) => {
    const { email, password } = req.body;


    try {

        const user = await User.findOne({ email });
        
        if (!user) return res.status(404).json({ message: "User not found" })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({ message: "Incorrect Password" })

        // Code Token 

        const payload = { id: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" })

        // remove password before sending it to the user

        const { password: _p, ...userWithoutPassword } = user._doc;


        return res.json({ message: "Login Success", token, user: userWithoutPassword })

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })

    }
})

export default router;

