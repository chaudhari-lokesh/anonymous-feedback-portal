const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
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

// 🔐 CONFIG
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const STAFF_ROLES = ['teacher', 'hod', 'principal'];

// 🔐 MIDDLEWARES
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

// 📦 DB
const MongoDB_uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Students';
const MongoDB_dbName = process.env.MONGODB_DB_NAME || 'StudentsPortal';
const PORT = process.env.PORT || 3001;

mongoose.connect(MongoDB_uri, {
  dbName: MongoDB_dbName,
  serverSelectionTimeoutMS: 10000,
})
  .then(() => console.log(`MongoDB connected to database "${mongoose.connection.db.databaseName}"`))
  .catch((err) => console.error('MongoDB error:', err));

// 🔑 LOGIN
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

// 📝 REGISTER
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
    const student = await StudentModel.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: student._id,
        email: student.email,
        name: student.name,
      },
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📤 FEEDBACK
const upload = multer({ storage: multer.memoryStorage() });

app.post('/feedback', upload.single('image'), async (req, res) => {
  try {
    const { topic = '', category = '', priority = 'Low', message = '' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message required' });
    }

    const fb = await FeedbackModel.create({
      topic,
      category,
      priority,
      message,
    });

    res.status(201).json(fb);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/feedbacks', async (req, res) => {
  try {
    const list = await FeedbackModel.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔐 ADMIN ROUTES
app.get('/admin/feedbacks', verifyToken, verifyAdmin, async (req, res) => {
  const feedbacks = await FeedbackModel.find().sort({ createdAt: -1 });
  res.json(feedbacks);
});

app.put('/admin/feedbacks/:id', verifyToken, verifyAdmin, async (req, res) => {
  const updated = await FeedbackModel.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );

  res.json(updated);
});


// Admin stats endpoint for dashboard
app.get('/admin/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const total = await FeedbackModel.countDocuments();
    const pending = await FeedbackModel.countDocuments({ status: 'Pending' });
    const inProgress = await FeedbackModel.countDocuments({ status: 'In Progress' });
    const resolved = await FeedbackModel.countDocuments({ status: 'Resolved' });
    const highPriority = await FeedbackModel.countDocuments({ priority: 'High' });
    // By category aggregation
    const byCategoryAgg = await FeedbackModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const byCategory = byCategoryAgg.map(cat => ({
      category: cat._id || 'Uncategorized',
      count: cat.count
    }));
    res.json({ total, pending, inProgress, resolved, highPriority, byCategory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚀 START
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});