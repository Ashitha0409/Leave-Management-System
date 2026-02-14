import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ApplyLeave from './pages/ApplyLeave';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.role === 'employer' ? <Navigate to="/employer-dashboard" /> : <Navigate to="/employee-dashboard" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Redirect root to Login */}
            <Route path="/" element={<Login />} />

            {/* Employee Routes */}
            <Route
              path="/employee-dashboard"
              element={
                <PrivateRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/apply-leave"
              element={
                <PrivateRoute allowedRoles={['employee', 'employer']}>
                  <ApplyLeave />
                </PrivateRoute>
              }
            />

            {/* Employer Routes */}
            <Route
              path="/employer-dashboard"
              element={
                <PrivateRoute allowedRoles={['employer']}>
                  <EmployerDashboard />
                </PrivateRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
