import React, { useState } from 'react';
import { login } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form);
      localStorage.setItem('token', res.data.token);
      setMsg('Login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Teacher Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input className="input" type="email" placeholder="Email" required 
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input className="input" type="password" placeholder="Password" required 
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition text-lg">
            Login
          </button>
        </form>
        {msg && <p className={`mt-4 text-center font-medium ${msg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
        <p className="text-center mt-6 text-gray-600">
          Don't have an account? <a href="/register" className="text-blue-600 font-bold hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;