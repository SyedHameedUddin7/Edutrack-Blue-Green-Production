import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const FacultyQuizResults = () => {
  const { API_URL } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedQuiz, setSelectedQuiz] = useState('all');

  useEffect(() => {
    fetchQuizResults();
  }, []);

  const fetchQuizResults = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/quiz/faculty-results`);
      setData(response.data);
      console.log('Faculty quiz results:', response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch quiz results');
      console.error('Error fetching quiz results:', error);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="loading-message">Loading quiz results...</div>;
  }

  if (error) {
    return (
      <div className="form-container" style={{ maxWidth: '800px' }}>
        <div className="no-data">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.attempts.length === 0) {
    return (
      <div className="form-container" style={{ maxWidth: '800px' }}>
        <h3>Student Quiz Results</h3>
        <div className="no-data">
          <p>No quiz attempts found for your subject and classes</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Subject: <strong>{data?.faculty.subject}</strong><br />
            Classes: <strong>{data?.faculty.classes.join(', ')}</strong>
          </p>
        </div>
      </div>
    );
  }

  // Filter attempts based on selected class and quiz
  const filteredAttempts = data.attempts.filter(attempt => {
    const classMatch = selectedClass === 'all' || attempt.student.classSection === selectedClass;
    const quizMatch = selectedQuiz === 'all' || attempt.quiz._id === selectedQuiz;
    return classMatch && quizMatch;
  });

  // Calculate filtered statistics
  const filteredStats = {
    totalAttempts: filteredAttempts.length,
    averageScore: filteredAttempts.length > 0
      ? (filteredAttempts.reduce((sum, a) => sum + a.score, 0) / filteredAttempts.length).toFixed(2)
      : 0,
    highestScore: filteredAttempts.length > 0
      ? Math.max(...filteredAttempts.map(a => a.score)).toFixed(2)
      : 0,
    lowestScore: filteredAttempts.length > 0
      ? Math.min(...filteredAttempts.map(a => a.score)).toFixed(2)
      : 0
  };

  return (
    <div className="form-container" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '25px' }}>
        <h3>Student Quiz Results - {data.faculty.subject}</h3>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
          Classes: {data.faculty.classes.join(', ')}
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div className="stat-card" style={{ borderTop: '4px solid #667eea' }}>
          <h4>Total Quizzes</h4>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea', margin: '10px 0' }}>
            {data.quizzes.length}
          </p>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            Created for your classes
          </p>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #28a745' }}>
          <h4>Total Attempts</h4>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', margin: '10px 0' }}>
            {filteredStats.totalAttempts}
          </p>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            Student submissions
          </p>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #ffc107' }}>
          <h4>Average Score</h4>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107', margin: '10px 0' }}>
            {filteredStats.averageScore}%
          </p>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            Class performance
          </p>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #17a2b8' }}>
          <h4>Score Range</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#17a2b8', margin: '10px 0' }}>
            {filteredStats.lowestScore}% - {filteredStats.highestScore}%
          </p>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            Low - High
          </p>
        </div>
      </div>

      {/* Class-wise Statistics */}
      {selectedClass === 'all' && (
        <div style={{
          marginBottom: '25px',
          padding: '20px',
          background: '#f0f4ff',
          borderRadius: '10px'
        }}>
          <h4 style={{ marginBottom: '15px', color: '#667eea' }}>Class-wise Performance</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {Object.entries(data.statistics.byClass).map(([cls, stats]) => (
              <div key={cls} style={{
                background: 'white',
                padding: '15px',
                borderRadius: '8px',
                border: '2px solid #667eea'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' }}>
                  {cls}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <div>Attempts: <strong>{stats.totalAttempts}</strong></div>
                  <div>Average: <strong>{stats.averageScore}%</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Filter by Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="form-control"
          >
            <option value="all">All Classes</option>
            {data.faculty.classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Filter by Quiz
          </label>
          <select
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
            className="form-control"
          >
            <option value="all">All Quizzes</option>
            {data.quizzes.map(quiz => (
              <option key={quiz._id} value={quiz._id}>
                {quiz.title} - {quiz.classSection}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Table */}
      {filteredAttempts.length === 0 ? (
        <div className="no-data">
          <p>No results found for the selected filters</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Class</th>
                <th>Quiz Title</th>
                <th>Chapter</th>
                <th>Score</th>
                <th>Correct Answers</th>
                <th>Time Taken</th>
                <th>Completed On</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttempts.map(attempt => (
                <tr key={attempt._id}>
                  <td><strong>{attempt.student.name}</strong></td>
                  <td>{attempt.student.rollNumber}</td>
                  <td>{attempt.student.classSection}</td>
                  <td>{attempt.quiz.title}</td>
                  <td>{attempt.quiz.chapter}</td>
                  <td>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: attempt.score >= 75 ? '#28a745' 
                           : attempt.score >= 50 ? '#ffc107' 
                           : '#dc3545'
                    }}>
                      {attempt.score.toFixed(1)}%
                    </span>
                  </td>
                  <td>
                    {attempt.questions.filter((q, idx) => 
                      attempt.answers.get(idx.toString()) === q.correctAnswer
                    ).length} / {attempt.questions.length}
                  </td>
                  <td>
                    {Math.floor(attempt.timeTaken / 60)}:{(attempt.timeTaken % 60).toString().padStart(2, '0')}
                  </td>
                  <td>
                    {new Date(attempt.completedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FacultyQuizResults;