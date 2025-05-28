import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ServiceRegistrationForm from './components/ServiceRegistrationForm';
import ProviderDashboard from './pages/ProviderDashboard';

function App() {
  const access = localStorage.getItem('access');
  const role = localStorage.getItem('role');

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
  path="/user-dashboard"
  element={access && role?.toLowerCase() === 'customer' ? <UserDashboard /> : <Navigate to="/login" />}
/>

        <Route
  path="/admin-dashboard"
  element={access && role?.toLowerCase() === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />}
/>
<Route
  path="/register-service"
  element={access && role === 'customer' ? <ServiceRegistrationForm /> : <Navigate to="/login" />}
/>
<Route
  path="/provider-dashboard"
  element={access && role === 'provider' ? <ProviderDashboard /> : <Navigate to="/login" />}
/>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
