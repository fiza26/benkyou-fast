import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import supabase from './supabase.js'
import { GoogleGenerativeAI } from '@google/generative-ai'

const port = 3000
const app = express()
app.use(cors())
app.use(express.json())

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY)

let words = []
let error = null

async function getWords() {
    const { data, error: dbError } = await supabase.from('advanced_learning').select()

    if (data) {
        words = data
    } else {
        error = dbError
        console.log('Error :', error)
    }
}

app.post('/', async (req, res) => {
    res.send('Home route accessed')
})

app.post('/gemini', async (req, res) => {
    try {
        const { countWord } = req.body
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

        // Check if the countWord index is valid
        if (!words[countWord]) {
            return res.status(400).json({ error: 'Invalid word index' })
        }

        const prompt = `Make a simple sentence with the word ${words[Number(countWord)].word}, remember it's japanese language`
        const result = await model.generateContent(prompt)
        const data = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text

        res.json({ result: data })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Something went wrong!', error2: error.response?.data || error.message })
    }
})

// app.post('/gemini-image', async (req, res) => {
//     try {
//         const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

//         const prompt = `A photo realistice image of fluffy white cat`

//         const result = await model.generateContent([prompt])
//         const response = await result.response

//         if (response.candidates && response.candidates.length > 0) {
//             const imagePart = response.candidates[0].content.parts.find(
//               (part) => part.inlineData && part.inlineData.mimeType.startsWith("image/")
//             );

//             if (imagePart) {
//               const base64Image = imagePart.inlineData.data;
//               const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${base64Image}`;

//               // You can now display this imageUrl in an <img> tag in your HTML
//               console.log("Generated Image URL:", imageUrl);

//               // Example of creating an image element in the DOM (for browser environments)
//               if (typeof document !== 'undefined') {
//                 const imgElement = document.createElement('img');
//                 imgElement.src = imageUrl;
//                 document.body.appendChild(imgElement);
//               }

//             } else {
//               console.log("No image data found in the response.");
//             }
//           } else {
//             console.log("No candidates found in the response.");
//           }
//         } catch (error) {
//             console.error(error)
//             res.status(500).json({ error: 'Something went wrong!' })
//         }
//     })

async function generateImage() {
    try {
        const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-002' })

        const prompt = `A photo realistice image of fluffy white cat`

        // The method for generating images might be different for dedicated models
        const result = await model.generateContent({
            prompt: prompt, // Or potentially just passing the string directly
            // You might have configuration options here, like number of images, quality, etc.
        });

        const response = result.response

        if (response && response.generatedImages && response.generatedImages.length > 0) {
            const base64Image = response.generatedImages[0].data; // Adjust based on actual response structure
            const mimeType = response.generatedImages[0].mimeType || 'image/png'; // Or get from response
      
            const imageUrl = `data:${mimeType};base64,${base64Image}`;
            console.log("Generated Image URL:", imageUrl);
      
            if (typeof document !== 'undefined') {
              const imgElement = document.createElement('img');
              imgElement.src = imageUrl;
              document.body.appendChild(imgElement);
            }
          } else {
            console.log("No image data found in the response.");
            console.log("Full Response:", response); // Log the full response to inspect its structure
          }
    } catch (error) {
        console.error(error)
        // res.status(500).json({ error: 'Something went wrong!' })
    }
}

async function startServer() {
    await getWords()
    await generateImage()

    // Check if words are populated
    if (words.length === 0) {
        console.log('Error :', error)
        console.log('No words found in the database.')
    } else {
        console.log('Advanced Learning Words :', words)
        console.log('First word :', words[0])
    }

    app.listen(port, () => console.log('Listening on port 3000'))
}

startServer()
