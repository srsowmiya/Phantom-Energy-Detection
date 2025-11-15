const express = require('express');
const router = express.Router();
const {
  getAnalytics
} = require('../controllers/analyticsController');
const {
  getInsights
} = require('../controllers/insightsController');
const auth = require('../middleware/auth');

// All analytics routes require authentication
router.use(auth);

router.get('/', getAnalytics);
router.post('/insights', getInsights);

module.exports = router;

