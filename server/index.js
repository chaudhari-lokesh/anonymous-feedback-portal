require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const StudentModel = require('./models/Student');
const FeedbackModel = require('./models/Feedback');

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.get('/health', (_req, res) => res.json({ ok: true }));

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const STAFF_ROLES = ['teacher', 'hod', 'principal'];

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || !STAFF_ROLES.includes(req.user.role)) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  next();
};

const MongoDB_uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Students';
const PORT = process.env.PORT || 3001;

mongoose.connect(MongoDB_uri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const student = await StudentModel.findOne({ email });
    if (!student) {
      return res.status(400).json({ message: 'User not registered' });
    }

    const ok = await bcryptjs.compare(password, student.password);
    if (!ok) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    const token = jwt.sign(
      {
        id: student._id,
        email: student.email,
        name: student.name,
        role: student.role,
        department: student.department,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Success',
      token,
      user: {
        id: student._id,
        email: student.email,
        name: student.name,
        role: student.role,
        department: student.department,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const student = await StudentModel.create({ name, email, password: hashedPassword });

    res.status(201).json({
      message: 'Registration successful',
      user: { id: student._id, email: student.email, name: student.name },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const upload = multer({ storage: multer.memoryStorage() });

app.post('/feedback', upload.single('image'), async (req, res) => {
  try {
    const body = req.body || {};
    const topic = body.topic || '';
    const category = body.category || '';
    const priority = body.priority || 'Low';
    const message = body.message || body.msg || '';
    if (!message) return res.status(400).json({ error: 'message required' });

    const fb = await FeedbackModel.create({ topic, category, priority, message });
    return res.status(201).json(fb);
  } catch (err) {
    console.error('Error saving feedback:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/feedbacks', async (req, res) => {
  try {
    const list = await FeedbackModel.find().sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (err) {
    console.error('Error loading feedbacks:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/admin/feedbacks', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status, priority, department, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (department) filter.department = department;
    if (category) filter.category = category;

    const feedbacks = await FeedbackModel.find(filter)
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email role')
      .lean();

    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/admin/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { department } = req.query;
    const filter = department ? { department } : {};

    const total = await FeedbackModel.countDocuments(filter);
    const pending = await FeedbackModel.countDocuments({ ...filter, status: 'Pending' });
    const inProgress = await FeedbackModel.countDocuments({ ...filter, status: 'In Progress' });
    const resolved = await FeedbackModel.countDocuments({ ...filter, status: 'Resolved' });
    const highPriority = await FeedbackModel.countDocuments({ ...filter, priority: 'High' });

    const byCategory = await FeedbackModel.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const byStatus = await FeedbackModel.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      total,
      pending,
      inProgress,
      resolved,
      highPriority,
      byCategory,
      byStatus,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/admin/feedbacks/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, assignedTo } = req.body;

    if (status && !['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const update = {};
    if (status !== undefined) update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    if (assignedTo !== undefined) update.assignedTo = assignedTo;

    const updated = await FeedbackModel.findByIdAndUpdate(id, { $set: update }, { new: true }).populate(
      'assignedTo',
      'name email role'
    );

    if (!updated) return res.status(404).json({ error: 'Feedback not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/admin/feedbacks/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deleted = await FeedbackModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Feedback not found' });
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/admin/export', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { department } = req.query;
    const filter = department ? { department } : {};
    const feedbacks = await FeedbackModel.find(filter).lean();

    const headers = ['ID', 'Topic', 'Category', 'Priority', 'Message', 'Status', 'Department', 'Date'];
    let csv = headers.join(',') + '\n';
    feedbacks.forEach((fb) => {
      const row = [
        fb._id,
        `"${(fb.topic || '').replace(/"/g, '""')}"`,
        fb.category || '',
        fb.priority || '',
        `"${(fb.message || '').replace(/"/g, '""')}"`,
        fb.status || 'Pending',
        fb.department || '',
        fb.createdAt || '',
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="feedbacks.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error', message: err.message });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
