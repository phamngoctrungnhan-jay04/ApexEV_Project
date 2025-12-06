import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ROUTES } from './constants/routes';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserRegister from './pages/admin/AdminUserRegister';
import AdminServiceManager from './pages/admin/AdminServiceManager';
import AdminPartsManager from './pages/admin/AdminPartsManager';
import AdminProfile from './pages/admin/AdminProfile';
// Manager imports
import FinanceDashboard from './pages/manager/FinanceDashboard';
import FinanceInvoices from './pages/manager/FinanceInvoices';
import ManagerProfile from './pages/manager/ManagerProfile';
import ManagerLayout from './components/layout/ManagerLayout';
import './i18n';
import './styles/Alert.css';

// Pages
import Homepage from './pages/landing/Homepage';
import LoginPage from './pages/auth/LoginPageModern';
import RegisterPage from './pages/auth/RegisterPageModern';
import Booking from './pages/customer/Booking';
import History from './pages/customer/History';
import OrderTracking from './pages/customer/OrderTracking';
import Invoices from './pages/customer/Invoices';
import CustomerProfile from './pages/customer/CustomerProfile';
import Settings from './pages/customer/Settings';
import Chat from './pages/customer/Chat';
import Ratings from './pages/customer/Ratings';
import OrderDetail from './pages/customer/OrderDetail';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import JobList from './pages/technician/JobList';
import MaintenanceChecklist from './pages/technician/MaintenanceChecklist';
import UploadEvidence from './pages/technician/UploadEvidence';
import PartsRequest from './pages/technician/PartsRequest';
import TechnicianProfile from './pages/technician/TechnicianProfile';
import ComponentDemo from './pages/ComponentDemo';
import AdvisorDashboard from './pages/advisor/AdvisorDashboard';
import AdvisorProfile from './pages/advisor/AdvisorProfile';
import AdvisorAppointments from './pages/advisor/AdvisorAppointments';
import PartsApproval from './pages/advisor/PartsApproval';

// Layout
import { CustomerLayout, TechnicianLayout } from './components/layout';
import AdminLayout from './components/layout/AdminLayout';

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to={ROUTES.HOME} />;
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page - Public */}
      <Route path="/" element={<Homepage />} />
      
      {/* Public routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      {/* Admin - Dashboard */}
      <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="ADMIN"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
      {/* Admin - Hồ sơ quản trị */}
      <Route path="/admin/profile" element={<ProtectedRoute requiredRole="ADMIN"><AdminLayout><AdminProfile /></AdminLayout></ProtectedRoute>} />
      {/* Admin - Đăng ký tài khoản nhân sự */}
      <Route path="/admin/register-user" element={<ProtectedRoute requiredRole="ADMIN"><AdminLayout><AdminUserRegister /></AdminLayout></ProtectedRoute>} />
      {/* Admin - Quản lý dịch vụ */}
      <Route path="/admin/services" element={<ProtectedRoute requiredRole="ADMIN"><AdminServiceManager /></ProtectedRoute>} />
      {/* Admin - Quản lý phụ tùng */}
      <Route path="/admin/parts" element={<ProtectedRoute requiredRole="ADMIN"><AdminPartsManager /></ProtectedRoute>} />
      
      {/* Manager (BUSINESS_MANAGER) - Quản lý Tài chính */}
      <Route path="/manager/dashboard" element={<ProtectedRoute requiredRole="BUSINESS_MANAGER"><FinanceDashboard /></ProtectedRoute>} />
      <Route path="/manager/finance" element={<ProtectedRoute requiredRole="BUSINESS_MANAGER"><FinanceDashboard /></ProtectedRoute>} />
      <Route path="/manager/invoices" element={<ProtectedRoute requiredRole="BUSINESS_MANAGER"><FinanceInvoices /></ProtectedRoute>} />
      <Route path="/manager/profile" element={<ProtectedRoute requiredRole="BUSINESS_MANAGER"><ManagerProfile /></ProtectedRoute>} />
      
      <Route path="/demo" element={<ComponentDemo />} />
      
      {/* Homepage route - outside CustomerLayout (after login) */}
      <Route 
        path="/Homepage" 
        element={
          <ProtectedRoute>
            <Homepage />
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
        <Route path="order-tracking/:orderId" element={<OrderTracking />} />
        <Route path="order/:orderId" element={<OrderDetail />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="chat" element={<Chat />} />
        <Route path="ratings" element={<Ratings />} />
      </Route>
      
      {/* Technician routes */}
      <Route 
        path="/technician/*" 
        element={
          <ProtectedRoute>
            <TechnicianLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<TechnicianDashboard />} />
        <Route path="jobs" element={<JobList />} />
        <Route path="checklist" element={<MaintenanceChecklist />} />
        <Route path="upload-evidence" element={<UploadEvidence />} />
        <Route path="parts-request" element={<PartsRequest />} />
        <Route path="profile" element={<TechnicianProfile />} />
      </Route>

      {/* Advisor routes */}
      <Route 
        path="/advisor/dashboard" 
        element={
          <ProtectedRoute>
            <AdvisorDashboard />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/advisor/profile" 
        element={
          <ProtectedRoute>
            <AdvisorProfile />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/advisor/appointments" 
        element={
          <ProtectedRoute>
            <AdvisorAppointments />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/advisor/parts-approval" 
        element={
          <ProtectedRoute>
            <PartsApproval />
          </ProtectedRoute>
        }
      />
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

export default App;
