import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/stats/summary - get aggregated metrics and charts data
router.get('/summary', async (req, res) => {
  try {
    const { start, end } = req.query;
    const summary = await db.getSummary({ start, end });
    res.json({
      success: true,
      data: summary
    });
  } catch (err) {
    console.error('Error computing summary stats:', err);
    res.status(500).json({ success: false, error: 'Failed to compute summary stats' });
  }
});

export default router;
