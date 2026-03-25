const express = require('express');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    let user;
    
    if (req.user.role === 'faculty') {
      user = await Faculty.findById(req.user.id).select('-password');
    } else if (req.user.role === 'student') {
      user = await Student.findById(req.user.id).select('-password');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
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

    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete old profile picture if exists
    if (student.profilePicture) {
      const oldPath = path.join(__dirname, '..', student.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save new profile picture path
    const profilePicturePath = `/uploads/profiles/${req.file.filename}`;
    student.profilePicture = profilePicturePath;
    await student.save();

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: profilePicturePath
    });

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

    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.profilePicture) {
      return res.status(400).json({ message: 'No profile picture to delete' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', student.profilePicture);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from database
    student.profilePicture = null;
    await student.save();

    res.json({ message: 'Profile picture deleted successfully' });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;