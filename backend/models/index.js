const Admin = require('./Admin');
const Faculty = require('./Faculty');
const Student = require('./Student');
const Attendance = require('./Attendance');
const Grade = require('./Grade');
const Quiz = require('./Quiz');
const QuizAttempt = require('./QuizAttempt');
const Timetable = require('./Timetable');
const SystemConfig = require('./SystemConfig');

// Attendance associations
Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendances' });
Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Faculty.hasMany(Attendance, { foreignKey: 'facultyId', as: 'attendances' });
Attendance.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });

// Grade associations
Student.hasMany(Grade, { foreignKey: 'studentId', as: 'grades' });
Grade.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Faculty.hasMany(Grade, { foreignKey: 'facultyId', as: 'grades' });
Grade.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });

// Quiz associations
Admin.hasMany(Quiz, { foreignKey: 'createdBy', as: 'quizzes' });
Quiz.belongsTo(Admin, { foreignKey: 'createdBy', as: 'creator' });

// QuizAttempt associations
Quiz.hasMany(QuizAttempt, { foreignKey: 'quizId', as: 'attempts' });
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });
Student.hasMany(QuizAttempt, { foreignKey: 'studentId', as: 'quizAttempts' });
QuizAttempt.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Timetable associations
Admin.hasMany(Timetable, { foreignKey: 'createdBy', as: 'timetables' });
Timetable.belongsTo(Admin, { foreignKey: 'createdBy', as: 'creator' });

module.exports = {
  Admin,
  Faculty,
  Student,
  Attendance,
  Grade,
  Quiz,
  QuizAttempt,
  Timetable,
  SystemConfig
};