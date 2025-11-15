const PhantomEvent = require('../models/PhantomEvent');
const PowerReading = require('../models/PowerReading');
const Port = require('../models/Port');
const Device = require('../models/Device');
const { Op } = require('sequelize');

// Initialize OpenAI (supports OpenAI API)
let OpenAI;
try {
  OpenAI = require('openai');
} catch (error) {
  console.warn('OpenAI package not installed. LLM features will be disabled.');
}

// @desc    Get AI-powered insights from analytics data
// @route   POST /api/analytics/insights
// @access  Private
const getInsights = async (req, res) => {
  try {
    const userId = req.userId;
    const { days = 30, startDate, endDate } = req.body;

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
      attributes: ['id', 'name', 'type', 'status', 'threshold']
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
      order: [['detected_at', 'DESC']]
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

    // Calculate statistics
    const totalPhantomEvents = phantomEvents.length;
    const resolvedEvents = phantomEvents.filter(e => e.resolved_at).length;
    const totalSavedUnits = phantomEvents.reduce((sum, e) => sum + (e.savedUnits || 0), 0);
    const totalSavedMoney = phantomEvents.reduce((sum, e) => sum + (e.savedMoney || 0), 0);
    const avgPower = powerReadings.length > 0
      ? powerReadings.reduce((sum, r) => sum + r.power, 0) / powerReadings.length
      : 0;

    // Get phantom events by port
    const eventsByPort = {};
    phantomEvents.forEach(event => {
      const portName = event.portData ? event.portData.name : 'Unknown';
      if (!eventsByPort[portName]) {
        eventsByPort[portName] = {
          portName,
          count: 0,
          totalSavedUnits: 0,
          totalSavedMoney: 0
        };
      }
      eventsByPort[portName].count++;
      eventsByPort[portName].totalSavedUnits += event.savedUnits || 0;
      eventsByPort[portName].totalSavedMoney += event.savedMoney || 0;
    });

    // Prepare data for LLM
    const analyticsSummary = {
      period: {
        start: dateStart.toISOString().split('T')[0],
        end: dateEnd.toISOString().split('T')[0],
        days: Math.ceil((dateEnd - dateStart) / (1000 * 60 * 60 * 24))
      },
      summary: {
        totalPhantomEvents,
        resolvedEvents,
        unresolvedEvents: totalPhantomEvents - resolvedEvents,
        totalSavedUnits: parseFloat(totalSavedUnits.toFixed(2)),
        totalSavedMoney: parseFloat(totalSavedMoney.toFixed(2)),
        avgPower: parseFloat(avgPower.toFixed(2)),
        totalDevices: devices.length,
        onlineDevices: devices.filter(d => d.is_online).length,
        totalPorts: ports.length,
        activePorts: ports.filter(p => p.status === 'active').length,
        phantomPorts: ports.filter(p => p.status === 'phantom').length,
        offPorts: ports.filter(p => p.status === 'off').length
      },
      portBreakdown: Object.values(eventsByPort).slice(0, 10), // Top 10 ports
      topPhantomPorts: Object.values(eventsByPort)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    };

    // Generate LLM insights if API key is configured
    let aiInsights = null;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (openaiApiKey && OpenAI) {
      try {
        const openai = new OpenAI({
          apiKey: openaiApiKey
        });

        const prompt = `You are an energy efficiency expert analyzing phantom energy consumption data. 

Analyze the following energy monitoring data and provide:
1. A brief summary of the user's energy consumption patterns
2. Key insights about phantom energy detection
3. Specific recommendations for energy savings
4. Identify any concerning patterns or trends
5. Provide actionable advice in a friendly, conversational tone

Data Summary:
- Period: ${analyticsSummary.period.days} days (${analyticsSummary.period.start} to ${analyticsSummary.period.end})
- Total Phantom Events: ${analyticsSummary.summary.totalPhantomEvents}
- Resolved Events: ${analyticsSummary.summary.resolvedEvents}
- Unresolved Events: ${analyticsSummary.summary.unresolvedEvents}
- Total Money Saved: $${analyticsSummary.summary.totalSavedMoney}
- Total Energy Saved: ${analyticsSummary.summary.totalSavedUnits} kWh
- Average Power Consumption: ${analyticsSummary.summary.avgPower}W
- Devices: ${analyticsSummary.summary.totalDevices} total, ${analyticsSummary.summary.onlineDevices} online
- Ports: ${analyticsSummary.summary.totalPorts} total (${analyticsSummary.summary.activePorts} active, ${analyticsSummary.summary.phantomPorts} phantom, ${analyticsSummary.summary.offPorts} off)

Top Phantom Energy Ports:
${analyticsSummary.topPhantomPorts.map((p, i) => `${i + 1}. ${p.portName}: ${p.count} events, $${p.totalSavedMoney.toFixed(2)} saved`).join('\n')}

Provide a comprehensive, humanized analysis with specific recommendations. Keep it concise but informative (300-400 words).`;

        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an energy efficiency expert providing friendly, actionable advice about phantom energy consumption and energy savings.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        });

        aiInsights = completion.choices[0].message.content;
      } catch (llmError) {
        console.error('LLM API Error:', llmError);
        // Continue without LLM insights if API fails
        aiInsights = null;
      }
    } else {
      // Fallback insights if LLM is not configured
      aiInsights = generateFallbackInsights(analyticsSummary);
    }

    res.status(200).json({
      success: true,
      data: {
        analytics: analyticsSummary,
        insights: aiInsights,
        hasLLM: !!openaiApiKey && !!OpenAI
      }
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during insights generation'
    });
  }
};

// Fallback insights generator (if LLM is not available)
const generateFallbackInsights = (analytics) => {
  let insights = `## Energy Consumption Analysis\n\n`;
  
  insights += `Over the past ${analytics.period.days} days, your system has detected ${analytics.summary.totalPhantomEvents} phantom energy events. `;
  
  if (analytics.summary.totalPhantomEvents > 0) {
    insights += `You've successfully saved $${analytics.summary.totalSavedMoney.toFixed(2)} and ${analytics.summary.totalSavedUnits.toFixed(2)} kWh of energy. `;
  }
  
  if (analytics.summary.unresolvedEvents > 0) {
    insights += `⚠️ You have ${analytics.summary.unresolvedEvents} unresolved phantom energy events that need attention. `;
  }
  
  if (analytics.summary.phantomPorts > 0) {
    insights += `Currently, ${analytics.summary.phantomPorts} port(s) are showing phantom energy consumption. `;
  }
  
  insights += `\n\n## Recommendations\n\n`;
  
  if (analytics.topPhantomPorts.length > 0) {
    insights += `1. **Focus on High-Impact Ports**: Your top phantom energy source is "${analytics.topPhantomPorts[0].portName}" with ${analytics.topPhantomPorts[0].count} events. Consider reviewing this port's configuration.\n\n`;
  }
  
  insights += `2. **Enable Auto-Cut**: Ensure auto-cut is enabled on all ports to automatically reduce phantom energy waste.\n\n`;
  insights += `3. **Regular Monitoring**: Continue monitoring your ports regularly to identify patterns in energy consumption.\n\n`;
  insights += `4. **Device Maintenance**: Keep your ${analytics.summary.totalDevices} device(s) online and properly configured for optimal monitoring.\n\n`;
  
  return insights;
};

module.exports = {
  getInsights
};

