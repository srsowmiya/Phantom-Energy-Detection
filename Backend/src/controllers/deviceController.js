const Device = require('../models/Device');
const DeviceAuthToken = require('../models/DeviceAuthToken');
const { Op } = require('sequelize');

// @desc    Create a new device
// @route   POST /api/devices
// @access  Private
const createDevice = async (req, res) => {
  try {
    const { name, location, mac_address } = req.body;
    const userId = req.userId;

    // Validation
    if (!name || !location || !mac_address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, location, and mac_address'
      });
    }

    // Check if MAC address already exists
    const existingDevice = await Device.findOne({ where: { mac_address } });
    
    if (existingDevice) {
      return res.status(400).json({
        success: false,
        message: 'Device with this MAC address already exists'
      });
    }

    // Create device
    const device = await Device.create({
      userId,
      name,
      location,
      mac_address,
      last_seen: new Date(),
      is_online: true
    });

    // Create device auth token
    const authToken = await DeviceAuthToken.create({
      deviceId: device.id
    });

    res.status(201).json({
      success: true,
      message: 'Device created successfully',
      data: {
        device,
        authToken: authToken.token
      }
    });
  } catch (error) {
    console.error('Create device error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'MAC address already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during device creation'
    });
  }
};

// @desc    Get all devices for current user
// @route   GET /api/devices
// @access  Private
const getDevices = async (req, res) => {
  try {
    const userId = req.userId;

    const devices = await Device.findAll({
      where: { userId },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: devices.length,
      data: { devices }
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single device
// @route   GET /api/devices/:id
// @access  Private
const getDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const device = await Device.findOne({
      where: { id, userId }
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { device }
    });
  } catch (error) {
    console.error('Get device error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update device
// @route   PUT /api/devices/:id
// @access  Private
const updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { name, location, mac_address } = req.body;

    const device = await Device.findOne({
      where: { id, userId }
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Update fields
    const updateData = {};
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (mac_address) {
      // Check if MAC address already exists for another device
      const existingDevice = await Device.findOne({
        where: { mac_address, id: { [Op.ne]: id } }
      });
      
      if (existingDevice) {
        return res.status(400).json({
          success: false,
          message: 'MAC address already exists'
        });
      }
      
      updateData.mac_address = mac_address;
    }

    await device.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Device updated successfully',
      data: { device }
    });
  } catch (error) {
    console.error('Update device error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'MAC address already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during update'
    });
  }
};

// @desc    Delete device
// @route   DELETE /api/devices/:id
// @access  Private
const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const device = await Device.findOne({
      where: { id, userId }
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Delete associated auth tokens
    await DeviceAuthToken.destroy({ where: { deviceId: id } });

    // Delete device
    await device.destroy();

    res.status(200).json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during deletion'
    });
  }
};

// @desc    Generate new device auth token
// @route   POST /api/devices/:id/token
// @access  Private
const generateDeviceToken = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const device = await Device.findOne({
      where: { id, userId }
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Create new auth token
    const authToken = await DeviceAuthToken.create({
      deviceId: device.id
    });

    res.status(201).json({
      success: true,
      message: 'Device token generated successfully',
      data: {
        token: authToken.token
      }
    });
  } catch (error) {
    console.error('Generate device token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token generation'
    });
  }
};

module.exports = {
  createDevice,
  getDevices,
  getDevice,
  updateDevice,
  deleteDevice,
  generateDeviceToken
};

