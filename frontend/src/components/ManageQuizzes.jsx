import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ManageQuizzes = () => {
  const { API_URL } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/quiz/all`);
      setQuizzes(response.data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to fetch quizzes'
      });
    }
    setLoading(false);
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? All student attempts will also be deleted.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/quiz/${quizId}`);
      setMessage({
        type: 'success',
        text: 'Quiz deleted successfully'
      });
      fetchQuizzes();
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to delete quiz'
      });
    }
  };

  if (loading) {
    return <div className="loading-message">Loading quizzes...</div>;
  }

  return (
    <div className="form-container" style={{ maxWidth: '1000px' }}>
      <h3>Manage Quizzes</h3>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="no-data">
          <p>No quizzes created yet</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Chapter</th>
                <th>Class</th>
                <th>Questions</th>
                <th>Duration</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(quiz => (
                <tr key={quiz._id}>
                  <td>{quiz.title}</td>
                  <td>{quiz.subject}</td>
                  <td>{quiz.chapter}</td>
                  <td>{quiz.classSection}</td>
                  <td>{quiz.numberOfQuestions} / {quiz.questionPool.length}</td>
                  <td>{Math.floor(quiz.duration / 60)} min</td>
                  <td>{new Date(quiz.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${quiz.isActive ? 'present' : 'absent'}`}>
                      {quiz.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(quiz._id)}
                      className="btn btn-danger-small"
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      Delete
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

export default ManageQuizzes;