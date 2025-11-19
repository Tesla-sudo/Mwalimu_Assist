// src/components/Attendance.jsx
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import { getProfile } from '../services/api';
import { getStudentsByGrade } from '../data/studentsData';
import { getAttendanceRecords, saveAttendanceRecord } from '../data/attendanceData';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Attendance = () => {
  const [profile, setProfile] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const pdfRef = useRef();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
        if (res.data.classes?.length > 0) {
          setSelectedGrade(res.data.classes[0]);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        alert("Please log in again");
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!selectedGrade) {
      setStudents([]);
      return;
    }

    setLoading(true);
    const gradeStudents = getStudentsByGrade(selectedGrade);
    setStudents(gradeStudents);

    const existingRecord = getAttendanceRecords().find(
      r => r.grade === parseInt(selectedGrade) && r.date === selectedDate
    );

    if (existingRecord) {
      const map = {};
      gradeStudents.forEach((student, index) => {
        const saved = existingRecord.students.find(s => s.id === student.id);
        map[index] = saved ? saved.status : 'present';
      });
      setAttendanceMap(map);
    } else {
      const map = {};
      gradeStudents.forEach((_, i) => { map[i] = 'present'; });
      setAttendanceMap(map);
    }

    setLoading(false);
  }, [selectedGrade, selectedDate]);

  useEffect(() => {
    if (selectedGrade) {
      const gradeHistory = getAttendanceRecords()
        .filter(r => r.grade === parseInt(selectedGrade))
        .sort((a, b) => b.date.localeCompare(a.date));
      setHistory(gradeHistory);
    }
  }, [selectedGrade]);

  const handleStatusChange = (index, status) => {
    setAttendanceMap(prev => ({ ...prev, [index]: status }));
  };

  const saveAttendance = () => {
    if (students.length === 0) return alert("No students in this class");

    const marked = students.map((student, i) => ({
      id: student.id,
      name: student.name,
      adm: student.adm,
      status: attendanceMap[i] || 'present'
    }));

    saveAttendanceRecord({
      grade: parseInt(selectedGrade),
      date: selectedDate,
      students: marked
    });

    alert(`Attendance saved! ${students.length} students marked.`);
  };

  const downloadPDF = async () => {
    if (!pdfRef.current) return;

    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`Attendance_Grade${selectedGrade}_${selectedDate}.pdf`);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("PDF failed. Try again.");
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 py-6 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-indigo-800 mb-2">
              Digital Attendance Register
            </h1>
            <p className="text-lg sm:text-xl text-gray-700">Real Students • Any Date • PDF Ready</p>
          </div>

          {/* Controls - Fully Responsive */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">Grade</label>
                <select
                  value={selectedGrade}
                  onChange={e => setSelectedGrade(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-indigo-300 rounded-xl text-lg focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">Choose Grade</option>
                  {profile.classes?.map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-indigo-300 rounded-xl text-lg focus:border-indigo-600"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition text-lg"
                >
                  {showHistory ? 'Hide' : 'View'} History
                </button>
              </div>
            </div>
          </div>

          {/* Main Register */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
              <p className="text-2xl text-gray-600">No students in Grade {selectedGrade}</p>
              <p className="mt-4 text-lg text-gray-500">Add students first in the Students section</p>
            </div>
          ) : (
            <div ref={pdfRef} className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold">Grade {selectedGrade} Attendance</h2>
                <p className="text-lg sm:text-xl mt-2 opacity-95">
                  {new Date(selectedDate).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-lg mt-3">Total: {students.length} students</p>
              </div>

              {/* Student List - Mobile Optimized */}
              <div className="p-4 sm:p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {students.map((student, i) => (
                    <div key={student.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 shadow hover:shadow-md transition">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <span className="text-xl font-bold text-gray-600 w-10">{i + 1}.</span>
                          <div>
                            <p className="text-lg sm:text-xl font-bold text-gray-800">{student.name}</p>
                            <p className="text-sm text-gray-500">Adm: {student.adm}</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleStatusChange(i, 'present')}
                            className={`px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition min-w-24 ${
                              attendanceMap[i] === 'present'
                                ? 'bg-green-600 text-white shadow-lg'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleStatusChange(i, 'absent')}
                            className={`px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition min-w-24 ${
                              attendanceMap[i] === 'absent'
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary & Actions */}
              <div className="bg-gray-100 p-6 border-t-4 border-indigo-600">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="text-center sm:text-left">
                    <p className="text-2xl sm:text-3xl font-bold">
                      Present: <span className="text-green-600">{Object.values(attendanceMap).filter(s => s === 'present').length}</span>
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold mt-2">
                      Absent: <span className="text-red-600">{Object.values(attendanceMap).filter(s => s === 'absent').length}</span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button
                      onClick={downloadPDF}
                      className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-xl transition flex items-center justify-center gap-2"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={saveAttendance}
                      className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-xl transition"
                    >
                      Save Register
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History - Responsive Grid */}
          {showHistory && history.length > 0 && (
            <div className="bg-white rounded-3xl shadow-2xl p-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-indigo-800 mb-6 text-center">Attendance History</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {history.map(rec => (
                  <div
                    key={rec.id}
                    onClick={() => { setSelectedDate(rec.date); setShowHistory(false); }}
                    className="cursor-pointer bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border-2 border-indigo-200 hover:border-indigo-600 transition text-center"
                  >
                    <p className="text-sm font-bold text-gray-700">
                      {new Date(rec.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-3">
                      {rec.students.filter(s => s.status === 'present').length}/{rec.students.length}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Present</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Attendance;