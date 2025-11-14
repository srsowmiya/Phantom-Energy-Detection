const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Schedule = sequelize.define('Schedule', {
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
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'start_time'
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'end_time'
  },
  days: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
    validate: {
      notEmpty: true
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'schedules',
  timestamps: false
});

module.exports = Schedule;

