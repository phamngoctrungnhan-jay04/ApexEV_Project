import React, { useEffect, useState, useMemo } from 'react';
import { FiUsers, FiMail, FiPhone, FiUserCheck, FiXCircle } from 'react-icons/fi';

// Services
import userService from '../../services/userService';

// Components - TUÂN THỦ DESIGN SYSTEM
import AdminLayout from '../../components/layout/AdminLayout';
import CustomButton from '../../components/common/CustomButton';
import CustomModal from '../../components/common/CustomModal'; // Đã fix cách dùng Modal
import CustomAlert from '../../components/common/CustomAlert';
import Loading from '../../components/common/Loading';

// Styles
import './AdminUserList.css';
import '../../styles/ApexModernCard.css';

const ROLES = {
  CUSTOMER: 'Khách hàng',
  SERVICE_ADVISOR: 'Cố vấn dịch vụ',
  TECHNICIAN: 'Kỹ thuật viên',
  ADMIN: 'Quản trị viên'
};

const AdminUserList = () => {
  // --- STATE MANAGEMENT ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // Loading cho Modal
  const [filterRole, setFilterRole] = useState('ALL');

  // Modal State
  const [deleteUser, setDeleteUser] = useState(null);
  const [editRoleUser, setEditRoleUser] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState('');

  // Alert State
  const [alertState, setAlertState] = useState({ type: '', message: '', show: false });

  // --- HELPERS ---
  const showAlert = (type, message) => {
    setAlertState({ type, message, show: true });
    setTimeout(() => setAlertState(prev => ({ ...prev, show: false })), 3000);
  };

  const openEditModal = (user) => {
    setEditRoleUser(user);
    setSelectedNewRole(user.role);
  };

  // --- API HANDLERS ---
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const rolesToFetch = Object.keys(ROLES);
        // Gọi API song song (Optimized)
        const responses = await Promise.all(
          rolesToFetch.map(role => userService.getUsersByRole(role))
        );
        setUsers(responses.flat());
      } catch (err) {
        console.error(err);
        showAlert('danger', 'Không thể lấy danh sách tài khoản. Vui lòng thử lại!');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteSubmit = async () => {
    if (!deleteUser) return;
    setSubmitting(true);
    try {
      await userService.deleteUser(deleteUser.id);
      setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
      showAlert('success', `Đã xóa tài khoản ${deleteUser.fullName}`);
      setDeleteUser(null);
    } catch (err) {
      showAlert('danger', 'Xóa thất bại! Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleUpdateSubmit = async () => {
    if (!editRoleUser || !selectedNewRole) return;
    setSubmitting(true);
    try {
      await userService.updateUserRole(editRoleUser.id, selectedNewRole);
      setUsers(prev => prev.map(u => 
        u.id === editRoleUser.id ? { ...u, role: selectedNewRole } : u
      ));
      showAlert('success', 'Cập nhật vai trò thành công!');
      setEditRoleUser(null);
    } catch (err) {
      showAlert('danger', 'Cập nhật thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await userService.toggleUserActive(user.id, !user.isActive);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
      showAlert('success', user.isActive ? 'Đã khóa tài khoản!' : 'Đã kích hoạt tài khoản!');
    } catch (err) {
      showAlert('danger', 'Thay đổi trạng thái thất bại!');
    }
  };

  // --- RENDER HELPERS ---
  const filteredUsers = useMemo(() => {
    return filterRole === 'ALL' ? users : users.filter(u => u.role === filterRole);
  }, [users, filterRole]);

  const renderRoleBadge = (role) => {
    const roleName = ROLES[role] || role;
    return <span className={`role-badge badge-${role?.toLowerCase()}`}>{roleName}</span>;
  };

  if (loading) return <Loading />;

  return (
    <AdminLayout>
      {/* Glassmorphism Header */}
      <header className="apex-glass-header modern-shadow">
        <FiUsers className="icon-title-lg" />
        <h1 className="apex-title">Quản lý nhân sự</h1>
        <span className="apex-subtitle">Danh sách tài khoản & thao tác quản trị</span>
      </header>

      {/* Filter */}
      <nav className="apex-filter-bar">
        <CustomButton
          variant={filterRole === 'ALL' ? 'primary' : 'outline'}
          className="apex-pill"
          onClick={() => setFilterRole('ALL')}
        >Tất cả</CustomButton>
        {Object.keys(ROLES).map(role => (
          <CustomButton
            key={role}
            variant={filterRole === role ? 'primary' : 'outline'}
            className="apex-pill"
            onClick={() => setFilterRole(role)}
          >{ROLES[role]}</CustomButton>
        ))}
      </nav>

      {/* Table */}
      <section className="apex-table-section">
        <table className="userlist-table modern-shadow">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Liên hệ</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map(user => (
              <tr key={user.id} className="userlist-row">
                <td>
                  <div className="d-flex align-items-center">
                    <span className={`user-avatar avatar-${user.role.toLowerCase()} apex-shadow`}>
                      {user.fullName.charAt(0)}
                    </span>
                    <span className="font-weight-bold">{user.fullName}</span>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div><FiMail className="mr-1 text-light" /> {user.email}</div>
                    <div><FiPhone className="mr-1 text-light" /> {user.phone}</div>
                  </div>
                </td>
                <td>{renderRoleBadge(user.role)}</td>
                <td>
                  {user.isActive ? (
                    <span className="status-badge active"><FiUserCheck /> Hoạt động</span>
                  ) : (
                    <span className="status-badge inactive"><FiXCircle /> Đã khóa</span>
                  )}
                  <CustomButton
                    variant={user.isActive ? 'outline' : 'success'}
                    size="sm"
                    className="ml-2"
                    onClick={() => handleToggleActive(user)}
                  >
                    {user.isActive ? 'Khóa' : 'Mở'}
                  </CustomButton>
                </td>
                <td>
                  <CustomButton size="sm" variant="secondary" onClick={() => openEditModal(user)} className="mr-2">
                    <FiUsers /> Sửa
                  </CustomButton>
                  <CustomButton size="sm" variant="danger" onClick={() => setDeleteUser(user)}>
                    <FiXCircle /> Xóa
                  </CustomButton>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-light">Không tìm thấy dữ liệu phù hợp</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Alert */}
      {alertState.show && (
        <div className="apex-alert">
          <CustomAlert variant={alertState.type}>{alertState.message}</CustomAlert>
        </div>
      )}

      {/* Modal Xóa */}
      <CustomModal
        show={!!deleteUser}
        title="Xác nhận xóa tài khoản"
        onHide={() => setDeleteUser(null)}
        onConfirm={handleDeleteSubmit}
        confirmText="Xóa tài khoản"
        confirmVariant="danger"
        cancelText="Hủy bỏ"
        loading={submitting}
      >
        <p>Bạn có chắc muốn xóa tài khoản <b>{deleteUser?.fullName}</b> không? Hành động này không thể hoàn tác.</p>
      </CustomModal>

      {/* Modal Sửa Role */}
      <CustomModal
        show={!!editRoleUser}
        title={`Chỉnh sửa vai trò: ${editRoleUser?.fullName}`}
        onHide={() => setEditRoleUser(null)}
        onConfirm={handleRoleUpdateSubmit}
        confirmText="Lưu thay đổi"
        confirmVariant="success"
        loading={submitting}
      >
        <div className="form-group">
          <label className="font-weight-bold mb-2">Chọn vai trò mới:</label>
          <select
            className="form-control"
            value={selectedNewRole}
            onChange={e => setSelectedNewRole(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px' }}
          >
            {Object.keys(ROLES).map(role => (
              <option key={role} value={role}>{ROLES[role]}</option>
            ))}
          </select>
        </div>
      </CustomModal>
    </AdminLayout>
  );
};

export default AdminUserList;