const express = require('express');
const { Grade, Student, Faculty, Attendance } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get students by classSection for grading (faculty)
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
    const response = students.map(s => ({ ...s.toJSON(), _id: s.id }));
    res.json(response);
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

    let grade = await Grade.findOne({
      where: { studentId, term, academicYear }
    });

    if (grade) {
      grade.subjects = subjects;
      grade.extraCurricular = extraCurricular || {};
      grade.descriptiveIndicators = descriptiveIndicators || '';
      grade.facultyId = req.user.id;
      grade.classSection = classSection;
      await grade.save();
    } else {
      grade = await Grade.create({
        studentId,
        facultyId: req.user.id,
        classSection,
        academicYear,
        term,
        subjects,
        extraCurricular: extraCurricular || {},
        descriptiveIndicators: descriptiveIndicators || ''
      });
    }

    const response = { ...grade.toJSON(), _id: grade.id };
    res.json({ message: 'Grades submitted successfully', grade: response });
  } catch (error) {
    console.error('Error submitting grades:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get grades for a student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, academicYear } = req.query;

    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const where = { studentId };
    if (term) where.term = term;
    if (academicYear) where.academicYear = academicYear;

    const grades = await Grade.findAll({
      where,
      include: [
        { model: Faculty, as: 'faculty', attributes: ['name', 'subject'] },
        { model: Student, as: 'student', attributes: ['name', 'rollNumber', 'classSection'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const response = grades.map(g => ({ ...g.toJSON(), _id: g.id }));
    res.json(response);
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

    const where = { classSection };
    if (term) where.term = term;
    if (academicYear) where.academicYear = academicYear || '2024-2025';

    const grades = await Grade.findAll({
      where,
      include: [
        { model: Student, as: 'student', attributes: ['name', 'rollNumber', 'classSection', 'class', 'section'] }
      ]
    });

    const response = grades.map(g => ({ ...g.toJSON(), _id: g.id }));
    res.json(response);
  } catch (error) {
    console.error('Error fetching class grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export grades
router.get('/export/:classSection', auth, async (req, res) => {
  try {
    const { classSection } = req.params;
    const { term, academicYear } = req.query;

    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const where = { classSection };
    if (term) where.term = term;
    if (academicYear) where.academicYear = academicYear || '2024-2025';

    const grades = await Grade.findAll({
      where,
      include: [
        { model: Student, as: 'student', attributes: ['name', 'rollNumber', 'classSection', 'class', 'section'] },
        { model: Faculty, as: 'faculty', attributes: ['name', 'subject'] }
      ]
    });

    const gradesWithAttendance = await Promise.all(
      grades.map(async (grade) => {
        const attendanceRecords = await Attendance.findAll({
          where: { studentId: grade.studentId }
        });
        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
        const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

        return {
          ...grade.toJSON(),
          _id: grade.id,
          attendance: { totalDays, presentDays, attendancePercentage }
        };
      })
    );

    res.json(gradesWithAttendance);
  } catch (error) {
    console.error('Error exporting grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get report card data
router.get('/report-card/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, academicYear } = req.query;

    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const student = await Student.findByPk(studentId, { attributes: { exclude: ['password'] } });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const gradeWhere = { studentId };
    if (term) gradeWhere.term = term;
    if (academicYear) gradeWhere.academicYear = academicYear || '2024-2025';

    const grades = await Grade.findOne({
      where: gradeWhere,
      include: [{ model: Faculty, as: 'faculty', attributes: ['name', 'subject'] }]
    });

    const attendanceRecords = await Attendance.findAll({ where: { studentId } });
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    const monthlyAttendance = {};
    attendanceRecords.forEach(record => {
      const month = new Date(record.date).toLocaleString('default', { month: 'short' });
      if (!monthlyAttendance[month]) {
        monthlyAttendance[month] = { total: 0, present: 0 };
      }
      monthlyAttendance[month].total++;
      if (record.status === 'present') monthlyAttendance[month].present++;
    });

    const studentResponse = { ...student.toJSON(), _id: student.id };
    const gradesResponse = grades ? { ...grades.toJSON(), _id: grades.id } : null;

    res.json({
      student: studentResponse,
      grades: gradesResponse,
      attendance: { totalDays, presentDays, attendancePercentage, monthly: monthlyAttendance }
    });
  } catch (error) {
    console.error('Error fetching report card:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete grade
router.delete('/:gradeId', auth, async (req, res) => {
  try {
    const { gradeId } = req.params;
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await Grade.destroy({ where: { id: gradeId } });
    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;