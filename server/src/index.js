// server/src/index.js
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (same level as package.json)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import v1Router from './routes/v1.js';

const app = express();

// ---- Trust proxy (Render/Heroku/Reverse proxy) ---------------
app.set('trust proxy', 1);

// ---- CORS ---------------------------------------------------
const allowlist = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptionsDelegate = (req, cb) => {
  const origin = req.header('Origin');

  // Cho phép Postman/cURL (không có Origin)
  if (!origin) {
    return cb(null, {
      origin: true,
      methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
      allowedHeaders: ['Content-Type','Authorization'],
      credentials: false,
      optionsSuccessStatus: 204,
    });
  }

  const ok = allowlist.includes(origin);

  if (!ok && process.env.NODE_ENV !== 'production') {
    console.warn('[CORS] Blocked origin:', origin);
  }

  cb(null, {
    origin: ok, // false => cors tự chặn, không cần throw Error
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: false,
    optionsSuccessStatus: 204,
  });
};

app.options('*', cors(corsOptionsDelegate));
app.use(cors(corsOptionsDelegate));

// ---- Security & performance (prod only) ---------------------
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
  app.use(compression());
}

// ---- Body parsers -------------------------------------------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- Health & API routes ------------------------------------
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/v1/health', (_req, res) => res.json({ ok: true })); // alias cho CI/monitor
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
    console.log(
      'CORS allowlist:',
      allowlist.length ? allowlist.join(', ') : '* (development fallback)'
    );
  }
});
