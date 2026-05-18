const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { protect } = require('../middleware/authMiddleware');

// GET /api/books/my - Author's own books
router.get('/my', protect, async (req, res) => {
  try {
    const books = await Book.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(books);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
