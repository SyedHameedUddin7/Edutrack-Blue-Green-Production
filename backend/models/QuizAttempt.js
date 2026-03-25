const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const QuizAttempt = sequelize.define('QuizAttempt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quizId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'quiz_id',
    references: { model: 'quizzes', key: 'id' }
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'student_id',
    references: { model: 'students', key: 'id' }
  },
  questions: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  answers: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completedAt: {
    type: DataTypes.DATE
  },
  timeTaken: {
    type: DataTypes.INTEGER
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'quiz_attempts',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['quiz_id', 'student_id']
    }
  ]
});

module.exports = QuizAttempt;