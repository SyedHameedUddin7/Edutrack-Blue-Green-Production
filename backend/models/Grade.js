const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  classSection: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true,
    default: '2024-2025'
  },
  term: {
    type: String,
    required: true,
    enum: ['FA1', 'FA2', 'FA3', 'FA4', 'SA1', 'SA2'],
    default: 'FA4'
  },
  subjects: [{
    name: {
      type: String,
      required: true
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100
    },
    grade: {
      type: String,
      default: ''
    },
    points: {
      type: Number,
      default: 0
    },
    remarks: {
      type: String,
      default: ''
    }
  }],
  extraCurricular: {
    gk: {
      grade: String,
      remarks: String
    },
    computer: {
      grade: String,
      remarks: String
    },
    sports: {
      grade: String,
      remarks: String
    }
  },
  descriptiveIndicators: {
    type: String,
    default: ''
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  finalGrade: {
    type: String,
    default: ''
  },
  gpa: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Calculate grades, total, percentage, and GPA before saving
gradeSchema.pre('save', function() {
  let total = 0;
  let maxTotal = 0;
  let totalPoints = 0;

  // Calculate for each subject
  this.subjects.forEach(subject => {
    total += subject.marksObtained;
    maxTotal += subject.totalMarks;
    
    // Calculate grade based on percentage
    const subjectPercentage = (subject.marksObtained / subject.totalMarks) * 100;
    
    if (subjectPercentage >= 91) {
      subject.grade = 'A1';
      subject.points = 10;
    } else if (subjectPercentage >= 81) {
      subject.grade = 'A2';
      subject.points = 9;
    } else if (subjectPercentage >= 71) {
      subject.grade = 'B1';
      subject.points = 8;
    } else if (subjectPercentage >= 61) {
      subject.grade = 'B2';
      subject.points = 7;
    } else if (subjectPercentage >= 51) {
      subject.grade = 'C1';
      subject.points = 6;
    } else if (subjectPercentage >= 41) {
      subject.grade = 'C2';
      subject.points = 5;
    } else if (subjectPercentage >= 33) {
      subject.grade = 'D';
      subject.points = 4;
    } else {
      subject.grade = 'E';
      subject.points = 0;
    }
    
    totalPoints += subject.points;
  });

  // Set totals
  this.totalMarks = total;
  this.percentage = maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(2) : 0;
  
  // Calculate GPA
  this.gpa = this.subjects.length > 0 ? (totalPoints / this.subjects.length).toFixed(2) : 0;
  
  // Final grade based on percentage
  if (this.percentage >= 91) {
    this.finalGrade = 'A1';
  } else if (this.percentage >= 81) {
    this.finalGrade = 'A2';
  } else if (this.percentage >= 71) {
    this.finalGrade = 'B1';
  } else if (this.percentage >= 61) {
    this.finalGrade = 'B2';
  } else if (this.percentage >= 51) {
    this.finalGrade = 'C1';
  } else if (this.percentage >= 41) {
    this.finalGrade = 'C2';
  } else if (this.percentage >= 33) {
    this.finalGrade = 'D';
  } else {
    this.finalGrade = 'E';
  }
});

// Prevent duplicate grades for same student, term
gradeSchema.index({ student: 1, term: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Grade', gradeSchema);