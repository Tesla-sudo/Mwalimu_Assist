import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Setup from './components/Setup';
import Students from './components/Students';
import Tools from './components/Tools';
import Assignments from './components/Assignements';
import Attendance from './components/Attendance';
import Home from './components/Home';
// import ChatApp from './components/Messages';
import Messages from './components/Messages';
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Routes>
              <Route path="/" element={<Home />} />
              {/* <Route path="/" element={<Navigate to="/dashboard" />} /> */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/students" element={<Students />} />
              <Route path="/tools" element={<Tools />} />
              <Route path='/assignements' element={<Assignments />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/community" element={<Messages />} />
            </Routes>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;