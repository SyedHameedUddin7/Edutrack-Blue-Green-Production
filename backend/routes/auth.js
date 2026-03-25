const express = require('express');
const jwt = require('jsonwebtoken');
const { Admin, Faculty, Student } = require('../models');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    console.log('Login attempt:', { username, role });

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Please provide username, password, and role' });
    }

    let Model;
    switch(role) {
      case 'admin': Model = Admin; break;
      case 'faculty': Model = Faculty; break;
      case 'student': Model = Student; break;
      default: return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await Model.findOne({ where: { username } });

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', user.username);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Password matched');

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = {
      _id: user.id,
      username: user.username,
      role: user.role,
      ...(user.name && { name: user.name }),
      ...(user.rollNumber && { rollNumber: user.rollNumber }),
      ...(user.class && { class: user.class }),
      ...(user.section && { section: user.section }),
      ...(user.subject && { subject: user.subject }),
      ...(user.classes && { classes: user.classes })
    };

    console.log('Sending response:', userResponse);

    res.json({ success: true, token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;