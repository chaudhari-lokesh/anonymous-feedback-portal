require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const path = require('path');
const StudentModel = require(path.join(__dirname, '..', 'models', 'Student'));

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Students';

async function main() {
  const email = String(process.env.TEACHER_EMAIL || 'teacher@school.edu').trim();
  const password = process.env.TEACHER_PASSWORD || 'teacher123';
  const name = process.env.TEACHER_NAME || 'Teacher';
  const role = process.env.TEACHER_ROLE || 'teacher';
  const department = process.env.TEACHER_DEPARTMENT || 'CSE';

  if (!['teacher', 'hod', 'principal'].includes(role)) {
    console.error('TEACHER_ROLE must be teacher, hod, or principal');
    process.exit(1);
  }

  await mongoose.connect(uri);

  let user = await StudentModel.findOne({ email });
  const hash = await bcryptjs.hash(password, 10);

  if (user) {
    user.role = role;
    user.department = department;
    user.password = hash;
    await user.save();
    console.log('Updated:', email);
  } else {
    await StudentModel.create({ name, email, password: hash, role, department });
    console.log('Created:', email);
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
