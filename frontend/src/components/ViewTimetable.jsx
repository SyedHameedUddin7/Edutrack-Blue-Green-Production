import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ViewTimetable = () => {
  const { API_URL, user } = useAuth();
  
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/timetable/my-timetable`);
      setTimetable(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch timetable');
      console.error('Error fetching timetable:', error);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="loading-message">Loading your timetable...</div>;
  }

  if (error) {
    return (
      <div className="form-container" style={{ maxWidth: '800px' }}>
        <div className="no-data">
          <p>{error}</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Please contact your admin if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  if (!timetable) {
    return (
      <div className="form-container" style={{ maxWidth: '800px' }}>
        <div className="no-data">
          <p>No timetable available for your class</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container" style={{ maxWidth: '1200px' }}>
      <div style={{
        marginBottom: '25px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '10px'
      }}>
        <h3 style={{ margin: 0, color: 'white' }}>My Timetable</h3>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
          Class {timetable.classSection} • Academic Year: {timetable.academicYear}
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="attendance-table" style={{ fontSize: '14px' }}>
          <thead>
            <tr>
              <th style={{ width: '120px', background: '#667eea', color: 'white' }}>
                Time
              </th>
              {DAYS.map(day => (
                <th key={day} style={{ background: '#667eea', color: 'white' }}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timetable.schedule[0].periods.map((period, periodIdx) => (
              <tr key={periodIdx}>
                <td style={{ 
                  fontWeight: 'bold', 
                  background: '#f0f4ff',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '13px' }}>Period {period.periodNumber}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {period.startTime} - {period.endTime}
                  </div>
                </td>
                {DAYS.map(day => {
                  const daySchedule = timetable.schedule.find(s => s.day === day);
                  const dayPeriod = daySchedule?.periods[periodIdx];
                  
                  return (
                    <td key={day} style={{ 
                      background: dayPeriod ? 'white' : '#fafafa',
                      padding: '15px',
                      verticalAlign: 'top'
                    }}>
                      {dayPeriod ? (
                        <div>
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: '#667eea',
                            marginBottom: '6px',
                            fontSize: '15px'
                          }}>
                            {dayPeriod.subject}
                          </div>
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            <span>👨‍🏫</span>
                            {dayPeriod.faculty?.name || dayPeriod.facultyName}
                          </div>
                        </div>
                      ) : (
                        <div style={{ 
                          color: '#999', 
                          fontSize: '13px',
                          textAlign: 'center'
                        }}>
                          -
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
        marginTop: '25px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px'
      }}>
        <div className="stat-card">
          <h4>📚 Total Periods</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea', margin: '10px 0' }}>
            {timetable.schedule[0].periods.length * DAYS.length}
          </p>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            {timetable.schedule[0].periods.length} periods/day × {DAYS.length} days
          </p>
        </div>

        <div className="stat-card">
          <h4>⏰ Daily Schedule</h4>
          <p style={{ fontSize: '16px', margin: '10px 0' }}>
            <strong>{timetable.schedule[0].periods[0].startTime}</strong> to{' '}
            <strong>{timetable.schedule[0].periods[timetable.schedule[0].periods.length - 1].endTime}</strong>
          </p>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            School timings
          </p>
        </div>

        <div className="stat-card">
          <h4>📅 Week Days</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745', margin: '10px 0' }}>
            {DAYS.length}
          </p>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            Monday to Saturday
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewTimetable;