import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ROUTES } from './constants/routes';
import './i18n';

// Pages
import Homepage from './pages/landing/Homepage';
import LoginPage from './pages/auth/LoginPageModern';
import RegisterPage from './pages/auth/RegisterPageModern';
import CustomerDashboard from './pages/customer/Dashboard';
import Booking from './pages/customer/Booking';
import History from './pages/customer/History';
import Invoices from './pages/customer/Invoices';
import Profile from './pages/customer/Profile';
import Settings from './pages/customer/Settings';
import Chat from './pages/customer/Chat';
import Ratings from './pages/customer/Ratings';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import JobList from './pages/technician/JobList';
import MaintenanceChecklist from './pages/technician/MaintenanceChecklist';
import UploadEvidence from './pages/technician/UploadEvidence';
import PartsRequest from './pages/technician/PartsRequest';
import ComponentDemo from './pages/ComponentDemo';

// Layout
import { CustomerLayout } from './components/layout';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page - Public */}
      <Route path="/" element={<Homepage />} />
      
      {/* Public routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path="/demo" element={<ComponentDemo />} />
      
      {/* Homepage route - outside CustomerLayout (after login) */}
      <Route 
        path="/Homepage" 
        element={
          <ProtectedRoute>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Customer routes - with Sidebar Layout */}
      <Route 
        path="/customer/*" 
        element={
          <ProtectedRoute>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="booking" element={<Booking />} />
        <Route path="history" element={<History />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="chat" element={<Chat />} />
        <Route path="ratings" element={<Ratings />} />
      </Route>
      
      {/* Technician routes */}
      <Route 
        path="/technician/*" 
        element={
          <ProtectedRoute>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<TechnicianDashboard />} />
        <Route path="jobs" element={<JobList />} />
        <Route path="checklist" element={<MaintenanceChecklist />} />
        <Route path="upload-evidence" element={<UploadEvidence />} />
        <Route path="parts-request" element={<PartsRequest />} />
        {/* TODO: Add more technician routes here */}
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App
