const express = require('express');
const { Op } = require('sequelize');
const { Faculty, Student, Attendance, Grade } = require('../models');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Create Faculty
router.post('/create-faculty', auth, isAdmin, async (req, res) => {
  try {
    const { name, classes, subject, username, password } = req.body;

    const existingFaculty = await Faculty.findOne({ where: { username } });
    if (existingFaculty) {
      return res.status(400).json({ message: 'Faculty with this username already exists' });
    }

    const faculty = await Faculty.create({ name, classes, subject, username, password });

    const facultyResponse = faculty.toJSON();
    delete facultyResponse.password;

    res.status(201).json({ message: 'Faculty created successfully', faculty: facultyResponse });
  } catch (error) {
    console.error('Create faculty error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create Student
router.post('/create-student', auth, isAdmin, async (req, res) => {
  try {
    const { name, rollNumber, class: studentClass, section, username, password } = req.body;

    const existingStudent = await Student.findOne({
      where: { [Op.or]: [{ username }, { rollNumber }] }
    });

    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this username or roll number already exists' });
    }

    const student = await Student.create({
      name, rollNumber, class: studentClass, section, username, password
    });

    const studentResponse = student.toJSON();
    delete studentResponse.password;

    res.status(201).json({ message: 'Student created successfully', student: studentResponse });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all faculties
router.get('/faculties', auth, isAdmin, async (req, res) => {
  try {
    const faculties = await Faculty.findAll({
      attributes: { exclude: ['password'] }
    });
    const response = faculties.map(f => ({ ...f.toJSON(), _id: f.id }));
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all students
router.get('/students', auth, isAdmin, async (req, res) => {
  try {
    const students = await Student.findAll({
      attributes: { exclude: ['password'] }
    });
    const response = students.map(s => ({ ...s.toJSON(), _id: s.id }));
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Faculty
router.delete('/faculty/:facultyId', auth, isAdmin, async (req, res) => {
  try {
    const { facultyId } = req.params;

    const faculty = await Faculty.findByPk(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    await Attendance.destroy({ where: { facultyId } });
    await Grade.destroy({ where: { facultyId } });
    await faculty.destroy();

    console.log(`Faculty ${faculty.name} deleted successfully with all related data`);
    res.json({ message: 'Faculty and all related records deleted successfully', deletedFaculty: faculty.name });
  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Student
router.delete('/student/:studentId', auth, isAdmin, async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Attendance.destroy({ where: { studentId } });
    await Grade.destroy({ where: { studentId } });
    await student.destroy();

    console.log(`Student ${student.name} deleted successfully with all related data`);
    res.json({ message: 'Student and all related records deleted successfully', deletedStudent: student.name });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get statistics
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const facultyCount = await Faculty.count();
    const studentCount = await Student.count();
    res.json({ totalFaculty: facultyCount, totalStudents: studentCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;