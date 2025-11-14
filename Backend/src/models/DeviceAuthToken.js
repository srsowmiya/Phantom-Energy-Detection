const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const DeviceAuthToken = sequelize.define('DeviceAuthToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
    allowNull: false
  },
  deviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'devices',
      key: 'id'
    },
    field: 'deviceId'
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => uuidv4() + '-' + Date.now(),
    validate: {
      notEmpty: true
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'deviceauthtokens',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['token']
    }
  ]
});

module.exports = DeviceAuthToken;

