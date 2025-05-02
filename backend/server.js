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

        const prompt = `Make a simple sentence with the word ${words[countWord].word}`
        const result = await model.generateContent(prompt)
        const data = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text

        res.json({ result: data })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Something went wrong!', error2: error.response?.data || error.message })
    }
})

async function startServer() {
    await getWords()

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
