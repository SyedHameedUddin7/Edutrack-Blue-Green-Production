import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const QuizHistory = () => {
  const { API_URL } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/quiz/my-attempts`);
      setAttempts(response.data);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
    setLoading(false);
  };

  const viewDetails = async (attemptId) => {
    try {
      const response = await axios.get(`${API_URL}/quiz/results/${attemptId}`);
      setSelectedAttempt(response.data);
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  if (loading) {
    return <div className="loading-message">Loading quiz history...</div>;
  }

  if (selectedAttempt) {
    return (
      <div className="form-container" style={{ maxWidth: '1000px' }}>
        <button
          onClick={() => setSelectedAttempt(null)}
          className="btn btn-secondary"
          style={{ marginBottom: '20px' }}
        >
          ← Back to History
        </button>

        <h3>Quiz Results - {selectedAttempt.quiz.title}</h3>

        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '10px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
            {selectedAttempt.score.toFixed(1)}%
          </div>
          <div style={{ fontSize: '16px', marginTop: '10px' }}>
            Time: {Math.floor(selectedAttempt.timeTaken / 60)}:{(selectedAttempt.timeTaken % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {selectedAttempt.results.map((result, idx) => (
            <div
              key={idx}
              style={{
                border: `2px solid ${result.isCorrect ? '#28a745' : '#dc3545'}`,
                borderRadius: '8px',
                padding: '15px',
                background: 'white'
              }}
            >
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ 
                  fontSize: '20px',
                  color: result.isCorrect ? '#28a745' : '#dc3545'
                }}>
                  {result.isCorrect ? '✓' : '✗'}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                    Q{idx + 1}. {result.question}
                  </p>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    Your answer: <strong>{result.studentAnswer !== null ? result.options[result.studentAnswer] : 'Not answered'}</strong>
                  </p>
                  {!result.isCorrect && (
                    <p style={{ fontSize: '14px', color: '#28a745' }}>
                      Correct: <strong>{result.options[result.correctAnswer]}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="form-container" style={{ maxWidth: '1000px' }}>
      <h3>My Quiz History</h3>

      {attempts.length === 0 ? (
        <div className="no-data">
          <p>No quiz attempts yet</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Quiz</th>
                <th>Subject</th>
                <th>Chapter</th>
                <th>Score</th>
                <th>Date</th>
                <th>Time Taken</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map(attempt => (
                <tr key={attempt._id}>
                  <td>{attempt.quiz.title}</td>
                  <td>{attempt.quiz.subject}</td>
                  <td>{attempt.quiz.chapter}</td>
                  <td>
                    <span style={{ 
                      fontSize: '18px', 
                      fontWeight: 'bold',
                      color: attempt.score >= 75 ? '#28a745' : attempt.score >= 50 ? '#ffc107' : '#dc3545'
                    }}>
                      {attempt.score.toFixed(1)}%
                    </span>
                  </td>
                  <td>{new Date(attempt.completedAt).toLocaleDateString()}</td>
                  <td>{Math.floor(attempt.timeTaken / 60)}:{(attempt.timeTaken % 60).toString().padStart(2, '0')}</td>
                  <td>
                    <button
                      onClick={() => viewDetails(attempt._id)}
                      className="btn btn-primary"
                      style={{ padding: '5px 15px', fontSize: '12px' }}
                    >
                      View Details
                    </button>
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

export default QuizHistory;