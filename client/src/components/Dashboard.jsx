import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile } from '../services/api';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
        if (!res.data.classes?.length || !res.data.subjects?.length) {
          navigate('/setup');  // Redirect if not setup
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <header>
        <h1>Welcome, {profile.name}!</h1>
        <p>CBC Tutor Dashboard - Empowering Grades 1-9 Learning</p>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <nav>
        <Link to="/setup">Setup Classes & Subjects</Link>
        <Link to="/students">Manage Students</Link>
        <Link to="/tools">AI Tools</Link>
      </nav>
      <main>
        <p>Your Classes: {profile.classes?.join(', ') || 'Not set'}</p>
        <p>Your Subjects: {profile.subjects?.join(', ') || 'Not set'}</p>
      </main>
    </div>
  );
};

export default Dashboard;