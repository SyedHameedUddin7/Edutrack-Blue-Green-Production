const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Grade = sequelize.define('Grade', {
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
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '2024-2025'
  },
  term: {
    type: DataTypes.ENUM('FA1', 'FA2', 'FA3', 'FA4', 'SA1', 'SA2'),
    allowNull: false,
    defaultValue: 'FA4'
  },
  subjects: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  extraCurricular: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  descriptiveIndicators: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  totalMarks: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  percentage: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  finalGrade: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  gpa: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  tableName: 'grades',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'term', 'academicYear']
    }
  ],
  hooks: {
    beforeSave: (grade) => {
      if (!grade.subjects || !Array.isArray(grade.subjects)) return;

      let total = 0, maxTotal = 0, totalPoints = 0;

      grade.subjects = grade.subjects.map(subject => {
        total += subject.marksObtained;
        maxTotal += subject.totalMarks || 100;
        const pct = (subject.marksObtained / (subject.totalMarks || 100)) * 100;

        let g, p;
        if (pct >= 91) { g = 'A1'; p = 10; }
        else if (pct >= 81) { g = 'A2'; p = 9; }
        else if (pct >= 71) { g = 'B1'; p = 8; }
        else if (pct >= 61) { g = 'B2'; p = 7; }
        else if (pct >= 51) { g = 'C1'; p = 6; }
        else if (pct >= 41) { g = 'C2'; p = 5; }
        else if (pct >= 33) { g = 'D'; p = 4; }
        else { g = 'E'; p = 0; }

        totalPoints += p;
        return { ...subject, grade: g, points: p };
      });

      grade.totalMarks = total;
      grade.percentage = maxTotal > 0 ? parseFloat(((total / maxTotal) * 100).toFixed(2)) : 0;
      grade.gpa = grade.subjects.length > 0 ? parseFloat((totalPoints / grade.subjects.length).toFixed(2)) : 0;

      if (grade.percentage >= 91) grade.finalGrade = 'A1';
      else if (grade.percentage >= 81) grade.finalGrade = 'A2';
      else if (grade.percentage >= 71) grade.finalGrade = 'B1';
      else if (grade.percentage >= 61) grade.finalGrade = 'B2';
      else if (grade.percentage >= 51) grade.finalGrade = 'C1';
      else if (grade.percentage >= 41) grade.finalGrade = 'C2';
      else if (grade.percentage >= 33) grade.finalGrade = 'D';
      else grade.finalGrade = 'E';
    }
  }
});

module.exports = Grade;