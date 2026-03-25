import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const FacultySchedule = () => {
  const { API_URL } = useAuth();
  
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/timetable/faculty-schedule`);
      setSchedule(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch schedule');
      console.error('Error fetching schedule:', error);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="loading-message">Loading your schedule...</div>;
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

  if (!schedule) {
    return (
      <div className="form-container" style={{ maxWidth: '800px' }}>
        <div className="no-data">
          <p>No schedule available</p>
        </div>
      </div>
    );
  }

  // Count total classes and free periods
  const totalPeriods = schedule.schedule[0].periods.length * weekDays.length;
  const assignedPeriods = schedule.schedule.reduce((sum, day) => {
    return sum + day.periods.filter(p => !p.free).length;
  }, 0);
  const freePeriods = totalPeriods - assignedPeriods;

  return (
    <div className="form-container" style={{ maxWidth: '1200px' }}>
      <div style={{
        marginBottom: '25px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '10px'
      }}>
        <h3 style={{ margin: 0, color: 'white' }}>My Weekly Schedule</h3>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
          {schedule.facultyName} • Subject: {schedule.subject}
        </p>
        <p style={{ margin: '5px 0 0 0', fontSize: '13px', opacity: 0.8 }}>
          Teaching Classes: {schedule.classes.join(', ')}
        </p>
      </div>

      <div style={{
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
      }}>
        <div className="stat-card" style={{ borderTop: '4px solid #667eea' }}>
          <h4>📚 Total Periods</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea', margin: '10px 0' }}>
            {assignedPeriods}
          </p>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            Classes per week
          </p>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #28a745' }}>
          <h4>⏰ Free Periods</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745', margin: '10px 0' }}>
            {freePeriods}
          </p>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            Available slots
          </p>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #ffc107' }}>
          <h4>📊 Workload</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffc107', margin: '10px 0' }}>
            {((assignedPeriods / totalPeriods) * 100).toFixed(0)}%
          </p>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            of total periods
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="attendance-table" style={{ fontSize: '13px' }}>
          <thead>
            <tr>
              <th style={{ width: '110px', background: '#667eea', color: 'white' }}>
                Time
              </th>
              {weekDays.map(day => (
                <th key={day} style={{ background: '#667eea', color: 'white' }}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.schedule[0].periods.map((period, periodIdx) => (
              <tr key={periodIdx}>
                <td style={{ 
                  fontWeight: 'bold', 
                  background: '#f0f4ff',
                  textAlign: 'center',
                  fontSize: '12px'
                }}>
                  <div>Period {period.periodNumber}</div>
                  <div style={{ color: '#666', marginTop: '4px' }}>
                    {period.startTime} - {period.endTime}
                  </div>
                </td>
                {weekDays.map(day => {
                  const daySchedule = schedule.schedule.find(s => s.day === day);
                  const dayPeriod = daySchedule?.periods[periodIdx];
                  
                  return (
                    <td key={day} style={{ 
                      background: dayPeriod?.free ? '#f9f9f9' : '#fff',
                      padding: '12px',
                      textAlign: 'center'
                    }}>
                      {dayPeriod?.free ? (
                        <div style={{ 
                          color: '#28a745',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          Free
                        </div>
                      ) : (
                        <div>
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: '#667eea',
                            marginBottom: '4px'
                          }}>
                            {dayPeriod?.subject}
                          </div>
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#666',
                            background: '#f0f4ff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            display: 'inline-block'
                          }}>
                            {dayPeriod?.classSection}
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
        borderRadius: '8px',
        fontSize: '13px',
        color: '#555'
      }}>
        <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>📌 Legend:</h4>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              background: 'white', 
              border: '2px solid #667eea',
              borderRadius: '4px'
            }} />
            <span>Assigned Class</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              background: '#f9f9f9', 
              border: '2px solid #ddd',
              borderRadius: '4px'
            }} />
            <span>Free Period</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultySchedule;