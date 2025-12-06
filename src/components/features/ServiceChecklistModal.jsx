// File: src/components/features/ServiceChecklistModal.jsx
// Modal hiển thị checklist items cho từng dịch vụ (APEX Modern UI)

import React, { useState, useEffect } from 'react';
import CustomModal from '../common/CustomModal';
import CustomAlert from '../common/CustomAlert';
import {
  FiCheckSquare,
  FiClock,
  FiAlertCircle,
  FiFilter,
  FiList,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiChevronUp,
  FiChevronDown,
  FiInfo
} from 'react-icons/fi';
import checklistItemService from '../../services/checklistItemService';
import './ServiceChecklistModal.css';

const ServiceChecklistModal = ({ show, onHide, service, isAdminMode = false }) => {
  const [checklistItems, setChecklistItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // CRUD Modal states
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

  // Load checklist items khi modal mở
  useEffect(() => {
    if (show && service) {
      fetchChecklistItems();
    }
  }, [show, service]);

  // Filter items khi category thay đổi
  useEffect(() => {
    if (categoryFilter === 'all') {
      setFilteredItems(checklistItems);
    } else {
      setFilteredItems(checklistItems.filter(item => item.category === categoryFilter));
    }
  }, [categoryFilter, checklistItems]);

  const fetchChecklistItems = async () => {
    setLoading(true);
    try {
      const data = await checklistItemService.getChecklistItemsByServiceId(service.id);
      const sorted = (data || []).sort((a, b) => a.stepOrder - b.stepOrder);
      setChecklistItems(sorted);
      setFilteredItems(sorted);
    } catch (error) {
      console.error('Fetch checklist items error:', error);
      setChecklistItems([]);
      setFilteredItems([]);
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
      serviceId: service?.id || '',
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
        serviceId: service.id,
        stepOrder: Number(form.stepOrder) || checklistItems.length + 1,
        estimatedTime: Number(form.estimatedTime) || 0
      });
      showAlert('success', 'Thêm checklist item thành công!');
      setShowAddModal(false);
      resetForm();
      fetchChecklistItems();
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
      fetchChecklistItems();
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
      fetchChecklistItems();
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
      fetchChecklistItems();
    } catch (error) {
      console.error('Toggle active error:', error);
      showAlert('danger', `Thay đổi trạng thái thất bại`);
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
      
      await checklistItemService.updateChecklistItem(item.id, {
        stepOrder: targetItem.stepOrder
      });
      await checklistItemService.updateChecklistItem(targetItem.id, {
        stepOrder: item.stepOrder
      });

      showAlert('success', 'Thay đổi thứ tự thành công!');
      fetchChecklistItems();
    } catch (error) {
      console.error('Move item error:', error);
      showAlert('danger', 'Thay đổi thứ tự thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Lấy màu theo category
  const getCategoryColor = (category) => {
    const colors = {
      battery: { bg: '#FFF3E0', color: '#FFA726', label: 'Pin' },
      motor: { bg: '#E8F5E9', color: '#66BB6A', label: 'Motor điện' },
      bms: { bg: '#F3E5F5', color: '#AB47BC', label: 'BMS' },
      cooling: { bg: '#E1F5FE', color: '#29B6F6', label: 'Làm mát' },
      regen: { bg: '#E0F7FA', color: '#26C6DA', label: 'Phanh tái sinh' },
      software: { bg: '#EDE7F6', color: '#7E57C2', label: 'Phần mềm' },
      brake: { bg: '#FFEBEE', color: '#EF5350', label: 'Phanh' },
      tire: { bg: '#E8F5E9', color: '#66BB6A', label: 'Lốp xe' },
      hvac: { bg: '#E1F5FE', color: '#42A5F5', label: 'Điều hòa' },
      suspension: { bg: '#EFEBE9', color: '#8D6E63', label: 'Hệ thống treo' },
      electrical: { bg: '#FFF9C4', color: '#FFEB3B', label: 'Điện' },
      cleaning: { bg: '#E0F7FA', color: '#26C6DA', label: 'Vệ sinh' },
      emergency: { bg: '#FBE9E7', color: '#FF5722', label: 'Khẩn cấp' }
    };
    return colors[category] || { bg: '#F3F4F6', color: '#6B7280', label: 'Khác' };
  };

  // Lấy danh sách unique categories từ checklist items
  const getUniqueCategories = () => {
    const categories = [...new Set(checklistItems.map(item => item.category))];
    return categories.map(cat => ({
      value: cat,
      ...getCategoryColor(cat)
    }));
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
              Mỗi item là 1 bước trong quy trình kiểm tra/bảo dưỡng.
            </p>
          </div>
        </div>

        <div className="form-columns">
          <div className="form-column">
            <div className="form-group">
              <label htmlFor={controlId('item-name')}>
                Tên bước <span className="required">*</span>
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
                <option value="battery">Pin</option>
                <option value="motor">Motor điện</option>
                <option value="bms">BMS</option>
                <option value="cooling">Làm mát</option>
                <option value="regen">Phanh tái sinh</option>
                <option value="software">Phần mềm</option>
                <option value="brake">Phanh</option>
                <option value="tire">Lốp xe</option>
                <option value="hvac">Điều hòa</option>
                <option value="suspension">Hệ thống treo</option>
                <option value="electrical">Điện</option>
                <option value="cleaning">Vệ sinh</option>
                <option value="emergency">Khẩn cấp</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor={controlId('step-order')}>Thứ tự bước</label>
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
              <label htmlFor={controlId('description')}>Mô tả chi tiết</label>
              <textarea
                id={controlId('description')}
                name="itemDescription"
                value={form.itemDescription}
                onChange={handleInputChange}
                placeholder="Cập nhật bản đồ, phần mềm màn hình giải trí"
                className="form-input"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor={controlId('estimated-time')}>Thời gian dự kiến (phút)</label>
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
    <>
      <CustomModal
        show={show}
        onHide={onHide}
        title={
          <div className="checklist-modal-header">
            <FiList className="header-icon" />
            <div>
              <h3>Danh sách công việc: {service?.name}</h3>
              <p className="header-subtitle">
                Tổng cộng {checklistItems.length} bước công việc
              </p>
            </div>
          </div>
        }
        footer={false}
        dialogClassName="service-checklist-modal"
        size="xl"
      >
        <div className="checklist-modal-content">
          {alert.show && <CustomAlert type={alert.type} message={alert.message} />}

          {/* Admin Add Button */}
          {isAdminMode && (
            <div className="admin-toolbar">
              <button className="btn-add-item" onClick={openAddModal}>
                <FiPlus /> Thêm Item Mới
              </button>
            </div>
          )}

          {/* Category Filter */}
          {checklistItems.length > 0 && (
            <div className="checklist-filter">
              <FiFilter className="filter-icon" />
              <button
                className={`filter-chip ${categoryFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('all')}
              >
                Tất cả ({checklistItems.length})
              </button>
              {getUniqueCategories().map(cat => (
                <button
                  key={cat.value}
                className={`filter-chip ${categoryFilter === cat.value ? 'active' : ''}`}
                style={{
                  '--chip-bg': cat.bg,
                  '--chip-color': cat.color
                }}
                onClick={() => setCategoryFilter(cat.value)}
              >
                {cat.label} ({checklistItems.filter(item => item.category === cat.value).length})
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="checklist-loading">
            <div className="spinner"></div>
            <p>Đang tải danh sách công việc...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && checklistItems.length === 0 && (
          <div className="checklist-empty">
            <FiCheckSquare className="empty-icon" />
            <h4>Chưa có checklist</h4>
            <p>Dịch vụ này chưa có danh sách công việc chi tiết.</p>
          </div>
        )}

        {/* Checklist Items */}
        {!loading && filteredItems.length > 0 && (
          <div className="checklist-items">
            {filteredItems.map((item, index) => {
              const categoryColor = getCategoryColor(item.category);
              return (
                <div key={item.id} className="checklist-item">
                  <div className="item-step">
                    <span className="step-number">{item.stepOrder}</span>
                  </div>
                  <div className="item-content">
                    <div className="item-header">
                      <h4 className="item-name">{item.itemName}</h4>
                      <div className="item-meta">
                        <span
                          className="item-category"
                          style={{
                            backgroundColor: categoryColor.bg,
                            color: categoryColor.color
                          }}
                        >
                          {categoryColor.label}
                        </span>
                        {item.isRequired && (
                          <span className="item-required">
                            <FiAlertCircle />
                            Bắt buộc
                          </span>
                        )}
                        <span className="item-time">
                          <FiClock />
                          {item.estimatedTime} phút
                        </span>
                      </div>
                    </div>
                    <p className="item-description">{item.itemDescription}</p>
                    {item.itemNameEn && (
                      <p className="item-name-en">
                        <em>{item.itemNameEn}</em>
                      </p>
                    )}

                    {/* Admin Actions */}
                    {isAdminMode && (
                      <div className="item-admin-actions">
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
                          className="btn-edit-item"
                          onClick={() => openEditModal(item)}
                          title="Chỉnh sửa"
                          disabled={loading}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn-delete-item"
                          onClick={() => openDeleteModal(item)}
                          title="Xóa"
                          disabled={loading}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No Results after filter */}
        {!loading && checklistItems.length > 0 && filteredItems.length === 0 && (
          <div className="checklist-empty">
            <FiFilter className="empty-icon" />
            <h4>Không tìm thấy kết quả</h4>
            <p>Không có công việc nào trong danh mục đã chọn.</p>
          </div>
        )}

        {/* Summary Footer */}
        {!loading && filteredItems.length > 0 && (
          <div className="checklist-summary">
            <div className="summary-item">
              <strong>Tổng bước:</strong>
              <span>{filteredItems.length}</span>
            </div>
            <div className="summary-item">
              <strong>Bắt buộc:</strong>
              <span>{filteredItems.filter(item => item.isRequired).length}</span>
            </div>
            <div className="summary-item">
              <strong>Thời gian dự kiến:</strong>
              <span>
                {filteredItems.reduce((sum, item) => sum + (item.estimatedTime || 0), 0)} phút
              </span>
            </div>
          </div>
        )}
      </div>
    </CustomModal>

    {/* Add Item Modal */}
    {isAdminMode && (
      <>
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

        {/* Edit Item Modal */}
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
      </>
    )}
    </>
  );
};

export default ServiceChecklistModal;
