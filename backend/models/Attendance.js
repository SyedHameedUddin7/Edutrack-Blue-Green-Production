const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'student_id',
    references: { model: 'students', key: 'id' }
  },
  facultyId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'faculty_id',
    references: { model: 'faculties', key: 'id' }
  },
  classSection: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('present', 'absent'),
    allowNull: false
  }
}, {
  tableName: 'attendances',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'date']
    }
  ]
});

module.exports = Attendance;