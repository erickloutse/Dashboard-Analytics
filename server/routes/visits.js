import express from 'express';
import Visit from '../models/Visit.js';
import Page from '../models/Page.js';
import { io } from '../index.js';

const router = express.Router();

// Get all visits with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      startDate, 
      endDate, 
      country, 
      device, 
      browser,
      path
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (startDate && endDate) {
      filter.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (country) filter.country = country;
    if (device) filter.device = device;
    if (browser) filter.browser = browser;
    if (path) filter.page = path;
    
    // Execute query with pagination
    const visits = await Visit.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Get total count for pagination
    const total = await Visit.countDocuments(filter);
    
    res.status(200).json({
      visits,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Record a new visit
router.post('/', async (req, res) => {
  try {
    const { 
      page: pagePath, 
      duration, 
      country, 
      device, 
      browser, 
      referrer, 
      userAgent,
      sessionId 
    } = req.body;
    
    // Get client IP
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Create new visit
    const newVisit = new Visit({
      page: pagePath,
      duration,
      country,
      device,
      browser,
      referrer,
      userAgent,
      ip,
      sessionId
    });
    
    await newVisit.save();
    
    // Update page statistics
    await updatePageStats(pagePath, duration, sessionId);
    
    // Emit real-time update via Socket.io
    io.emit('newVisit', newVisit);
    
    res.status(201).json(newVisit);
  } catch (error) {
    console.error('Error recording visit:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to update page statistics
async function updatePageStats(pagePath, duration, sessionId) {
  try {
    // Find or create page
    let page = await Page.findOne({ path: pagePath });
    
    if (!page) {
      page = new Page({ path: pagePath });
    }
    
    // Increment views
    page.views += 1;
    
    // Check if this is a unique visitor (simplified)
    const existingVisits = await Visit.countDocuments({ 
      page: pagePath, 
      sessionId 
    });
    
    if (existingVisits <= 1) {
      page.uniqueVisitors += 1;
    }
    
    // Update average time on page
    if (duration > 0) {
      const totalTime = page.avgTimeOnPage * (page.views - 1) + duration;
      page.avgTimeOnPage = totalTime / page.views;
    }
    
    // Update bounce rate (simplified)
    const bounceCount = await Visit.countDocuments({
      sessionId,
      $or: [
        { duration: { $lt: 10 } },  // Less than 10 seconds
        { duration: { $exists: false } }
      ]
    });
    
    const totalSessions = await Visit.distinct('sessionId', { page: pagePath }).length;
    page.bounceRate = (bounceCount / totalSessions) * 100;
    
    page.lastUpdated = new Date();
    await page.save();
    
    // Emit real-time update via Socket.io
    io.emit('pageUpdate', page);
    
    return page;
  } catch (error) {
    console.error('Error updating page stats:', error);
    throw error;
  }
}

// Get visit details by ID
router.get('/:id', async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    
    res.status(200).json(visit);
  } catch (error) {
    console.error('Error fetching visit:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;