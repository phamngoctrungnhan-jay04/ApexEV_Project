// File: src/pages/admin/AdminChecklistManager.jsx
// Quản lý CRUD Checklist Items cho Admin

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import CustomAlert from '../../components/common/CustomAlert';
import CustomModal from '../../components/common/CustomModal';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiChevronUp,
  FiChevronDown,
  FiInfo,
  FiAlertTriangle
} from 'react-icons/fi';
import SearchBar from '../../components/common/SearchBar';
import checklistItemService from '../../services/checklistItemService';
import serviceService from '../../services/serviceService';
import './AdminChecklistManager.css';

const AdminChecklistManager = () => {
  const [checklistItems, setChecklistItems] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form state
  const [form, setForm] = useState({
    serviceId: '',
    itemName: '',
    itemNameEn: '',
    itemDescription: '',
    itemDescriptionEn: '',
    stepOrder: 1,
    category: '',
    estimatedTime: 0,
    isRequired: true,
    isActive: true
  });

  // Categories từ backend
  const categories = [
    { value: 'exterior_check', label: 'Kiểm tra ngoại thất' },
    { value: 'interior_check', label: 'Kiểm tra nội thất' },
    { value: 'engine_check', label: 'Kiểm tra động cơ' },
    { value: 'battery_check', label: 'Kiểm tra pin' },
    { value: 'brake_check', label: 'Kiểm tra phanh' },
    { value: 'tire_check', label: 'Kiểm tra lốp' },
    { value: 'fluid_check', label: 'Kiểm tra chất lỏng' },
    { value: 'other', label: 'Khác' }
  ];

  // Load services and items on mount
  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      fetchChecklistItems(selectedServiceId);
    } else {
      setChecklistItems([]);
      setFilteredItems([]);
    }
  }, [selectedServiceId]);

  // Filter items
  useEffect(() => {
    let result = [...checklistItems];

    if (searchTerm) {
      result = result.filter(item =>
        item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      result = result.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(result);
  }, [checklistItems, searchTerm, selectedCategory]);

  const fetchServices = async () => {
    try {
      const data = await serviceService.getAllServices();
      setServices(data || []);
    } catch (error) {
      console.error('Fetch services error:', error);
      showAlert('danger', 'Không thể tải danh sách dịch vụ');
    }
  };

  const fetchChecklistItems = async (serviceId) => {
    setLoading(true);
    try {
      const data = await checklistItemService.getChecklistItemsByServiceId(serviceId);
      const sorted = (data || []).sort((a, b) => a.stepOrder - b.stepOrder);
      setChecklistItems(sorted);
      setFilteredItems(sorted);
    } catch (error) {
      console.error('Fetch checklist items error:', error);
      showAlert('danger', 'Không thể tải danh sách checklist items');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setForm({
      serviceId: selectedServiceId || '',
      itemName: '',
      itemNameEn: '',
      itemDescription: '',
      itemDescriptionEn: '',
      stepOrder: checklistItems.length + 1,
      category: '',
      estimatedTime: 0,
      isRequired: true,
      isActive: true
    });
  };

  // CRUD Handlers
  const openAddModal = () => {
    if (!selectedServiceId) {
      showAlert('warning', 'Vui lòng chọn dịch vụ trước khi thêm checklist item');
      return;
    }
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setForm({
      serviceId: item.serviceId,
      itemName: item.itemName || '',
      itemNameEn: item.itemNameEn || '',
      itemDescription: item.itemDescription || '',
      itemDescriptionEn: item.itemDescriptionEn || '',
      stepOrder: item.stepOrder || 1,
      category: item.category || '',
      estimatedTime: item.estimatedTime || 0,
      isRequired: item.isRequired !== false,
      isActive: item.isActive !== false
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleAddItem = async () => {
    if (!form.itemName || !form.category) {
      showAlert('warning', 'Vui lòng nhập đầy đủ thông tin bắt buộc (Tên item, Category)');
      return;
    }

    setLoading(true);
    try {
      await checklistItemService.createChecklistItem({
        ...form,
        serviceId: selectedServiceId,
        stepOrder: Number(form.stepOrder) || checklistItems.length + 1,
        estimatedTime: Number(form.estimatedTime) || 0
      });
      showAlert('success', 'Thêm checklist item thành công!');
      setShowAddModal(false);
      resetForm();
      fetchChecklistItems(selectedServiceId);
    } catch (error) {
      console.error('Add item error:', error);
      showAlert('danger', `Thêm thất bại: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = async () => {
    if (!form.itemName || !form.category) {
      showAlert('warning', 'Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);
    try {
      await checklistItemService.updateChecklistItem(selectedItem.id, {
        ...form,
        stepOrder: Number(form.stepOrder),
        estimatedTime: Number(form.estimatedTime)
      });
      showAlert('success', 'Cập nhật checklist item thành công!');
      setShowEditModal(false);
      setSelectedItem(null);
      resetForm();
      fetchChecklistItems(selectedServiceId);
    } catch (error) {
      console.error('Update item error:', error);
      showAlert('danger', `Cập nhật thất bại: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    setLoading(true);
    try {
      await checklistItemService.deleteChecklistItem(selectedItem.id);
      showAlert('success', 'Xóa checklist item thành công!');
      setShowDeleteModal(false);
      setSelectedItem(null);
      fetchChecklistItems(selectedServiceId);
    } catch (error) {
      console.error('Delete item error:', error);
      showAlert('danger', `Xóa thất bại: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (item) => {
    setLoading(true);
    try {
      await checklistItemService.toggleChecklistItemActive(item.id);
      showAlert('success', `${item.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} item thành công!`);
      fetchChecklistItems(selectedServiceId);
    } catch (error) {
      console.error('Toggle active error:', error);
      showAlert('danger', `Thay đổi trạng thái thất bại: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveItem = async (item, direction) => {
    const currentIndex = checklistItems.findIndex(i => i.id === item.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= checklistItems.length) return;

    setLoading(true);
    try {
      const targetItem = checklistItems[targetIndex];
      
      // Swap stepOrder
      await checklistItemService.updateChecklistItem(item.id, {
        stepOrder: targetItem.stepOrder
      });
      await checklistItemService.updateChecklistItem(targetItem.id, {
        stepOrder: item.stepOrder
      });

      showAlert('success', 'Thay đổi thứ tự thành công!');
      fetchChecklistItems(selectedServiceId);
    } catch (error) {
      console.error('Move item error:', error);
      showAlert('danger', 'Thay đổi thứ tự thất bại');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (categoryValue) => {
    const cat = categories.find(c => c.value === categoryValue);
    return cat ? cat.label : categoryValue;
  };

  const renderForm = (prefix = 'form') => {
    const controlId = (name) => `${prefix}-${name}`;

    return (
      <div className="checklist-item-form">
        <div className="form-info-card">
          <FiInfo />
          <div className="info-content">
            <p className="info-title">Thông tin Checklist Item</p>
            <p className="info-text">
              Mỗi item là 1 bước trong quy trình kiểm tra/bảo dưỡng. Hãy mô tả rõ ràng để kỹ thuật viên dễ thực hiện.
            </p>
          </div>
        </div>

        <div className="form-columns">
          <div className="form-column">
            <div className="form-group">
              <label htmlFor={controlId('item-name')}>
                Tên bước (Tiếng Việt) <span className="required">*</span>
              </label>
              <input
                id={controlId('item-name')}
                type="text"
                name="itemName"
                value={form.itemName}
                onChange={handleInputChange}
                placeholder="VD: Kiểm tra áp suất lốp"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor={controlId('item-name-en')}>
                Tên bước (English)
              </label>
              <input
                id={controlId('item-name-en')}
                type="text"
                name="itemNameEn"
                value={form.itemNameEn}
                onChange={handleInputChange}
                placeholder="EX: Check tire pressure"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor={controlId('category')}>
                Danh mục <span className="required">*</span>
              </label>
              <select
                id={controlId('category')}
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

            <div className="form-group">
              <label htmlFor={controlId('step-order')}>
                Thứ tự bước
              </label>
              <input
                id={controlId('step-order')}
                type="number"
                name="stepOrder"
                value={form.stepOrder}
                onChange={handleInputChange}
                className="form-input"
                min="1"
              />
            </div>
          </div>

          <div className="form-column">
            <div className="form-group">
              <label htmlFor={controlId('description')}>
                Mô tả chi tiết (Tiếng Việt)
              </label>
              <textarea
                id={controlId('description')}
                name="itemDescription"
                value={form.itemDescription}
                onChange={handleInputChange}
                placeholder="Mô tả cách thực hiện..."
                className="form-input"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor={controlId('description-en')}>
                Mô tả chi tiết (English)
              </label>
              <textarea
                id={controlId('description-en')}
                name="itemDescriptionEn"
                value={form.itemDescriptionEn}
                onChange={handleInputChange}
                placeholder="Describe how to perform..."
                className="form-input"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor={controlId('estimated-time')}>
                Thời gian dự kiến (phút)
              </label>
              <input
                id={controlId('estimated-time')}
                type="number"
                name="estimatedTime"
                value={form.estimatedTime}
                onChange={handleInputChange}
                className="form-input"
                min="0"
              />
            </div>

            <div className="form-checkboxes">
              <div className="form-checkbox">
                <input
                  id={controlId('is-required')}
                  type="checkbox"
                  name="isRequired"
                  checked={form.isRequired}
                  onChange={handleInputChange}
                />
                <label htmlFor={controlId('is-required')}>Bắt buộc thực hiện</label>
              </div>

              <div className="form-checkbox">
                <input
                  id={controlId('is-active')}
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleInputChange}
                />
                <label htmlFor={controlId('is-active')}>Kích hoạt</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <section className="admin-checklist-manager">
        {alert.show && <CustomAlert type={alert.type} message={alert.message} />}

        <div className="page-header">
          <div className="header-left">
            <h1>Quản Lý Checklist Items</h1>
            <p className="subtitle">Quản lý các bước kiểm tra/bảo dưỡng cho từng dịch vụ</p>
          </div>
          <button className="btn-add" onClick={openAddModal} disabled={!selectedServiceId}>
            <FiPlus /> Thêm Item
          </button>
        </div>

        {/* Filters */}
        <div className="filters-row">
          <div className="filter-group">
            <label>Chọn dịch vụ:</label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="service-select"
            >
              <option value="">-- Chọn dịch vụ để xem checklist --</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Lọc theo danh mục:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
              disabled={!selectedServiceId}
            >
              <option value="">-- Tất cả danh mục --</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm kiếm checklist item..."
          ariaLabel="Tìm kiếm checklist item"
        />

        {/* Table */}
        <div className="checklist-table-container">
          {!selectedServiceId && (
            <div className="empty-state">
              <FiAlertTriangle />
              <p>Vui lòng chọn dịch vụ để xem danh sách checklist items</p>
            </div>
          )}

          {selectedServiceId && loading && <div className="loading">Đang tải...</div>}

          {selectedServiceId && !loading && filteredItems.length === 0 && (
            <div className="empty-state">Không có checklist item nào</div>
          )}

          {selectedServiceId && !loading && filteredItems.length > 0 && (
            <table className="checklist-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>STT</th>
                  <th>Tên bước</th>
                  <th>Danh mục</th>
                  <th>Mô tả</th>
                  <th style={{ width: '100px' }}>Thời gian</th>
                  <th style={{ width: '100px' }}>Bắt buộc</th>
                  <th style={{ width: '100px' }}>Trạng thái</th>
                  <th style={{ width: '200px' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={item.id} className="checklist-row">
                    <td>{item.stepOrder}</td>
                    <td className="item-name">{item.itemName}</td>
                    <td>
                      <span className="category-badge" data-category={item.category}>
                        {getCategoryLabel(item.category)}
                      </span>
                    </td>
                    <td className="item-description">{item.itemDescription || 'Không có mô tả'}</td>
                    <td>{item.estimatedTime ? `${item.estimatedTime} phút` : 'Chưa rõ'}</td>
                    <td>
                      <span className={`required-badge ${item.isRequired ? 'required' : 'optional'}`}>
                        {item.isRequired ? 'Bắt buộc' : 'Tùy chọn'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
                        {item.isActive ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </td>
                    <td className="checklist-actions">
                      <button
                        className="btn-move"
                        onClick={() => handleMoveItem(item, 'up')}
                        disabled={index === 0 || loading}
                        title="Di chuyển lên"
                      >
                        <FiChevronUp />
                      </button>
                      <button
                        className="btn-move"
                        onClick={() => handleMoveItem(item, 'down')}
                        disabled={index === filteredItems.length - 1 || loading}
                        title="Di chuyển xuống"
                      >
                        <FiChevronDown />
                      </button>
                      <button
                        className={`btn-toggle ${item.isActive ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleActive(item)}
                        title={item.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        disabled={loading}
                      >
                        {item.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => openEditModal(item)}
                        title="Chỉnh sửa"
                        disabled={loading}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => openDeleteModal(item)}
                        title="Xóa"
                        disabled={loading}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Modal */}
        <CustomModal
          show={showAddModal}
          onHide={() => { setShowAddModal(false); resetForm(); }}
          title="Thêm Checklist Item Mới"
          onConfirm={handleAddItem}
          confirmText="Thêm Item"
          loading={loading}
          dialogClassName="checklist-form-modal"
        >
          {renderForm('add')}
        </CustomModal>

        {/* Edit Modal */}
        <CustomModal
          show={showEditModal}
          onHide={() => { setShowEditModal(false); resetForm(); setSelectedItem(null); }}
          title="Chỉnh Sửa Checklist Item"
          onConfirm={handleEditItem}
          confirmText="Cập nhật"
          loading={loading}
          dialogClassName="checklist-form-modal"
        >
          {renderForm('edit')}
        </CustomModal>

        {/* Delete Confirmation Modal */}
        <CustomModal
          show={showDeleteModal}
          onHide={() => { setShowDeleteModal(false); setSelectedItem(null); }}
          title="Xác nhận xóa Checklist Item"
          onConfirm={handleDeleteItem}
          confirmText="Xóa"
          cancelText="Hủy"
          loading={loading}
          isDanger={true}
        >
          <p>Bạn có chắc chắn muốn xóa item <strong>{selectedItem?.itemName}</strong>?</p>
          <p className="warning-text">Hành động này không thể hoàn tác!</p>
        </CustomModal>
      </section>
    </AdminLayout>
  );
};

export default AdminChecklistManager;
