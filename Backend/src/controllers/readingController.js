const PowerReading = require('../models/PowerReading');
const Port = require('../models/Port');
const PhantomEvent = require('../models/PhantomEvent');
const SwitchAction = require('../models/SwitchAction');
const Notification = require('../models/Notification');
const Device = require('../models/Device');
const { Op } = require('sequelize');

// @desc    Create a power reading and detect phantom energy
// @route   POST /api/readings
// @access  Device Auth
const createReading = async (req, res) => {
  try {
    const { portId, voltage, current, power } = req.body;

    // Validation
    if (!portId || voltage === undefined || current === undefined || power === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide portId, voltage, current, and power'
      });
    }

    if (voltage < 0 || current < 0 || power < 0) {
      return res.status(400).json({
        success: false,
        message: 'Voltage, current, and power must be non-negative'
      });
    }

    // Get device from request (set by deviceAuth middleware)
    const device = req.device;
    
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
      power,
      timestamp: new Date()
    });

    // Phantom Detection Logic
    let phantomEvent = null;
    let switchAction = null;

    if (power < port.threshold && power > 0) {
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
        detected_power: power,
        detected_at: new Date(),
        action_taken: actionTaken,
        savedUnits: 0, // Calculate based on time and power difference
        savedMoney: 0 // Calculate based on saved units and rate
      });

      // Create notification for user
      await Notification.create({
        userId: port.userId,
        portId: portId,
        message: `Phantom energy detected on ${port.name} (${power}W). ${port.autoCut ? 'Port automatically turned off.' : 'Please check manually.'}`,
        is_read: false
      });
    } else if (power >= port.threshold && port.status === 'phantom') {
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
    } else if (power >= port.threshold && port.status === 'off') {
      // Power is normal, set to active if was off
      await port.update({ status: 'active' });
    } else if (power === 0 && port.status !== 'off') {
      // No power, set to off
      await port.update({ status: 'off' });
    }

    res.status(201).json({
      success: true,
      message: 'Power reading created successfully',
      data: {
        reading,
        phantomDetected: phantomEvent !== null,
        phantomEvent,
        switchAction
      }
    });
  } catch (error) {
    console.error('Create reading error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during reading creation'
    });
  }
};

// @desc    Get all power readings for a port
// @route   GET /api/readings/port/:portId
// @access  Private
const getReadingsByPort = async (req, res) => {
  try {
    const { portId } = req.params;
    const userId = req.userId;

    // Verify port belongs to user
    const port = await Port.findOne({
      where: { id: portId, userId }
    });

    if (!port) {
      return res.status(404).json({
        success: false,
        message: 'Port not found'
      });
    }

    const { limit = 100, offset = 0, startDate, endDate } = req.query;

    const whereClause = { portId: portId };
    
    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp[Op.gte] = new Date(startDate);
      if (endDate) whereClause.timestamp[Op.lte] = new Date(endDate);
    }

    const readings = await PowerReading.findAll({
      where: whereClause,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      count: readings.length,
      data: { readings }
    });
  } catch (error) {
    console.error('Get readings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single power reading
// @route   GET /api/readings/:id
// @access  Private
const getReading = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const reading = await PowerReading.findByPk(id, {
      include: [{
        model: Port,
        as: 'portData',
        where: { userId },
        required: true
      }]
    });

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { reading }
    });
  } catch (error) {
    console.error('Get reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createReading,
  getReadingsByPort,
  getReading
};

