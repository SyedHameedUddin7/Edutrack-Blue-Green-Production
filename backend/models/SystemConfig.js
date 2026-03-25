const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const SystemConfig = sequelize.define('SystemConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  configKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  configValue: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isEncrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'system_configs',
  timestamps: true,
  hooks: {
    beforeCreate: async (config) => {
      if (config.isEncrypted) {
        config.configValue = await bcrypt.hash(config.configValue, 10);
      }
    },
    beforeUpdate: async (config) => {
      if (config.changed('configValue') && config.isEncrypted) {
        config.configValue = await bcrypt.hash(config.configValue, 10);
      }
    }
  }
});

SystemConfig.prototype.verifyValue = async function(value) {
  if (this.isEncrypted) {
    return await bcrypt.compare(value, this.configValue);
  }
  return this.configValue === value;
};

module.exports = SystemConfig;