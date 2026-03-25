import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TakeQuiz = () => {
  const { API_URL, user } = useAuth();
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAvailableQuizzes();
  }, []);

  useEffect(() => {
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizStarted && !quizCompleted) {
      submitQuiz();
    }
  }, [timeLeft, quizStarted, quizCompleted]);

  const fetchAvailableQuizzes = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    console.log('Fetching available quizzes for student...');
    console.log('User data:', user);
    
    try {
      const response = await axios.get(`${API_URL}/quiz/available`);
      console.log('Quizzes received:', response.data);
      
      setAvailableQuizzes(response.data);
      
      if (response.data.length === 0) {
        setMessage({
          type: 'info',
          text: `No quizzes available for your class (${user?.class}${user?.section}). Please check with your admin.`
        });
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch quizzes'
      });
    }
    
    setLoading(false);
  };

  const startQuiz = async (quiz) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    console.log('Starting quiz:', quiz._id);

    try {
      const response = await axios.post(`${API_URL}/quiz/start/${quiz._id}`);
      
      console.log('Quiz started successfully:', response.data);
      
      setSelectedQuiz(quiz);
      setAttemptId(response.data.attemptId);
      setQuestions(response.data.questions);
      setTimeLeft(response.data.duration);
      setQuizStarted(true);
      setCurrentQuestion(0);
      setAnswers({});
    } catch (error) {
      console.error('Error starting quiz:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to start quiz'
      });
    }

    setLoading(false);
  };

  const handleAnswer = async (optionIndex) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });

    // Save answer to backend
    try {
      await axios.post(`${API_URL}/quiz/answer/${attemptId}`, {
        questionIndex: currentQuestion,
        answer: optionIndex
      });
      console.log(`Answer saved for question ${currentQuestion}`);
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    if (!window.confirm('Are you sure you want to submit the quiz? You cannot change your answers after submission.')) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/quiz/submit/${attemptId}`);
      
      console.log('Quiz submitted:', response.data);
      
      // Fetch detailed results
      const resultsResponse = await axios.get(`${API_URL}/quiz/results/${attemptId}`);
      
      console.log('Results fetched:', resultsResponse.data);
      
      setResults(resultsResponse.data);
      setQuizCompleted(true);
      setMessage({
        type: 'success',
        text: `Quiz completed! Score: ${response.data.score}%`
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit quiz'
      });
    }

    setLoading(false);
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setAttemptId(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(0);
    setQuizStarted(false);
    setQuizCompleted(false);
    setResults(null);
    setMessage({ type: '', text: '' });
    fetchAvailableQuizzes();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && !quizStarted) {
    return <div className="loading-message">Loading quizzes...</div>;
  }

  // Quiz selection screen
  if (!quizStarted && !quizCompleted) {
    return (
      <div className="form-container" style={{ maxWidth: '800px' }}>
        <h3>Available Quizzes</h3>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          background: '#f0f4ff',
          borderRadius: '8px',
          borderLeft: '4px solid #667eea'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
            <strong>Your Class:</strong> {user?.classSection || `${user?.class}${user?.section}`}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
            Only quizzes assigned to your class will appear here
          </p>
        </div>

        {availableQuizzes.length === 0 ? (
          <div className="no-data">
            <p>No quizzes available for your class at the moment</p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              Please contact your admin if you believe this is an error
            </p>
          </div>
        ) : (
          <div className="stats-grid">
            {availableQuizzes.map(quiz => (
              <div key={quiz._id} className="stat-card">
                <h4>{quiz.title}</h4>
                <p><strong>Subject:</strong> {quiz.subject}</p>
                <p><strong>Chapter:</strong> {quiz.chapter}</p>
                <p><strong>Class:</strong> {quiz.classSection}</p>
                <p><strong>Questions:</strong> {quiz.numberOfQuestions}</p>
                <p><strong>Duration:</strong> {Math.floor(quiz.duration / 60)} minutes</p>
                
                {quiz.attempted ? (
                  <button
                    disabled
                    className="btn btn-secondary"
                    style={{ marginTop: '10px', opacity: 0.6 }}
                  >
                    Already Attempted
                  </button>
                ) : (
                  <button
                    onClick={() => startQuiz(quiz)}
                    className="btn btn-primary"
                    style={{ marginTop: '10px' }}
                  >
                    Start Quiz
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Quiz in progress
  if (quizStarted && !quizCompleted) {
    const currentQ = questions[currentQuestion];

    return (
      <div className="attendance-container">
        <div className="attendance-form">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <div>
              <h3>{selectedQuiz.title}</h3>
              <p style={{ color: '#666', margin: '5px 0' }}>
                {selectedQuiz.subject} - {selectedQuiz.chapter}
              </p>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              background: timeLeft < 300 ? '#fee' : '#f0f0f0',
              padding: '10px 20px',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '24px' }}>⏱️</span>
              <span style={{ 
                fontSize: '20px', 
                fontWeight: 'bold',
                color: timeLeft < 300 ? '#dc3545' : '#333'
              }}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '14px', 
              color: '#666',
              marginBottom: '10px'
            }}>
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Object.keys(answers).length} answered</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: '#e0e0e0', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>

          <div style={{ 
            background: '#f8f9fa', 
            padding: '30px', 
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <h4 style={{ 
              fontSize: '18px', 
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              {currentQ.question}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  style={{
                    padding: '15px 20px',
                    textAlign: 'left',
                    border: answers[currentQuestion] === idx 
                      ? '2px solid #667eea' 
                      : '2px solid #ddd',
                    background: answers[currentQuestion] === idx 
                      ? '#f0f4ff' 
                      : 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'all 0.2s'
                  }}
                >
                  <strong>{String.fromCharCode(65 + idx)}.</strong> {option}
                </button>
              ))}
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="btn btn-secondary"
            >
              ← Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={submitQuiz}
                className="btn btn-primary"
                style={{ background: '#28a745' }}
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="btn btn-primary"
              >
                Next →
              </button>
            )}
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(10, 1fr)', 
            gap: '8px' 
          }}>
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                style={{
                  padding: '10px',
                  border: 'none',
                  borderRadius: '6px',
                  background: idx === currentQuestion
                    ? '#667eea'
                    : answers[idx] !== undefined
                    ? '#28a745'
                    : '#e0e0e0',
                  color: idx === currentQuestion || answers[idx] !== undefined
                    ? 'white'
                    : '#333',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Quiz completed - results screen
  if (quizCompleted && results) {
    return (
      <div className="attendance-container">
        <div className="attendance-form">
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '60px', marginBottom: '10px' }}>
              {results.score >= 75 ? '🎉' : results.score >= 50 ? '👍' : '📚'}
            </div>
            <h2>Quiz Completed!</h2>
            <p style={{ color: '#666', fontSize: '18px' }}>
              {results.quiz.title}
            </p>
          </div>

          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '40px',
            borderRadius: '15px',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
              {results.score.toFixed(1)}%
            </div>
            <div style={{ fontSize: '18px' }}>
              {results.results.filter(r => r.isCorrect).length} out of{' '}
              {results.results.length} correct
            </div>
            <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.9 }}>
              Time taken: {Math.floor(results.timeTaken / 60)}:{(results.timeTaken % 60).toString().padStart(2, '0')}
            </div>
          </div>

          <h3 style={{ marginBottom: '20px' }}>Answer Review:</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {results.results.map((result, idx) => (
              <div
                key={idx}
                style={{
                  border: `2px solid ${result.isCorrect ? '#28a745' : '#dc3545'}`,
                  borderRadius: '10px',
                  padding: '20px',
                  background: result.isCorrect ? '#f0fff4' : '#fff5f5'
                }}
              >
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ 
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: result.isCorrect ? '#28a745' : '#dc3545'
                  }}>
                    {result.isCorrect ? '✓' : '✗'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      fontWeight: 'bold', 
                      marginBottom: '10px',
                      fontSize: '16px'
                    }}>
                      Q{idx + 1}. {result.question}
                    </p>

                    <p style={{ 
                      fontSize: '14px', 
                      color: '#666',
                      marginBottom: '8px'
                    }}>
                      <strong>Your answer:</strong>{' '}
                      <span style={{ 
                        color: result.isCorrect ? '#28a745' : '#dc3545',
                        fontWeight: 'bold'
                      }}>
                        {result.studentAnswer !== null 
                          ? result.options[result.studentAnswer]
                          : 'Not answered'}
                      </span>
                    </p>

                    {!result.isCorrect && (
                      <p style={{ 
                        fontSize: '14px',
                        color: '#28a745',
                        fontWeight: 'bold',
                        marginBottom: '8px'
                      }}>
                        Correct answer: {result.options[result.correctAnswer]}
                      </p>
                    )}

                    <div style={{ 
                      marginTop: '12px',
                      padding: '12px',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                      borderLeft: '4px solid #667eea'
                    }}>
                      <p style={{ 
                        fontSize: '13px',
                        color: '#333',
                        lineHeight: '1.6'
                      }}>
                        <strong style={{ color: '#667eea' }}>Explanation: </strong>
                        {result.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={resetQuiz}
            className="btn btn-primary"
            style={{ marginTop: '30px' }}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TakeQuiz;