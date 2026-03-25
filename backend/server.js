const express = require('express');

const cors = require('cors');

const dotenv = require('dotenv');

const path = require('path');

const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('./swagger.json');

const connectDB = require('./config/db');

const Admin = require('./models/Admin');

// Load environment variables

dotenv.config();

// Check for Groq API key

if (!process.env.GROQ_API_KEY) {

  console.warn('⚠️  WARNING: GROQ_API_KEY not found in environment variables');

  console.warn('⚠️  AI quiz generation will not work without it');

}

const app = express();

// Middleware

app.use(cors({

  origin: ['http://localhost:5173', 'http://localhost:5174'],

  credentials: true,

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  allowedHeaders: ['Content-Type', 'Authorization']

}));

app.use(express.json());
 
// Serve static files for profile pictures

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger Documentation

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {

  customCss: '.swagger-ui .topbar { display: none }',

  customSiteTitle: "School Management API Documentation"

}));

// Connect to MongoDB

connectDB();

// Create default admin if doesn't exist

const createDefaultAdmin = async () => {

  try {

    const adminExists = await Admin.findOne({ username: 'admin' });

    if (!adminExists) {

      const admin = new Admin({

        username: 'admin',

        password: 'admin123',

        role: 'admin'

      });

      await admin.save();

      console.log('✅ Default admin created - Username: admin, Password: admin123');

      const savedAdmin = await Admin.findOne({ username: 'admin' });

      console.log('✅ Verified admin role:', savedAdmin.role);

    } else {

      console.log('✅ Admin already exists');

      if (!adminExists.role) {

        console.log('⚠️  Existing admin missing role, updating...');

        adminExists.role = 'admin';

        await adminExists.save();

        console.log('✅ Admin role updated');

      }

    }

  } catch (error) {

    console.error('❌ Error creating default admin:', error);

  }

};

// Routes

app.use('/api/auth', require('./routes/auth'));

app.use('/api/admin', require('./routes/admin'));

app.use('/api/user', require('./routes/user'));

app.use('/api/attendance', require('./routes/attendance'));

app.use('/api/grades', require('./routes/grades'));

app.use('/api/quiz', require('./routes/quiz'));

app.use('/api/timetable', require('./routes/timetable'));

// Health check

app.get('/', (req, res) => {

  res.json({

    message: 'School Management API is running',

    documentation: '/api-docs'

  });

});

// Test route

app.get('/api/test', (req, res) => {

  res.json({ message: 'API is working!' });

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(`🚀 Server running on port ${PORT}`);

  console.log(`📡 API URL: http://localhost:${PORT}`);

  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);

  console.log(`✅ CORS enabled for: http://localhost:5173, http://localhost:5174`);

  console.log(`📁 Static files served from: /uploads`);

  createDefaultAdmin();

});
 