// frontend/src/components/Students.jsx
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addStudent, getStudents, getRecommendations, getProfile } from '../services/api';

const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const Students = () => {
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [bulkRows, setBulkRows] = useState([{ name: '', performance: '' }]);
  const [saving, setSaving] = useState(false);
  const [recs, setRecs] = useState({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  const navigate = useNavigate();

  // Fetch teacher profile to get their subjects per class
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        const { classes = [], subjects = [] } = res.data;
        
        // Map: class → subjects they teach
        const classSubjectMap = {};
        classes.forEach(cls => {
          // For now: assume all subjects apply to all selected classes
          // Later: can refine per-class subjects
          classSubjectMap[cls] = subjects;
        });

        // Store in state for dynamic dropdown
        window.__teacherClassSubjects = classSubjectMap;
        setLoadingProfile(false);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchProfile();
    fetchStudents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Update available subjects when class changes
  useEffect(() => {
    if (selectedClass && window.__teacherClassSubjects?.[selectedClass]) {
      setAvailableSubjects(window.__teacherClassSubjects[selectedClass]);
      setSelectedSubject(''); // Reset subject
    } else {
      setAvailableSubjects([]);
      setSelectedSubject('');
    }
  }, [selectedClass]);

  const fetchStudents = async () => {
    try {
      const res = await getStudents();
      setStudents(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const addRow = () => {
    setBulkRows(prev => [...prev, { name: '', performance: '' }]);
  };

  const updateRow = (index, field, value) => {
    const updated = [...bulkRows];
    updated[index][field] = value;
    setBulkRows(updated);
  };

  const removeRow = (index) => {
    setBulkRows(prev => prev.filter((_, i) => i !== index));
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const rows = pasted
      .trim()
      .split('\n')
      .map(row => {
        const [name, perf] = row.split('\t');
        return {
          name: name?.trim() || '',
          performance: perf?.trim() ? parseInt(perf) || '' : ''
        };
      })
      .filter(r => r.name);

    setBulkRows(rows.length > 0 ? rows : [{ name: '', performance: '' }]);
  };

  const saveBulk = async () => {
    if (!selectedClass) return alert('Please select a class');
    if (!selectedSubject) return alert('Please select a subject');
    
    const validRows = bulkRows
      .map(r => ({
        name: r.name.trim(),
        performance: r.performance ? parseInt(r.performance) : undefined
      }))
      .filter(r => r.name);

    if (validRows.length === 0) return alert('No valid students to add');

    setSaving(true);
    try {
      for (const { name, performance } of validRows) {
        await addStudent({
          name,
          class: parseInt(selectedClass),
          subject: selectedSubject,
          performance
        });
      }
      setBulkRows([{ name: '', performance: '' }]);
      fetchStudents();
      alert(`${validRows.length} students added/updated in ${selectedSubject}!`);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert('Some students failed to save');
    } finally {
      setSaving(false);
    }
  };

  const fetchRec = async (studentId) => {
    try {
      const res = await getRecommendations({ studentId });
      setRecs(prev => ({ ...prev, [studentId]: res.data.recommendations }));
    } catch {
      alert('AI recommendation failed');
    }
  };

  if (loadingProfile) return <p>Loading your profile...</p>;

  return (
    <div className="students-page">
      <h2>Manage Students</h2>

      {/* Bulk Add Section */}
      <div className="bulk-section">
        <h3>Add Multiple Students</h3>
        <p><strong>Tip:</strong> Copy from Excel/Google Sheets → Paste below</p>

        <div className="selectors-row">
          <div className="class-selector">
            <label>Select Class: </label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              required
            >
              <option value="">Choose Grade</option>
              {GRADES.map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>

          <div className="subject-selector">
            <label>Select Subject: </label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              disabled={!selectedClass || availableSubjects.length === 0}
              required
            >
              <option value="">
                {selectedClass 
                  ? (availableSubjects.length > 0 ? 'Choose Subject' : 'No subjects for this class')
                  : 'First select class'}
              </option>
              {availableSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bulk-table-container">
          <table className="bulk-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Performance %</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bulkRows.map((row, i) => (
                <tr key={i}>
                  <td>
                    <input
                      type="text"
                      value={row.name}
                      onChange={e => updateRow(i, 'name', e.target.value)}
                      placeholder="e.g. John Kamau"
                      onPaste={i === 0 ? handlePaste : undefined}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.performance}
                      onChange={e => updateRow(i, 'performance', e.target.value)}
                      placeholder="0-100"
                      min="0"
                      max="100"
                    />
                  </td>
                  <td>
                    {bulkRows.length > 1 && (
                      <button
                        type="button"
                        className="remove-row"
                        onClick={() => removeRow(i)}
                      >
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bulk-actions">
          <button type="button" onClick={addRow} className="add-row-btn">
            + Add Row
          </button>
          <button
            onClick={saveBulk}
            disabled={saving || !selectedClass || !selectedSubject}
            className="save-bulk-btn"
          >
            {saving 
              ? 'Saving...' 
              : `Add ${bulkRows.filter(r => r.name).length} Students to ${selectedSubject}`
            }
          </button>
        </div>
      </div>

      {/* Existing Students List */}
      <div className="students-list">
        <h3>Your Students ({students.length})</h3>
        {students.length === 0 ? (
          <p>No students yet. Add above!</p>
        ) : (
          <ul>
            {students.map(student => (
              <li key={student._id} className="student-item">
                <div>
                  <strong>{student.name}</strong> — Grade {student.class}, <em>{student.subject}</em>
                  {student.performance !== undefined && ` — ${student.performance}%`}
                </div>
                <div className="actions">
                  <button onClick={() => fetchRec(student._id)}>
                    AI Recommendation
                  </button>
                  {recs[student._id] && (
                    <div className="recommendation">
                      <strong>AI:</strong> {recs[student._id]}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Students;