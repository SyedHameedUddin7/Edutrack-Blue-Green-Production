const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    console.log('Login attempt:', { username, role });

    // Validate input
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Please provide username, password, and role' });
    }

    let user;
    let Model;

    // Determine which model to use based on role
    switch(role) {
      case 'admin':
        Model = Admin;
        break;
      case 'faculty':
        Model = Faculty;
        break;
      case 'student':
        Model = Student;
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    // Find user
    user = await Model.findOne({ username });
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', user.username);

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Password matched');

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare user response - convert to plain object and remove password
    const userResponse = {
      _id: user._id,
      username: user.username,
      role: user.role,
      // Add other fields based on role
      ...(user.name && { name: user.name }),
      ...(user.rollNumber && { rollNumber: user.rollNumber }),
      ...(user.class && { class: user.class }),
      ...(user.section && { section: user.section }),
      ...(user.subject && { subject: user.subject }),
      ...(user.classes && { classes: user.classes })
    };

    console.log('Sending response:', userResponse);

    res.json({
      success: true,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;