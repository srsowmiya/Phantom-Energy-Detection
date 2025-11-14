const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Port = sequelize.define('Port', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
    allowNull: false,
    field: 'id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'userId'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  threshold: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 5.0,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'phantom', 'off'),
    allowNull: false,
    defaultValue: 'off'
  },
  autoCut: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'autoCut'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'createdAt'
  }
}, {
  tableName: 'ports',
  timestamps: true,
  updatedAt: false
});

module.exports = Port;

