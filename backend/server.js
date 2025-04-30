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

let data = ''

// async function gemini() {
//     try {
//         const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

//         const prompt = `Make a simple sentence with the word ${words[0].word}`

//         const result = await model.generateContent(prompt)

//         console.log('Gemini full response:', JSON.stringify(result, null, 2))

//         data = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text

//         console.log('Generated sentence:', data)
//     } catch (error) {
//         console.log('Error:', error)
//     }
// }

app.post('/gemini', async(req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
        const prompt = `Make a simple sentence with the word ${words[0].word}`
        const result = await model.generateContent(prompt)

        data = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text

        res.json({ result: data })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Something went wrong' })
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

    // await gemini()

    app.listen(port, () => console.log('Listening on port 3000'))
}

startServer()
