const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Book = require('../models/Book');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { generateDraftResponse } = require('../config/gemini');

// All admin routes are protected
router.use(protect, adminOnly);

// GET /api/admin/tickets - All tickets with filters
router.get('/tickets', async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) filter.subject = { $regex: search, $options: 'i' };

    const tickets = await Ticket.find(filter)
      .populate('author', 'name email city')
      .populate('book', 'title')
      .populate('assignedTo', 'name email')
      .sort({ priority: 1, createdAt: 1 });

    // Sort by priority weight
    const priorityWeight = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    tickets.sort((a, b) => {
      const pw = priorityWeight[a.priority] - priorityWeight[b.priority];
      if (pw !== 0) return pw;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/tickets/:id/draft - Generate AI draft
router.get('/tickets/:id/draft', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('author', 'name email')
      .populate('book');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (ticket.aiDraftGenerated && ticket.aiDraftResponse) {
      return res.json({ draft: ticket.aiDraftResponse, cached: true });
    }

    const draft = await generateDraftResponse(ticket, ticket.author.name, ticket.book);
    if (draft) {
      ticket.aiDraftResponse = draft;
      ticket.aiDraftGenerated = true;
      await ticket.save();
      res.json({ draft, cached: false });
    } else {
      res.json({ draft: null, error: 'AI unavailable. Please write response manually.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/tickets/:id/respond - Send response to author
router.post('/tickets/:id/respond', async (req, res) => {
  const { content, isInternal } = req.body;
  if (!content) return res.status(400).json({ message: 'Content required' });
  try {
    const ticket = await Ticket.findById(req.params.id).populate('author', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const message = {
      sender: 'admin',
      senderId: req.user._id,
      senderName: req.user.name,
      content,
      isInternal: !!isInternal
    };
    ticket.messages.push(message);
    if (!isInternal && ticket.status === 'Open') ticket.status = 'In Progress';
    await ticket.save();

    const io = req.app.get('io');
    if (!isInternal) {
      io.to(`ticket_${ticket._id}`).emit('ticket_update', { ticketId: ticket._id, message, status: ticket.status });
      io.to(`author_${ticket.author._id}`).emit('ticket_response', { ticketId: ticket._id, ticketNumber: ticket.ticketId });
    }
    io.to('admin_room').emit('ticket_updated', { ticketId: ticket._id, status: ticket.status });

    res.json({ message: 'Response sent', ticket });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/tickets/:id - Update ticket (status, category, priority, assign)
router.patch('/tickets/:id', async (req, res) => {
  const { status, category, priority, assignedTo } = req.body;
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (status) ticket.status = status;
    if (category) ticket.category = category;
    if (priority) ticket.priority = priority;
    if (assignedTo === 'me') ticket.assignedTo = req.user._id;
    else if (assignedTo === null) ticket.assignedTo = null;

    await ticket.save();
    const populated = await Ticket.findById(ticket._id)
      .populate('author', 'name email')
      .populate('assignedTo', 'name email');

    const io = req.app.get('io');
    io.to('admin_room').emit('ticket_updated', populated);
    io.to(`ticket_${ticket._id}`).emit('ticket_update', { ticketId: ticket._id, status: ticket.status });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/stats - Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: 'Open' });
    const inProgress = await Ticket.countDocuments({ status: 'In Progress' });
    const resolved = await Ticket.countDocuments({ status: 'Resolved' });
    const critical = await Ticket.countDocuments({ priority: 'Critical' });
    const totalAuthors = await User.countDocuments({ role: 'author' });
    const totalBooks = await Book.countDocuments();
    res.json({ total, open, inProgress, resolved, critical, totalAuthors, totalBooks });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/authors - List all authors
router.get('/authors', async (req, res) => {
  try {
    const authors = await User.find({ role: 'author' }).select('-password').sort({ name: 1 });
    res.json(authors);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
