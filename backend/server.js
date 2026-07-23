import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const port = 3000;
const app = express();

app.use(cors());
app.use(express.json());

// Check if API Key exists
if (!process.env.GEMINI_KEY) {
  console.error("❌ ERROR: GEMINI_KEY is missing in .env file");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

app.post("/gemini", async (req, res) => {
  try {
    const { word } = req.body;

    if (!word) {
      console.log("⚠️ No word received in request body");
      return res.status(400).json({ error: "No word provided" });
    }

    console.log(`🤖 Generating lesson for: ${word}`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Using the Japanese word "${word}", generate:
                    1. A short and simple Japanese sentence using that word.
                    2. Romaji for the sentence.
                    3. The English translation of the sentence.
                    4. A brief explanation that is easy to understand for that sentence.
                    Format:
                    Japanese: ...
                    Romaji: ...
                    English: ...
                    Explanation: ...`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    const cleaned = text.trim().replace(/\n{2,}/g, "\n");

    res.json({ result: cleaned });
  } catch (error) {
    console.error("❌ BACKEND ERROR:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});
