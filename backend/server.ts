import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import { dbManager } from './db/database';
import { runSeed } from './db/seed';
import cors from 'cors';

app.use(cors({
  origin: [
    'https://your-vercel-app-name.vercel.app', // Replace with your actual Vercel domain
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes
app.use('/api', apiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'TravelSaathi AI API',
    tagline: 'Discover India. Plan Smarter. Travel Better.',
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  try {
    console.log('🚀 Initializing TravelSaathi AI database...');
    await dbManager.init();
    await runSeed(false);

    app.listen(PORT, () => {
      console.log(`✨ TravelSaathi AI Backend Server running at http://localhost:${PORT}`);
      console.log(`👉 API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
