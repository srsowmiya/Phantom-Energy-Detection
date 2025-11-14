const User = require('./User');
const Device = require('./Device');
const Port = require('./Port');
const PowerReading = require('./PowerReading');
const PhantomEvent = require('./PhantomEvent');
const SwitchAction = require('./SwitchAction');
const Notification = require('./Notification');
const Schedule = require('./Schedule');
const DeviceAuthToken = require('./DeviceAuthToken');

// User Relationships
User.hasMany(Device, { foreignKey: 'userId', as: 'devices' });
User.hasMany(Port, { foreignKey: 'userId', as: 'ports' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

Device.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Port.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// Port Relationships
Port.hasMany(PowerReading, { foreignKey: 'portId', as: 'powerReadings' });
Port.hasMany(PhantomEvent, { foreignKey: 'portId', as: 'phantomEvents' });
Port.hasMany(SwitchAction, { foreignKey: 'portId', as: 'switchActions' });
Port.hasMany(Notification, { foreignKey: 'portId', as: 'notifications' });
Port.hasMany(Schedule, { foreignKey: 'portId', as: 'schedules' });

PowerReading.belongsTo(Port, { foreignKey: 'portId', as: 'portData' });
PhantomEvent.belongsTo(Port, { foreignKey: 'portId', as: 'portData' });
SwitchAction.belongsTo(Port, { foreignKey: 'portId', as: 'portData' });
Notification.belongsTo(Port, { foreignKey: 'portId', as: 'portData' });
Schedule.belongsTo(Port, { foreignKey: 'portId', as: 'portData' });

// Device Relationships
Device.hasMany(DeviceAuthToken, { foreignKey: 'deviceId', as: 'authTokens' });

DeviceAuthToken.belongsTo(Device, { foreignKey: 'deviceId', as: 'deviceData' });

module.exports = {
  User,
  Device,
  Port,
  PowerReading,
  PhantomEvent,
  SwitchAction,
  Notification,
  Schedule,
  DeviceAuthToken
};

