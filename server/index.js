require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const StudentModel = require('./models/Student');
const FeedbackModel = require('./models/Feedback');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(express.json());
app.use(cors());

const MongoDB_uri = process.env.MONGODB_URI || "mongodb://localhost:27017/Students";
const PORT = process.env.PORT || 3001;

mongoose.connect(MongoDB_uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await StudentModel.findOne({email: email});
        
        if(!student) {
            return res.status(400).json({ message: "User not registered" });
        }
        
        if(student.password !== password) {
            return res.status(400).json({ message: "Password is incorrect" });
        }
        
        res.json({ message: "Success", user: { id: student._id, email: student.email, name: student.name } });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/register', async (req, res) => {
    try {
        const student = await StudentModel.create(req.body);
        res.status(201).json({ message: "Registration successful", user: { id: student._id, email: student.email, name: student.name } });
    } catch(err) {
        res.status(400).json({ error: err.message });
    }
});


// Use memory storage for Render (serverless environment)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST feedback with optional image (use this route — replaces existing /feedback handler)
app.post('/feedback', upload.single('image'), async (req, res) => {
  try {
    const body = req.body || {};
    const topic = body.topic || '';
    const category = body.category || '';
    const priority = body.priority || 'Low';
    const message = body.message || body.msg || '';

    if (!message) return res.status(400).json({ error: 'message required' });

    // Note: File uploads stored in memory for serverless; image not saved to DB

    const fb = await FeedbackModel.create({ topic, category, priority, message });
    return res.status(201).json(fb);
  } catch (err) {
    console.error('Error saving feedback:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

// get all feedbacks
app.get('/feedbacks', async (req, res) => {
  try {
    const list = await FeedbackModel.find().sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (err) {
    console.error('Error loading feedbacks:', err);
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error', message: err.message });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

