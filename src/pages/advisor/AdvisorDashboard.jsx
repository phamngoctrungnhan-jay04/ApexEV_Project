import { useEffect, useState } from 'react';
import { FiCheckCircle, FiClock, FiUser, FiCalendar } from 'react-icons/fi';
import Header from '../../components/layout/Header';
import AdvisorLayout from './AdvisorLayout';
import './AdvisorDashboard.css';
import appointmentService from '../../services/appointmentService';
import { services as serviceList } from '../../mockData/services';

function AdvisorDashboard() {
          // Hàm lấy tổng giá dịch vụ từ tên dịch vụ
          function getTotalServicePrice(requestedService) {
            if (!requestedService) return 0;
            // Tách từng dịch vụ nếu là chuỗi dài có dấu phẩy
            let names = Array.isArray(requestedService) ? requestedService : [requestedService];
            let allNames = [];
            names.forEach(name => {
              if (typeof name === 'string' && name.includes(',')) {
                allNames.push(...name.split(',').map(item => item.trim()));
              } else if (typeof name === 'string') {
                allNames.push(name.trim());
              }
            });
            let total = 0;
            allNames.forEach(n => {
              const found = serviceList.find(s => s.name === n);
              if (found) total += found.basePrice;
            });
            return total;
          }
        const [rejectingId, setRejectingId] = useState(null);
      // Xử lý từ chối lịch hẹn
      const handleReject = async (id) => {
        try {
          setRejectingId(id);
          await appointmentService.cancelAppointment(id);
          // Reload lại danh sách lịch chờ xác nhận
          const data = await appointmentService.getPendingAppointments();
          setAppointments(data);
          setRejectingId(null);
        } catch {
          setError('Từ chối thất bại');
          setRejectingId(null);
        }
      };
    // Chuyển mảng [2025,12,13,8,0] thành Date object
    function formatAppointmentTime(arr) {
      if (Array.isArray(arr) && arr.length >= 5) {
        return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4]);
      }
      // Nếu là string ISO thì parse luôn
      if (typeof arr === 'string') {
        return new Date(arr);
      }
      return null;
    }
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Gọi API lấy danh sách lịch hẹn trạng thái PENDING cho advisor
    appointmentService.getPendingAppointments()
      .then(data => {
        setAppointments(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải dữ liệu');
        setLoading(false);
      });
  }, []);

  const handleConfirm = async (id) => {
    // Xác nhận lịch hẹn
    try {
      setLoading(true);
      await appointmentService.confirmAppointment(id);
      // Reload lại danh sách lịch chờ xác nhận
      const data = await appointmentService.getPendingAppointments();
      setAppointments(data);
      setLoading(false);
    } catch {
      setError('Xác nhận thất bại');
      setLoading(false);
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

  return (
    <AdvisorLayout onLogout={handleLogout}>
      <div className="advisor-dashboard-bg" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div className="glassmorphism" style={{ width: '100%', margin: '24px', padding: '32px 40px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(51, 138, 243, 0.12)', background: 'rgba(255,255,255,0.9)' }}>
          <h2 className="dashboard-title">Lịch hẹn cần xác nhận</h2>
          {loading && <div className="dashboard-loading">Đang tải...</div>}
          {error && <div className="dashboard-error">{error}</div>}
          {!loading && !error && appointments.length === 0 && (
            <div className="dashboard-empty">Không có lịch hẹn nào cần xác nhận</div>
          )}
          {!loading && !error && appointments.length > 0 && (
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table className="dashboard-table" style={{ width: '100%', minWidth: '1400px', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ width: '110px', whiteSpace: 'nowrap', padding: '10px 0' }}><FiCalendar /> Ngày</th>
                    <th style={{ width: '160px', whiteSpace: 'nowrap', padding: '10px 0' }}><FiUser /> Khách hàng</th>
                    <th style={{ width: '100px', whiteSpace: 'nowrap', padding: '10px 0' }}><FiClock /> Thời gian</th>
                    <th style={{ width: '500px', padding: '10px 0' }}>Dịch vụ</th>
                    <th style={{ width: '140px', whiteSpace: 'nowrap', padding: '10px 0' }}>Tổng giá</th>
                    <th style={{ width: '120px', whiteSpace: 'nowrap', padding: '10px 0' }}>Trạng thái</th>
                    <th style={{ width: '180px', whiteSpace: 'nowrap', padding: '10px 0' }}>Xác nhận</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(app => {
                    // Xử lý dịch vụ: nếu là mảng thì hiển thị danh sách có số thứ tự
                    let serviceNames = Array.isArray(app.requestedService) ? app.requestedService : [app.requestedService];
                    return (
                      <tr key={app.id} className={app.status === 'CONFIRMED' ? 'row-confirmed' : ''}>
                        <td style={{ whiteSpace: 'nowrap', padding: '10px 0' }}>{app.appointmentTime ? (formatAppointmentTime(app.appointmentTime)?.toLocaleDateString('vi-VN') || 'Invalid Date') : ''}</td>
                        <td style={{ whiteSpace: 'nowrap', padding: '10px 0' }}>{app.customerFullName || ''}</td>
                        <td style={{ whiteSpace: 'nowrap', padding: '10px 0' }}>{app.appointmentTime ? (formatAppointmentTime(app.appointmentTime)?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) || 'Invalid Date') : ''}</td>
                        <td style={{ wordBreak: 'break-word', whiteSpace: 'pre-line', padding: '10px 0' }}>
                          <ol style={{ paddingLeft: 18, margin: 0 }}>
                            {serviceNames.map((name, idx) => {
                              // Nếu dịch vụ là chuỗi dài, tách từng dịch vụ theo dấu phẩy
                              if (typeof name === 'string' && name.includes(',')) {
                                return name.split(',').map((item, subIdx) => (
                                  <li key={idx + '-' + subIdx} style={{ marginBottom: 2 }}>{item.trim()}</li>
                                ));
                              }
                              return <li key={idx} style={{ marginBottom: 2 }}>{name}</li>;
                            })}
                          </ol>
                        </td>
                        <td style={{ fontWeight: 600, color: '#338AF3', whiteSpace: 'nowrap', padding: '10px 0' }}>
                          {getTotalServicePrice(serviceNames).toLocaleString('vi-VN')} đ
                        </td>
                        <td style={{ whiteSpace: 'nowrap', padding: '10px 0' }}>
                          {app.status === 'CONFIRMED' ? (
                            <span className="status-confirmed">Đã xác nhận</span>
                          ) : (
                            <span className="status-pending">Chờ xác nhận</span>
                          )}
                        </td>
                        <td style={{ whiteSpace: 'nowrap', padding: '10px 0' }}>
                          {app.status !== 'CONFIRMED' && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                              <button
                                className="btn-confirm"
                                style={{
                                  background: 'var(--success-green, #34c759)',
                                  color: '#fff',
                                  borderRadius: '12px',
                                  padding: '8px 16px',
                                  fontSize: '15px',
                                  boxShadow: '0 4px 12px rgba(52, 199, 89, 0.18)',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                onMouseOver={e => {
                                  e.currentTarget.style.background = '#28a745';
                                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                }}
                                onMouseOut={e => {
                                  e.currentTarget.style.background = 'var(--success-green, #34c759)';
                                  e.currentTarget.style.transform = 'none';
                                }}
                                onClick={() => handleConfirm(app.id)}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                  <FiCheckCircle style={{ fontSize: 17, marginRight: 4 }} /> Xác nhận
                                </span>
                              </button>
                              <button
                                className="btn-reject"
                                onClick={() => handleReject(app.id)}
                                disabled={rejectingId === app.id}
                                style={{
                                  background: 'var(--danger-red, #EF4444)',
                                  color: '#fff',
                                  borderRadius: '12px',
                                  padding: '8px 16px',
                                  fontSize: '15px',
                                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.18)',
                                  border: 'none',
                                  cursor: rejectingId === app.id ? 'not-allowed' : 'pointer',
                                  opacity: rejectingId === app.id ? 0.7 : 1,
                                  fontWeight: 600,
                                  transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                onMouseOver={e => {
                                  e.currentTarget.style.background = '#DC2626';
                                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                }}
                                onMouseOut={e => {
                                  e.currentTarget.style.background = 'var(--danger-red, #EF4444)';
                                  e.currentTarget.style.transform = 'none';
                                }}
                              >
                                {rejectingId === app.id ? (
                                  <span>Đang xử lý...</span>
                                ) : (
                                  <span style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                    <span style={{ fontSize: 17, marginRight: 4 }}>✖</span> Từ chối
                                  </span>
                                )}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdvisorLayout>
  );
}

export default AdvisorDashboard;
