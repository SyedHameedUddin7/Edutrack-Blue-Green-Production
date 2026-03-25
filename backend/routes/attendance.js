const express = require('express');
const { Op } = require('sequelize');
const { Attendance, Student, Faculty } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get students by classSection (for faculty)
router.get('/students/:classSection', auth, async (req, res) => {
  try {
    const { classSection } = req.params;

    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied. Faculty only.' });
    }

    const students = await Student.findAll({
      where: { classSection },
      attributes: { exclude: ['password'] },
      order: [['rollNumber', 'ASC']]
    });

    // Add _id for frontend compatibility
    const response = students.map(s => ({ ...s.toJSON(), _id: s.id }));
    res.json(response);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark attendance (for faculty)
router.post('/mark', auth, async (req, res) => {
  try {
    const { attendance, classSection, date } = req.body;

    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied. Faculty only.' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    const dateOnly = attendanceDate.toISOString().split('T')[0];

    // Delete existing attendance for this classSection and date
    await Attendance.destroy({
      where: { classSection, date: dateOnly }
    });

    // Create attendance records
    const records = attendance.map(record => ({
      studentId: record.studentId,
      facultyId: req.user.id,
      classSection,
      date: dateOnly,
      status: record.status
    }));

    await Attendance.bulkCreate(records);

    res.json({ message: 'Attendance marked successfully', count: records.length });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance for a student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const attendanceRecords = await Attendance.findAll({
      where: { studentId },
      include: [{ model: Faculty, as: 'faculty', attributes: ['name', 'subject'] }],
      order: [['date', 'DESC']]
    });

    const records = attendanceRecords.map(r => ({
      ...r.toJSON(),
      _id: r.id,
      student: r.studentId
    }));

    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'present').length;
    const absentDays = totalDays - presentDays;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    res.json({
      records,
      statistics: { totalDays, presentDays, absentDays, attendancePercentage }
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance by date range
router.get('/student/:studentId/range', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const where = { studentId };
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }

    const attendanceRecords = await Attendance.findAll({
      where,
      include: [{ model: Faculty, as: 'faculty', attributes: ['name', 'subject'] }],
      order: [['date', 'DESC']]
    });

    const response = attendanceRecords.map(r => ({ ...r.toJSON(), _id: r.id }));
    res.json(response);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance history for a classSection (for faculty)
router.get('/class/:classSection/history', auth, async (req, res) => {
  try {
    const { classSection } = req.params;

    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied. Faculty only.' });
    }

    const attendanceRecords = await Attendance.findAll({
      where: { classSection },
      include: [{ model: Student, as: 'student', attributes: ['name', 'rollNumber'] }],
      order: [['date', 'DESC']],
      limit: 100
    });

    const response = attendanceRecords.map(r => ({ ...r.toJSON(), _id: r.id }));
    res.json(response);
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;