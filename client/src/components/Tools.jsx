// src/components/Tools.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateContent, getProfile } from '../services/api';
import jsPDF from 'jspdf';
import Navbar from './Navbar';

const Tools = () => {
  const [type, setType] = useState('workplan');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ classes: [], subjects: [] });
  const navigate = useNavigate();

  useEffect(() => {
    getProfile()
      .then(res => {
        setProfile(res.data);
        if (!res.data.classes?.length) navigate('/setup');
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject) return alert('Please select grade and subject');
    
    setLoading(true);
    setContent(''); // Clear previous content
    
    try {
      const res = await generateContent({
        type,
        grade: +selectedClass,
        subject: selectedSubject,
        topic: topic || undefined
      });
      setContent(res.data.content);
      setGeneratedAt(new Date().toLocaleString('en-KE'));
    } catch (err) {
      alert('Generation failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(20);
    doc.text(`Grade ${selectedClass} - ${selectedSubject}`, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${generatedAt}`, 105, 30, { align: 'center' });
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 15, 45);
    doc.save(`MwalimuAssist_${selectedSubject}_Grade${selectedClass}_${type}.pdf`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    alert('Copied to clipboard!');
  };

  // FIXED: Proper display name for each type
  const getContentTypeName = () => {
    switch (type) {
      case 'workplan': return 'Lesson Plan';
      case 'questions': return 'Exam Questions';
      case 'scheme': return 'Scheme of Work';
      case 'rubric': return 'Assessment Rubric';
      default: return 'Content';
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Hero Header */}
          <div className="text-center mb-16 mt-8">
            <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-black to-green-600 mb-6">
              Gemini AI for Mwalimu
            </h1>
            <p className="text-3xl font-bold text-gray-800 mb-4">KICD-Aligned • CBC Perfect • With YouTube Links</p>
            <p className="text-2xl text-gray-700">Generate Lesson Plans, Exams, Schemes & Rubrics in Seconds</p>
            <div className="mt-8 flex justify-center gap-4">
              <span className="px-6 py-3 bg-red-600 text-white rounded-full font-bold text-xl shadow-lg">Kenya Flag</span>
              <span className="px-6 py-3 bg-black text-white rounded-full font-bold text-xl shadow-lg">Kenya Flag</span>
              <span className="px-6 py-3 bg-green-600 text-white rounded-full font-bold text-xl shadow-lg">Kenya Flag</span>
            </div>
          </div>

          {/* Generator Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border-4 border-white mb-12">
            <form onSubmit={handleGenerate} className="space-y-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Type Selector */}
                <div className="relative">
                  <label className="block text-xl font-bold text-gray-800 mb-4">Content Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full px-8 py-6 text-xl font-medium bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border-4 border-purple-300 focus:border-purple-600 focus:ring-8 focus:ring-purple-200 transition-all"
                  >
                    <option value="workplan">Lesson Plan</option>
                    <option value="questions">Exam Questions</option>
                    <option value="scheme">Scheme of Work</option>
                    <option value="rubric">Assessment Rubric</option>
                  </select>
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-xl font-bold text-gray-800 mb-4">Grade</label>
                  <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    required
                    className="w-full px-8 py-6 text-xl font-medium bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl border-4 border-blue-300 focus:border-blue-600 focus:ring-8 focus:ring-blue-200 transition-all"
                  >
                    <option value="">Select Grade</option>
                    {profile.classes?.sort((a,b)=>a-b).map(c => (
                      <option key={c} value={c}>Grade {c}</option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xl font-bold text-gray-800 mb-4">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    required
                    className="w-full px-8 py-6 text-xl font-medium bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl border-4 border-emerald-300 focus:border-emerald-600 focus:ring-8 focus:ring-emerald-200 transition-all"
                  >
                    <option value="">Select Subject</option>
                    {profile.subjects?.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Topic (Conditional) */}
                {(type === 'questions' || type === 'rubric') && (
                  <div>
                    <label className="block text-xl font-bold text-gray-800 mb-4">Topic (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Fractions, Energy, Poetry..."
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      className="w-full px-8 py-6 text-xl font-medium bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl border-4 border-amber-300 focus:border-amber-600 focus:ring-8 focus:ring-amber-200 transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={loading || !selectedClass || !selectedSubject}
                  className={`relative px-20 py-8 text-3xl font-bold rounded-3xl shadow-2xl transition-all transform hover:scale-105 ${
                    loading || !selectedClass || !selectedSubject
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white hover:shadow-3xl'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-8 border-white border-t-transparent"></div>
                      Generating with Gemini AI...
                    </span>
                  ) : (
                    <span className="flex items-center gap-4">
                      Generate CBC Content
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Generated Content — FIXED DUPLICATE TEXT */}
          {content && (
            <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-green-600 rounded-3xl shadow-2xl overflow-hidden border-8 border-white">
              <div className="bg-black/40 backdrop-blur-sm p-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-white text-center md:text-left">
                    <h2 className="text-4xl font-bold">Grade {selectedClass} • {selectedSubject}</h2>
                    <p className="text-2xl opacity-90 mt-2">
                      {getContentTypeName()} Ready!
                    </p>
                    <p className="text-lg opacity-80 mt-2">Generated: {generatedAt}</p>
                  </div>
                  <div className="flex gap-6">
                    <button
                      onClick={copyToClipboard}
                      className="px-10 py-6 bg-white text-purple-700 font-bold text-xl rounded-2xl shadow-xl hover:bg-gray-100 transition-all hover:scale-110 flex items-center gap-3"
                    >
                      Copy
                    </button>
                    <button
                      onClick={downloadPDF}
                      className="px-10 py-6 bg-yellow-400 text-black font-bold text-xl rounded-2xl shadow-xl hover:bg-yellow-300 transition-all hover:scale-110 flex items-center gap-3"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-12">
                <div className="prose prose-lg max-w-none font-serif leading-relaxed text-gray-800">
                  <pre className="whitespace-pre-wrap text-lg">{content}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-20">
            <p className="text-3xl font-bold text-gray-800">
              Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Google Gemini Pro</span>
            </p>
            <p className="text-2xl text-gray-600 mt-4">Made with Kenya Flag for Kenyan Teachers</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tools;