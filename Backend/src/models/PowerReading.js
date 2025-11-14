const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PowerReading = sequelize.define('PowerReading', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
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
  voltage: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  current: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  power: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'powerreadings',
  timestamps: false,
  indexes: [
    {
      fields: ['portId', 'timestamp']
    }
  ]
});

module.exports = PowerReading;

