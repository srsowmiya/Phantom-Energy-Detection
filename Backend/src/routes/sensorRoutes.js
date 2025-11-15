const express = require('express');
const router = express.Router();
const {
  createSensorReading
} = require('../controllers/sensorController');

// Sensor endpoint for Python scripts (no auth middleware, token in body)
router.post('/reading', createSensorReading);

module.exports = router;

