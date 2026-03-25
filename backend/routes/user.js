const express = require('express');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { Faculty, Student } = require('../models');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    let user;

    if (req.user.role === 'faculty') {
      user = await Faculty.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    } else if (req.user.role === 'student') {
      user = await Student.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add _id field for frontend compatibility
    const response = { ...user.toJSON(), _id: user.id };
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile picture (Student only)
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can upload profile pictures' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    const student = await Student.findByPk(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.profilePicture) {
      const oldPath = path.join(__dirname, '..', student.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const profilePicturePath = `/uploads/profiles/${req.file.filename}`;
    student.profilePicture = profilePicturePath;
    await student.save();

    res.json({ message: 'Profile picture uploaded successfully', profilePicture: profilePicturePath });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete profile picture (Student only)
router.delete('/delete-profile-picture', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can delete profile pictures' });
    }

    const student = await Student.findByPk(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.profilePicture) {
      return res.status(400).json({ message: 'No profile picture to delete' });
    }

    const filePath = path.join(__dirname, '..', student.profilePicture);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    student.profilePicture = null;
    await student.save();

    res.json({ message: 'Profile picture deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;