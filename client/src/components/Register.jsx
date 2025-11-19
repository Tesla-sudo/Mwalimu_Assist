import React, { useState } from 'react';
import { register } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await register(form);
      localStorage.setItem('token', res.data.token);
      setMsg('Account created! Welcome aboard!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-8">Join Mwalimu Assist</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input className="input" type="text" placeholder="Full Name" required 
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input className="input" type="email" placeholder="Email" required 
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input className="input" type="password" placeholder="Password" required 
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition text-lg">
            Create Account
          </button>
        </form>
        {msg && <p className={`mt-4 text-center font-medium ${msg.includes('created') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
      </div>
    </div>
  );
};

export default Register;