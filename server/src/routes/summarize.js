// server/src/routes/summarize.js
import { Router } from "express";
import aiRateLimit from "../middleware/aiRateLimit.js";
import { summarizeService } from "../lib/summarize.js";

const router = Router();

/**
 * POST /api/v1/summarize
 * Body: { text, lang?, mode?, title?, topic? }
 */
router.post("/summarize", aiRateLimit, async (req, res) => {
  try {
    const { text, lang, mode, title, topic } = req.body || {};
    const data = await summarizeService({ text, lang, mode, title, topic });
    res.json(data);
  } catch (err) {
    const status = err.status || 500;
    const code = err.code || "SERVER_ERROR";
    const message =
      err.message || (status === 500 ? "Unexpected server error" : "Error");

    if (status >= 500) console.error(err); // log server errors
    res.status(status).json({ error: code, message });
  }
});

export default router;
