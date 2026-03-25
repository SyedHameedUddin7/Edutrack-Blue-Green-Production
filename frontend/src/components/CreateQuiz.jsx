import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CreateQuiz = () => {
  const { API_URL } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    chapter: '',
    classSection: '',
    duration: 1800,
    numberOfQuestions: 10
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const chapters = {
    Maths: [
      "Real Numbers", "Polynomials", "Pair of Linear Equations in Two Variables",
      "Quadratic Equations", "Arithmetic Progressions", "Triangles",
      "Coordinate Geometry", "Introduction to Trigonometry", "Applications of Trigonometry",
      "Circles", "Areas Related to Circles", "Surface Areas and Volumes",
      "Statistics", "Probability"
    ],
    Physics: [
      "Electricity", "Magnetic Effects of Electric Current", "Sources of Energy",
      "Reflection of Light by Curved Surfaces", "Refraction of Light at Curved Surfaces",
      "Human Eye and Colorful World"
    ],
    Biology: [
      "Nutrition", "Respiration", "Transportation", "Excretion",
      "Control and Coordination", "Reproduction", "Heredity and Evolution",
      "Our Environment"
    ],
    Social: [
      "India: Relief Features", "India: Climate and Vegetation",
      "Indian Rivers and Water Resources", "Industries in India",
      "Nationalism in India", "National Movement in India",
      "Indian Constitution", "Democracy and Diversity",
      "Sustainable Development with Equity"
    ]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'subject') {
      setFormData({
        ...formData,
        [name]: value,
        chapter: '' // Reset chapter when subject changes
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_URL}/quiz/create`, formData);
      
      setMessage({ 
        type: 'success', 
        text: `${response.data.message}! Generated ${response.data.quiz.questionPoolSize} questions.` 
      });
      
      // Reset form
      setFormData({
        title: '',
        subject: '',
        chapter: '',
        classSection: '',
        duration: 1800,
        numberOfQuestions: 10
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to create quiz' 
      });
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      <h3>Create AI-Powered Quiz</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Quiz Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-control"
            placeholder="e.g., Mid-term Exam - Trigonometry"
            required
          />
        </div>

        <div className="form-group">
          <label>Subject *</label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="">-- Select Subject --</option>
            <option value="Maths">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Biology">Biology</option>
            <option value="Social">Social Studies</option>
          </select>
        </div>

        {formData.subject && (
          <div className="form-group">
            <label>Chapter *</label>
            <select
              name="chapter"
              value={formData.chapter}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">-- Select Chapter --</option>
              {chapters[formData.subject].map((chapter, idx) => (
                <option key={idx} value={chapter}>
                  {chapter}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Class-Section *</label>
          <input
            type="text"
            name="classSection"
            value={formData.classSection}
            onChange={handleChange}
            className="form-control"
            placeholder="e.g., 10A"
            required
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            Enter class with section (e.g., 10A means Class 10 Section A)
          </small>
        </div>

        <div className="form-group">
          <label>Duration (minutes) *</label>
          <input
            type="number"
            name="duration"
            value={formData.duration / 60}
            onChange={(e) => setFormData({
              ...formData,
              duration: parseInt(e.target.value) * 60
            })}
            className="form-control"
            min="5"
            max="180"
            required
          />
        </div>

        <div className="form-group">
          <label>Number of Questions per Student *</label>
          <input
            type="number"
            name="numberOfQuestions"
            value={formData.numberOfQuestions}
            onChange={handleChange}
            className="form-control"
            min="5"
            max="15"
            required
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            AI will generate 15 questions. Each student gets {formData.numberOfQuestions} random questions.
          </small>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
        >
          {loading ? 'Generating Questions with AI...' : 'Create Quiz'}
        </button>
      </form>

      <div className="placeholder-message" style={{ marginTop: '30px' }}>
        <p><strong>🤖 AI-Powered Quiz Features:</strong></p>
        <ul>
          <li>AI generates 15 unique questions per chapter</li>
          <li>Each student gets different random questions from the pool</li>
          <li>Questions are verified for accuracy</li>
          <li>Includes detailed explanations for each answer</li>
          <li>Mixed difficulty levels (easy, medium, hard)</li>
          <li>Questions are saved and reused for consistency</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateQuiz;