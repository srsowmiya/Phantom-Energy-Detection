const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateUser
} = require('../controllers/userController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getMe);
router.put('/:id', auth, updateUser);

module.exports = router;

