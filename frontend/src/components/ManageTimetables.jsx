import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ManageTimetables = () => {
  const { API_URL } = useAuth();
  
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/timetable/all`);
      setTimetables(response.data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to fetch timetables'
      });
    }
    setLoading(false);
  };

  const handleView = async (classSection) => {
    try {
      const response = await axios.get(`${API_URL}/timetable/class/${classSection}`);
      setSelectedTimetable(response.data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to fetch timetable details'
      });
    }
  };

  const handleDelete = async (timetableId, classSection) => {
    if (!window.confirm(`Are you sure you want to delete the timetable for ${classSection}? This cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/timetable/${timetableId}`);
      setMessage({
        type: 'success',
        text: `Timetable for ${classSection} deleted successfully`
      });
      fetchTimetables();
      if (selectedTimetable && selectedTimetable._id === timetableId) {
        setSelectedTimetable(null);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to delete timetable'
      });
    }
  };

  if (loading) {
    return <div className="loading-message">Loading timetables...</div>;
  }

  if (selectedTimetable) {
    return (
      <div className="form-container" style={{ maxWidth: '1200px' }}>
        <button
          onClick={() => setSelectedTimetable(null)}
          className="btn btn-secondary"
          style={{ marginBottom: '20px' }}
        >
          ← Back to List
        </button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <h3 style={{ margin: 0 }}>Timetable - {selectedTimetable.classSection}</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
              Academic Year: {selectedTimetable.academicYear}
            </p>
          </div>
          <button
            onClick={() => handleDelete(selectedTimetable._id, selectedTimetable.classSection)}
            className="btn btn-danger-small"
          >
            Delete Timetable
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="attendance-table" style={{ fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Time</th>
                {DAYS.map(day => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedTimetable.schedule[0].periods.map((period, periodIdx) => (
                <tr key={periodIdx}>
                  <td style={{ fontWeight: 'bold', fontSize: '12px' }}>
                    Period {period.periodNumber}<br />
                    <span style={{ fontSize: '11px', color: '#666' }}>
                      {period.startTime} - {period.endTime}
                    </span>
                  </td>
                  {DAYS.map(day => {
                    const daySchedule = selectedTimetable.schedule.find(s => s.day === day);
                    const dayPeriod = daySchedule?.periods[periodIdx];
                    
                    return (
                      <td key={day} style={{ 
                        background: dayPeriod ? '#f0f4ff' : 'white',
                        padding: '12px'
                      }}>
                        {dayPeriod && (
                          <div>
                            <div style={{ 
                              fontWeight: 'bold', 
                              color: '#667eea',
                              marginBottom: '4px'
                            }}>
                              {dayPeriod.subject}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {dayPeriod.faculty?.name || dayPeriod.facultyName}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>📊 Summary:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '13px' }}>
            <div>
              <strong>Total Periods/Week:</strong> {selectedTimetable.schedule[0].periods.length * DAYS.length}
            </div>
            <div>
              <strong>Periods/Day:</strong> {selectedTimetable.schedule[0].periods.length}
            </div>
            <div>
              <strong>Days/Week:</strong> {DAYS.length}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container" style={{ maxWidth: '1000px' }}>
      <h3>Manage Timetables</h3>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {timetables.length === 0 ? (
        <div className="no-data">
          <p>No timetables created yet</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Class-Section</th>
                <th>Academic Year</th>
                <th>Total Periods</th>
                <th>Created On</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {timetables.map(timetable => (
                <tr key={timetable._id}>
                  <td><strong>{timetable.classSection}</strong></td>
                  <td>{timetable.academicYear}</td>
                  <td>
                    {timetable.schedule.length} days × {timetable.schedule[0].periods.length} periods
                  </td>
                  <td>{new Date(timetable.createdAt).toLocaleDateString()}</td>
                  <td>{timetable.createdBy?.username || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${timetable.isActive ? 'present' : 'absent'}`}>
                      {timetable.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleView(timetable.classSection)}
                        className="btn btn-primary"
                        style={{ padding: '5px 12px', fontSize: '12px' }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(timetable._id, timetable.classSection)}
                        className="btn btn-danger-small"
                        style={{ padding: '5px 12px', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    </div>
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

export default ManageTimetables;