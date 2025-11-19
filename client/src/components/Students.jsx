// src/components/Students.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addStudent, getStudents, getRecommendations, getProfile } from '../services/api';
import Navbar from './Navbar';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [bulkRows, setBulkRows] = useState([{ name: '', performance: '' }]);
  const [saving, setSaving] = useState(false);
  const [recs, setRecs] = useState({});
  const [loadingRec, setLoadingRec] = useState({});
  const [teacherClasses, setTeacherClasses] = useState({});
  const navigate = useNavigate();

  // Load teacher profile and students
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        const classSubjectMap = {};
        res.data.classes.forEach(cls => {
          classSubjectMap[cls] = res.data.subjects;
        });
        setTeacherClasses(classSubjectMap);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      }
    };
    fetchProfile();
    fetchStudents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Update available subjects when class changes
  useEffect(() => {
    if (selectedClass && teacherClasses[selectedClass]) {
      setAvailableSubjects(teacherClasses[selectedClass]);
      setSelectedSubject('');
    } else {
      setAvailableSubjects([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  const fetchStudents = async () => {
    try {
      const res = await getStudents();
      setStudents(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  // Group students by Grade + Subject
  const groupedStudents = students.reduce((acc, s) => {
    const key = `Grade ${s.class} - ${s.subject}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  // Bulk add helpers
  const addRow = () => setBulkRows(prev => [...prev, { name: '', performance: '' }]);
  const updateRow = (i, field, val) => {
    const updated = [...bulkRows];
    updated[i][field] = val;
    setBulkRows(updated);
  };
  const removeRow = (i) => setBulkRows(prev => prev.filter((_, idx) => idx !== i));

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const rows = text.trim().split('\n').map(line => {
      const [name, perf] = line.split('\t');
      return { name: name?.trim(), performance: perf?.trim() || '' };
    }).filter(r => r.name);
    setBulkRows(rows.length > 0 ? rows : [{ name: '', performance: '' }]);
  };

  const saveBulk = async () => {
    if (!selectedClass || !selectedSubject) return alert("Please select grade and subject");

    const valid = bulkRows
      .map(r => ({ name: r.name.trim(), performance: r.performance ? parseInt(r.performance) : null }))
      .filter(r => r.name);

    if (valid.length === 0) return alert("No students to add");

    setSaving(true);
    try {
      for (const { name, performance } of valid) {
        await addStudent({ name, class: parseInt(selectedClass), subject: selectedSubject, performance });
      }
      setBulkRows([{ name: '', performance: '' }]);
      fetchStudents();
      alert(`${valid.length} students added successfully!`);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Some students failed to save");
    } finally {
      setSaving(false);
    }
  };

  const fetchRec = async (studentId) => {
    setLoadingRec(prev => ({ ...prev, [studentId]: true }));
    try {
      const res = await getRecommendations({ studentId });
      setRecs(prev => ({ ...prev, [studentId]: res.data.recommendations }));
    } catch (err) {
      console.error("AI Recommendation failed:", err);
      setRecs(prev => ({ ...prev, [studentId]: "Gemini is taking a break. Try again soon!" }));
    } finally {
      setLoadingRec(prev => ({ ...prev, [studentId]: false }));
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-blue-800 mb-4">Manage Your Students</h1>
            <p className="text-xl text-gray-600">Add students, track performance, get personalized AI advice</p>
          </div>

          {/* Add Students Section */}
          <div className="card mb-12">
            <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center">Add Students (Paste from Excel!)</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">Select Grade</label>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                >
                  <option value="">Choose Grade</option>
                  {Object.keys(teacherClasses).sort((a, b) => a - b).map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">Select Subject</label>
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  disabled={!selectedClass}
                  className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{selectedClass ? 'Choose Subject' : 'First select a grade'}</option>
                  {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Bulk Input Table */}
            <div className="bg-white rounded-2xl shadow-inner border-2 border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="px-6 py-5 text-left text-lg font-semibold">Student Name</th>
                    <th className="px-6 py-5 text-left text-lg font-semibold">Performance %</th>
                    <th className="w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bulkRows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={row.name}
                          onChange={e => updateRow(i, 'name', e.target.value)}
                          onPaste={i === 0 ? handlePaste : null}
                          placeholder="e.g. Amina Hassan"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={row.performance}
                          onChange={e => updateRow(i, 'performance', e.target.value)}
                          placeholder="85"
                          className="w-28 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="text-center">
                        {bulkRows.length > 1 && (
                          <button
                            onClick={() => removeRow(i)}
                            className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xl transition"
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
              <button
                onClick={addRow}
                className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl transition shadow-lg"
              >
                + Add Another Row
              </button>
              <button
                onClick={saveBulk}
                disabled={saving || !selectedSubject}
                className={`px-10 py-5 text-xl font-bold rounded-xl transition shadow-lg ${
                  selectedSubject
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                    : 'bg-gray-400 cursor-not-allowed text-gray-200'
                }`}
              >
                {saving ? 'Saving Students...' : `Add ${bulkRows.filter(r => r.name.trim()).length} Students`}
              </button>
            </div>
          </div>

          {/* Students List */}
          <div className="mt-16">
            <h2 className="text-4xl font-bold text-center text-blue-800 mb-10">
              Your Students ({students.length})
            </h2>

            {Object.keys(groupedStudents).length === 0 ? (
              <div className="text-center py-20 bg-gray-100 rounded-2xl">
                <p className="text-2xl text-gray-600">No students yet. Add your first class above!</p>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(groupedStudents).map(([key, list]) => (
                  <div key={key} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6">
                      <h3 className="text-2xl font-bold">{key} • {list.length} students</h3>
                    </div>
                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {list.map(s => (
                          <div key={s._id} className="bg-gradient-to-b from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="text-xl font-bold text-gray-800">{s.name}</h4>
                              {s.performance != null && (
                                <span className={`px-3 py-1 rounded-full text-white font-bold text-sm ${
                                  s.performance >= 70 ? 'bg-green-500' :
                                  s.performance >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}>
                                  {s.performance}%
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => fetchRec(s._id)}
                              disabled={loadingRec[s._id]}
                              className={`w-full py-3 px-6 rounded-xl font-bold text-white transition mt-4 ${
                                loadingRec[s._id]
                                  ? 'bg-gray-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg'
                              }`}
                            >
                              {loadingRec[s._id] ? 'Gemini Thinking...' : 'AI Help'}
                            </button>

                            {recs[s._id] && (
                              <div className="mt-5 p-5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                <p className="font-bold text-blue-800 mb-2">Gemini Advice:</p>
                                <p className="text-gray-700 leading-relaxed text-sm">{recs[s._id]}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Students;