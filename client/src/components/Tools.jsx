import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateContent, getProfile } from '../services/api';

const Tools = () => {
  const [type, setType] = useState('workplan');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [content, setContent] = useState('');
  const [profile, setProfile] = useState({ classes: [], subjects: [] });
  const navigate = useNavigate();

  // Load profile on mount
  React.useEffect(() => {
    getProfile().then(res => {
      setProfile(res.data);
      if (!res.data.classes?.length) navigate('/setup');
    }).catch(() => navigate('/login'));
  }, [navigate]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject) return alert('Select class/subject');
    try {
      const res = await generateContent({ type, class: parseInt(selectedClass), subject: selectedSubject });
      setContent(res.data.content);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert('Generation error');
    }
  };

  return (
    <div className="tools-page">
      <h2>AI Tools for CBC</h2>
      <form onSubmit={handleGenerate}>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="workplan">Generate Workplan</option>
          <option value="questions">Generate Questions</option>
        </select>
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          <option value="">Select Class</option>
          {profile.classes.map(c => <option key={c} value={c}>Grade {c}</option>)}
        </select>
        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
          <option value="">Select Subject</option>
          {profile.subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit">Generate</button>
      </form>
      {content && (
        <div className="output">
          <h3>AI Output:</h3>
          <pre>{content}</pre>
        </div>
      )}
    </div>
  );
};

export default Tools;