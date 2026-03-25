const express = require('express');
const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get students by classSection for grading (faculty)
router.get('/students/:classSection', auth, async (req, res) => {
  try {
    const { classSection } = req.params;

    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied. Faculty only.' });
    }

    const students = await Student.find({ classSection })
      .select('-password')
      .sort({ rollNumber: 1 });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit grades for a student (faculty)
router.post('/submit', auth, async (req, res) => {
  try {
    const { studentId, classSection, term, academicYear, subjects, extraCurricular, descriptiveIndicators } = req.body;

    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied. Faculty only.' });
    }

    // Check if grade already exists for this student and term
    let grade = await Grade.findOne({ 
      student: studentId, 
      term, 
      academicYear 
    });

    if (grade) {
      // Update existing grade
      grade.subjects = subjects;
      grade.extraCurricular = extraCurricular || {};
      grade.descriptiveIndicators = descriptiveIndicators || '';
      grade.faculty = req.user.id;
      grade.classSection = classSection;
    } else {
      // Create new grade
      grade = new Grade({
        student: studentId,
        faculty: req.user.id,
        classSection,
        academicYear,
        term,
        subjects,
        extraCurricular: extraCurricular || {},
        descriptiveIndicators: descriptiveIndicators || ''
      });
    }

    await grade.save();

    res.json({
      message: 'Grades submitted successfully',
      grade
    });

  } catch (error) {
    console.error('Error submitting grades:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get grades for a student (student/faculty)
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, academicYear } = req.query;

    // Verify access
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = { student: studentId };
    if (term) query.term = term;
    if (academicYear) query.academicYear = academicYear;

    const grades = await Grade.find(query)
      .populate('faculty', 'name subject')
      .populate('student', 'name rollNumber classSection')
      .sort({ createdAt: -1 });

    res.json(grades);

  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all grades for a class (faculty)
router.get('/class/:classSection', auth, async (req, res) => {
  try {
    const { classSection } = req.params;
    const { term, academicYear } = req.query;

    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = { classSection };
    if (term) query.term = term;
    if (academicYear) query.academicYear = academicYear || '2024-2025';

    const grades = await Grade.find(query)
      .populate('student', 'name rollNumber classSection class section')
      .sort({ 'student.rollNumber': 1 });

    res.json(grades);

  } catch (error) {
    console.error('Error fetching class grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export grades to CSV format (faculty)
router.get('/export/:classSection', auth, async (req, res) => {
  try {
    const { classSection } = req.params;
    const { term, academicYear } = req.query;

    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = { classSection };
    if (term) query.term = term;
    if (academicYear) query.academicYear = academicYear || '2024-2025';

    const grades = await Grade.find(query)
      .populate('student', 'name rollNumber classSection class section')
      .populate('faculty', 'name subject')
      .sort({ 'student.rollNumber': 1 });

    // Get attendance data for each student
    const gradesWithAttendance = await Promise.all(
      grades.map(async (grade) => {
        const attendanceRecords = await Attendance.find({ 
          student: grade.student._id 
        });

        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
        const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

        return {
          ...grade.toObject(),
          attendance: {
            totalDays,
            presentDays,
            attendancePercentage
          }
        };
      })
    );

    res.json(gradesWithAttendance);

  } catch (error) {
    console.error('Error exporting grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get report card data (includes grades + attendance)
router.get('/report-card/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, academicYear } = req.query;

    // Verify access
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get student details
    const student = await Student.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get grades
    const gradeQuery = { student: studentId };
    if (term) gradeQuery.term = term;
    if (academicYear) gradeQuery.academicYear = academicYear || '2024-2025';

    const grades = await Grade.findOne(gradeQuery)
      .populate('faculty', 'name subject');

    // Get attendance
    const attendanceRecords = await Attendance.find({ student: studentId });
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    // Calculate monthly attendance
    const monthlyAttendance = {};
    attendanceRecords.forEach(record => {
      const month = new Date(record.date).toLocaleString('default', { month: 'short' });
      if (!monthlyAttendance[month]) {
        monthlyAttendance[month] = { total: 0, present: 0 };
      }
      monthlyAttendance[month].total++;
      if (record.status === 'present') {
        monthlyAttendance[month].present++;
      }
    });

    res.json({
      student,
      grades,
      attendance: {
        totalDays,
        presentDays,
        attendancePercentage,
        monthly: monthlyAttendance
      }
    });

  } catch (error) {
    console.error('Error fetching report card:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete grade (admin/faculty)
router.delete('/:gradeId', auth, async (req, res) => {
  try {
    const { gradeId } = req.params;

    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Grade.findByIdAndDelete(gradeId);

    res.json({ message: 'Grade deleted successfully' });

  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;