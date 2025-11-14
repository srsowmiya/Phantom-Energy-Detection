const Port = require('../models/Port');
const { Op } = require('sequelize');

// @desc    Create a new port
// @route   POST /api/ports
// @access  Private
const createPort = async (req, res) => {
  try {
    const { name, type, threshold, autoCut } = req.body;
    const userId = req.userId;

    // Validation
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and type'
      });
    }

    // Create port
    const port = await Port.create({
      userId,
      name,
      type,
      threshold: threshold || 5.0,
      status: 'off',
      autoCut: autoCut !== undefined ? autoCut : true
    });

    res.status(201).json({
      success: true,
      message: 'Port created successfully',
      data: { port }
    });
  } catch (error) {
    console.error('Create port error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during port creation'
    });
  }
};

// @desc    Get all ports for current user
// @route   GET /api/ports
// @access  Private
const getPorts = async (req, res) => {
  try {
    const userId = req.userId;

    const ports = await Port.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: ports.length,
      data: { ports }
    });
  } catch (error) {
    console.error('Get ports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single port
// @route   GET /api/ports/:id
// @access  Private
const getPort = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const port = await Port.findOne({
      where: { id: id, userId }
    });

    if (!port) {
      return res.status(404).json({
        success: false,
        message: 'Port not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { port }
    });
  } catch (error) {
    console.error('Get port error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update port
// @route   PUT /api/ports/:id
// @access  Private
const updatePort = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { name, type, threshold, status, autoCut } = req.body;

    const port = await Port.findOne({
      where: { id: id, userId }
    });

    if (!port) {
      return res.status(404).json({
        success: false,
        message: 'Port not found'
      });
    }

    // Update fields
    const updateData = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (threshold !== undefined) updateData.threshold = threshold;
    if (status) {
      if (!['active', 'phantom', 'off'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be active, phantom, or off'
        });
      }
      updateData.status = status;
    }
    if (autoCut !== undefined) updateData.autoCut = autoCut;

    await port.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Port updated successfully',
      data: { port }
    });
  } catch (error) {
    console.error('Update port error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during update'
    });
  }
};

// @desc    Delete port
// @route   DELETE /api/ports/:id
// @access  Private
const deletePort = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const port = await Port.findOne({
      where: { id: id, userId }
    });

    if (!port) {
      return res.status(404).json({
        success: false,
        message: 'Port not found'
      });
    }

    await port.destroy();

    res.status(200).json({
      success: true,
      message: 'Port deleted successfully'
    });
  } catch (error) {
    console.error('Delete port error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during deletion'
    });
  }
};

module.exports = {
  createPort,
  getPorts,
  getPort,
  updatePort,
  deletePort
};

