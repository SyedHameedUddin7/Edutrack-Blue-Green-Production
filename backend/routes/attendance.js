const express = require('express');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get students by classSection (for faculty)
router.get('/students/:classSection', auth, async (req, res) => {
  try {
    const { classSection } = req.params;

    // Verify user is faculty
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied. Faculty only.' });
    }

    const students = await Student.find({ 
      classSection: classSection
    }).select('-password').sort({ rollNumber: 1 });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark attendance (for faculty)
router.post('/mark', auth, async (req, res) => {
  try {
    const { attendance, classSection, date } = req.body;

    // Verify user is faculty
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied. Faculty only.' });
    }

    // Parse date and set to start of day
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Delete existing attendance for this classSection and date
    await Attendance.deleteMany({
      classSection: classSection,
      date: attendanceDate
    });

    // Create attendance records
    const attendanceRecords = attendance.map(record => ({
      student: record.studentId,
      faculty: req.user.id,
      classSection: classSection,
      date: attendanceDate,
      status: record.status
    }));

    await Attendance.insertMany(attendanceRecords);

    res.json({ 
      message: 'Attendance marked successfully',
      count: attendanceRecords.length 
    });

  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance for a student (for student)
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify user is the student or admin
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const attendanceRecords = await Attendance.find({ student: studentId })
      .populate('faculty', 'name subject')
      .sort({ date: -1 });

    // Calculate statistics
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
    const absentDays = totalDays - presentDays;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    res.json({
      records: attendanceRecords,
      statistics: {
        totalDays,
        presentDays,
        absentDays,
        attendancePercentage
      }
    });

  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance by date range (for student)
router.get('/student/:studentId/range', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify user is the student or admin
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = { student: studentId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('faculty', 'name subject')
      .sort({ date: -1 });

    res.json(attendanceRecords);

  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance history for a classSection (for faculty)
router.get('/class/:classSection/history', auth, async (req, res) => {
  try {
    const { classSection } = req.params;

    // Verify user is faculty
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied. Faculty only.' });
    }

    const attendanceRecords = await Attendance.find({ 
      classSection: classSection
    })
      .populate('student', 'name rollNumber')
      .sort({ date: -1 })
      .limit(100);

    res.json(attendanceRecords);

  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;