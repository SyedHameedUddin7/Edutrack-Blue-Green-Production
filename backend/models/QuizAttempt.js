const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    studentAnswer: Number,
    explanation: String
  }],
  answers: {
    type: Map,
    of: Number,
    default: {}
  },
  score: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  timeTaken: {
    type: Number // in seconds
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Ensure one attempt per student per quiz
quizAttemptSchema.index({ quiz: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);