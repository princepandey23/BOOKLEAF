const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Book = require('../models/Book');
const { protect } = require('../middleware/authMiddleware');
const { classifyTicket, generateDraftResponse } = require('../config/gemini');

// POST /api/tickets - Create ticket (author)
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'author') return res.status(403).json({ message: 'Authors only' });
  const { bookId, subject, description } = req.body;
  if (!subject || !description) return res.status(400).json({ message: 'Subject and description required' });
  try {
    let book = null;
    let bookTitle = 'General / Account Level';
    if (bookId && bookId !== 'general') {
      book = await Book.findOne({ _id: bookId, author: req.user._id });
      if (book) bookTitle = book.title;
    }

    // AI classification (non-blocking)
    const aiResult = await classifyTicket(subject, description);

    const ticket = new Ticket({
      author: req.user._id,
      book: book ? book._id : null,
      bookTitle,
      subject,
      description,
      category: aiResult.category,
      aiCategory: aiResult.category,
      priority: aiResult.priority,
      aiPriority: aiResult.priority,
      messages: []
    });
    await ticket.save();

    const populated = await Ticket.findById(ticket._id).populate('author', 'name email').populate('book', 'title');

    // Emit to admin room
    const io = req.app.get('io');
    io.to('admin_room').emit('new_ticket', populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/tickets/my - Author's tickets
router.get('/my', protect, async (req, res) => {
  if (req.user.role !== 'author') return res.status(403).json({ message: 'Authors only' });
  try {
    const tickets = await Ticket.find({ author: req.user._id })
      .populate('author', 'name email')
      .populate('book', 'title')
      .sort({ updatedAt: -1 });
    // Filter internal messages from author view
    const filtered = tickets.map(t => {
      const obj = t.toObject();
      obj.messages = obj.messages.filter(m => !m.isInternal);
      return obj;
    });
    res.json(filtered);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/tickets/:id - Single ticket
router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('author', 'name email city')
      .populate('book', 'title mrp total_copies_sold total_royalty_earned royalty_paid royalty_pending last_royalty_payout_date available_on status')
      .populate('assignedTo', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    // Authors can only see their own
    if (req.user.role === 'author' && ticket.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const obj = ticket.toObject();
    if (req.user.role === 'author') {
      obj.messages = obj.messages.filter(m => !m.isInternal);
    }
    res.json(obj);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
