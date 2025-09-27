// server/src/index.js
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (same level as package.json)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express from 'express';
import cors from 'cors';
import v1Router from './routes/v1.js';

const app = express();

// ---- CORS ---------------------------------------------------
const origins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: origins.length ? origins : true, // allow all if not configured (dev fallback)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ---- Body parsers -------------------------------------------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- Health & API routes ------------------------------------
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/v1', v1Router);

// ---- Not found + error handler ------------------------------
app.use((req, res, _next) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ---- Start server -------------------------------------------
const port = process.env.PORT || 5051;
app.listen(port, () => {
  console.log(`API listening on :${port}`);

  if (process.env.NODE_ENV !== 'production') {
    if (origins.length) {
      console.log('CORS allowed origins:', origins.join(', '));
    } else {
      console.log('CORS allowed origins: * (development fallback)');
    }
  }
});
