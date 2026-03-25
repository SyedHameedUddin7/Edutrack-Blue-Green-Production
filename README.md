# Group_04_Final_Project_EduTrack_AI-
INFO 6150 Web Design and User Experience Engineering Final Project- Fall 2025
# INFO 6150 – Final Project  
## EduTrack AI – School Management System

---

## 📘 Repository Overview

This repository contains the **Final Project for INFO 6150 – Web Design & User Experience Engineering (Fall 2025)** at **Northeastern University**.

**EduTrack AI** is a **full-stack School Management System** built using **React (Vite) for the frontend** and **Node.js, Express, and MongoDB for the backend**. The application manages academic and administrative workflows through **secure authentication, role-based access control, RESTful APIs, and persistent data storage**.

The repository serves as a **shared collaborative workspace** for a team of five members, following best practices in **version control, modular architecture, and team-based development**.

---

## 👥 Team Members 

- Gagana Ananda  
- Jayanth Muthaluri  
- Mallesh Mallikarjunaiah  
- Prajwal Prakash  
- Syed Hameed Uddin  

---

## 🏫 Project Description

**EduTrack AI** is a responsive, role-based **School Management System** that streamlines core academic operations for educational institutions.

The system supports:
- Secure user authentication and authorization
- Dedicated dashboards for **Admin, Faculty, and Students**
- Attendance tracking and monitoring
- Quiz creation, attempts, and evaluation
- Grade entry and report card generation
- Timetable creation and viewing

The application follows **industry-standard full-stack architecture**, including RESTful backend APIs, MVC-based backend organization, authentication middleware, and MongoDB persistence.

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- User **Sign-Up and Login**
- Secure password hashing using **bcrypt**
- **JWT-based authentication**
- Role-based access control (**Admin, Faculty, Student**)
- Protected backend routes using authentication middleware
- Global authentication state management using **React Context API**

> ⚠️ **Note:** Google OAuth authentication is **not implemented**. All other authentication and authorization features are fully functional.

---

### 🏫 Role-Based Dashboards

#### Admin
- Admin dashboard overview
- Create and manage faculty
- Create and manage students
- Manage quizzes
- Manage timetables
- View academic data

#### Faculty
- Faculty dashboard
- Mark attendance
- Create quizzes
- Enter grades
- View faculty schedules
- Manage academic records

#### Student
- Student dashboard
- View attendance records
- Take quizzes
- View quiz history and results
- View grades and report cards
- View timetables

---

### 🧠 Academic & AI-Ready Modules
- Attendance management module
- Quiz system with attempts, results, and history
- Grade management and reporting
- Report card generation
- Timetable generation and visualization
- Modular backend design ready for AI/LLM integration

---

### 📱 Responsive UI / UX
- Fully responsive across desktop, tablet, and mobile devices
- Built using **React + Vite**
- Component-based UI architecture
- Clear navigation and visual hierarchy
- Accessibility-friendly layouts and forms

---

## 🔁 End-to-End Transactional Flows

### Flow 1 – Student
Login → Student Dashboard → Take Quiz → View Quiz Result → View Grades

### Flow 2 – Faculty
Login → Faculty Dashboard → Mark Attendance → Create Quiz → Enter Grades → View Schedule

### Flow 3 – Admin
Login → Admin Dashboard → Create Faculty/Student → Manage Timetables → View Academic Data

Each flow ensures data consistency, validation, error handling, and secure access control.

---

## 🛠️ Technology Stack

### Frontend
- React (Vite)
- JavaScript (ES6+)
- CSS3
- React Context API
- Axios
- ESLint

### Backend
- Node.js
- Express.js
- RESTful API architecture
- MVC pattern

### Database
- MongoDB
- Mongoose ODM
- Full CRUD operations

### Security & Utilities
- bcrypt (password hashing)
- JWT (authentication and authorization)
- dotenv (environment configuration)
- Middleware-based route protection

---

## 📁 Project Structure

```
EDUTRACK_AI/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Attendance.js
│   │   ├── Faculty.js
│   │   ├── Grade.js
│   │   ├── Quiz.js
│   │   ├── QuizAttempt.js
│   │   ├── QuizResult.js
│   │   ├── Student.js
│   │   ├── SystemConfig.js
│   │   └── Timetable.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── attendance.js
│   │   ├── auth.js
│   │   ├── grades.js
│   │   ├── quiz.js
│   │   ├── timetable.js
│   │   └── user.js
│   ├── server.js
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── FacultyDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── CreateFaculty.jsx
│   │   │   ├── CreateStudent.jsx
│   │   │   ├── CreateQuiz.jsx
│   │   │   ├── TakeQuiz.jsx
│   │   │   ├── QuizHistory.jsx
│   │   │   ├── EnterGrades.jsx
│   │   │   ├── ReportCard.jsx
│   │   │   ├── MarkAttendance.jsx
│   │   │   ├── ViewAttendance.jsx
│   │   │   ├── GenerateTimetable.jsx
│   │   │   ├── ViewTimetable.jsx
│   │   │   ├── ViewClassGrades.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

---

## 🚀 Setup & Execution

### Prerequisites
- Node.js (v18+)
- MongoDB (local or cloud)
- npm

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing

- Manual testing of authentication flows
- API testing using Postman
- Role-based access testing
- UI testing across multiple screen sizes
- Validation and error handling testing

---

## 🤝 Contribution & Effort Distribution

| Team Member | Contribution |
|------------|--------------|
| Gagana Ananda | 25% |
| Jayanth Muthaluri | 25% |
| Mallesh Mallikarjunaiah | 25% |
| Prajwal Prakash | 25% |
| Syed Hameed Uddin | 25% |

---

## 📜 License

This project is developed **strictly for academic use** as part of **INFO 6150 coursework** at Northeastern University.

---

## 📚 Citations & Credits
- Background video credit: **filmsupply.com**

---

## 📌 Notes on Requirements Compliance

- All frontend, backend, database, authentication, role-based access, and transactional flow requirements are implemented.
- **Google OAuth authentication** is the only requirement not implemented in the current submission.

---

## 🙌 Acknowledgements

- Northeastern University  
- INFO 6150 Faculty & Teaching Assistants  
- Open-source libraries and documentation  
