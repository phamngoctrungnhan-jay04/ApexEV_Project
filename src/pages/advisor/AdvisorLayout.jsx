import AdvisorSidebar from '../../components/layout/AdvisorSidebar';

function AdvisorLayout({ children, onLogout }) {
  return (
    <div style={{ display: 'flex' }}>
      <AdvisorSidebar onLogout={onLogout} />
      <main style={{ marginLeft: 220, width: '100%' }}>
        {children}
      </main>
    </div>
  );
}
export default AdvisorLayout;
