import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

const port = 3000
const app = express()
app.use(cors())
app.use(express.json())

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY)

app.post('/gemini', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

        
    } catch {

    }
})