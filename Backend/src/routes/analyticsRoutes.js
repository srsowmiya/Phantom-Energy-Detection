const express = require('express');
const router = express.Router();
const {
  getAnalytics
} = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

// All analytics routes require authentication
router.use(auth);

router.get('/', getAnalytics);

module.exports = router;

