const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const PhantomEvent = sequelize.define('PhantomEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
    allowNull: false
  },
  portId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ports',
      key: 'id'
    },
    field: 'portId'
  },
  detected_power: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    },
    field: 'detected_power'
  },
  detected_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
    field: 'detected_at'
  },
  action_taken: {
    type: DataTypes.ENUM('auto_cut', 'notified', 'ignored'),
    allowNull: false,
    field: 'action_taken'
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'resolved_at'
  },
  savedUnits: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
    field: 'savedUnits'
  },
  savedMoney: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
    field: 'savedMoney'
  }
}, {
  tableName: 'phantomevents',
  timestamps: false
});

module.exports = PhantomEvent;

