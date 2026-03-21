import 'dotenv/config'

export const env = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT,
    CLIENT_URL: process.env.CLIENT_URL,
    JWT_SECRET: process.env.JWT_SECRET
} 