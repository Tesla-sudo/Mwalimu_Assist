// backend/routes/student.js
import express from 'express';
import { generateStudentRecommendation } from '../utils/geminiStudentRec.js';
import Student from '../models/Student.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET personalized AI recommendation for a student
router.post('/recommendation', auth, async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await Student.findById(studentId);
    if (!student || student.teacher.toString() !== req.user.id) {
      return res.status(404).json({ msg: "Student not found" });
    }

    const result = await generateStudentRecommendation({
      name: student.name,
      grade: student.class,
      subject: student.subject,
      performance: student.performance || "unknown"
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ recommendations: result.recommendation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;