const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Timetable = sequelize.define('Timetable', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  classSection: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subjectAllocation: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  schedule: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  academicYear: {
    type: DataTypes.STRING,
    defaultValue: '2024-2025'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'created_by',
    references: { model: 'admins', key: 'id' }
  }
}, {
  tableName: 'timetables',
  timestamps: true,
  indexes: [
    {
      fields: ['classSection', 'academicYear', 'isActive']
    }
  ]
});

module.exports = Timetable;