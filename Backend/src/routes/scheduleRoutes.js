const express = require('express');
const router = express.Router();
const {
  createSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule
} = require('../controllers/scheduleController');
const auth = require('../middleware/auth');

// All schedule routes require authentication
router.use(auth);

router.post('/', createSchedule);
router.get('/', getSchedules);
router.get('/:id', getSchedule);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);

module.exports = router;

