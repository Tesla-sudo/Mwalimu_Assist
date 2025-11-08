import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Setup from './components/Setup';
import Students from './components/Students';
import Tools from './components/Tools';

function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem', background: '#f4f4f4' }}>
        <Link to="/register" style={{ margin: '0 10px' }}>Register</Link>
        <Link to="/login" style={{ margin: '0 10px' }}>Login</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <div style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/students" element={<Students />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/" element={<Login />} />  {/* Default to login */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;