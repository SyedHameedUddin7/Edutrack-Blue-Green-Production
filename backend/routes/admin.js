const express = require('express');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Create Faculty
router.post('/create-faculty', auth, isAdmin, async (req, res) => {
  try {
    const { name, classes, subject, username, password } = req.body;

    const existingFaculty = await Faculty.findOne({ username });
    if (existingFaculty) {
      return res.status(400).json({ message: 'Faculty with this username already exists' });
    }

    const faculty = new Faculty({
      name,
      classes,
      subject,
      username,
      password
    });

    await faculty.save();

    const facultyResponse = faculty.toObject();
    delete facultyResponse.password;

    res.status(201).json({
      message: 'Faculty created successfully',
      faculty: facultyResponse
    });

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
      $or: [{ username }, { rollNumber }] 
    });
    
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this username or roll number already exists' 
      });
    }

    const student = new Student({
      name,
      rollNumber,
      class: studentClass,
      section,
      username,
      password
    });

    await student.save();

    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.status(201).json({
      message: 'Student created successfully',
      student: studentResponse
    });

  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all faculties
router.get('/faculties', auth, isAdmin, async (req, res) => {
  try {
    const faculties = await Faculty.find().select('-password');
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all students
router.get('/students', auth, isAdmin, async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Faculty
router.delete('/faculty/:facultyId', auth, isAdmin, async (req, res) => {
  try {
    const { facultyId } = req.params;

    const faculty = await Faculty.findById(facultyId);
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Delete all attendance records marked by this faculty
    await Attendance.deleteMany({ faculty: facultyId });

    // Delete all grades submitted by this faculty
    await Grade.deleteMany({ faculty: facultyId });

    // Delete the faculty
    await Faculty.findByIdAndDelete(facultyId);

    console.log(`Faculty ${faculty.name} deleted successfully with all related data`);

    res.json({ 
      message: 'Faculty and all related records deleted successfully',
      deletedFaculty: faculty.name
    });

  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Student
router.delete('/student/:studentId', auth, isAdmin, async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete all attendance records for this student
    await Attendance.deleteMany({ student: studentId });

    // Delete all grades for this student
    await Grade.deleteMany({ student: studentId });

    // Delete the student
    await Student.findByIdAndDelete(studentId);

    console.log(`Student ${student.name} deleted successfully with all related data`);

    res.json({ 
      message: 'Student and all related records deleted successfully',
      deletedStudent: student.name
    });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get statistics
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const facultyCount = await Faculty.countDocuments();
    const studentCount = await Student.countDocuments();
    
    res.json({
      totalFaculty: facultyCount,
      totalStudents: studentCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;