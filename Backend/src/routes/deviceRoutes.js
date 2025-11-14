const express = require('express');
const router = express.Router();
const {
  createDevice,
  getDevices,
  getDevice,
  updateDevice,
  deleteDevice,
  generateDeviceToken
} = require('../controllers/deviceController');
const auth = require('../middleware/auth');

// All device routes require authentication
router.use(auth);

router.post('/', createDevice);
router.get('/', getDevices);
router.get('/:id', getDevice);
router.put('/:id', updateDevice);
router.delete('/:id', deleteDevice);
router.post('/:id/token', generateDeviceToken);

module.exports = router;

