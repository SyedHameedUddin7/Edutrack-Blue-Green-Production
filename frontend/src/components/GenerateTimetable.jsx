import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const GenerateTimetable = () => {
  const { API_URL } = useAuth();
  
  const [availableClasses, setAvailableClasses] = useState([]);
  const [classesWithTimetables, setClassesWithTimetables] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [classConfigurations, setClassConfigurations] = useState({});
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [loading, setLoading] = useState(false);
  const [fetchingFaculties, setFetchingFaculties] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const maxPeriodsPerWeek = 6 * 7; // 6 days × 7 periods = 42

  useEffect(() => {
    fetchAvailableClasses();
  }, []);

  const fetchAvailableClasses = async () => {
    try {
      const response = await axios.get(`${API_URL}/timetable/available-classes`);
      setAvailableClasses(response.data.availableClasses);
      setClassesWithTimetables(response.data.classesWithTimetables);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleClassToggle = async (classSection) => {
    const isCurrentlySelected = selectedClasses.includes(classSection);

    if (isCurrentlySelected) {
      // Remove class
      setSelectedClasses(selectedClasses.filter(c => c !== classSection));
      const newConfigs = { ...classConfigurations };
      delete newConfigs[classSection];
      setClassConfigurations(newConfigs);
    } else {
      // Add class
      setSelectedClasses([...selectedClasses, classSection]);
      
      // Fetch faculties for this class
      setFetchingFaculties(true);
      try {
        const response = await axios.get(`${API_URL}/timetable/faculties/${classSection}`);
        const facultyList = response.data;

        // Initialize allocation with default values
        const initialAllocation = facultyList.map(f => ({
          faculty: f.facultyId,
          facultyName: f.facultyName,
          subject: f.subject,
          periodsPerWeek: 6 // Default 6 periods per week
        }));

        setClassConfigurations({
          ...classConfigurations,
          [classSection]: {
            faculties: facultyList,
            allocation: initialAllocation
          }
        });

      } catch (error) {
        setMessage({
          type: 'error',
          text: `Failed to fetch faculties for ${classSection}`
        });
      }
      setFetchingFaculties(false);
    }

    setMessage({ type: '', text: '' });
  };

  const handlePeriodChange = (classSection, index, value) => {
    const numValue = parseInt(value) || 0;
    
    const newConfigs = { ...classConfigurations };
    newConfigs[classSection].allocation[index].periodsPerWeek = numValue;
    setClassConfigurations(newConfigs);
  };

  const getTotalPeriodsForClass = (classSection) => {
    if (!classConfigurations[classSection]) return 0;
    return classConfigurations[classSection].allocation.reduce(
      (sum, alloc) => sum + alloc.periodsPerWeek, 0
    );
  };

  const handleSelectAll = () => {
    const classesWithoutTimetables = availableClasses.filter(
      cls => !classesWithTimetables.includes(cls)
    );
    classesWithoutTimetables.forEach(cls => {
      if (!selectedClasses.includes(cls)) {
        handleClassToggle(cls);
      }
    });
  };

  const handleDeselectAll = () => {
    setSelectedClasses([]);
    setClassConfigurations({});
  };

  const handleGenerate = async () => {
    if (selectedClasses.length === 0) {
      setMessage({ 
        type: 'error', 
        text: 'Please select at least one class' 
      });
      return;
    }

    // Validate all classes
    for (const classSection of selectedClasses) {
      const totalPeriods = getTotalPeriodsForClass(classSection);
      
      if (totalPeriods === 0) {
        setMessage({ 
          type: 'error', 
          text: `${classSection}: Please allocate at least one period` 
        });
        return;
      }

      if (totalPeriods > maxPeriodsPerWeek) {
        setMessage({ 
          type: 'error', 
          text: `${classSection}: Total periods (${totalPeriods}) exceeds maximum (${maxPeriodsPerWeek})` 
        });
        return;
      }
    }

    const summary = selectedClasses.map(cls => 
      `${cls}: ${getTotalPeriodsForClass(cls)} periods`
    ).join('\n');

    if (!window.confirm(
      `Generate timetables for ${selectedClasses.length} class(es)?\n\n${summary}\n\n` +
      `This will automatically assign teachers and prevent scheduling conflicts across all classes.`
    )) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const results = {
      success: [],
      failed: []
    };

    // Generate timetable for each class
    for (const classSection of selectedClasses) {
      try {
        const response = await axios.post(`${API_URL}/timetable/generate`, {
          classSection,
          subjectAllocation: classConfigurations[classSection].allocation,
          academicYear
        });

        results.success.push(classSection);
        console.log(`✅ Generated timetable for ${classSection}`);

      } catch (error) {
        results.failed.push({
          class: classSection,
          error: error.response?.data?.message || 'Failed to generate'
        });
        console.error(`❌ Failed for ${classSection}:`, error);
      }
    }

    // Show results
    let resultMessage = '';
    if (results.success.length > 0) {
      resultMessage += `✅ Successfully generated timetables for:\n${results.success.join(', ')}\n\n`;
    }
    if (results.failed.length > 0) {
      resultMessage += `❌ Failed for:\n${results.failed.map(f => `${f.class}: ${f.error}`).join('\n')}`;
    }

    setMessage({
      type: results.failed.length === 0 ? 'success' : 'error',
      text: resultMessage
    });

    // Refresh available classes
    fetchAvailableClasses();
    
    // Reset only successful classes
    if (results.success.length > 0) {
      const remainingClasses = selectedClasses.filter(
        cls => !results.success.includes(cls)
      );
      setSelectedClasses(remainingClasses);

      const newConfigs = { ...classConfigurations };
      results.success.forEach(cls => delete newConfigs[cls]);
      setClassConfigurations(newConfigs);
    }

    setLoading(false);
  };

  return (
    <div className="form-container" style={{ maxWidth: '1200px' }}>
      <h3>Generate Timetable</h3>

      <div style={{
        marginBottom: '25px',
        padding: '20px',
        background: '#f0f4ff',
        borderRadius: '10px',
        borderLeft: '4px solid #667eea'
      }}>
        <h4 style={{ marginBottom: '10px', color: '#667eea' }}>🎯 Smart Features:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#555' }}>
          <li>Select multiple classes and customize periods per subject</li>
          <li>Automatic teacher assignment based on allocation</li>
          <li>Global collision prevention - no teacher in two places at once across all classes</li>
          <li>Flexible period distribution across 6 days × 7 periods</li>
        </ul>
      </div>

      <div className="form-group">
        <label>Academic Year</label>
        <input
          type="text"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          className="form-control"
          placeholder="e.g., 2024-2025"
        />
      </div>

      <div className="form-group">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <label style={{ margin: 0 }}>Select Classes for Timetable Generation *</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSelectAll}
              className="btn btn-secondary"
              style={{ padding: '5px 15px', fontSize: '12px' }}
              disabled={fetchingFaculties || loading}
            >
              Select All Available
            </button>
            <button
              onClick={handleDeselectAll}
              className="btn btn-secondary"
              style={{ padding: '5px 15px', fontSize: '12px' }}
              disabled={fetchingFaculties || loading}
            >
              Deselect All
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '12px',
          marginTop: '15px'
        }}>
          {availableClasses.length === 0 ? (
            <p style={{ color: '#666', gridColumn: '1 / -1' }}>
              No classes available. Please assign faculties to classes first.
            </p>
          ) : (
            availableClasses.map(cls => {
              const hasExisting = classesWithTimetables.includes(cls);
              const isSelected = selectedClasses.includes(cls);

              return (
                <div
                  key={cls}
                  onClick={() => !hasExisting && !fetchingFaculties && !loading && handleClassToggle(cls)}
                  style={{
                    padding: '15px',
                    border: `2px solid ${
                      hasExisting ? '#ccc' : isSelected ? '#667eea' : '#ddd'
                    }`,
                    borderRadius: '8px',
                    background: hasExisting ? '#f5f5f5' : isSelected ? '#f0f4ff' : 'white',
                    cursor: hasExisting || fetchingFaculties || loading ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    color: hasExisting ? '#999' : '#333',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '18px', marginBottom: '5px' }}>
                    {cls}
                  </div>
                  {hasExisting && (
                    <div style={{
                      fontSize: '11px',
                      color: '#28a745',
                      fontWeight: 'bold'
                    }}>
                      ✓ Exists
                    </div>
                  )}
                  {isSelected && !hasExisting && (
                    <div style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      color: '#667eea',
                      fontSize: '20px'
                    }}>
                      ✓
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {fetchingFaculties && (
          <div style={{ marginTop: '10px', color: '#667eea', textAlign: 'center' }}>
            Loading faculties...
          </div>
        )}
      </div>

      {selectedClasses.length > 0 && (
        <>
          {selectedClasses.map(classSection => {
            const config = classConfigurations[classSection];
            if (!config) return null;

            const totalAllocated = getTotalPeriodsForClass(classSection);
            const remainingPeriods = maxPeriodsPerWeek - totalAllocated;
            const progressPercentage = (totalAllocated / maxPeriodsPerWeek) * 100;

            return (
              <div 
                key={classSection}
                style={{
                  marginTop: '25px',
                  marginBottom: '20px',
                  padding: '20px',
                  background: '#fff',
                  border: '2px solid #667eea',
                  borderRadius: '10px'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <h4 style={{ margin: 0, color: '#333' }}>
                    📚 Class {classSection}
                  </h4>
                  <button
                    onClick={() => handleClassToggle(classSection)}
                    style={{
                      padding: '5px 10px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Remove
                  </button>
                </div>
                
                <div style={{
                  display: 'grid',
                  gap: '15px'
                }}>
                  {config.allocation.map((allocation, index) => (
                    <div 
                      key={index}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 2fr 1fr',
                        gap: '15px',
                        alignItems: 'center',
                        padding: '15px',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      <div>
                        <div style={{ 
                          fontWeight: 'bold', 
                          color: '#667eea',
                          marginBottom: '4px'
                        }}>
                          {allocation.subject}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          👨‍🏫 {allocation.facultyName}
                        </div>
                      </div>

                      <div>
                        <label style={{ 
                          fontSize: '12px', 
                          color: '#666',
                          display: 'block',
                          marginBottom: '5px'
                        }}>
                          Periods per week:
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={maxPeriodsPerWeek}
                          value={allocation.periodsPerWeek}
                          onChange={(e) => handlePeriodChange(classSection, index, e.target.value)}
                          className="form-control"
                          style={{ fontSize: '16px', fontWeight: 'bold' }}
                          disabled={loading}
                        />
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold',
                          color: allocation.periodsPerWeek > 0 ? '#667eea' : '#ccc'
                        }}>
                          {allocation.periodsPerWeek}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          periods
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  background: totalAllocated > maxPeriodsPerWeek ? '#fff3cd' : '#d4edda',
                  border: `2px solid ${totalAllocated > maxPeriodsPerWeek ? '#ffc107' : '#28a745'}`,
                  borderRadius: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <div>
                      <strong style={{ fontSize: '18px' }}>
                        Total: {totalAllocated} / {maxPeriodsPerWeek}
                      </strong>
                      <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                        {remainingPeriods >= 0 
                          ? `${remainingPeriods} periods remaining (will be free periods)`
                          : `⚠️ Exceeds by ${Math.abs(remainingPeriods)} periods!`
                        }
                      </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                      {progressPercentage.toFixed(0)}%
                    </div>
                  </div>

                  <div style={{
                    width: '100%',
                    height: '12px',
                    background: '#e0e0e0',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(progressPercentage, 100)}%`,
                      height: '100%',
                      background: totalAllocated > maxPeriodsPerWeek 
                        ? 'linear-gradient(90deg, #ffc107, #ff6b6b)' 
                        : 'linear-gradient(90deg, #667eea, #764ba2)',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={handleGenerate}
            className="btn btn-primary"
            disabled={loading || selectedClasses.length === 0}
            style={{ width: '100%', marginTop: '20px' }}
          >
            {loading ? 'Generating...' : `Generate Timetables for ${selectedClasses.length} Class(es)`}
          </button>
        </>
      )}

      {message.text && (
        <div className={`message ${message.type}`} style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>
          {message.text}
        </div>
      )}

      <div style={{
        marginTop: '25px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#555'
      }}>
        <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>📋 How it works:</h4>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Select one or more classes from the grid</li>
          <li>For each class, teachers will be loaded automatically</li>
          <li>Set how many periods each subject should have per week</li>
          <li>System generates optimized schedules with collision prevention across all classes</li>
          <li>Teachers won't be scheduled in multiple classes at the same time</li>
        </ol>
      </div>
    </div>
  );
};

export default GenerateTimetable;