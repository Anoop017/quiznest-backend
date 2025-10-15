import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import authMiddleware from "./middleware/authMiddleware.js"
import Quiz from "./models/Quiz.js"
import cors from "cors";
import Country from "./models/Country.js"


dotenv.config();

const app = express();

app.use(express.json())
app.use("/api/auth", authRoutes);
app.use(cors({
  origin: ["http://localhost:5173", "https://quiz-nest-site.netlify.app/"],
  credentials: true,
}));

// APP - GET
app.get("/", (req, res) => {
  res.json({message : "Hello from QuizNest Backend"})
})

// JWT - GET
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "You accessed a protecred route!", user: req.user })
})

// MONGOOSE - CONNECT
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB Connection Error", err))

 
app.get("/api/countries", async(req,res)=>{
  try{
    const countries = await Country.find().sort({name:1})
    res.json({countries})
  }catch(error){
    res.status(500).json({message:"Failed to Fetch Countries", error:error.message})
  }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
