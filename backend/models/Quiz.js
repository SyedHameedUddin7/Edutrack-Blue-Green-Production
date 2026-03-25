const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.ENUM('Maths', 'Physics', 'Biology', 'Social'),
    allowNull: false
  },
  chapter: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 1800,
    allowNull: false
  },
  numberOfQuestions: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    allowNull: false
  },
  questionPool: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  classSection: {
    type: DataTypes.STRING,
    allowNull: false
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
  tableName: 'quizzes',
  timestamps: true
});

module.exports = Quiz;