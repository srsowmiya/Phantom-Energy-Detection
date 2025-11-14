const express = require('express');
const router = express.Router();
const {
  createPort,
  getPorts,
  getPort,
  updatePort,
  deletePort
} = require('../controllers/portController');
const {
  switchPort,
  getSwitchActions
} = require('../controllers/switchController');
const auth = require('../middleware/auth');

// All port routes require authentication
router.use(auth);

router.post('/', createPort);
router.get('/', getPorts);
router.get('/:id', getPort);
router.put('/:id', updatePort);
router.delete('/:id', deletePort);

// Switch control routes
router.post('/:id/switch', switchPort);
router.get('/:id/switch-actions', getSwitchActions);

module.exports = router;

