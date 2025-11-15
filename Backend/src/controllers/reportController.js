const PhantomEvent = require('../models/PhantomEvent');
const PowerReading = require('../models/PowerReading');
const Port = require('../models/Port');
const Device = require('../models/Device');
const { Op } = require('sequelize');

// @desc    Generate monthly report
// @route   GET /api/reports/monthly
// @access  Private
const generateMonthlyReport = async (req, res) => {
  try {
    const userId = req.userId;
    const { year, month } = req.query;

    // Validate year and month
    const reportYear = year ? parseInt(year) : new Date().getFullYear();
    const reportMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    if (reportMonth < 1 || reportMonth > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month. Must be between 1 and 12'
      });
    }

    // Calculate date range for the month
    const startDate = new Date(reportYear, reportMonth - 1, 1);
    const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59, 999);

    // Get user's ports
    const ports = await Port.findAll({
      where: { userId },
      attributes: ['id', 'name', 'type', 'threshold']
    });

    const portIds = ports.map(port => port.id);

    // Get phantom events for the month
    const phantomEvents = await PhantomEvent.findAll({
      where: {
        portId: { [Op.in]: portIds },
        detected_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: Port,
        as: 'portData',
        attributes: ['id', 'name', 'type']
      }],
      order: [['detected_at', 'ASC']]
    });

    // Calculate statistics
    const totalPhantomEvents = phantomEvents.length;
    const resolvedEvents = phantomEvents.filter(e => e.resolved_at).length;
    const autoCutEvents = phantomEvents.filter(e => e.action_taken === 'auto_cut').length;
    
    const totalSavedUnits = phantomEvents.reduce((sum, e) => sum + (e.savedUnits || 0), 0);
    const totalSavedMoney = phantomEvents.reduce((sum, e) => sum + (e.savedMoney || 0), 0);
    const avgPhantomPower = phantomEvents.length > 0
      ? phantomEvents.reduce((sum, e) => sum + e.detected_power, 0) / phantomEvents.length
      : 0;

    // Get power readings for the month to calculate total consumption
    const powerReadings = await PowerReading.findAll({
      where: {
        portId: { [Op.in]: portIds },
        timestamp: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: ['power', 'timestamp'],
      order: [['timestamp', 'ASC']]
    });

    // Calculate average power consumption
    const totalPower = powerReadings.reduce((sum, r) => sum + r.power, 0);
    const avgPowerConsumption = powerReadings.length > 0 ? totalPower / powerReadings.length : 0;

    // Get phantom events by port
    const eventsByPort = {};
    phantomEvents.forEach(event => {
      const portName = event.portData ? event.portData.name : 'Unknown';
      if (!eventsByPort[portName]) {
        eventsByPort[portName] = {
          portName,
          count: 0,
          totalSavedUnits: 0,
          totalSavedMoney: 0,
          avgPhantomPower: 0
        };
      }
      eventsByPort[portName].count++;
      eventsByPort[portName].totalSavedUnits += event.savedUnits || 0;
      eventsByPort[portName].totalSavedMoney += event.savedMoney || 0;
    });

    // Calculate averages for each port
    Object.values(eventsByPort).forEach(portData => {
      portData.avgPhantomPower = phantomEvents
        .filter(e => (e.portData ? e.portData.name : 'Unknown') === portData.portName)
        .reduce((sum, e) => sum + e.detected_power, 0) / portData.count;
    });

    // Get device statistics
    const devices = await Device.findAll({
      where: { userId },
      attributes: ['id', 'name', 'location', 'is_online']
    });

    // Daily breakdown
    const dailyBreakdown = {};
    phantomEvents.forEach(event => {
      const day = new Date(event.detected_at).getDate();
      if (!dailyBreakdown[day]) {
        dailyBreakdown[day] = {
          day,
          events: 0,
          savedUnits: 0,
          savedMoney: 0
        };
      }
      dailyBreakdown[day].events++;
      dailyBreakdown[day].savedUnits += event.savedUnits || 0;
      dailyBreakdown[day].savedMoney += event.savedMoney || 0;
    });

    const report = {
      period: {
        year: reportYear,
        month: reportMonth,
        monthName: new Date(reportYear, reportMonth - 1).toLocaleString('default', { month: 'long' }),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      summary: {
        totalPhantomEvents,
        resolvedEvents,
        unresolvedEvents: totalPhantomEvents - resolvedEvents,
        autoCutEvents,
        totalSavedUnits: parseFloat(totalSavedUnits.toFixed(2)),
        totalSavedMoney: parseFloat(totalSavedMoney.toFixed(2)),
        avgPhantomPower: parseFloat(avgPhantomPower.toFixed(2)),
        avgPowerConsumption: parseFloat(avgPowerConsumption.toFixed(2))
      },
      devices: {
        total: devices.length,
        online: devices.filter(d => d.is_online).length,
        offline: devices.filter(d => !d.is_online).length
      },
      ports: {
        total: ports.length,
        breakdown: Object.values(eventsByPort)
      },
      dailyBreakdown: Object.values(dailyBreakdown).sort((a, b) => a.day - b.day),
      phantomEvents: phantomEvents.slice(0, 50) // Include first 50 events for details
    };

    res.status(200).json({
      success: true,
      message: 'Monthly report generated successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Generate monthly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during report generation'
    });
  }
};

module.exports = {
  generateMonthlyReport
};


