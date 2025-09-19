import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import v1Router from './routes/v1.js';

const app = express();

// CORS
const origins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: origins.length ? origins : true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

app.use(express.json());

// Routes
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/v1', v1Router);

const port = process.env.PORT || 5051;
app.listen(port, () => console.log(`API on :${port}`));
