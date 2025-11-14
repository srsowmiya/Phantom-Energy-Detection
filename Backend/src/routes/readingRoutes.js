const express = require('express');
const router = express.Router();
const {
  createReading,
  getReadingsByPort,
  getReading
} = require('../controllers/readingController');
const auth = require('../middleware/auth');
const deviceAuth = require('../middleware/deviceAuth');

// Create reading - requires device authentication
router.post('/', deviceAuth, createReading);

// Get readings - requires user authentication
router.get('/port/:portId', auth, getReadingsByPort);
router.get('/:id', auth, getReading);

module.exports = router;

