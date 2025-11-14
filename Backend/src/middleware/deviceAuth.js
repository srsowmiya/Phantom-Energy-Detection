const DeviceAuthToken = require('../models/DeviceAuthToken');
const Device = require('../models/Device');

const deviceAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization') || req.header('X-Device-Token');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No device token provided. Access denied.'
      });
    }

    let token = authHeader;
    
    // Handle Bearer token format
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Find device token
    const deviceToken = await DeviceAuthToken.findOne({
      where: { token },
      include: [{
        model: Device,
        as: 'deviceData'
      }]
    });

    if (!deviceToken || !deviceToken.deviceData) {
      return res.status(401).json({
        success: false,
        message: 'Invalid device token. Access denied.'
      });
    }

    // Add device to request object
    req.device = deviceToken.deviceData;
    req.deviceId = deviceToken.deviceData.id;
    req.deviceToken = deviceToken;

    // Update device last_seen
    await Device.update(
      { last_seen: new Date(), is_online: true },
      { where: { id: req.deviceId } }
    );

    next();
  } catch (error) {
    console.error('Device auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during device authentication.'
    });
  }
};

module.exports = deviceAuth;

