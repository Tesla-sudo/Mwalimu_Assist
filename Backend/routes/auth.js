const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, getProfile, addStudent, getStudents, generateContent, getRecommendations } = require('../controllers/authController');
const auth = require('../middleware/auth');

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

module.exports = router;