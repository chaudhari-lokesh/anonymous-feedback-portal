const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  topic: { type: String },
  category: { type: String },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
  message: { type: String, required: true },
  image: { type: String },
  status: { 
    type: String, 
    enum: ["Pending", "In Progress", "Resolved"], 
    default: "Pending" 
  },
  department: { 
    type: String, 
    default: "CSE"
  },
  adminNotes: { type: String, default: "" },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  }
}, { timestamps: true });

const FeedbackModel = mongoose.model('Feedback', FeedbackSchema);

module.exports = FeedbackModel;