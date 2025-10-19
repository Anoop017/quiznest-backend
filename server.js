import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import auth from "./routes/auth.js"
import quiz from "./routes/quiz.js"
import authMiddleware from "./middleware/authMiddleware.js"
import Quiz from "./models/Quiz.js"
import cors from "cors"
import Country from "./models/Country.js"


dotenv.config()

const app = express()

// Apply CORS middleware BEFORE other middleware and routes
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "https://quiz-nest-site.netlify.app"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())
app.use("/api/auth", auth)
app.use("/api/quiz", quiz)

// APP - GET
app.get("/", (req, res) => {
  res.json({message: "Hello from QuizNest Backend"})
})

// JWT - GET
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "You accessed a protected route!", user: req.user })
})

// Countries endpoint
app.get("/api/countries", async(req, res) => {
  try {
    const countries = await Country.find().sort({name: 1})
    res.json({countries})
  } catch(error) {
    res.status(500).json({message: "Failed to Fetch Countries", error: error.message})
  }
})
// For Uptime Monitoring
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
// MONGOOSE - CONNECT
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB Connection Error", err))

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
