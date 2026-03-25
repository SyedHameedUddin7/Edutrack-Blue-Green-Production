const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: process.env.DB_SSL === 'true' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {},
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected Successfully');
    
    await sequelize.sync({ alter: true });
    console.log('Database tables synced');
  } catch (error) {
    console.error('PostgreSQL Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };