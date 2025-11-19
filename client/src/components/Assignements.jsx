// src/components/Assignments.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { generateContent } from '../services/api';
import {
  getAssignments,
  addAssignment,
  deleteAssignment,
  markMultipleSubmitted
} from '../data/assignementsData';

// PDF Libraries
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showBulkSubmit, setShowBulkSubmit] = useState(null);
  const [showSubmittedList, setShowSubmittedList] = useState(null);
  const [showAssignmentContent, setShowAssignmentContent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [bulkNames, setBulkNames] = useState('');
  const [totalStudents, setTotalStudents] = useState('');

  const [form, setForm] = useState({
    title: '',
    subject: '',
    grade: '',
    type: 'assignment',
    dueDate: ''
  });

  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  // Ref for PDF capture
  const pdfRef = useRef();

  useEffect(() => {
    setAssignments(getAssignments());
  }, []);

  const handleGenerate = async () => {
    if (!form.title || !form.subject || !form.grade) {
      alert("Please fill Title, Subject, and Grade first");
      return;
    }
    setGenerating(true);
    try {
      const res = await generateContent({
        type: form.type === 'exam' ? 'questions' : form.type,
        grade: parseInt(form.grade),
        subject: form.subject,
        topic: form.title
      });
      setGeneratedContent(res.data.content || "Content generated successfully!");
    } catch (err) {
      alert("Failed to generate content");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    if (!form.title || !form.subject || !form.grade || !form.dueDate) {
      alert("Please fill all fields");
      return;
    }

    addAssignment({
      title: form.title,
      subject: form.subject,
      grade: parseInt(form.grade),
      type: form.type,
      due: form.dueDate,
      content: generatedContent || "No content generated."
    });

    setAssignments(getAssignments());
    setShowCreate(false);
    setForm({ title: '', subject: '', grade: '', type: 'assignment', dueDate: '' });
    setGeneratedContent('');
  };

  const handleBulkSubmit = () => {
    const names = bulkNames.trim().split('\n').map(n => n.trim()).filter(n => n);
    if (names.length === 0 || !totalStudents || totalStudents < 1) {
      alert("Please enter student names and total class size");
      return;
    }
    markMultipleSubmitted(showBulkSubmit.id, names, parseInt(totalStudents));
    setAssignments(getAssignments());
    setShowBulkSubmit(null);
    setBulkNames('');
    setTotalStudents('');
  };

  const handleDelete = (id) => {
    deleteAssignment(id);
    setAssignments(getAssignments());
    setShowDeleteConfirm(null);
  };

  // DOWNLOAD PDF FUNCTION
  const downloadPDF = () => {
    const input = pdfRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`${showAssignmentContent.title.replace(/[^a-z0-9]/gi, '_')}_Grade_${showAssignmentContent.grade}.pdf`);
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      complete: 'bg-emerald-100 text-emerald-800',
      active: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800',
      upcoming: 'bg-amber-100 text-amber-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    const icons = { exam: 'Exam', assignment: 'Homework', project: 'Project' };
    return icons[type] || 'Task';
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-indigo-800 mb-4">Assignments & Assessments</h1>
            <p className="text-xl text-gray-700">Create • Review • Track • Download • Share</p>
          </div>

          <div className="flex justify-between items-center mb-10">
            <p className="text-lg text-gray-600">
              Total: <strong className="text-indigo-700">{assignments.length}</strong> assignments
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-xl transition transform hover:scale-105"
            >
              + New Assignment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {assignments.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-2xl text-gray-500">No assignments yet. Create your first one!</p>
              </div>
            ) : (
              assignments.map(ass => (
                <div key={ass.id} className="group bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-200 hover:shadow-2xl transition-all duration-300">
                  <div className={`h-4 ${ass.status === 'complete' ? 'bg-emerald-500' : ass.status === 'overdue' ? 'bg-red-500' : ass.status === 'upcoming' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                  <div className="p-8">

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{ass.title}</h3>
                        <p className="text-gray-600 mt-1">Grade {ass.grade} • {ass.subject}</p>
                      </div>
                      <span className="text-3xl">{getTypeIcon(ass.type)}</span>
                    </div>

                    <div className="space-y-3 text-sm">
                      <p><strong>Due:</strong> {new Date(ass.due).toLocaleDateString('en-KE')}</p>
                      <p><strong>Submissions:</strong> <span className="text-xl font-bold text-indigo-600">{ass.submitted}/{ass.total || '—'}</span></p>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <span className={`px-4 py-2 rounded-full font-bold text-sm ${getStatusColor(ass.status)}`}>
                        {ass.status.toUpperCase()}
                      </span>

                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition text-sm font-bold">
                        {ass.content && (
                          <button onClick={() => setShowAssignmentContent(ass)} className="text-purple-600 hover:text-purple-800">
                            View Assignment
                          </button>
                        )}
                        {ass.status !== 'complete' && (
                          <>
                            <button onClick={() => setShowBulkSubmit(ass)} className="text-green-600 hover:text-green-800">
                              Bulk Submit
                            </button>
                            <button onClick={() => setShowSubmittedList(ass)} className="text-blue-600 hover:text-blue-800">
                              View List
                            </button>
                          </>
                        )}
                        {ass.status === 'complete' && (
                          <button onClick={() => setShowDeleteConfirm(ass.id)} className="text-red-600 hover:text-red-800">
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* FULL ASSIGNMENT VIEW + PDF DOWNLOAD */}
          {showAssignmentContent && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-6">
              <div ref={pdfRef} className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
                <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-indigo-800">{showAssignmentContent.title}</h2>
                    <p className="text-lg text-gray-600">Grade {showAssignmentContent.grade} • {showAssignmentContent.subject} • {showAssignmentContent.type.toUpperCase()}</p>
                  </div>
                  <button onClick={() => setShowAssignmentContent(null)} className="text-4xl text-gray-500 hover:text-gray-700">×</button>
                </div>

                <div className="p-10 bg-gradient-to-b from-gray-50 to-white">
                  <div className="bg-white border-4 border-dashed border-indigo-200 rounded-2xl p-10">
                    <pre className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800">
                      {showAssignmentContent.content}
                    </pre>
                  </div>
                  <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 italic">
                      Generated on {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border-t-2 border-gray-200 flex justify-end gap-4">
                  <button
                    onClick={downloadPDF}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-2"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => setShowAssignmentContent(null)}
                    className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BULK SUBMIT MODAL */}
          {showBulkSubmit && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
                <h3 className="text-2xl font-bold mb-4">Bulk Submission</h3>
                <p className="text-gray-600 mb-6"><strong>{showBulkSubmit.title}</strong></p>

                <textarea
                  placeholder="Enter student names (one per line)\nAmina Hassan\nJohn Kamau\nFatuma Ali"
                  value={bulkNames}
                  onChange={e => setBulkNames(e.target.value)}
                  className="w-full h-64 p-4 border-2 border-gray-300 rounded-xl mb-4 resize-none font-medium"
                />

                <input
                  type="number"
                  placeholder="Total students in class (e.g. 52)"
                  value={totalStudents}
                  onChange={e => setTotalStudents(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl mb-6"
                />

                <div className="flex gap-4">
                  <button onClick={() => { setShowBulkSubmit(null); setBulkNames(''); setTotalStudents(''); }} className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl">
                    Cancel
                  </button>
                  <button onClick={handleBulkSubmit} className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl">
                    Submit All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUBMITTED LIST */}
          {showSubmittedList && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-screen overflow-y-auto shadow-2xl">
                <h3 className="text-2xl font-bold mb-4">Students Who Submitted</h3>
                <p className="text-gray-600 mb-6"><strong>{showSubmittedList.title}</strong></p>
                {showSubmittedList.submittedBy?.length > 0 ? (
                  <ul className="space-y-2">
                    {showSubmittedList.submittedBy.map((name, i) => (
                      <li key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                        <span className="text-green-600 font-bold">{i + 1}.</span> {name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-10">No submissions yet</p>
                )}
                <button onClick={() => setShowSubmittedList(null)} className="mt-6 w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl">
                  Close
                </button>
              </div>
            </div>
          )}

          {/* DELETE CONFIRM */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-8 max-w-md shadow-2xl">
                <h3 className="text-2xl font-bold mb-4">Delete Assignment?</h3>
                <p className="text-gray-600 mb-8">This completed assignment will be permanently removed.</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl">
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl">
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CREATE MODAL */}
          {showCreate && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-screen overflow-y-auto">
                <div className="p-10">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-4xl font-bold text-indigo-800">Create New Assignment</h2>
                    <button onClick={() => setShowCreate(false)} className="text-4xl text-gray-500 hover:text-gray-700">&times;</button>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <input type="text" placeholder="e.g. Fractions Mastery Test" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-6 py-5 text-xl border-2 border-gray-300 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none" />
                      <div className="grid grid-cols-2 gap-4">
                        <select value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} className="px-6 py-5 text-lg border-2 border-gray-300 rounded-2xl">
                          <option value="">Grade</option>
                          {[1,2,3,4,5,6,7,8,9].map(g => <option key={g} value={g}>Grade {g}</option>)}
                        </select>
                        <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="px-6 py-5 text-lg border-2 border-gray-300 rounded-2xl">
                          <option value="">Subject</option>
                          {['Mathematics', 'English', 'Science', 'Social Studies', 'Kiswahili', 'CRE', 'Creative Arts'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-6 py-5 text-lg border-2 border-gray-300 rounded-2xl">
                          <option value="assignment">Homework</option>
                          <option value="exam">Exam/Test</option>
                          <option value="project">Project</option>
                        </select>
                        <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="px-6 py-5 text-lg border-2 border-gray-300 rounded-2xl" />
                      </div>
                    </div>

                    <div>
                      <button onClick={handleGenerate} disabled={generating || !form.title || !form.subject || !form.grade} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700-bold text-xl py-6 rounded-2xl shadow-xl mb-6 disabled:opacity-60 transition">
                        {generating ? 'Generating...' : 'Generate with Gemini AI'}
                      </button>

                      {generatedContent && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                          <h4 className="font-bold text-xl text-purple-800 mb-4">AI-Generated Assignment</h4>
                          <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed font-medium bg-white p-4 rounded-xl max-h-96 overflow-y-auto">
                            {generatedContent}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-10">
                    <button onClick={() => setShowCreate(false)} className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl">
                      Cancel
                    </button>
                    <button onClick={handleSave} className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-xl">
                      Create & Assign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Assignments;