import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import activitiesRouter from './routes/activities.js';
import statsRouter from './routes/stats.js';
import trackerRouter from './routes/tracker.js';
import iconsRouter from './routes/icons.js';
import { machineTracker } from './machineTracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/activities', activitiesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/tracker', trackerRouter);
app.use('/api/icons', iconsRouter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const activities = await db.getAll();
    res.json({
      status: 'ok',
      service: 'Activity Tracker API',
      uptime: process.uptime(),
      activitiesCount: activities.length,
      isMachineTracking: machineTracker.isTracking,
      currentActivity: machineTracker.getStatus().currentActivity,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Serve frontend in production
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      // In dev mode when client/dist isn't built yet
      res.status(200).send('Activity Tracker API server is running. Launch Vite client in dev mode.');
    }
  });
});

// Initialize database and start server
async function startServer() {
  await db.init();
  machineTracker.start();
  app.listen(PORT, () => {
    console.log(`\n⚡ Activity Tracker Server running at http://localhost:${PORT}`);
    console.log(`   API endpoints ready at http://localhost:${PORT}/api/activities`);
    console.log(`   Machine Tracker live at http://localhost:${PORT}/api/tracker/status\n`);
  });
}

startServer();
