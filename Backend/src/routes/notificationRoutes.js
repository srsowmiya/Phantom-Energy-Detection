const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// All notification routes require authentication
router.use(auth);

router.get('/', getNotifications);
router.get('/:id', getNotification);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;

