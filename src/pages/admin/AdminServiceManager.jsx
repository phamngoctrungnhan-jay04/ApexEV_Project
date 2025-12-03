// File: src/pages/admin/AdminServiceManager.jsx
// Trang quản lý dịch vụ cho Admin (CRUD services)

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import CustomAlert from '../../components/common/CustomAlert';
import CustomModal from '../../components/common/CustomModal';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiToggleLeft,
  FiToggleRight,
  FiType,
  FiAlignLeft,
  FiList,
  FiDollarSign,
  FiClock,
  FiInfo,
  FiAlertTriangle,
  FiActivity
} from 'react-icons/fi';
import SearchBar from '../../components/common/SearchBar';
import serviceService from '../../services/serviceService';
import './AdminServiceManager.css';

const AdminServiceManager = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    unitPrice: '',
    estimatedDuration: '',
    isActive: true
  });

  // Service categories - Đồng bộ với mockData/services.js
  const categories = [
    { value: 'maintenance', label: 'Bảo dưỡng', color: '#338AF3', bg: '#E3F2FD' },
    { value: 'battery', label: 'Pin & Điện', color: '#FFA726', bg: '#FFF3E0' },
    { value: 'tire', label: 'Lốp xe', color: '#66BB6A', bg: '#E8F5E9' },
    { value: 'brake', label: 'Phanh', color: '#EF5350', bg: '#FFEBEE' },
    { value: 'software', label: 'Phần mềm', color: '#AB47BC', bg: '#F3E5F5' },
    { value: 'cleaning', label: 'Vệ sinh', color: '#26C6DA', bg: '#E0F7FA' },
    { value: 'hvac', label: 'Điều hòa', color: '#42A5F5', bg: '#E1F5FE' },
    { value: 'suspension', label: 'Hệ thống treo', color: '#8D6E63', bg: '#EFEBE9' },
    { value: 'emergency', label: 'Cứu hộ', color: '#FF5722', bg: '#FBE9E7' },
    { value: 'inspection', label: 'Kiểm tra', color: '#7E57C2', bg: '#EDE7F6' },
    { value: 'cooling', label: 'Làm mát', color: '#29B6F6', bg: '#E1F5FE' }
  ];

  // Helper function để lấy label và màu sắc từ category value
  const getCategoryInfo = (categoryValue) => {
    const cat = categories.find(c => c.value === categoryValue);
    return cat || { label: 'Chưa phân loại', color: '#6B7280', bg: '#F3F4F6' };
  };

  const getCategoryLabel = (categoryValue) => {
    return getCategoryInfo(categoryValue).label;
  };

  // Load services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await serviceService.getAllServices();
      setServices(data || []);
      setFilteredServices(data || []);
    } catch (error) {
      console.error('Fetch services error:', error);
      showAlert('danger', `Không thể tải danh sách dịch vụ: ${error.message || 'Lỗi kết nối'}`);
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
    setForm({
      name: '',
      description: '',
      category: '',
      unitPrice: '',
      estimatedDuration: '',
      isActive: true
    });
  };

  const renderServiceForm = (prefix = 'form') => {
    const controlId = (name) => `${prefix}-${name}`;

    return (
      <div className="service-form">
        <div className="form-info-card">
          <FiInfo />
          <div className="info-content">
            <p className="info-title">Thông tin dịch vụ</p>
            <p className="info-text">
              Hãy mô tả rõ ràng chi tiết và giá trị dịch vụ để cố vấn dễ tư vấn cho khách hàng.
            </p>
          </div>
        </div>

        <div className="form-columns">
          <div className="form-column">
            <div className="form-group">
              <label htmlFor={controlId('service-name')}>
                Tên dịch vụ <span className="required">*</span>
              </label>
              <div className="form-input-wrapper">
                <FiType />
                <input
                  id={controlId('service-name')}
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên dịch vụ"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor={controlId('service-category')}>
                Danh mục dịch vụ <span className="required">*</span>
              </label>
              <div className="form-input-wrapper">
                <FiList />
                <select
                  id={controlId('service-category')}
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor={controlId('service-price')}>
                Giá dự kiến (VNĐ) <span className="required">*</span>
              </label>
              <div className="form-input-wrapper">
                <FiDollarSign />
                <input
                  id={controlId('service-price')}
                  type="number"
                  name="unitPrice"
                  value={form.unitPrice}
                  onChange={handleInputChange}
                  placeholder="Nhập giá dự kiến"
                  className="form-input"
                  min="0"
                />
              </div>
              <div className="warning-text subtle">
                <FiAlertTriangle />
                <span>Giá sẽ hiển thị cho khách hàng, hãy nhập số dương và bao gồm chi phí vật tư.</span>
              </div>
            </div>
          </div>

          <div className="form-column">
            <div className="form-group">
              <label htmlFor={controlId('service-description')}>Mô tả</label>
              <div className="form-input-wrapper textarea-wrapper">
                <FiAlignLeft />
                <textarea
                  id={controlId('service-description')}
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả dịch vụ"
                  className="form-textarea"
                  rows="6"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor={controlId('service-duration')}>Thời gian dự kiến (phút)</label>
              <div className="form-input-wrapper">
                <FiClock />
                <input
                  id={controlId('service-duration')}
                  type="number"
                  name="estimatedDuration"
                  value={form.estimatedDuration}
                  onChange={handleInputChange}
                  placeholder="Nhập thời gian dự kiến"
                  className="form-input"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Trạng thái dịch vụ</label>
              <div className="form-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="toggle-checkbox"
                  />
                  <span className="toggle-text">
                    <FiActivity />
                    Hoạt động tức thì
                  </span>
                </label>
              </div>
              <p className="toggle-description">
                Dịch vụ sẽ được hiển thị ngay trên hệ thống đặt lịch khi trạng thái kích hoạt.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleAddService = async () => {
    // Validate
    if (!form.name || !form.unitPrice || !form.category) {
      showAlert('danger', 'Vui lòng nhập đầy đủ: Tên dịch vụ, Danh mục và Giá dự kiến');
      return;
    }

    setLoading(true);
    try {
      await serviceService.createService(form);
      showAlert('success', 'Thêm dịch vụ thành công!');
      setShowAddModal(false);
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Create service error:', error);
      showAlert('danger', `Thêm dịch vụ thất bại: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditService = async () => {
    if (!selectedService) return;

    // Validate
    if (!form.name || !form.unitPrice || !form.category) {
      showAlert('danger', 'Vui lòng nhập đầy đủ: Tên dịch vụ, Danh mục và Giá dự kiến');
      return;
    }

    setLoading(true);
    try {
      await serviceService.updateService(selectedService.id, form);
      showAlert('success', 'Cập nhật dịch vụ thành công!');
      setShowEditModal(false);
      resetForm();
      setSelectedService(null);
      fetchServices();
    } catch (error) {
      console.error('Update service error:', error);
      showAlert('danger', `Cập nhật dịch vụ thất bại: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    setLoading(true);
    try {
      await serviceService.deleteService(selectedService.id);
      showAlert('success', 'Xóa dịch vụ thành công!');
      setShowDeleteModal(false);
      setSelectedService(null);
      fetchServices();
    } catch (error) {
      console.error('Delete service error:', error);
      showAlert('danger', `Xóa dịch vụ thất bại: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (service) => {
    setSelectedService(service);
    setForm({
      name: service.name || '',
      description: service.description || '',
      category: service.category || '',
      unitPrice: service.unitPrice || '',
      estimatedDuration: service.estimatedDuration || '',
      isActive: service.isActive !== undefined ? service.isActive : true
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  // Category summary - đếm số dịch vụ theo danh mục
  const categorySummary = categories.map(cat => ({
    ...cat,
    count: services.filter(s => s.category === cat.value).length
  }));

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filter by category
  useEffect(() => {
    let filtered = [...services];
    
    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(s => s.category === categoryFilter);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(service =>
        service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredServices(filtered);
  }, [searchTerm, services, categoryFilter]);

  const handleToggleActive = async (service) => {
    try {
      const updatedService = { ...service, isActive: !service.isActive };
      await serviceService.updateService(service.id, updatedService);
      showAlert('success', `${updatedService.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'} dịch vụ thành công!`);
      fetchServices();
    } catch (error) {
      console.error('Toggle active error:', error);
      showAlert('danger', `Cập nhật trạng thái thất bại: ${error.message || 'Lỗi không xác định'}`);
    }
  };

  return (
    <AdminLayout>
      <section className="admin-service-manager-page">
        <div className="service-manager-container">
        {/* Header */}
        <div className="service-manager-header">
          <div className="header-left">
            <FiPackage className="header-icon" />
            <h1 className="header-title">Quản lý dịch vụ</h1>
          </div>
          <button className="btn-add-service" onClick={openAddModal}>
            <FiPlus /> Thêm dịch vụ
          </button>
        </div>

        {/* Alert (Floating toast) */}
        {alert.show && (
          <CustomAlert variant={alert.type} floating dismissible onClose={() => setAlert({ show: false, type: '', message: '' })}>
            {alert.message}
          </CustomAlert>
        )}

        {/* Category Filter Chips */}
        <div className="category-filter">
          <button
            className={`filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            Tất cả
          </button>
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`filter-btn ${categoryFilter === cat.value ? 'active' : ''}`}
              data-category={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar (Reusable) */}
        <SearchBar
          size="compact"
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={fetchServices}
          placeholder="Tìm kiếm dịch vụ..."
          ariaLabel="Tìm kiếm dịch vụ"
        />

        {/* Table */}
        <div className="service-table-container">
          {loading && <div className="loading">Đang tải...</div>}
          {!loading && filteredServices.length === 0 && (
            <div className="empty-state">Không có dịch vụ nào</div>
          )}
          {!loading && filteredServices.length > 0 && (
            <table className="service-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên dịch vụ</th>
                  <th>Danh mục</th>
                  <th>Mô tả</th>
                  <th>Giá dự kiến (VNĐ)</th>
                  <th>Thời gian (phút)</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service, index) => {
                  const categoryInfo = getCategoryInfo(service.category);
                  return (
                    <tr 
                      key={service.id} 
                      className="service-row"
                      data-category={service.category || 'default'}
                    >
                      <td>{index + 1}</td>
                      <td className="service-name">{service.name}</td>
                      <td className="service-category">
                        <span 
                          className="category-badge"
                          data-category={service.category || 'default'}
                        >
                          {categoryInfo.label}
                        </span>
                      </td>
                      <td className="service-description">{service.description || 'Không có mô tả'}</td>
                      <td className="service-price">{service.unitPrice ? service.unitPrice.toLocaleString('vi-VN') : '0'}</td>
                      <td className="service-duration">{service.estimatedDuration || 'Chưa rõ'}</td>
                      <td className="service-status">
                        <span className={`status-badge ${service.isActive !== false ? 'active' : 'inactive'}`}>
                          {service.isActive !== false ? 'Hoạt động' : 'Vô hiệu hóa'}
                        </span>
                      </td>
                      <td className="service-actions">
                        <button 
                          className={`btn-toggle ${service.isActive !== false ? 'active' : 'inactive'}`}
                          onClick={() => handleToggleActive(service)}
                          title={service.isActive !== false ? 'Vô hiệu hóa dịch vụ' : 'Kích hoạt dịch vụ'}
                        >
                          {service.isActive !== false ? <FiToggleRight /> : <FiToggleLeft />}
                        </button>
                        <button className="btn-edit" onClick={() => openEditModal(service)} title="Chỉnh sửa">
                          <FiEdit2 />
                        </button>
                        <button className="btn-delete" onClick={() => openDeleteModal(service)} title="Xóa">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Modal */}
        <CustomModal
          show={showAddModal}
          onHide={() => { setShowAddModal(false); resetForm(); }}
          title="Thêm dịch vụ mới"
          onConfirm={handleAddService}
          confirmText="Thêm dịch vụ"
          loading={loading}
          dialogClassName="service-form-modal"
        >
          {renderServiceForm('add')}
        </CustomModal>

        {/* Edit Modal */}
        <CustomModal
          show={showEditModal}
          onHide={() => { setShowEditModal(false); resetForm(); setSelectedService(null); }}
          title="Chỉnh sửa dịch vụ"
          onConfirm={handleEditService}
          confirmText="Cập nhật"
          loading={loading}
          dialogClassName="service-form-modal"
        >
          {renderServiceForm('edit')}
        </CustomModal>

        {/* Delete Confirmation Modal */}
        <CustomModal
          show={showDeleteModal}
          onHide={() => { setShowDeleteModal(false); setSelectedService(null); }}
          title="Xác nhận xóa dịch vụ"
          onConfirm={handleDeleteService}
          confirmText="Xóa"
          cancelText="Hủy"
          loading={loading}
          isDanger={true}
        >
          <p>Bạn có chắc chắn muốn xóa dịch vụ <strong>{selectedService?.name}</strong>?</p>
          <p className="warning-text">Hành động này không thể hoàn tác!</p>
        </CustomModal>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminServiceManager;
