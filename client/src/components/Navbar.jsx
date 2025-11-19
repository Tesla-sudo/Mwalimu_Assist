// src/components/Navbar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!isLoggedIn) return null;

  const navLinks = [
    { to: '/', label: 'Home'},
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/students', label: 'Students' },
    { to: '/tools', label: 'AI Tools' },
    { to: '/setup', label: 'Setup' },
    { to: '/assignements', label: 'Assignements'},
    { to: '/attendance', label: 'Attendance'},
    { to: '/community', label: 'Community'},
    
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo + Brand */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-tight">Mwalimu Assist</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/dashboard'}
                className={({ isActive }) =>
                  `font-medium text-lg transition-all duration-200 hover:text-yellow-300 ${
                    isActive ? 'text-yellow-300 underline underline-offset-4 font-bold' : ''
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-xl font-semibold transition shadow-lg"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition"
              aria-label="Toggle menu"
            >
              {/* Hamburger Icon */}
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-blue-700 shadow-2xl">
          <div className="px-4 pt-4 pb-6 space-y-3">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/dashboard'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-lg font-medium transition-all ${
                    isActive
                      ? 'bg-white text-blue-800 shadow-lg font-bold'
                      : 'hover:bg-white hover:bg-opacity-20'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold text-lg transition shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;