const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const SwitchAction = sequelize.define('SwitchAction', {
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
  previous_state: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'previous_state'
  },
  new_state: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'new_state'
  },
  triggered_by: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'triggered_by'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'switchactions',
  timestamps: false
});

module.exports = SwitchAction;

