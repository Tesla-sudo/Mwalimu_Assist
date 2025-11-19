// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, getStudents } from '../services/api';
import { getAssignments } from '../data/assignementsData';
import Navbar from './Navbar';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, studentsRes] = await Promise.all([getProfile(), getStudents()]);
        setProfile(profileRes.data);
        setStudents(studentsRes.data);
        setAssignments(getAssignments().slice(0, 5)); // Latest 5

        if (!profileRes.data.classes?.length) navigate('/setup');
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  // Analytics Calculations
  const subjectPerformance = students.reduce((acc, s) => {
    if (!s.performance) return acc;
    if (!acc[s.subject]) acc[s.subject] = { total: 0, count: 0 };
    acc[s.subject].total += s.performance;
    acc[s.subject].count += 1;
    return acc;
  }, {});

  const subjectData = Object.entries(subjectPerformance).map(([subject, data]) => ({
    subject,
    average: Math.round(data.total / data.count)
  }));

  const gradeData = students.reduce((acc, s) => {
    acc[s.class] = (acc[s.class] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(gradeData).map(([grade, count]) => ({
    name: `Grade ${grade}`,
    value: count
  }));

  const performanceLevels = {
    excellent: students.filter(s => s.performance >= 80).length,
    good: students.filter(s => s.performance >= 60 && s.performance < 80).length,
    average: students.filter(s => s.performance >= 40 && s.performance < 60).length,
    weak: students.filter(s => s.performance < 40).length,
  };

  const barData = [
    { name: 'Excellent (80–100%)', count: performanceLevels.excellent, fill: '#10b981' },
    { name: 'Good (60–79%)', count: performanceLevels.good, fill: '#3b82f6' },
    { name: 'Average (40–59%)', count: performanceLevels.average, fill: '#f59e0b' },
    { name: 'Needs Help (<40%)', count: performanceLevels.weak, fill: '#ef4444' },
  ];

  const activeAssignments = assignments.filter(a => a.status !== 'complete').length;
  const overdueAssignments = assignments.filter(a => a.status === 'overdue').length;

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Welcome Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-indigo-800 mb-3">Karibu, {profile.name}!</h1>
            <p className="text-2xl text-gray-700">CBE Teacher Dashboard • {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition">
              <h3 className="text-lg font-semibold opacity-90">Total Students</h3>
              <p className="text-5xl font-bold mt-3">{students.length}</p>
            </div>
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition">
              <h3 className="text-lg font-semibold opacity-90">Classes Teaching</h3>
              <p className="text-5xl font-bold mt-3">{profile.classes?.length || 0}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition">
              <h3 className="text-lg font-semibold opacity-90">Active Assignments</h3>
              <p className="text-5xl font-bold mt-3">{activeAssignments}</p>
            </div>
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition">
              <h3 className="text-lg font-semibold opacity-90">Overdue</h3>
              <p className="text-5xl font-bold mt-3">{overdueAssignments}</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Average Performance by Subject</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                  <XAxis dataKey="subject" angle={-30} textAnchor="end" height={80} tick={{ fontSize: 14 }} />
                  <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="average" fill="#6366f1" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Performance Distribution</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                  <XAxis type="number" domain={[0, students.length + 5]} />
                  <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 13 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={(entry) => entry.fill} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Row: Pie + Recent Assignments */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Students by Grade */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Students by Grade</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Assignments */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Recent Assignments</h3>
                <a href="/assignments" className="text-indigo-600 hover:text-indigo-800 font-bold text-lg transition">
                  View All →
                </a>
              </div>
              <div className="space-y-4">
                {assignments.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <p className="text-xl text-gray-600">No assignments yet. Create your first one!</p>
                  </div>
                ) : (
                  assignments.map(ass => (
                    <div key={ass.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-md transition">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-lg">{ass.title}</p>
                        <p className="text-sm text-gray-600">
                          Grade {ass.grade} • {ass.subject} • Due {new Date(ass.due).toLocaleDateString('en-KE')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                          ass.status === 'complete' ? 'bg-emerald-100 text-emerald-800' :
                          ass.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          ass.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {ass.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer Tagline */}
          <div className="text-center mt-16 text-gray-600">
            <p className="text-lg">Mwalimu Assist • Built for Kenyan CBC Teachers with Love</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;