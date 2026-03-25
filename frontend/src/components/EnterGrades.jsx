import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const EnterGrades = () => {
  const { API_URL, user } = useAuth();
  const [selectedClassSection, setSelectedClassSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [term, setTerm] = useState('FA4');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [subjects, setSubjects] = useState([
    { name: 'Language Hindi', marksObtained: '', totalMarks: 100 },
    { name: 'Language Telugu', marksObtained: '', totalMarks: 100 },
    { name: 'Language English', marksObtained: '', totalMarks: 100 },
    { name: 'Mathematics', marksObtained: '', totalMarks: 100 },
    { name: 'Science', marksObtained: '', totalMarks: 100 },
    { name: 'Social', marksObtained: '', totalMarks: 100 }
  ]);

  const [extraCurricular, setExtraCurricular] = useState({
    gk: { grade: 'A', remarks: '' },
    computer: { grade: 'A', remarks: '' },
    sports: { grade: 'A', remarks: '' }
  });

  const [descriptiveIndicators, setDescriptiveIndicators] = useState('');

  const availableClasses = user?.classes || [];

  useEffect(() => {
    if (selectedClassSection) {
      fetchStudents();
    }
  }, [selectedClassSection]);

  useEffect(() => {
    if (selectedStudent && term) {
      loadExistingGrades();
    }
  }, [selectedStudent, term]);

  const fetchStudents = async () => {
    if (!selectedClassSection) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/grades/students/${selectedClassSection}`
      );
      setStudents(response.data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch students'
      });
    }
    setLoading(false);
  };

  const loadExistingGrades = async () => {
    if (!selectedStudent || !term || !academicYear) return;

    try {
      const response = await axios.get(
        `${API_URL}/grades/student/${selectedStudent._id}?term=${term}&academicYear=${academicYear}`
      );

      if (response.data && response.data.length > 0) {
        const existingGrade = response.data[0];
        
        // Set subjects
        if (existingGrade.subjects && existingGrade.subjects.length > 0) {
          setSubjects(existingGrade.subjects);
        }
        
        // Set extraCurricular with proper defaults
        const loadedExtra = existingGrade.extraCurricular || {};
        setExtraCurricular({
          gk: loadedExtra.gk || { grade: 'A', remarks: '' },
          computer: loadedExtra.computer || { grade: 'A', remarks: '' },
          sports: loadedExtra.sports || { grade: 'A', remarks: '' }
        });
        
        // Set descriptive indicators
        setDescriptiveIndicators(existingGrade.descriptiveIndicators || '');
        
        setMessage({ 
          type: 'info', 
          text: 'Loaded existing grades for this student' 
        });
        
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        // No existing grades, reset to default
        resetForm();
      }
    } catch (error) {
      console.error('Error loading grades:', error);
      // If error (like no grades found), just reset form
      resetForm();
    }
  };

  const resetForm = () => {
    setSubjects([
      { name: 'Language Hindi', marksObtained: '', totalMarks: 100 },
      { name: 'Language Telugu', marksObtained: '', totalMarks: 100 },
      { name: 'Language English', marksObtained: '', totalMarks: 100 },
      { name: 'Mathematics', marksObtained: '', totalMarks: 100 },
      { name: 'Science', marksObtained: '', totalMarks: 100 },
      { name: 'Social', marksObtained: '', totalMarks: 100 }
    ]);
    setExtraCurricular({
      gk: { grade: 'A', remarks: '' },
      computer: { grade: 'A', remarks: '' },
      sports: { grade: 'A', remarks: '' }
    });
    setDescriptiveIndicators('');
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    
    if (field === 'marksObtained' || field === 'totalMarks') {
      // Allow empty string or convert to number
      newSubjects[index][field] = value === '' ? '' : Number(value);
    } else {
      newSubjects[index][field] = value;
    }
    
    setSubjects(newSubjects);
  };

  const handleExtraCurricularChange = (subject, field, value) => {
    setExtraCurricular({
      ...extraCurricular,
      [subject]: {
        ...extraCurricular[subject],
        [field]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStudent) {
      setMessage({ type: 'error', text: 'Please select a student' });
      return;
    }

    // Validate that all marks are filled
    const hasEmptyMarks = subjects.some(s => s.marksObtained === '' || s.marksObtained === null);
    if (hasEmptyMarks) {
      setMessage({ type: 'error', text: 'Please enter marks for all subjects' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Convert empty strings to 0 before submitting
      const submissionSubjects = subjects.map(s => ({
        ...s,
        marksObtained: s.marksObtained === '' ? 0 : Number(s.marksObtained),
        totalMarks: Number(s.totalMarks)
      }));

      await axios.post(`${API_URL}/grades/submit`, {
        studentId: selectedStudent._id,
        classSection: selectedClassSection,
        term,
        academicYear,
        subjects: submissionSubjects,
        extraCurricular,
        descriptiveIndicators
      });

      setMessage({
        type: 'success',
        text: `Grades submitted successfully for ${selectedStudent.name}!`
      });

      // Reset form after successful submission
      resetForm();
      setSelectedStudent(null);

      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit grades'
      });
    }

    setLoading(false);
  };

  return (
    <div className="grades-container">
      <h3>Enter Student Grades</h3>

      <div className="grades-form">
        <div className="form-row">
          <div className="form-group">
            <label>Class-Section *</label>
            <select
              value={selectedClassSection}
              onChange={(e) => {
                setSelectedClassSection(e.target.value);
                setSelectedStudent(null);
              }}
              className="form-control"
              required
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
            <label>Select Student *</label>
            <select
              value={selectedStudent?._id || ''}
              onChange={(e) => {
                const student = students.find(s => s._id === e.target.value);
                setSelectedStudent(student);
              }}
              className="form-control"
              required
              disabled={!selectedClassSection}
            >
              <option value="">-- Select Student --</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.rollNumber} - {student.name}
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

        {selectedStudent && (
          <form onSubmit={handleSubmit}>
            <div className="student-info-card">
              <h4>Student: {selectedStudent.name}</h4>
              <p>Roll Number: {selectedStudent.rollNumber}</p>
              <p>Class: {selectedStudent.classSection}</p>
            </div>

            <div className="subjects-table-container">
              <h4>Subject Marks</h4>
              <table className="grades-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Marks Obtained</th>
                    <th>Total Marks</th>
                    <th>Remarks (Optional)</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject, index) => (
                    <tr key={index}>
                      <td>{subject.name}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={subject.totalMarks}
                          value={subject.marksObtained}
                          onChange={(e) =>
                            handleSubjectChange(index, 'marksObtained', e.target.value)
                          }
                          className="form-control small-input"
                          placeholder="Enter marks"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={subject.totalMarks}
                          onChange={(e) =>
                            handleSubjectChange(index, 'totalMarks', e.target.value)
                          }
                          className="form-control small-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={subject.remarks || ''}
                          onChange={(e) =>
                            handleSubjectChange(index, 'remarks', e.target.value)
                          }
                          className="form-control"
                          placeholder="Optional remarks"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="extra-curricular-section">
              <h4>Extra Curricular</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>GK Grade</label>
                  <select
                    value={extraCurricular.gk?.grade || 'A'}
                    onChange={(e) =>
                      handleExtraCurricularChange('gk', 'grade', e.target.value)
                    }
                    className="form-control"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Computer Grade</label>
                  <select
                    value={extraCurricular.computer?.grade || 'A'}
                    onChange={(e) =>
                      handleExtraCurricularChange('computer', 'grade', e.target.value)
                    }
                    className="form-control"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Sports Grade</label>
                  <select
                    value={extraCurricular.sports?.grade || 'A'}
                    onChange={(e) =>
                      handleExtraCurricularChange('sports', 'grade', e.target.value)
                    }
                    className="form-control"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Descriptive Indicators / Remarks</label>
              <textarea
                value={descriptiveIndicators}
                onChange={(e) => setDescriptiveIndicators(e.target.value)}
                className="form-control"
                rows="4"
                placeholder="Enter overall performance remarks..."
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Grades'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EnterGrades;