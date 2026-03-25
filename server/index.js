import path from 'path'
import express from 'express';
import cors from 'cors'

import authRoutes from './routes/auth.js';
import applicationRoutes from './routes/applications.js';
import aiRoutes from './routes/ai.js';
import { env } from './lib/env.js'
import { connectDb } from './lib/db.js  '

const app = express();
const __dirname = path.resolve()
const PORT = env.PORT || 3000;

// middleware
app.use(express.json());

app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/ai', aiRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')))

  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
  })
}

// global error handler (simple)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

// connect to MongoDB and start server
const connect = async () => {
  await connectDb()
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

connect().catch(error => {
  console.error('Failed to start server: ', error)
  process.exit(1)
})
