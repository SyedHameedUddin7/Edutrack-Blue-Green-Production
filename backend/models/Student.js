const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rollNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  class: {
    type: DataTypes.STRING,
    allowNull: false
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false
  },
  classSection: {
    type: DataTypes.STRING
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
    defaultValue: 'student'
  },
  profilePicture: {
    type: DataTypes.STRING,
    defaultValue: null
  }
}, {
  tableName: 'students',
  timestamps: true,
  hooks: {
    beforeCreate: async (student) => {
      student.classSection = student.class + student.section;
      student.password = await bcrypt.hash(student.password, 10);
    },
    beforeUpdate: async (student) => {
      if (student.changed('class') || student.changed('section')) {
        student.classSection = student.class + student.section;
      }
      if (student.changed('password')) {
        student.password = await bcrypt.hash(student.password, 10);
      }
    }
  }
});

Student.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = Student;