import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile, getProfile } from '../services/api';
import { CBC_GRADE_LEVELS, getSubjectsForGrades } from '../config/cbc';

const Setup = () => {
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndLoad = async () => {
      try {
        const res = await getProfile();
        setSelectedClasses(res.data.classes || []);
        setSelectedSubjects(res.data.subjects || []);
        setAvailableSubjects(getSubjectsForGrades(res.data.classes || []));
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        navigate('/login');
      }
    };
    fetchAndLoad();
  }, [navigate]);

  useEffect(() => {
    setAvailableSubjects(getSubjectsForGrades(selectedClasses));
    setSelectedSubjects([]);  // Reset subjects on class change
  }, [selectedClasses]);

  const handleClassChange = (grade) => {
    setSelectedClasses(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedClasses.length === 0 || selectedSubjects.length === 0) {
      alert('Select at least one class and subject');
      return;
    }
    try {
      await updateProfile({ classes: selectedClasses, subjects: selectedSubjects });
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error');
    }
  };

  return (
    <div className="setup-form">
      <h2>Setup Your Teaching Profile</h2>
      <form onSubmit={handleSubmit}>
        <section>
          <h3>Select Classes (Grades 1-9)</h3>
          {CBC_GRADE_LEVELS.map(level => (
            <div key={level.id}>
              <strong>{level.name}</strong>
              {level.grades.map(grade => (
                <label key={grade}>
                  <input
                    type="checkbox"
                    checked={selectedClasses.includes(grade)}
                    onChange={() => handleClassChange(grade)}
                  />
                  Grade {grade}
                </label>
              ))}
            </div>
          ))}
        </section>
        <section>
          <h3>Select Subjects (Based on Classes)</h3>
          {availableSubjects.map(subject => (
            <label key={subject}>
              <input
                type="checkbox"
                checked={selectedSubjects.includes(subject)}
                onChange={() => handleSubjectChange(subject)}
              />
              {subject}
            </label>
          ))}
        </section>
        <button type="submit">Save Setup</button>
      </form>
    </div>
  );
};

export default Setup;