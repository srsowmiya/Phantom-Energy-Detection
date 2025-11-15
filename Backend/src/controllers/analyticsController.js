const PhantomEvent = require('../models/PhantomEvent');
const PowerReading = require('../models/PowerReading');
const Port = require('../models/Port');
const Device = require('../models/Device');
const Schedule = require('../models/Schedule');
const { Op } = require('sequelize');

// @desc    Get analytics data
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const { days = 30, startDate, endDate } = req.query;

    // Calculate date range
    let dateStart, dateEnd;
    if (startDate && endDate) {
      dateStart = new Date(startDate);
      dateEnd = new Date(endDate);
    } else {
      dateEnd = new Date();
      dateStart = new Date();
      dateStart.setDate(dateStart.getDate() - parseInt(days));
    }

    // Get user's ports and devices
    const ports = await Port.findAll({
      where: { userId },
      attributes: ['id', 'name', 'type']
    });
    const portIds = ports.map(p => p.id);

    const devices = await Device.findAll({
      where: { userId },
      attributes: ['id', 'name', 'location', 'is_online']
    });

    // Get phantom events in date range
    const phantomEvents = await PhantomEvent.findAll({
      where: {
        portId: { [Op.in]: portIds },
        detected_at: {
          [Op.between]: [dateStart, dateEnd]
        }
      },
      include: [{
        model: Port,
        as: 'portData',
        attributes: ['id', 'name', 'type']
      }],
      order: [['detected_at', 'ASC']]
    });

    // Get power readings in date range
    const powerReadings = await PowerReading.findAll({
      where: {
        portId: { [Op.in]: portIds },
        timestamp: {
          [Op.between]: [dateStart, dateEnd]
        }
      },
      attributes: ['power', 'timestamp', 'portId'],
      order: [['timestamp', 'ASC']]
    });

    // Calculate daily statistics
    const dailyStats = {};
    const powerByDay = {};
    
    powerReadings.forEach(reading => {
      const date = new Date(reading.timestamp).toISOString().split('T')[0];
      if (!powerByDay[date]) {
        powerByDay[date] = { total: 0, count: 0, readings: [] };
      }
      powerByDay[date].total += reading.power;
      powerByDay[date].count += 1;
      powerByDay[date].readings.push(reading.power);
    });

    // Calculate averages and totals for each day
    Object.keys(powerByDay).forEach(date => {
      const dayData = powerByDay[date];
      dailyStats[date] = {
        date,
        avgPower: dayData.count > 0 ? dayData.total / dayData.count : 0,
        maxPower: Math.max(...dayData.readings, 0),
        minPower: Math.min(...dayData.readings, 0),
        totalReadings: dayData.count
      };
    });

    // Get phantom events by port
    const eventsByPort = {};
    phantomEvents.forEach(event => {
      const portId = event.portId;
      if (!eventsByPort[portId]) {
        eventsByPort[portId] = {
          portId,
          portName: event.portData ? event.portData.name : 'Unknown',
          events: 0,
          totalSavedUnits: 0,
          totalSavedMoney: 0,
          avgPhantomPower: 0
        };
      }
      eventsByPort[portId].events++;
      eventsByPort[portId].totalSavedUnits += event.savedUnits || 0;
      eventsByPort[portId].totalSavedMoney += event.savedMoney || 0;
      eventsByPort[portId].avgPhantomPower += event.detected_power;
    });

    // Calculate averages
    Object.keys(eventsByPort).forEach(portId => {
      const portData = eventsByPort[portId];
      if (portData.events > 0) {
        portData.avgPhantomPower = portData.avgPhantomPower / portData.events;
      }
    });

    // Get phantom events by day
    const phantomByDay = {};
    phantomEvents.forEach(event => {
      const date = new Date(event.detected_at).toISOString().split('T')[0];
      if (!phantomByDay[date]) {
        phantomByDay[date] = { count: 0, totalPower: 0, totalSaved: 0 };
      }
      phantomByDay[date].count++;
      phantomByDay[date].totalPower += event.detected_power;
      phantomByDay[date].totalSaved += event.savedMoney || 0;
    });

    // Convert to arrays for charts
    const dailyPowerData = Object.values(dailyStats).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    const phantomEventsByDay = Object.keys(phantomByDay).map(date => ({
      date,
      count: phantomByDay[date].count,
      avgPower: phantomByDay[date].count > 0 ? phantomByDay[date].totalPower / phantomByDay[date].count : 0,
      saved: phantomByDay[date].totalSaved
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    const portBreakdown = Object.values(eventsByPort);

    // Calculate summary statistics
    const totalPhantomEvents = phantomEvents.length;
    const totalSavedUnits = phantomEvents.reduce((sum, e) => sum + (e.savedUnits || 0), 0);
    const totalSavedMoney = phantomEvents.reduce((sum, e) => sum + (e.savedMoney || 0), 0);
    const avgPower = powerReadings.length > 0
      ? powerReadings.reduce((sum, r) => sum + r.power, 0) / powerReadings.length
      : 0;

    // Power consumption by port
    const powerByPort = {};
    powerReadings.forEach(reading => {
      if (!powerByPort[reading.portId]) {
        powerByPort[reading.portId] = { total: 0, count: 0, portId: reading.portId };
      }
      powerByPort[reading.portId].total += reading.power;
      powerByPort[reading.portId].count += 1;
    });

    const portPowerConsumption = Object.values(powerByPort).map(data => {
      const port = ports.find(p => p.id === data.portId);
      return {
        portId: data.portId,
        portName: port ? port.name : 'Unknown',
        avgPower: data.count > 0 ? data.total / data.count : 0,
        totalPower: data.total
      };
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPhantomEvents,
          totalSavedUnits: parseFloat(totalSavedUnits.toFixed(2)),
          totalSavedMoney: parseFloat(totalSavedMoney.toFixed(2)),
          avgPower: parseFloat(avgPower.toFixed(2)),
          totalDevices: devices.length,
          onlineDevices: devices.filter(d => d.is_online).length,
          totalPorts: ports.length
        },
        dailyPowerData,
        phantomEventsByDay,
        portBreakdown,
        portPowerConsumption,
        dateRange: {
          start: dateStart.toISOString(),
          end: dateEnd.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during analytics generation'
    });
  }
};

module.exports = {
  getAnalytics
};

