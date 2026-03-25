import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './ViewClassGrades.css';

const ViewClassGrades = () => {
  const { API_URL, user } = useAuth();
  const [selectedClassSection, setSelectedClassSection] = useState('');
  const [term, setTerm] = useState('FA4');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const availableClasses = user?.classes || [];

  useEffect(() => {
    if (selectedClassSection) {
      fetchClassGrades();
    }
  }, [selectedClassSection, term, academicYear]);

  const fetchClassGrades = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.get(
        `${API_URL}/grades/class/${selectedClassSection}?term=${term}&academicYear=${academicYear}`
      );

      setGrades(response.data);

      if (response.data.length === 0) {
        setMessage({
          type: 'info',
          text: 'No grades found for this class and term'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch grades'
      });
    }

    setLoading(false);
  };

  const calculateClassAverage = () => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((sum, grade) => sum + Number(grade.percentage), 0);
    return (total / grades.length).toFixed(2);
  };

  return (
    <div className="view-grades-container">
      <h3>View Class Grades</h3>

      <div className="grades-filters">
        <div className="form-row">
          <div className="form-group">
            <label>Class-Section *</label>
            <select
              value={selectedClassSection}
              onChange={(e) => setSelectedClassSection(e.target.value)}
              className="form-control"
            >
              <option value="">-- Select Class-Section --</option>
              {availableClasses.map((cls, index) => (
                <option key={index} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Term *</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="form-control"
            >
              <option value="FA1">FA1</option>
              <option value="FA2">FA2</option>
              <option value="FA3">FA3</option>
              <option value="FA4">FA4</option>
              <option value="SA1">SA1</option>
              <option value="SA2">SA2</option>
            </select>
          </div>

          <div className="form-group">
            <label>Academic Year *</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="form-control"
              placeholder="2024-2025"
            />
          </div>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {selectedClassSection && grades.length > 0 && (
          <div className="class-stats-bar">
            <div className="stat-item">
              <strong>Class Average:</strong> {calculateClassAverage()}%
            </div>
            <div className="stat-divider">|</div>
            <div className="stat-item">
              <strong>Total Students:</strong> {grades.length}
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-message">Loading grades...</div>
      )}

      {!loading && grades.length > 0 && (
        <div className="grades-list">
          <table className="class-grades-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>GPA</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade._id}>
                  <td>{grade.student.rollNumber}</td>
                  <td>{grade.student.name}</td>
                  <td>{grade.totalMarks}</td>
                  <td>{grade.percentage}%</td>
                  <td>
                    <span className={`grade-badge grade-${grade.finalGrade}`}>
                      {grade.finalGrade}
                    </span>
                  </td>
                  <td>{grade.gpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && selectedClassSection && grades.length === 0 && (
        <div className="no-data">
          <p>No grades found for {selectedClassSection} in {term}.</p>
        </div>
      )}
    </div>
  );
};

export default ViewClassGrades;