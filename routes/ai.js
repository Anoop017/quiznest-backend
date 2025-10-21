// routes/ai.js
import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// Health for AI route
router.get("/health", (req, res) => res.json({ ok: true }));

router.post("/generate-quiz", async (req, res) => {
  try {
    // --- THIS IS THE FIX ---
    // Initialize the 'ai' client *inside* the handler.
    // By the time this code runs, dotenv.config() in server.js
    // has already populated process.env.
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    // --- END OF FIX ---

    const { topic } = req.body;
    if (!topic) return res.status(400).json({ message: "Topic is required" });

    const prompt = `
      Please generate 5 multiple-choice quiz questions about the topic: ${topic}.
      Include 4 options labeled A, B, C, and D, and indicate one correct answer for each in this format:
      **Correct Answer: [Letter]) [Answer Text]**.
      Separate each question block using "---".
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Defensive checks
    if (
      !result.candidates ||
      result.candidates.length === 0 ||
      !result.candidates[0].content?.parts?.[0]?.text
    ) {
      const blockReason = result.promptFeedback?.blockReason || "Unknown reason";
      console.error("AI response blocked/empty:", blockReason);
      return res.status(500).json({ message: `AI response blocked: ${blockReason}` });
    }

    const aiResponseAsText =
      result.response?.text?.() || result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({ textResponse: aiResponseAsText });
  } catch (err) {
    console.error("AI generate-quiz error:", err);
    res.status(500).json({ message: "Failed to generate quiz", error: err.message });
  }
});

export default router;