import express from 'express';
import { machineTracker } from '../machineTracker.js';

const router = express.Router();

// GET /api/tracker/status - Get current machine activity & tracking state
router.get('/status', (req, res) => {
  try {
    const status = machineTracker.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tracker/toggle - Toggle tracking on / off
router.post('/toggle', (req, res) => {
  try {
    const isTracking = machineTracker.toggle();
    res.json({
      success: true,
      isTracking,
      status: machineTracker.getStatus()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tracker/start - Start machine tracking
router.post('/start', (req, res) => {
  try {
    machineTracker.start();
    res.json({
      success: true,
      isTracking: true,
      status: machineTracker.getStatus()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tracker/stop - Stop machine tracking
router.post('/stop', (req, res) => {
  try {
    machineTracker.stop();
    res.json({
      success: true,
      isTracking: false,
      status: machineTracker.getStatus()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tracker/poll-now - Force an immediate machine probe
router.post('/poll-now', async (req, res) => {
  try {
    const status = await machineTracker.poll();
    res.json({
      success: true,
      data: status
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
