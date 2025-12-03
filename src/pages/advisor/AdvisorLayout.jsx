import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdvisorSidebar from '../../components/layout/AdvisorSidebar';

function AdvisorLayout({ children }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex' }}>
      <AdvisorSidebar onLogout={handleLogout} />
      <main style={{ marginLeft: 220, width: '100%' }}>
        {children}
      </main>
    </div>
  );
}
export default AdvisorLayout;
