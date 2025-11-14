const Port = require('../models/Port');
const SwitchAction = require('../models/SwitchAction');

// @desc    Control port switch (turn on/off)
// @route   POST /api/ports/:id/switch
// @access  Private
const switchPort = async (req, res) => {
  try {
    const { id } = req.params;
    const { state } = req.body;
    const userId = req.userId;

    // Validation
    if (typeof state !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'State must be a boolean (true or false)'
      });
    }

    // Find port
    const port = await Port.findOne({
      where: { id: id, userId }
    });

    if (!port) {
      return res.status(404).json({
        success: false,
        message: 'Port not found'
      });
    }

    // Determine previous and new status
    const previousState = port.status !== 'off';
    const previousStatus = port.status;
    
    // Update port status based on state
    let newStatus;
    if (state) {
      // Turn on - set to active
      newStatus = 'active';
    } else {
      // Turn off
      newStatus = 'off';
    }

    await port.update({ status: newStatus });

    // Create switch action
    const switchAction = await SwitchAction.create({
      portId: id,
      previous_state: previousState,
      new_state: state,
      triggered_by: 'user',
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      message: `Port ${state ? 'turned on' : 'turned off'} successfully`,
      data: {
        port: {
          id: port.id,
          name: port.name,
          status: newStatus,
          previousStatus
        },
        switchAction
      }
    });
  } catch (error) {
    console.error('Switch port error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during switch operation'
    });
  }
};

// @desc    Get switch actions for a port
// @route   GET /api/ports/:id/switch-actions
// @access  Private
const getSwitchActions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify port belongs to user
    const port = await Port.findOne({
      where: { id: id, userId }
    });

    if (!port) {
      return res.status(404).json({
        success: false,
        message: 'Port not found'
      });
    }

    const { limit = 100, offset = 0 } = req.query;

    const switchActions = await SwitchAction.findAll({
      where: { portId: id },
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      count: switchActions.length,
      data: { switchActions }
    });
  } catch (error) {
    console.error('Get switch actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  switchPort,
  getSwitchActions
};

