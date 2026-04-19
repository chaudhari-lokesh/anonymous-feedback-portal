const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: [true, 'Email already exists'],
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["student", "teacher", "hod", "principal"],
        default: "student"
    },
    department: {
        type: String,
        default: "CSE"
    }
}, { timestamps: true });

const StudentModel = mongoose.model('Student', StudentSchema);

module.exports = StudentModel; 