const PowerReading = require('../models/PowerReading');
const Port = require('../models/Port');
const PhantomEvent = require('../models/PhantomEvent');
const SwitchAction = require('../models/SwitchAction');
const Notification = require('../models/Notification');
const Device = require('../models/Device');
const DeviceAuthToken = require('../models/DeviceAuthToken');
const { Op } = require('sequelize');

// @desc    Create sensor reading from Python script (simplified endpoint)
// @route   POST /api/sensor/reading
// @access  Device Token (in body or header)
const createSensorReading = async (req, res) => {
  try {
    const { 
      deviceToken,      // Device token for authentication
      portId,           // Port ID (UUID)
      voltage,          // Voltage in volts
      current,          // Current in amps
      power             // Power in watts (optional, can be calculated)
    } = req.body;

    // Validation
    if (!deviceToken) {
      return res.status(401).json({
        success: false,
        message: 'Device token is required'
      });
    }

    if (!portId || voltage === undefined || current === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide portId, voltage, and current'
      });
    }

    if (voltage < 0 || current < 0) {
      return res.status(400).json({
        success: false,
        message: 'Voltage and current must be non-negative'
      });
    }

    // Calculate power if not provided
    const calculatedPower = power !== undefined ? power : (voltage * current);

    if (calculatedPower < 0) {
      return res.status(400).json({
        success: false,
        message: 'Power must be non-negative'
      });
    }

    // Authenticate device using token
    const deviceTokenRecord = await DeviceAuthToken.findOne({
      where: { token: deviceToken },
      include: [{
        model: Device,
        as: 'deviceData'
      }]
    });

    if (!deviceTokenRecord || !deviceTokenRecord.deviceData) {
      return res.status(401).json({
        success: false,
        message: 'Invalid device token. Access denied.'
      });
    }

    const device = deviceTokenRecord.deviceData;

    // Update device last_seen
    await Device.update(
      { last_seen: new Date(), is_online: true },
      { where: { id: device.id } }
    );

    // Verify port exists and belongs to the device's user
    const port = await Port.findByPk(portId);
    
    if (!port) {
      return res.status(404).json({
        success: false,
        message: 'Port not found'
      });
    }

    // Verify port belongs to device's user
    if (port.userId !== device.userId) {
      return res.status(403).json({
        success: false,
        message: 'Port does not belong to this device\'s user'
      });
    }

    // Create power reading
    const reading = await PowerReading.create({
      portId: portId,
      voltage,
      current,
      power: calculatedPower,
      timestamp: new Date()
    });

    // Phantom Detection Logic (same as original)
    let phantomEvent = null;
    let switchAction = null;

    if (calculatedPower < port.threshold && calculatedPower > 0) {
      // Phantom energy detected
      
      // Update port status to phantom
      await port.update({ status: 'phantom' });

      // Determine action taken
      let actionTaken = 'notified';
      
      if (port.autoCut) {
        // Auto cut enabled - turn off the port
        const previousState = port.status !== 'off';
        
        await port.update({ status: 'off' });
        actionTaken = 'auto_cut';

        // Create switch action
        switchAction = await SwitchAction.create({
          portId: portId,
          previous_state: previousState,
          new_state: false,
          triggered_by: 'system',
          timestamp: new Date()
        });
      }

      // Create phantom event
      phantomEvent = await PhantomEvent.create({
        portId: portId,
        detected_power: calculatedPower,
        detected_at: new Date(),
        action_taken: actionTaken,
        savedUnits: 0, // Calculate based on time and power difference
        savedMoney: 0 // Calculate based on saved units and rate
      });

      // Create notification for user
      await Notification.create({
        userId: port.userId,
        portId: portId,
        message: `Phantom energy detected on ${port.name} (${calculatedPower.toFixed(2)}W). ${port.autoCut ? 'Port automatically turned off.' : 'Please check manually.'}`,
        is_read: false
      });
    } else if (calculatedPower >= port.threshold && port.status === 'phantom') {
      // Phantom energy resolved - power is back to normal
      await port.update({ status: 'active' });
      
      // Update phantom event if exists
      const latestPhantomEvent = await PhantomEvent.findOne({
        where: {
          portId: portId,
          resolved_at: null
        },
        order: [['detected_at', 'DESC']]
      });

      if (latestPhantomEvent) {
        const resolutionTime = new Date();
        const durationHours = (resolutionTime - latestPhantomEvent.detected_at) / (1000 * 60 * 60);
        
        // Calculate saved units (assume average phantom power was detected_power)
        const savedUnits = latestPhantomEvent.detected_power * durationHours / 1000; // Convert to kWh
        const savedMoney = savedUnits * 10; // Assume $10 per kWh (adjust as needed)

        await latestPhantomEvent.update({
          resolved_at: resolutionTime,
          savedUnits,
          savedMoney
        });
      }
    } else if (calculatedPower >= port.threshold && port.status === 'off') {
      // Power is normal, set to active if was off
      await port.update({ status: 'active' });
    } else if (calculatedPower === 0 && port.status !== 'off') {
      // No power, set to off
      await port.update({ status: 'off' });
    }

    res.status(201).json({
      success: true,
      message: 'Sensor reading created successfully',
      data: {
        reading: {
          id: reading.id,
          voltage: reading.voltage,
          current: reading.current,
          power: reading.power,
          timestamp: reading.timestamp
        },
        phantomDetected: phantomEvent !== null,
        portStatus: port.status
      }
    });
  } catch (error) {
    console.error('Create sensor reading error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during sensor reading creation'
    });
  }
};

module.exports = {
  createSensorReading
};

