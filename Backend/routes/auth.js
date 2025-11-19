import express from 'express';
const router = express.Router();
import { register, login, getMe, updateProfile, getProfile, addStudent, getStudents, generateContent, getRecommendations } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);

// New routes
router.put('/profile', auth, updateProfile);
router.get('/profile', auth, getProfile);
router.post('/students', auth, addStudent);
router.get('/students', auth, getStudents);
router.post('/ai/generate', auth, generateContent);
router.post('/ai/recommend', auth, getRecommendations);

export default router;

//  generateContent, getRecommendations