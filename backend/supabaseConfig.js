import dotenv from 'dotenv'
dotenv.config()

export const supabaseUrl = process.env.SUPABASE_URL;
export const supabaseKey = process.env.SUPABASE_KEY;