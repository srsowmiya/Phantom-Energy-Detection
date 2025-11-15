const express = require('express');
const router = express.Router();
const {
  generateMonthlyReport
} = require('../controllers/reportController');
const auth = require('../middleware/auth');

// All report routes require authentication
router.use(auth);

router.get('/monthly', generateMonthlyReport);

module.exports = router;

