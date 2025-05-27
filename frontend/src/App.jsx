import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const access = localStorage.getItem('access');

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user-dashboard" element={access ? <UserDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin-dashboard" element={access ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
