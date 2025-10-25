import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import auth from "./routes/auth.js"
import quiz from "./routes/quiz.js"
import authMiddleware from "./middleware/authMiddleware.js"
import Quiz from "./models/Quiz.js"
import cors from "cors"
import Country from "./models/Country.js"
import aiRouter from "./routes/ai.js"

dotenv.config()

const app = express()

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://quiz-nest-site.netlify.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Parse JSON
app.use(express.json())

// Routes
app.use("/api/auth", auth)
app.use("/api/quiz", quiz)
app.use("/api/ai", aiRouter);

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
    console.error("Countries fetch error:", error);
    res.status(500).json({message: "Failed to Fetch Countries", error: error.message})
  }
})

// For Uptime Monitoring
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// MONGOOSE - CONNECT
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB Connection Error", err);
    process.exit(1);
  });

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));