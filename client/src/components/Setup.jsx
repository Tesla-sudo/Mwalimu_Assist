// src/components/Setup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile, getProfile } from '../services/api';
import { CBC_GRADE_LEVELS, getSubjectsForGrades } from '../config/cbc';
import Navbar from './Navbar';

const Setup = () => {
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProfile();
        setSelectedClasses(res.data.classes || []);
        setSelectedSubjects(res.data.subjects || []);
        setAvailableSubjects(getSubjectsForGrades(res.data.classes || []));
      } catch {
        navigate('/login');
      }
    };
    load();
  }, [navigate]);

  useEffect(() => {
    const subjects = getSubjectsForGrades(selectedClasses);
    setAvailableSubjects(subjects);
    setSelectedSubjects(prev => prev.filter(s => subjects.includes(s)));
  }, [selectedClasses]);

  const toggleClass = (grade) => {
    setSelectedClasses(prev =>
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const toggleSubject = (subject) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedClasses.length === 0 || selectedSubjects.length === 0) {
      alert('Please select at least one class and one subject');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ classes: selectedClasses, subjects: selectedSubjects });
      navigate('/dashboard');
    } catch {
      alert('Failed to save. Please try again.');
      setSaving(false);
    }
  };

  const progress = selectedClasses.length > 0 && selectedSubjects.length > 0 ? 100 : 50;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-emerald-50 to-amber-50 py-8 px-4 sm:py-12">
        <div className="max-w-5xl mx-auto">

          {/* Header - Mobile Optimized */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 mb-3">
              Karibu Mwalimu!
            </h1>
            <p className="text-lg sm:text-2xl text-gray-700 font-medium">Complete your profile in 30 seconds</p>
            
            <div className="mt-6 max-w-xs sm:max-w-md mx-auto px-4">
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                {progress === 100 ? 'Ready to go!' : 'Almost there...'}
              </p>
              </div>
            {/* </Campeonato> */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 sm:space-y-12">

            {/* Classes Section - Fully Responsive */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-10 border-4 border-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                <div className="text-4xl sm:text-5xl"></div>
                <div className="text-left sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Which Classes Do You Teach?</h2>
                  <p className="text-gray-600 text-sm sm:text-base">Select all that apply (Grades 1–9)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {CBC_GRADE_LEVELS.map(level => (
                  <div 
                    key={level.id} 
                    className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-5 sm:p-6 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-xl"
                  >
                    <h3 className="font-bold text-lg sm:text-xl text-indigo-800 mb-4 text-center">
                      {level.name}
                    </h3>
                    <div className="space-y-3">
                      {level.grades.map(grade => (
                        <label 
                          key={grade}
                          className="flex items-center gap-3 p-3 sm:p-4 bg-white/80 rounded-xl cursor-pointer hover:bg-white transition-all hover:shadow-md text-sm sm:text-base"
                        >
                          <input
                            type="checkbox"
                            checked={selectedClasses.includes(grade)}
                            onChange={() => toggleClass(grade)}
                            className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 rounded-lg focus:ring-4 focus:ring-blue-300"
                          />
                          <span className="font-semibold text-gray-800 flex-1">
                            Grade {grade}
                          </span>
                          {selectedClasses.includes(grade) && (
                            <span className="text-2xl sm:text-3xl"></span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subjects Section - Perfect on Phone */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-10 border-4 border-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                <div className="text-4xl sm:text-5xl"></div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Which Subjects Do You Teach?</h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {selectedClasses.length === 0 
                      ? "First select your classes above" 
                      : `Available for Grade${selectedClasses.length > 1 ? 's' : ''} ${selectedClasses.sort().join(', ')}`
                    }
                  </p>
                </div>
              </div>

              {availableSubjects.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <p className="text-xl sm:text-2xl">Please select at least one class first</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {availableSubjects.map(subject => (
                    <label
                      key={subject}
                      className={`relative block p-5 sm:p-6 rounded-2xl border-3 cursor-pointer transition-all transform hover:scale-105 text-center ${
                        selectedSubjects.includes(subject)
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-600 shadow-2xl'
                          : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject)}
                        onChange={() => toggleSubject(subject)}
                        className="absolute opacity-0"
                      />
                      <div>
                        <div className="text-3xl sm:text-4xl mb-2">
                          {subject === 'Mathematics' && 'Calculator'}
                          {subject === 'English' && 'Language'}
                          {subject === 'Kiswahili' && 'Kenya Flag'}
                          {subject === 'Science' && 'Beaker'}
                          {subject === 'Social Studies' && 'Globe'}
                          {subject === 'CRE' && 'Cross'}
                          {subject === 'Creative Arts' && 'Palette'}
                          {subject === 'Physical Education' && 'Soccer Ball'}
                        </div>
                        <p className="font-bold text-sm sm:text-lg break-words">{subject}</p>
                        {selectedSubjects.includes(subject) && (
                          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-2xl sm:text-3xl"></div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button - Mobile Friendly */}
            <div className="text-center px-4">
              <button
                type="submit"
                disabled={saving || selectedClasses.length === 0 || selectedSubjects.length === 0}
                className={`w-full max-w-md px-12 py-5 sm:py-6 text-xl sm:text-2xl font-bold rounded-2xl shadow-2xl transition-all transform hover:scale-105 ${
                  selectedClasses.length > 0 && selectedSubjects.length > 0
                    ? 'bg375-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white hover:shadow-3xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent text-green-500"></div>
                    Saving Profile...
                  </span>
                ) : (
                  'Complete Setup & Enter Dashboard'
                )}
              </button>
            </div>
          </form>

          {/* Footer - Mobile Optimized */}
          <div className="text-center mt-12 sm:mt-16 px-4">
            <p className="text-xl sm:text-2xl font-medium text-gray-700">
              Over <span className="text-green-600 font-bold">12,000+</span> Kenyan teachers already using Mwalimu Assist
            </p>
            <p className="text-base sm:text-lg text-gray-600 mt-3">Join your fellow wazalendo today</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Setup;