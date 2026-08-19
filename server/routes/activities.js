import { Router } from 'express';
import { db, CATEGORIES } from '../db.js';

const router = Router();

// GET /api/activities - list activities with filtering
router.get('/', async (req, res) => {
  try {
    const { start, end, category, search, limit } = req.query;
    const activities = await db.getAll({ start, end, category, search, limit });
    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve activities' });
  }
});

// GET /api/activities/categories - get category metadata
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    data: CATEGORIES
  });
});

// GET /api/activities/:id - get single activity
router.get('/:id', async (req, res) => {
  try {
    const activity = await db.getById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }
    res.json({ success: true, data: activity });
  } catch (err) {
    console.error('Error fetching activity:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve activity' });
  }
});

// POST /api/activities - create new activity
router.post('/', async (req, res) => {
  try {
    const { title, appName, category, duration, startTime, endTime, notes } = req.body;
    
    if (!title && !appName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Either activity title or app name is required' 
      });
    }

    const activity = await db.create({
      title,
      appName,
      category,
      duration,
      startTime,
      endTime,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Activity recorded successfully',
      data: activity
    });
  } catch (err) {
    console.error('Error creating activity:', err);
    res.status(500).json({ success: false, error: 'Failed to create activity' });
  }
});

// PUT /api/activities/:id - update existing activity
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }
    res.json({
      success: true,
      message: 'Activity updated successfully',
      data: updated
    });
  } catch (err) {
    console.error('Error updating activity:', err);
    res.status(500).json({ success: false, error: 'Failed to update activity' });
  }
});

// DELETE /api/activities/:id - delete activity
router.delete('/:id', async (req, res) => {
  try {
    const success = await db.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }
    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting activity:', err);
    res.status(500).json({ success: false, error: 'Failed to delete activity' });
  }
});

// POST /api/activities/seed - regenerate demo data
router.post('/seed', async (req, res) => {
  try {
    const seeded = await db.seedSampleData();
    res.json({
      success: true,
      message: `Successfully seeded ${seeded.length} sample activities`,
      count: seeded.length
    });
  } catch (err) {
    console.error('Error seeding data:', err);
    res.status(500).json({ success: false, error: 'Failed to seed sample data' });
  }
});

// DELETE /api/activities/clear/all - clear all activities
router.delete('/clear/all', async (req, res) => {
  try {
    await db.clearAll();
    res.json({
      success: true,
      message: 'All activities cleared successfully'
    });
  } catch (err) {
    console.error('Error clearing data:', err);
    res.status(500).json({ success: false, error: 'Failed to clear activities' });
  }
});

export default router;
