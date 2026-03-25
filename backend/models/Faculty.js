const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const Faculty = sequelize.define('Faculty', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  classes: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'faculty'
  }
}, {
  tableName: 'faculties',
  timestamps: true,
  hooks: {
    beforeCreate: async (faculty) => {
      faculty.password = await bcrypt.hash(faculty.password, 10);
    },
    beforeUpdate: async (faculty) => {
      if (faculty.changed('password')) {
        faculty.password = await bcrypt.hash(faculty.password, 10);
      }
    }
  }
});

Faculty.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = Faculty;