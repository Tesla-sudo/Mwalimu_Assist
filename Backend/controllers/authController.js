const User = require('../models/User');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// === AUTH FUNCTIONS (from original) ===
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// === NEW TEACHER FUNCTIONS ===
const updateProfile = async (req, res) => {
  const { classes, subjects } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.classes = classes || user.classes;
    user.subjects = subjects || user.subjects;
    await user.save();

    res.json({ msg: 'Profile updated', user: { id: user.id, classes: user.classes, subjects: user.subjects } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const addStudent = async (req, res) => {
  const { name, class: studentClass, subject, performance } = req.body;
  try {
    let student = await Student.findOne({ name, class: studentClass, subject, teacher: req.user.id });
    if (student) {
      student.performance = performance !== undefined ? performance : student.performance;
      await student.save();
      return res.json({ msg: 'Student updated', student });
    }

    student = new Student({ name, class: studentClass, subject, performance, teacher: req.user.id });
    await student.save();
    res.status(201).json({ msg: 'Student added', student });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await Student.find({ teacher: req.user.id });
    res.json(students);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const generateContent = async (req, res) => {
  const { type, class: studentClass, subject } = req.body;
  try {
    let content = '';
    if (type === 'workplan') {
      content = `CBC Workplan for Grade ${studentClass} ${subject}:\n\nObjective: Develop problem-solving competency.\nActivities:\n- Group discussion (30min)\n- Practical demo (45min)\nAssessment: Rubric-based observation.`;
    } else if (type === 'questions') {
      content = `5 CBC Questions for Grade ${studentClass} ${subject}:\n1. Apply concept X to real-life (competency: critical thinking)\n2. Design a model... (competency: creativity)\n...`;
    }
    res.json({ content });
  } catch (err) {
    res.status(500).json({ msg: 'AI generation error' });
  }
};

const getRecommendations = async (req, res) => {
  const { studentId } = req.body;
  try {
    const student = await Student.findById(studentId);
    if (!student || student.teacher.toString() !== req.user.id.toString()) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    let recs = '';
    if (student.performance < 70) {
      recs = `Remedial for ${student.name}: Use interactive videos on ${student.subject} basics. Focus: Communication competency.`;
    } else {
      recs = `Advanced for ${student.name}: Challenge questions on ${student.subject}. Focus: Creativity competency.`;
    }
    res.json({ recommendations: recs });
  } catch (err) {
    res.status(500).json({ msg: 'Recommendation error' });
  }
};

// === EXPORT ALL FUNCTIONS ===
module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  getProfile,
  addStudent,
  getStudents,
  generateContent,
  getRecommendations
};