import mongoose from "mongoose";
import bcrypt from "bcrypt"


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    pin: { type: String, required: true },
    totalTimeSpent: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    progressData: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });


userSchema.pre("save", async function (next) {
    if (!this.isModified("pin")) return next();
    this.pin = await bcrypt.hash(this.pin, 10);
    next();
})

const User = mongoose.model("User", userSchema)

export default User