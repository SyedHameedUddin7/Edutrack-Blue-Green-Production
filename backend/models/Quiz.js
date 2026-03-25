const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['Maths', 'Physics', 'Biology', 'Social']
  },
  chapter: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 1800, // 30 minutes in seconds
    required: true
  },
  numberOfQuestions: {
    type: Number,
    default: 10,
    required: true
  },
  questionPool: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: Number,
      required: true
    },
    explanation: {
      type: String,
      required: true
    }
  }],
  classSection: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);