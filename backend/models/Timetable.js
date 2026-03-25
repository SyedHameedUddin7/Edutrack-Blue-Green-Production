const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  classSection: {
    type: String,
    required: true
  },
  subjectAllocation: [{
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true
    },
    facultyName: String,
    subject: String,
    periodsPerWeek: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  schedule: [{
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    periods: [{
      periodNumber: {
        type: Number,
        required: true
      },
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      },
      subject: {
        type: String,
        required: true
      },
      faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
      },
      facultyName: String
    }]
  }],
  academicYear: {
    type: String,
    default: '2024-2025'
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

// Ensure one active timetable per class per academic year
timetableSchema.index({ classSection: 1, academicYear: 1, isActive: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);