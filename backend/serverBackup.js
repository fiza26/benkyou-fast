import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import supabase from "./supabase.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const port = 3000;
const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

let words = [];
let error = null;

async function getWords() {
  const { data, error: dbError } = await supabase
    .from("advanced_learning")
    .select();

  if (data) {
    words = data;
  } else {
    error = dbError;
    console.log("Error :", error);
  }
}

app.get("/", (req, res) => {
  res.send("Home route accessed");
});

app.post("/gemini", async (req, res) => {
  try {
    const { countWord } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    if (!words[countWord]) {
      return res.status(400).json({ error: "Invalid word index" });
    }

    const jpWord = words[countWord].word;

    const prompt = `Using the Japanese word "${jpWord}", generate:
                        1. A short and simple Japanese sentence using that word.
                        2. Romaji for the sentence.
                        3. The English translation of the sentence.
                        4. A brief explanation that is easy to understand for that sentence.
                        Only return the following. No unnecessary text. 
                        Format:
                        Japanese: ...
                        Romaji: ...
                        English: ...
                        Explanation: ...`;

    const result = await model.generateContent(prompt);

    const rawText =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = rawText.trim().replace(/\n{2,}/g, "\n");
    res.json({ result: cleaned });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong!",
      error2: error.response?.data || error.message,
    });
  }
});

async function startServer() {
  await getWords();

  // Check if words are populated
  if (words.length === 0) {
    console.log("Error :", error);
    console.log("No words found in the database.");
  } else {
    console.log("Advanced Learning Words :", words);
    console.log("First word :", words[0]);
  }

  app.listen(port, () => console.log("Listening on port 3000"));
}

startServer();
