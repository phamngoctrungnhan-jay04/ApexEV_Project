// File: src/pages/admin/AdminUserRegister.jsx
// Trang quản lý danh sách nhân sự (APEX Modern UI)

import React, { useState, useEffect } from 'react';
import CustomAlert from '../../components/common/CustomAlert';
import CustomModal from '../../components/common/CustomModal';
import { FiUserPlus, FiMail, FiPhone, FiLock, FiUsers, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import SearchBar from '../../components/common/SearchBar';
import './AdminUserRegister.css';
import authService from '../../services/authService';
import userService from '../../services/userService';
import AdminLayout from '../../components/layout/AdminLayout';

const ROLE_CATEGORIES = [
  {
    value: 'ADMIN',
    label: 'Quản trị viên',
    color: '#AB47BC',
    background: '#F3E5F5',
    shadow: 'rgba(171, 71, 188, 0.25)'
  },
  {
    value: 'BUSINESS_MANAGER',
    label: 'Quản lý kinh doanh',
    color: '#FF6B6B',
    background: '#FFF0F0',
    shadow: 'rgba(255, 107, 107, 0.25)'
  },
  {
    value: 'SERVICE_ADVISOR',
    label: 'Cố vấn dịch vụ',
    color: '#338AF3',
    background: '#E3F2FD',
    shadow: 'rgba(51, 138, 243, 0.25)'
  },
  {
    value: 'TECHNICIAN',
    label: 'Kỹ thuật viên',
    color: '#FFA726',
    background: '#FFF3E0',
    shadow: 'rgba(255, 167, 38, 0.25)'
  },
  {
    value: 'CUSTOMER',
    label: 'Khách hàng',
    color: '#34c759',
    background: '#E6F9EE',
    shadow: 'rgba(52, 199, 89, 0.25)'
  }
];

const ROLE_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  ...ROLE_CATEGORIES.map(role => ({ key: role.value, label: role.label }))
];

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: ROLE_CATEGORIES[0].value
};
const AdminUserRegister = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // all | SERVICE_ADVISOR | TECHNICIAN | ADMIN
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form state
  const [form, setForm] = useState(initialForm);

  // Load users on mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Filter users when search term changes
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    let data = [...users];
    if (roleFilter !== 'all') {
      data = data.filter(u => u.role === roleFilter);
    }
    if (term) {
      data = data.filter(u =>
        u.fullName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phone?.toLowerCase().includes(term)
      );
    }
    setFilteredUsers(data);
  }, [searchTerm, users, roleFilter]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      // Fetch all roles (bao gồm khách hàng)
      const [admins, businessManagers, advisors, technicians, customers] = await Promise.all([
        userService.getUsersByRole('ADMIN'),
        userService.getUsersByRole('BUSINESS_MANAGER'),
        userService.getUsersByRole('SERVICE_ADVISOR'),
        userService.getUsersByRole('TECHNICIAN'),
        userService.getUsersByRole('CUSTOMER')
      ]);
      const merged = [...(admins||[]), ...(businessManagers||[]), ...(advisors||[]), ...(technicians||[]), ...(customers||[])];
      // Deduplicate by id (backend returns "id", not "userId")
      const map = new Map();
      const allUsers = [];
      merged.forEach(u => {
        if (!u) return;
        // Normalize: backend uses "id", FE expects "userId"
        const uniqueId = u.id || u.userId || `${u.email||u.fullName||'unknown'}-${u.role}`;
        if (!map.has(uniqueId)) {
          map.set(uniqueId, true);
          // Normalize userId for consistent usage throughout the component
          u.userId = u.id || u.userId;
          allUsers.push(u);
        }
      });
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      console.error('Fetch users error:', error);
      showAlert('danger', `Không thể tải danh sách nhân sự: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
  };

  const handleAddUser = async () => {
    if (!form.fullName || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      showAlert('danger', '⚠️ Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (form.password !== form.confirmPassword) {
      showAlert('danger', '⚠️ Mật khẩu nhập lại không khớp');
      return;
    }

    setLoading(true);
    try {
      // Use registerStaff instead of register to preserve role
      await authService.registerStaff(form);
      showAlert('success', '✅ Thêm nhân sự thành công!');
      setShowAddModal(false);
      resetForm();
      fetchAllUsers();
    } catch (error) {
      console.error('Create user error:', error);
      showAlert('danger', `❌ Thêm nhân sự thất bại: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    if (!form.fullName || !form.email || !form.phone) {
      showAlert('danger', '⚠️ Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      await userService.updateUserRole(selectedUser.userId, form.role);
      showAlert('success', 'Cập nhật nhân sự thành công!');
      setShowEditModal(false);
      resetForm();
      setSelectedUser(null);
      fetchAllUsers();
    } catch (error) {
      console.error('Update user error:', error);
      showAlert('danger', `❌ Cập nhật nhân sự thất bại: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      await userService.deleteUser(selectedUser.userId);
      showAlert('success', ' Xóa nhân sự thành công!');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchAllUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      showAlert('danger', `❌ Xóa nhân sự thất bại: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await userService.toggleUserActive(user.userId, !user.isActive);
      showAlert('success', `${!user.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'} nhân sự thành công!`);
      fetchAllUsers();
    } catch (error) {
      console.error('Toggle active error:', error);
      showAlert('danger', `❌ Cập nhật trạng thái thất bại: ${error.message || 'Lỗi không xác định'}`);
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      confirmPassword: '',
      role: user.role || ROLE_CATEGORIES[0].value
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const getRoleInfo = (roleValue) => {
    return ROLE_CATEGORIES.find(role => role.value === roleValue) || {
      value: 'OTHER',
      label: 'Khác',
      color: '#6B7280',
      background: '#F3F4F6',
      shadow: 'rgba(107, 114, 128, 0.25)'
    };
  };

  const getRoleLabel = (role) => {
    return getRoleInfo(role).label;
  };

  const getAvatarUrl = (user) => {
    if (!user) return null;
    return user.avatarUrl || user.avatar || user.profileImage || user.profilePicture || user.imageUrl || null;
  };

  const getInitial = (name) => {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
  };

  const getRoleClass = (role) => {
    return role ? role.toLowerCase() : 'default';
  };

  const roleSummary = ROLE_CATEGORIES.map(role => ({
    ...role,
    count: users.filter(user => user.role === role.value).length
  }));

  return (
    <AdminLayout>
      <section className="admin-user-register-page">
        <div className="user-manager-container">
        {/* Header */}
        <div className="user-manager-header">
          <div className="header-left">
            <div className="header-icon">
              <FiUsers />
            </div>
            <h1 className="header-title">QUẢN LÝ TÀI KHOẢN</h1>
          </div>
          <button className="btn-add-user" onClick={openAddModal}>
            <FiUserPlus /> Thêm tài khoản
          </button>
        </div>

        {/* Alert (Floating toast) */}
        {alert.show && (
          <CustomAlert 
            variant={alert.type} 
            floating 
            dismissible 
            onClose={() => setAlert({ show: false, type: '', message: '' })}
          >
            {alert.message}
          </CustomAlert>
        )}

        {/* Role Category Grid */}
        <div className="role-category-grid">
          {roleSummary.map(category => (
            <div
              key={category.value}
              className="role-category-card"
              data-role={category.value.toLowerCase()}
            >
              <div className="role-category-info">
                <span className="role-category-dot" data-role={category.value.toLowerCase()} />
                <div>
                  <p className="role-category-label">{category.label}</p>
                  <p className="role-category-count">{category.count} nhân sự</p>
                </div>
              </div>
              <span className="role-category-pill">
                {category.value === 'ADMIN' && 'ADMIN'}
                {category.value === 'BUSINESS_MANAGER' && 'QLKD'}
                {category.value === 'SERVICE_ADVISOR' && 'CVDV'}
                {category.value === 'TECHNICIAN' && 'KTV'}
                {category.value === 'CUSTOMER' && 'KH'}
              </span>
            </div>
          ))}
        </div>

        {/* Role Filter */}
        <div className="role-filter">
          {ROLE_FILTERS.map(item => (
            <button
              key={item.key}
              className={`filter-btn ${roleFilter === item.key ? 'active' : ''} ${item.key !== 'all' ? 'chip-role' : ''}`}
              data-role={item.key !== 'all' ? item.key.toLowerCase() : undefined}
              onClick={() => setRoleFilter(item.key)}
            >
              {item.key !== 'all' && (
                <span className="role-dot" data-role={item.key.toLowerCase()} />
              )}
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <SearchBar
          size="compact"
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={fetchAllUsers}
          placeholder="Tìm kiếm nhân sự..."
          ariaLabel="Tìm kiếm nhân sự"
        />

        {/* Table */}
        <div className="user-table-container">
          {loading && <div className="loading">Đang tải...</div>}
          {!loading && filteredUsers.length === 0 && (
            <div className="empty-state">Không có nhân sự nào</div>
          )}
          {!loading && filteredUsers.length > 0 && (
            <table className="user-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.userId || `${index}-${user.email}`}
                    className="user-row"
                    data-role={getRoleClass(user.role)}
                  >
                    <td>{index + 1}</td>
                    <td className="user-name">
                      <div className="user-info">
                        <div className="user-avatar">
                          {getAvatarUrl(user) ? (
                            <img 
                              src={getAvatarUrl(user)} 
                              alt={user.fullName || 'Avatar'} 
                              className="user-avatar-image"
                              loading="lazy"
                            />
                          ) : (
                            <span
                              className={`user-avatar-fallback role-${getRoleClass(user.role)}`}
                              data-role={getRoleClass(user.role)}
                            >
                              {getInitial(user.fullName)}
                            </span>
                          )}
                        </div>
                        <span className="user-fullname">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="user-email">{user.email}</td>
                    <td className="user-phone">{user.phone}</td>
                    <td className="user-role">
                      <span
                        className={`role-badge role-${user.role?.toLowerCase()}`}
                        data-role={getRoleClass(user.role)}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="user-status">
                      <span className={`status-badge ${user.isActive !== false ? 'active' : 'inactive'}`}>
                        {user.isActive !== false ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </span>
                    </td>
                    <td className="user-actions">
                      <button 
                        className={`btn-toggle ${user.isActive !== false ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleActive(user)}
                        title={user.isActive !== false ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      >
                        {user.isActive !== false ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                      <button className="btn-edit" onClick={() => openEditModal(user)} title="Chỉnh sửa">
                        <FiEdit2 />
                      </button>
                      <button className="btn-delete" onClick={() => openDeleteModal(user)} title="Xóa">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Modal - Wider size */}
        <CustomModal
          show={showAddModal}
          onHide={() => { setShowAddModal(false); resetForm(); }}
          title="Thêm tài khoản mới"
          onConfirm={handleAddUser}
          confirmText="Thêm nhân sự"
          loading={loading}
          size="xl"
          dialogClassName="apex-modal apex-modal-wide"
          centered
        >
          <div className="user-form modern">
            <div className="form-section">
              <p className="form-section-title">Thông tin cơ bản</p>
              <div className="form-grid">
                <div className="form-group">
                  <label>Họ tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleInputChange}
                    placeholder="Nhập họ tên"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="Nhập email công việc"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                    className="form-input"
                  />
                  <small className="helper-text">Sử dụng số liên hệ chính để hỗ trợ xác thực.</small>
                </div>
                <div className="form-group">
                  <label>Vai trò *</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    {ROLE_CATEGORIES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                  <small className="helper-text">Hệ thống tự áp dụng quyền theo vai trò.</small>
                </div>
              </div>
            </div>

            <div className="form-section">
              <p className="form-section-title">Thông tin bảo mật</p>
              <div className="form-grid">
                <div className="form-group">
                  <label>Mật khẩu *</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu"
                    className="form-input"
                  />
                  <small className="helper-text">Tối thiểu 8 ký tự gồm chữ và số.</small>
                </div>
                <div className="form-group">
                  <label>Nhập lại mật khẩu *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập lại mật khẩu"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </CustomModal>

        {/* Edit Modal */}
        <CustomModal
          show={showEditModal}
          onHide={() => { setShowEditModal(false); resetForm(); setSelectedUser(null); }}
          title="Chỉnh sửa nhân sự"
          onConfirm={handleEditUser}
          confirmText="Cập nhật"
          loading={loading}
          size="lg"
          dialogClassName="apex-modal"
        >
          <div className="user-form modern">
            <div className="form-section">
              <p className="form-section-title">Thông tin hiển thị</p>
              <div className="form-grid">
                <div className="form-group">
                  <label>Họ tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Vai trò *</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    {ROLE_CATEGORIES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </CustomModal>

        {/* Delete Confirmation Modal */}
        <CustomModal
          show={showDeleteModal}
          onHide={() => { setShowDeleteModal(false); setSelectedUser(null); }}
          title="Xác nhận xóa nhân sự"
          onConfirm={handleDeleteUser}
          confirmText="Xóa"
          cancelText="Hủy"
          loading={loading}
          isDanger={true}
        >
          <p>Bạn có chắc chắn muốn xóa nhân sự <strong>{selectedUser?.fullName}</strong>?</p>
          <p className="warning-text">Hành động này không thể hoàn tác!</p>
        </CustomModal>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminUserRegister;
