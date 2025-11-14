const Schedule = require('../models/Schedule');
const Port = require('../models/Port');

// @desc    Create a new schedule
// @route   POST /api/schedules
// @access  Private
const createSchedule = async (req, res) => {
  try {
    const { port, start_time, end_time, days, is_active } = req.body;
    const userId = req.userId;

    // Validation
    if (!port || !start_time || !end_time || !days) {
      return res.status(400).json({
        success: false,
        message: 'Please provide port, start_time, end_time, and days'
      });
    }

    // Verify port belongs to user
    const portExists = await Port.findOne({
      where: { id: port, userId }
    });

    if (!portExists) {
      return res.status(404).json({
        success: false,
        message: 'Port not found'
      });
    }

    // Create schedule
    const schedule = await Schedule.create({
      portId: port,
      start_time,
      end_time,
      days,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: { schedule }
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during schedule creation'
    });
  }
};

// @desc    Get all schedules for current user
// @route   GET /api/schedules
// @access  Private
const getSchedules = async (req, res) => {
  try {
    const userId = req.userId;
    const { port } = req.query;

    const whereClause = {};
    
    if (port) {
      // Verify port belongs to user
      const portExists = await Port.findOne({
        where: { id: port, userId }
      });

      if (!portExists) {
        return res.status(404).json({
          success: false,
          message: 'Port not found'
        });
      }
      
      whereClause.portId = port;
    }

    const schedules = await Schedule.findAll({
      where: whereClause,
      include: [{
        model: Port,
        as: 'portData',
        where: { userId },
        required: true,
        attributes: ['id', 'name', 'type']
      }],
      order: [['start_time', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: { schedules }
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single schedule
// @route   GET /api/schedules/:id
// @access  Private
const getSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const schedule = await Schedule.findOne({
      where: { id },
      include: [{
        model: Port,
        as: 'portData',
        where: { userId },
        required: true,
        attributes: ['id', 'name', 'type']
      }]
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { schedule }
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private
const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { start_time, end_time, days, is_active } = req.body;

    const schedule = await Schedule.findOne({
      where: { id },
      include: [{
        model: Port,
        as: 'portData',
        where: { userId },
        required: true
      }]
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Update fields
    const updateData = {};
    if (start_time) updateData.start_time = start_time;
    if (end_time) updateData.end_time = end_time;
    if (days) updateData.days = days;
    if (is_active !== undefined) updateData.is_active = is_active;

    await schedule.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: { schedule }
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    
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

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private
const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const schedule = await Schedule.findOne({
      where: { id },
      include: [{
        model: Port,
        as: 'portData',
        where: { userId },
        required: true
      }]
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    await schedule.destroy();

    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during deletion'
    });
  }
};

module.exports = {
  createSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule
};

