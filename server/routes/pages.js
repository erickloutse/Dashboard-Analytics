import express from 'express';
import Page from '../models/Page.js';

const router = express.Router();

// Get all pages with sorting and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      sortBy = 'views', 
      order = 'desc', 
      limit = 20,
      search
    } = req.query;
    
    // Build query
    let query = Page.find();
    
    // Add search filter if provided
    if (search) {
      query = query.find({
        $or: [
          { path: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } }
        ]
      });
    }
    
    // Add sorting
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;
    
    // Execute query
    const pages = await query
      .sort(sortOptions)
      .limit(parseInt(limit));
    
    res.status(200).json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific page by path
router.get('/:path', async (req, res) => {
  try {
    const path = decodeURIComponent(req.params.path);
    const page = await Page.findOne({ path });
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.status(200).json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update page title
router.patch('/:id', async (req, res) => {
  try {
    const { title } = req.body;
    
    const page = await Page.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true }
    );
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.status(200).json(page);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;