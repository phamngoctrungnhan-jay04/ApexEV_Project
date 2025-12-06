// File: src/pages/admin/AdminPartsManager.jsx
// Trang quản lý phụ tùng cho Admin (CRUD parts)

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import CustomAlert from '../../components/common/CustomAlert';
import CustomModal from '../../components/common/CustomModal';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiType,
  FiAlignLeft,
  FiDollarSign,
  FiInfo,
  FiAlertTriangle,
  FiHash,
  FiBox,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw
} from 'react-icons/fi';
import SearchBar from '../../components/common/SearchBar';
import partService from '../../services/partService';
import './AdminPartsManager.css';

const AdminPartsManager = () => {
  const [parts, setParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);

  // Form state
  const [form, setForm] = useState({
    partName: '',
    sku: '',
    description: '',
    quantityInStock: 0,
    price: ''
  });

  // Stock adjustment state
  const [stockForm, setStockForm] = useState({
    quantity: 0,
    action: 'add'
  });

  // Category filter based on SKU prefix
  const categories = [
    { value: 'all', label: 'Tất cả', prefix: '' },
    { value: 'battery', label: 'Pin & Điện', prefix: 'BAT-' },
    { value: 'cooling', label: 'Làm mát', prefix: 'COOL-' },
    { value: 'brake', label: 'Phanh', prefix: 'BRK-' },
    { value: 'tire', label: 'Lốp xe', prefix: 'TIRE-' },
    { value: 'motor', label: 'Động cơ điện', prefix: 'MOT-' },
    { value: 'inverter', label: 'Inverter/Sạc', prefix: 'INV-|CHG-' },
    { value: 'suspension', label: 'Hệ thống treo', prefix: 'SUS-' },
    { value: 'hvac', label: 'Điều hòa', prefix: 'HVAC-' },
    { value: 'electrical', label: 'Điện 12V & Chiếu sáng', prefix: 'ELEC-' },
    { value: 'care', label: 'Vệ sinh & Chăm sóc', prefix: 'CARE-' },
    { value: 'emergency', label: 'Cứu hộ khẩn cấp', prefix: 'EMRG-' }
  ];

  const [categoryFilter, setCategoryFilter] = useState('all');

  // Get category from SKU
  const getCategoryFromSku = (sku) => {
    if (!sku) return { label: 'Chưa phân loại', value: 'unknown' };
    const upperSku = sku.toUpperCase();
    
    for (const cat of categories) {
      if (cat.prefix && cat.prefix !== '') {
        const prefixes = cat.prefix.split('|');
        for (const prefix of prefixes) {
          if (upperSku.startsWith(prefix)) {
            return cat;
          }
        }
      }
    }
    return { label: 'Khác', value: 'other' };
  };

  // Load parts on mount
  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    setLoading(true);
    try {
      const data = await partService.getAllPartsForAdmin();
      setParts(data || []);
      setFilteredParts(data || []);
    } catch (error) {
      console.error('Fetch parts error:', error);
      showAlert('danger', `Không thể tải danh sách phụ tùng: ${error.message || 'Lỗi kết nối'}`);
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
      partName: '',
      sku: '',
      description: '',
      quantityInStock: 0,
      price: ''
    });
  };

  const renderPartForm = (prefix = 'form') => {
    const controlId = (name) => `${prefix}-${name}`;

    return (
      <div className="part-form">
        <div className="form-info-card">
          <FiInfo />
          <div className="info-content">
            <p className="info-title">Thông tin phụ tùng</p>
            <p className="info-text">
              SKU nên theo chuẩn: [LOẠI]-[CHI TIẾT]-[MÃ] (VD: BAT-CELL-18650-LG)
            </p>
          </div>
        </div>

        <div className="form-columns">
          <div className="form-column">
            <div className="form-group">
              <label htmlFor={controlId('part-name')}>
                Tên phụ tùng <span className="required">*</span>
              </label>
              <div className="form-input-wrapper">
                <FiType />
                <input
                  id={controlId('part-name')}
                  type="text"
                  name="partName"
                  value={form.partName}
                  onChange={handleInputChange}
                  placeholder="Nhập tên phụ tùng"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor={controlId('part-sku')}>
                Mã SKU
              </label>
              <div className="form-input-wrapper">
                <FiHash />
                <input
                  id={controlId('part-sku')}
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleInputChange}
                  placeholder="VD: BAT-CELL-18650-LG"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor={controlId('part-price')}>
                Đơn giá (VNĐ) <span className="required">*</span>
              </label>
              <div className="form-input-wrapper">
                <FiDollarSign />
                <input
                  id={controlId('part-price')}
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleInputChange}
                  placeholder="Nhập đơn giá"
                  className="form-input"
                  min="0"
                />
              </div>
              <div className="warning-text subtle">
                <FiAlertTriangle />
                <span>Đơn giá bán lẻ, chưa tính công lắp đặt.</span>
              </div>
            </div>
          </div>

          <div className="form-column">
            <div className="form-group">
              <label htmlFor={controlId('part-description')}>Mô tả</label>
              <div className="form-input-wrapper textarea-wrapper">
                <FiAlignLeft />
                <textarea
                  id={controlId('part-description')}
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả phụ tùng"
                  className="form-textarea"
                  rows="4"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor={controlId('part-stock')}>Số lượng tồn kho</label>
              <div className="form-input-wrapper">
                <FiBox />
                <input
                  id={controlId('part-stock')}
                  type="number"
                  name="quantityInStock"
                  value={form.quantityInStock}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="form-input"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleAddPart = async () => {
    // Validate
    if (!form.partName || !form.price) {
      showAlert('danger', 'Vui lòng nhập đầy đủ: Tên phụ tùng và Đơn giá');
      return;
    }

    setLoading(true);
    try {
      await partService.createPart({
        ...form,
        price: parseFloat(form.price),
        quantityInStock: parseInt(form.quantityInStock) || 0
      });
      showAlert('success', 'Thêm phụ tùng thành công!');
      setShowAddModal(false);
      resetForm();
      fetchParts();
    } catch (error) {
      console.error('Create part error:', error);
      const errorMsg = error.response?.data || error.message || 'Lỗi không xác định';
      showAlert('danger', `Thêm phụ tùng thất bại: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPart = async () => {
    if (!selectedPart) return;

    // Validate
    if (!form.partName || !form.price) {
      showAlert('danger', 'Vui lòng nhập đầy đủ: Tên phụ tùng và Đơn giá');
      return;
    }

    setLoading(true);
    try {
      await partService.updatePart(selectedPart.id, {
        ...form,
        price: parseFloat(form.price),
        quantityInStock: parseInt(form.quantityInStock) || 0
      });
      showAlert('success', 'Cập nhật phụ tùng thành công!');
      setShowEditModal(false);
      resetForm();
      setSelectedPart(null);
      fetchParts();
    } catch (error) {
      console.error('Update part error:', error);
      const errorMsg = error.response?.data || error.message || 'Lỗi không xác định';
      showAlert('danger', `Cập nhật phụ tùng thất bại: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePart = async () => {
    if (!selectedPart) return;

    setLoading(true);
    try {
      await partService.deletePart(selectedPart.id);
      showAlert('success', 'Xóa phụ tùng thành công!');
      setShowDeleteModal(false);
      setSelectedPart(null);
      fetchParts();
    } catch (error) {
      console.error('Delete part error:', error);
      const errorMsg = error.response?.data || error.message || 'Lỗi không xác định';
      showAlert('danger', `Xóa phụ tùng thất bại: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedPart || stockForm.quantity <= 0) {
      showAlert('danger', 'Vui lòng nhập số lượng hợp lệ (> 0)');
      return;
    }

    setLoading(true);
    try {
      await partService.updateStock(selectedPart.id, stockForm.quantity, stockForm.action);
      const actionText = stockForm.action === 'add' ? 'Nhập kho' : 'Xuất kho';
      showAlert('success', `${actionText} thành công: ${stockForm.quantity} x ${selectedPart.partName}`);
      setShowStockModal(false);
      setStockForm({ quantity: 0, action: 'add' });
      setSelectedPart(null);
      fetchParts();
    } catch (error) {
      console.error('Update stock error:', error);
      const errorMsg = error.response?.data || error.message || 'Lỗi không xác định';
      showAlert('danger', `Cập nhật tồn kho thất bại: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (part) => {
    setSelectedPart(part);
    setForm({
      partName: part.partName || '',
      sku: part.sku || '',
      description: part.description || '',
      quantityInStock: part.quantityInStock || 0,
      price: part.price || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (part) => {
    setSelectedPart(part);
    setShowDeleteModal(true);
  };

  const openStockModal = (part) => {
    setSelectedPart(part);
    setStockForm({ quantity: 0, action: 'add' });
    setShowStockModal(true);
  };

  // Filter by category and search
  useEffect(() => {
    let filtered = [...parts];
    
    // Filter by category (based on SKU prefix)
    if (categoryFilter !== 'all') {
      const selectedCategory = categories.find(c => c.value === categoryFilter);
      if (selectedCategory && selectedCategory.prefix) {
        const prefixes = selectedCategory.prefix.split('|');
        filtered = filtered.filter(p => {
          if (!p.sku) return false;
          const upperSku = p.sku.toUpperCase();
          return prefixes.some(prefix => upperSku.startsWith(prefix));
        });
      }
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(part =>
        part.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredParts(filtered);
  }, [searchTerm, parts, categoryFilter]);

  // Stock status helper
  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: 'Hết hàng', class: 'out-of-stock' };
    if (quantity <= 5) return { label: 'Sắp hết', class: 'low-stock' };
    if (quantity <= 20) return { label: 'Còn ít', class: 'medium-stock' };
    return { label: 'Đủ hàng', class: 'in-stock' };
  };

  // Statistics
  const stats = {
    total: parts.length,
    outOfStock: parts.filter(p => p.quantityInStock === 0).length,
    lowStock: parts.filter(p => p.quantityInStock > 0 && p.quantityInStock <= 5).length,
    totalValue: parts.reduce((sum, p) => sum + (p.price * p.quantityInStock), 0)
  };

  return (
    <AdminLayout>
      <section className="admin-parts-manager-page">
        <div className="parts-manager-container">
          {/* Header */}
          <div className="parts-manager-header">
            <div className="header-left">
              <FiPackage className="header-icon" />
              <h1 className="header-title">Quản lý phụ tùng</h1>
            </div>
            <button className="btn-add-part" onClick={openAddModal}>
              <FiPlus /> Thêm phụ tùng
            </button>
          </div>

          {/* Alert */}
          {alert.show && (
            <CustomAlert variant={alert.type} floating dismissible onClose={() => setAlert({ show: false, type: '', message: '' })}>
              {alert.message}
            </CustomAlert>
          )}

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon"><FiPackage /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Tổng phụ tùng</span>
              </div>
            </div>
            <div className="stat-card danger">
              <div className="stat-icon"><FiAlertTriangle /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.outOfStock}</span>
                <span className="stat-label">Hết hàng</span>
              </div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon"><FiTrendingDown /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.lowStock}</span>
                <span className="stat-label">Sắp hết (≤5)</span>
              </div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon"><FiDollarSign /></div>
              <div className="stat-info">
                <span className="stat-value">{(stats.totalValue / 1000000).toFixed(1)}M</span>
                <span className="stat-label">Giá trị tồn kho</span>
              </div>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="category-filter">
            {categories.map(cat => (
              <button
                key={cat.value}
                className={`filter-btn ${categoryFilter === cat.value ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <SearchBar
            size="compact"
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={fetchParts}
            placeholder="Tìm kiếm phụ tùng theo tên, SKU..."
            ariaLabel="Tìm kiếm phụ tùng"
          />

          {/* Table */}
          <div className="parts-table-container">
            {loading && <div className="loading">Đang tải...</div>}
            {!loading && filteredParts.length === 0 && (
              <div className="empty-state">
                <FiPackage className="empty-icon" />
                <p>Không có phụ tùng nào</p>
              </div>
            )}
            {!loading && filteredParts.length > 0 && (
              <table className="parts-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên phụ tùng</th>
                    <th>Mã SKU</th>
                    <th>Danh mục</th>
                    <th>Đơn giá (VNĐ)</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map((part, index) => {
                    const category = getCategoryFromSku(part.sku);
                    const stockStatus = getStockStatus(part.quantityInStock);
                    return (
                      <tr key={part.id} className="part-row">
                        <td>{index + 1}</td>
                        <td className="part-name">
                          <div className="part-name-cell">
                            <span className="name-text">{part.partName}</span>
                            {part.description && (
                              <span className="description-hint" title={part.description}>
                                {part.description.length > 50 
                                  ? part.description.substring(0, 50) + '...' 
                                  : part.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="part-sku">
                          <code>{part.sku || '-'}</code>
                        </td>
                        <td className="part-category">
                          <span className={`category-badge ${category.value}`}>
                            {category.label}
                          </span>
                        </td>
                        <td className="part-price">
                          {part.price ? part.price.toLocaleString('vi-VN') : '0'}
                        </td>
                        <td className="part-stock">
                          <span className={`stock-value ${stockStatus.class}`}>
                            {part.quantityInStock}
                          </span>
                        </td>
                        <td className="part-status">
                          <span className={`status-badge ${stockStatus.class}`}>
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="part-actions">
                          <button 
                            className="btn-stock" 
                            onClick={() => openStockModal(part)} 
                            title="Nhập/Xuất kho"
                          >
                            <FiRefreshCw />
                          </button>
                          <button 
                            className="btn-edit" 
                            onClick={() => openEditModal(part)} 
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            className="btn-delete" 
                            onClick={() => openDeleteModal(part)} 
                            title="Xóa"
                          >
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
            title="Thêm phụ tùng mới"
            onConfirm={handleAddPart}
            confirmText="Thêm phụ tùng"
            loading={loading}
            dialogClassName="part-form-modal"
          >
            {renderPartForm('add')}
          </CustomModal>

          {/* Edit Modal */}
          <CustomModal
            show={showEditModal}
            onHide={() => { setShowEditModal(false); resetForm(); setSelectedPart(null); }}
            title="Chỉnh sửa phụ tùng"
            onConfirm={handleEditPart}
            confirmText="Cập nhật"
            loading={loading}
            dialogClassName="part-form-modal"
          >
            {renderPartForm('edit')}
          </CustomModal>

          {/* Delete Confirmation Modal */}
          <CustomModal
            show={showDeleteModal}
            onHide={() => { setShowDeleteModal(false); setSelectedPart(null); }}
            title="Xác nhận xóa phụ tùng"
            onConfirm={handleDeletePart}
            confirmText="Xóa"
            cancelText="Hủy"
            loading={loading}
            isDanger={true}
          >
            <div className="delete-confirm-content">
              <FiAlertTriangle className="warning-icon" />
              <p>Bạn có chắc chắn muốn xóa phụ tùng:</p>
              <p className="part-name-highlight"><strong>{selectedPart?.partName}</strong></p>
              {selectedPart?.sku && <p className="part-sku-info">SKU: <code>{selectedPart.sku}</code></p>}
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>
          </CustomModal>

          {/* Stock Adjustment Modal */}
          <CustomModal
            show={showStockModal}
            onHide={() => { setShowStockModal(false); setSelectedPart(null); setStockForm({ quantity: 0, action: 'add' }); }}
            title="Điều chỉnh tồn kho"
            onConfirm={handleUpdateStock}
            confirmText={stockForm.action === 'add' ? 'Nhập kho' : 'Xuất kho'}
            loading={loading}
            dialogClassName="stock-modal"
          >
            <div className="stock-form">
              <div className="stock-part-info">
                <FiPackage className="part-icon" />
                <div className="part-details">
                  <span className="part-name">{selectedPart?.partName}</span>
                  <span className="current-stock">
                    Tồn kho hiện tại: <strong>{selectedPart?.quantityInStock || 0}</strong>
                  </span>
                </div>
              </div>

              <div className="stock-action-toggle">
                <button
                  className={`action-btn add ${stockForm.action === 'add' ? 'active' : ''}`}
                  onClick={() => setStockForm(prev => ({ ...prev, action: 'add' }))}
                >
                  <FiTrendingUp />
                  Nhập kho
                </button>
                <button
                  className={`action-btn subtract ${stockForm.action === 'subtract' ? 'active' : ''}`}
                  onClick={() => setStockForm(prev => ({ ...prev, action: 'subtract' }))}
                >
                  <FiTrendingDown />
                  Xuất kho
                </button>
              </div>

              <div className="form-group">
                <label>Số lượng</label>
                <input
                  type="number"
                  className="form-input stock-input"
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  min="1"
                  placeholder="Nhập số lượng"
                />
              </div>

              {stockForm.action === 'subtract' && selectedPart && stockForm.quantity > selectedPart.quantityInStock && (
                <div className="stock-warning">
                  <FiAlertTriangle />
                  <span>Số lượng xuất ({stockForm.quantity}) vượt quá tồn kho ({selectedPart.quantityInStock})</span>
                </div>
              )}

              <div className="stock-preview">
                <span className="preview-label">Tồn kho sau điều chỉnh:</span>
                <span className={`preview-value ${stockForm.action === 'add' ? 'increase' : 'decrease'}`}>
                  {stockForm.action === 'add' 
                    ? (selectedPart?.quantityInStock || 0) + (stockForm.quantity || 0)
                    : Math.max(0, (selectedPart?.quantityInStock || 0) - (stockForm.quantity || 0))
                  }
                </span>
              </div>
            </div>
          </CustomModal>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminPartsManager;
