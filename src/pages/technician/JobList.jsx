// src/pages/technician/JobList.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiClock, FiUser, FiTool, FiCalendar, FiChevronRight, FiChevronDown, 
  FiCheckCircle, FiXCircle, FiAlertTriangle, FiPlay, FiRefreshCw, 
  FiFileText, FiSave, FiMessageSquare, FiLoader, FiAlertCircle,
  FiCamera, FiImage, FiTrash2, FiX, FiPackage, FiRepeat
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import './JobList.css';
import technicianWorkService from '../../services/technicianWorkService';
import checklistService from '../../services/checklistService';
import { uploadTechnicianFile, getFileViewUrl } from '../../services/uploadService';

// Backend OrderStatus mapping
const STATUS_LABELS = {
  CONFIRMED: 'Đã xác nhận',
  RECEPTION: 'Tiếp nhận',
  INSPECTION: 'Kiểm tra',
  QUOTING: 'Báo giá',
  WAITING_APPROVAL: 'Chờ duyệt',
  WAITING_FOR_PARTS: 'Chờ phụ tùng',
  IN_PROGRESS: 'Đang thực hiện',
  READY_FOR_INVOICE: 'Sẵn sàng xuất hóa đơn',
  INVOICED: 'Đã xuất hóa đơn',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy'
};

const STATUS_CLASSES = {
  CONFIRMED: 'status-confirmed',
  RECEPTION: 'status-reception',
  INSPECTION: 'status-inspection',
  QUOTING: 'status-quoting',
  WAITING_APPROVAL: 'status-waiting',
  WAITING_FOR_PARTS: 'status-waiting-parts',
  IN_PROGRESS: 'status-in-progress',
  READY_FOR_INVOICE: 'status-ready',
  INVOICED: 'status-invoiced',
  COMPLETED: 'status-completed',
  CANCELLED: 'status-cancelled'
};

// Checklist item status
const ITEM_STATUS = {
  PENDING: 'PENDING',
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  NEEDS_ATTENTION: 'NEEDS_ATTENTION',
  NEEDS_REPLACEMENT: 'NEEDS_REPLACEMENT'
};

const JobList = () => {
  const navigate = useNavigate();
  
  // State cho danh sách công việc
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [advisorNotes, setAdvisorNotes] = useState(''); // Ghi chú từ Advisor
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // State cho inline checklist
  const [expandedServiceId, setExpandedServiceId] = useState(null);
  const [serviceChecklists, setServiceChecklists] = useState({}); // { serviceId: { items: [], results: {} } }
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [savingItem, setSavingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(null); // itemId đang upload
  const [imagePreview, setImagePreview] = useState(null); // { itemId, url } để xem ảnh lớn
  const [replacementItems, setReplacementItems] = useState([]); // Danh sách items cần thay thế
  const fileInputRefs = useRef({}); // Refs cho input file của từng item

  // Fetch danh sách công việc
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await technicianWorkService.getMyOrders();
      setOrders(data || []);
    } catch (err) {
      setError('Không thể tải danh sách công việc');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Fetch chi tiết order khi chọn
  const handleSelectOrder = async (order) => {
    setSelectedOrder(order);
    setExpandedServiceId(null);
    setServiceChecklists({});
    setAdvisorNotes('');
    
    try {
      const detail = await technicianWorkService.getOrderItems(order.orderId);
      setOrderItems(detail.orderItems || []);
      setAdvisorNotes(detail.advisorNotes || '');
    } catch (err) {
      console.error('Error fetching order items:', err);
      setOrderItems([]);
      setAdvisorNotes('');
    }
  };

  // Toggle service accordion và load checklist
  const handleServiceClick = async (item) => {
    const serviceId = item.serviceId;
    
    if (expandedServiceId === serviceId) {
      setExpandedServiceId(null);
      return;
    }

    setExpandedServiceId(serviceId);
    
    // Nếu chưa load checklist cho service này
    if (!serviceChecklists[serviceId]) {
      setLoadingChecklist(true);
      try {
        // Lấy checklist items từ API
        const checklistItems = await checklistService.getChecklistItemsByService(serviceId);
        
        // Khởi tạo results cho mỗi item
        const results = {};
        checklistItems.forEach(checkItem => {
          results[checkItem.id] = {
            status: ITEM_STATUS.PENDING,
            notes: '',
            images: []
          };
        });

        setServiceChecklists(prev => ({
          ...prev,
          [serviceId]: {
            items: checklistItems,
            results: results
          }
        }));
      } catch (err) {
        console.error('Error fetching checklist:', err);
        // Tạo checklist mặc định nếu không có
        setServiceChecklists(prev => ({
          ...prev,
          [serviceId]: {
            items: [],
            results: {}
          }
        }));
      } finally {
        setLoadingChecklist(false);
      }
    }
  };

  // Cập nhật status của checklist item
  const handleItemStatusChange = (serviceId, itemId, status) => {
    setServiceChecklists(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        results: {
          ...prev[serviceId].results,
          [itemId]: {
            ...prev[serviceId].results[itemId],
            status: status
          }
        }
      }
    }));
  };

  // Cập nhật notes của checklist item
  const handleItemNotesChange = (serviceId, itemId, notes) => {
    setServiceChecklists(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        results: {
          ...prev[serviceId].results,
          [itemId]: {
            ...prev[serviceId].results[itemId],
            notes: notes
          }
        }
      }
    }));
  };

  // Upload ảnh cho checklist item
  const handleImageUpload = async (serviceId, itemId, file) => {
    if (!file) return;
    
    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ hỗ trợ file ảnh JPG, PNG, WEBP');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('Kích thước ảnh tối đa 5MB');
      return;
    }

    setUploadingImage(itemId);
    try {
      // Upload lên S3
      const response = await uploadTechnicianFile(file, 'checklist-evidence');
      const imageUrl = response.url || response.fileUrl || response.s3Key;
      
      // Cập nhật state với ảnh mới
      setServiceChecklists(prev => {
        const currentImages = prev[serviceId]?.results[itemId]?.images || [];
        return {
          ...prev,
          [serviceId]: {
            ...prev[serviceId],
            results: {
              ...prev[serviceId].results,
              [itemId]: {
                ...prev[serviceId].results[itemId],
                images: [...currentImages, { url: imageUrl, name: file.name }]
              }
            }
          }
        };
      });
      
      console.log('Image uploaded:', imageUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Không thể tải ảnh lên. Vui lòng thử lại!');
    } finally {
      setUploadingImage(null);
      // Reset input file
      if (fileInputRefs.current[itemId]) {
        fileInputRefs.current[itemId].value = '';
      }
    }
  };

  // Xóa ảnh khỏi checklist item
  const handleRemoveImage = (serviceId, itemId, imageIndex) => {
    setServiceChecklists(prev => {
      const currentImages = prev[serviceId]?.results[itemId]?.images || [];
      const newImages = currentImages.filter((_, idx) => idx !== imageIndex);
      return {
        ...prev,
        [serviceId]: {
          ...prev[serviceId],
          results: {
            ...prev[serviceId].results,
            [itemId]: {
              ...prev[serviceId].results[itemId],
              images: newImages
            }
          }
        }
      };
    });
  };

  // Mở xem ảnh lớn
  const handlePreviewImage = (itemId, url) => {
    setImagePreview({ itemId, url });
  };

  // Đóng preview ảnh
  const handleClosePreview = () => {
    setImagePreview(null);
  };

  // Lưu kết quả checklist item
  const handleSaveItem = async (serviceId, itemId) => {
    setSavingItem(itemId);
    try {
      const result = serviceChecklists[serviceId].results[itemId];
      // TODO: Gọi API lưu kết quả
      // await checklistService.saveChecklistResult(selectedOrder.orderId, itemId, result);
      console.log('Saving item:', { orderId: selectedOrder.orderId, itemId, result });
      
      // Hiển thị thông báo thành công
      alert('Đã lưu kết quả kiểm tra!');
    } catch (err) {
      console.error('Error saving checklist item:', err);
      alert('Không thể lưu kết quả. Vui lòng thử lại!');
    } finally {
      setSavingItem(null);
    }
  };

  // Tính progress của service
  const getServiceProgress = (serviceId) => {
    const checklist = serviceChecklists[serviceId];
    if (!checklist || !checklist.items.length) return 0;
    
    const completed = Object.values(checklist.results).filter(
      r => r.status !== ITEM_STATUS.PENDING
    ).length;
    
    return Math.round((completed / checklist.items.length) * 100);
  };

  // Bắt đầu công việc - theo BUSINESS FLOW:
  // RECEPTION → INSPECTION (tạo checklist) → QUOTING (nếu cần phụ tùng) → WAITING_FOR_PARTS (nếu chưa có sẵn) → IN_PROGRESS → READY_FOR_INVOICE → COMPLETED
  const handleStartWork = async (orderId) => {
    try {
      const currentStatus = selectedOrder?.status;
      let nextStatus;
      
      // Xác định status tiếp theo dựa trên status hiện tại và business logic
      switch (currentStatus) {
        case 'CONFIRMED':
          // Bước 0: Xe đã được xác nhận → Tiếp nhận xe
          nextStatus = 'RECEPTION';
          break;
        case 'RECEPTION':
          // Bước 1: Tiếp nhận xe → Bắt đầu kiểm tra
          nextStatus = 'INSPECTION';
          break;
        case 'INSPECTION':
          // Bước 2: Kiểm tra xong → Kiểm tra xem có cần phụ tùng không
          // Nếu có replacement items → QUOTING (để báo giá)
          // Nếu không có → IN_PROGRESS (thực hiện luôn)
          if (replacementItems.length > 0) {
            // Có phụ tùng cần thay → Chuyển sang báo giá
            if (window.confirm('Phát hiện có phụ tùng cần thay thế. Chuyển sang gửi báo giá?')) {
              nextStatus = 'QUOTING';
            } else {
              return; // Không chuyển trạng thái
            }
          } else {
            // Không cần phụ tùng → Thực hiện luôn
            nextStatus = 'IN_PROGRESS';
          }
          break;
        case 'QUOTING':
          // Bước 3: Sau khi báo giá được duyệt → Kiểm tra phụ tùng có sẵn không
          // Logic này cần check với backend/advisor
          // Tạm thời cho phép chuyển sang WAITING_FOR_PARTS hoặc IN_PROGRESS
          if (window.confirm('Phụ tùng đã có sẵn trong kho?\nChọn YES nếu có sẵn (bắt đầu thực hiện)\nChọn NO nếu chưa có (chờ phụ tùng)')) {
            nextStatus = 'IN_PROGRESS'; // Có sẵn → Thực hiện luôn
          } else {
            nextStatus = 'WAITING_FOR_PARTS'; // Chưa có → Chờ phụ tùng
          }
          break;
        case 'WAITING_FOR_PARTS':
          // Bước 4: Phụ tùng đã về → Bắt đầu thực hiện
          if (window.confirm('Phụ tùng đã về đầy đủ. Bắt đầu thực hiện?')) {
            nextStatus = 'IN_PROGRESS';
          } else {
            return;
          }
          break;
        default:
          nextStatus = 'IN_PROGRESS';
      }
      
      await technicianWorkService.updateWorkStatus(orderId, nextStatus);
      fetchOrders();
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, status: nextStatus });
      }
    } catch (err) {
      console.error('Error starting work:', err);
      alert('Không thể chuyển trạng thái. Vui lòng thử lại!');
    }
  };

  // Hoàn thành công việc
  const handleCompleteWork = async (orderId) => {
    // Kiểm tra tất cả checklist đã hoàn thành chưa
    let allCompleted = true;
    orderItems.forEach(item => {
      const serviceId = item.serviceId;
      const checklist = serviceChecklists[serviceId];
      if (checklist && checklist.items.length > 0) {
        const pending = Object.values(checklist.results).filter(
          r => r.status === ITEM_STATUS.PENDING
        ).length;
        if (pending > 0) allCompleted = false;
      }
    });

    if (!allCompleted) {
      if (!window.confirm('Một số hạng mục kiểm tra chưa hoàn thành. Bạn có chắc muốn hoàn thành công việc?')) {
        return;
      }
    }

    try {
      await technicianWorkService.completeWork(orderId);
      fetchOrders();
      if (selectedOrder && selectedOrder.orderId === orderId) {
        // Backend trả về READY_FOR_INVOICE khi technician hoàn thành
        setSelectedOrder({ ...selectedOrder, status: 'READY_FOR_INVOICE' });
      }
    } catch (err) {
      console.error('Error completing work:', err);
      alert('Không thể hoàn thành công việc. Vui lòng thử lại!');
    }
  };

  // Filter orders theo tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    // Pending = chờ thực hiện (CONFIRMED, RECEPTION, INSPECTION, QUOTING, WAITING_FOR_PARTS)
    if (activeTab === 'pending') {
      return ['CONFIRMED', 'RECEPTION', 'INSPECTION', 'QUOTING', 'WAITING_FOR_PARTS'].includes(order.status);
    }
    // In Progress = đang thực hiện
    if (activeTab === 'inProgress') return order.status === 'IN_PROGRESS';
    // Completed = đã hoàn thành hoặc sẵn sàng xuất hóa đơn
    if (activeTab === 'completed') {
      return ['READY_FOR_INVOICE', 'COMPLETED'].includes(order.status);
    }
    return true;
  });

  // Render status badge
  const renderStatusBadge = (status) => (
    <span className={`job-status-badge ${STATUS_CLASSES[status] || ''}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );

  // Toggle item cần thay thế
  const handleToggleReplacement = (serviceId, itemId, itemName, serviceName) => {
    const checklist = serviceChecklists[serviceId];
    const result = checklist?.results[itemId];
    const isReplacement = result?.status === ITEM_STATUS.NEEDS_REPLACEMENT;
    
    // Toggle status
    if (isReplacement) {
      // Bỏ đánh dấu thay thế -> về PENDING
      handleItemStatusChange(serviceId, itemId, ITEM_STATUS.PENDING);
      setReplacementItems(prev => prev.filter(item => !(item.serviceId === serviceId && item.itemId === itemId)));
    } else {
      // Đánh dấu thay thế
      handleItemStatusChange(serviceId, itemId, ITEM_STATUS.NEEDS_REPLACEMENT);
      setReplacementItems(prev => {
        // Kiểm tra đã tồn tại chưa
        const exists = prev.some(item => item.serviceId === serviceId && item.itemId === itemId);
        if (exists) return prev;
        return [...prev, {
          serviceId,
          itemId,
          itemName,
          serviceName,
          notes: result?.notes || '',
          images: result?.images || [] // Lưu hình ảnh đã chụp
        }];
      });
    }
  };

  // Render checklist item status buttons
  const renderStatusButtons = (serviceId, itemId, currentStatus, itemName, serviceName) => (
    <>
      <div className="checklist-status-buttons">
        <button
          className={`status-btn passed ${currentStatus === ITEM_STATUS.PASSED ? 'active' : ''}`}
          onClick={() => handleItemStatusChange(serviceId, itemId, ITEM_STATUS.PASSED)}
          title="Đạt"
        >
          <FiCheckCircle />
          <span>Đạt</span>
        </button>
        <button
          className={`status-btn failed ${currentStatus === ITEM_STATUS.FAILED ? 'active' : ''}`}
          onClick={() => handleItemStatusChange(serviceId, itemId, ITEM_STATUS.FAILED)}
          title="Không đạt"
        >
          <FiXCircle />
          <span>Lỗi</span>
        </button>
        <button
          className={`status-btn attention ${currentStatus === ITEM_STATUS.NEEDS_ATTENTION ? 'active' : ''}`}
          onClick={() => handleItemStatusChange(serviceId, itemId, ITEM_STATUS.NEEDS_ATTENTION)}
          title="Cần chú ý"
        >
          <FiAlertTriangle />
          <span>Chú ý</span>
        </button>
      </div>
      
      {/* Nút Thay thế - riêng biệt để cùng hàng với Thêm ảnh */}
      <button
        className={`status-btn replacement ${currentStatus === ITEM_STATUS.NEEDS_REPLACEMENT ? 'active' : ''}`}
        onClick={() => handleToggleReplacement(serviceId, itemId, itemName, serviceName)}
        title="Cần thay thế"
      >
        <FiRepeat />
        <span>Thay thế</span>
      </button>
    </>
  );

  // Render inline checklist
  const renderInlineChecklist = (serviceId, serviceName) => {
    const checklist = serviceChecklists[serviceId];
    
    if (loadingChecklist && expandedServiceId === serviceId) {
      return (
        <div className="checklist-loading">
          <FiLoader className="spin" />
          <span>Đang tải checklist...</span>
        </div>
      );
    }

    if (!checklist || !checklist.items.length) {
      return (
        <div className="checklist-empty">
          <FiFileText />
          <span>Không có checklist cho dịch vụ này</span>
        </div>
      );
    }

    return (
      <div className="inline-checklist">
        <div className="checklist-progress-bar">
          <div 
            className="checklist-progress-fill"
            style={{ width: `${getServiceProgress(serviceId)}%` }}
          />
        </div>
        <div className="checklist-progress-text">
          Tiến độ: {getServiceProgress(serviceId)}%
        </div>

        <div className="checklist-items">
          {checklist.items.map((item, index) => {
            const result = checklist.results[item.id] || { status: ITEM_STATUS.PENDING, notes: '', images: [] };
            return (
              <div 
                key={item.id} 
                className={`checklist-item ${result.status.toLowerCase()}`}
              >
                <div className="checklist-item-header">
                  <div className="checklist-item-number">
                    {index + 1}
                  </div>
                  <div className="checklist-item-info">
                    <h5 className="checklist-item-name">
                      {item.itemName}
                      {item.isRequired && (
                        <span className="required-badge">Bắt buộc</span>
                      )}
                    </h5>
                    {item.itemDescription && (
                      <p className="checklist-item-desc">{item.itemDescription}</p>
                    )}
                    {item.category && (
                      <span className="checklist-item-category">{item.category}</span>
                    )}
                  </div>
                </div>

                <div className="checklist-item-body">
                  {/* Hàng nút trạng thái + nút thêm ảnh */}
                  <div className="checklist-status-row">
                    {renderStatusButtons(serviceId, item.id, result.status, item.itemName, serviceName)}
                    
                    {/* Nút thêm ảnh */}
                    <input
                      type="file"
                      accept="image/*"
                      ref={el => fileInputRefs.current[item.id] = el}
                      onChange={(e) => handleImageUpload(serviceId, item.id, e.target.files[0])}
                      style={{ display: 'none' }}
                      id={`image-upload-${item.id}`}
                    />
                    <button 
                      className="btn-add-image"
                      onClick={() => fileInputRefs.current[item.id]?.click()}
                      disabled={uploadingImage === item.id}
                    >
                      {uploadingImage === item.id ? (
                        <FiLoader className="spin" />
                      ) : (
                        <FiCamera />
                      )}
                      <span>{uploadingImage === item.id ? 'Đang tải...' : 'Thêm ảnh'}</span>
                    </button>
                  </div>
                  
                  {/* Wrapper cho notes và images - layout 2 cột */}
                  <div className="checklist-item-content-row">
                    {/* Cột trái: Ghi chú */}
                    <div className="checklist-item-notes">
                      <textarea
                        placeholder="Ghi chú (nếu có)..."
                        value={result.notes}
                        onChange={(e) => handleItemNotesChange(serviceId, item.id, e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Cột phải: Hiển thị ảnh đã upload */}
                    <div className="checklist-item-images">
                      {result.images && result.images.length > 0 ? (
                        <div className="images-grid">
                          {result.images.map((img, imgIndex) => (
                            <div key={imgIndex} className="image-thumbnail">
                              <img 
                                src={img.url} 
                                alt={img.name || `Ảnh ${imgIndex + 1}`}
                                onClick={() => handlePreviewImage(item.id, img.url)}
                              />
                              <button 
                                className="btn-remove-image"
                                onClick={() => handleRemoveImage(serviceId, item.id, imgIndex)}
                                title="Xóa ảnh"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="images-placeholder">
                          <FiImage />
                          <span>Chưa có ảnh</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="checklist-item-actions">
                    <button 
                      className="btn-save-item"
                      onClick={() => handleSaveItem(serviceId, item.id)}
                      disabled={savingItem === item.id}
                    >
                      {savingItem === item.id ? (
                        <>
                          <FiLoader className="spin" />
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        <>
                          <FiSave />
                          <span>Lưu</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="joblist-loading">
        <FiLoader className="spin" size={40} />
        <p>Đang tải danh sách công việc...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="joblist-error">
        <FiAlertCircle size={40} />
        <p>{error}</p>
        <button onClick={fetchOrders} className="btn-retry">
          <FiRefreshCw />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="joblist-container">
      {/* Header */}
      <div className="joblist-header">
        <h1>
          <FiTool />
          Danh sách công việc
        </h1>
        <button className="btn-refresh" onClick={fetchOrders}>
          <FiRefreshCw />
          Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="joblist-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tất cả ({orders.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Chờ xử lý ({orders.filter(o => o.status === 'ASSIGNED').length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'inProgress' ? 'active' : ''}`}
          onClick={() => setActiveTab('inProgress')}
        >
          Đang thực hiện ({orders.filter(o => o.status === 'IN_PROGRESS').length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Hoàn thành ({orders.filter(o => o.status === 'COMPLETED').length})
        </button>
      </div>

      {/* Main content */}
      <div className="joblist-content">
        {/* Left panel - Order list */}
        <div className="joblist-panel orders-panel">
          <h3 className="panel-title">
            <FiCalendar />
            Lịch được phân công
          </h3>
          
          {filteredOrders.length === 0 ? (
            <div className="empty-orders">
              <FiFileText size={48} />
              <p>Không có công việc nào</p>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map(order => (
                <div 
                  key={order.orderId}
                  className={`order-card ${selectedOrder?.orderId === order.orderId ? 'selected' : ''}`}
                  onClick={() => handleSelectOrder(order)}
                >
                  <div className="order-card-header">
                    <span className="order-id">#{order.orderId}</span>
                    {renderStatusBadge(order.status)}
                  </div>
                  
                  <div className="order-card-body">
                    <div className="order-info">
                      <FiUser />
                      <span>{order.customerName || 'Khách hàng'}</span>
                    </div>
                    {order.createdAt && (
                      <div className="order-info" style={{ fontSize: '0.85em', color: '#9CA3AF' }}>
                        <FiFileText />
                        <span>Đặt: {(() => {
                          const date = new Date(order.createdAt);
                          return date.toLocaleString('vi-VN', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        })()}</span>
                      </div>
                    )}
                    <div className="order-info">
                      <FiCalendar />
                      <span>Hẹn: {order.appointmentDate || 'Chưa có'}</span>
                    </div>
                    <div className="order-info">
                      <FiClock />
                      <span>{order.appointmentTime || 'Chưa có giờ'}</span>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <span className="vehicle-info">
                      <FaCar />
                      {order.vehicleBrand} {order.vehicleModel} - {order.licensePlate}
                    </span>
                    <FiChevronRight />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel - Order detail with inline checklist */}
        <div className="joblist-panel detail-panel">
          {!selectedOrder ? (
            <div className="no-selection">
              <FiFileText size={64} />
              <h3>Chọn một công việc để xem chi tiết</h3>
              <p>Click vào công việc bên trái để xem thông tin và thực hiện checklist</p>
            </div>
          ) : (
            <>
              {/* Order detail header */}
              <div className="detail-header">
                <div className="detail-title">
                  <h2>Chi tiết công việc #{selectedOrder.orderId}</h2>
                  {renderStatusBadge(selectedOrder.status)}
                </div>
                
                <div className="detail-actions">
                  {/* Cho phép chuyển trạng thái theo BUSINESS FLOW */}
                  {['CONFIRMED', 'RECEPTION', 'INSPECTION', 'QUOTING', 'WAITING_FOR_PARTS'].includes(selectedOrder.status) && (
                    <button 
                      className="btn-start"
                      onClick={() => handleStartWork(selectedOrder.orderId)}
                    >
                      <FiPlay />
                      {selectedOrder.status === 'CONFIRMED' ? 'Tiếp nhận xe' :
                       selectedOrder.status === 'RECEPTION' ? 'Bắt đầu kiểm tra xe' : 
                       selectedOrder.status === 'INSPECTION' ? 'Hoàn tất kiểm tra' : 
                       selectedOrder.status === 'QUOTING' ? 'Xác nhận phụ tùng' :
                       selectedOrder.status === 'WAITING_FOR_PARTS' ? 'Phụ tùng đã về' : 'Tiếp tục'}
                    </button>
                  )}
                  
                  {/* Nút yêu cầu phụ tùng - CHỈ hiển thị ở bước INSPECTION hoặc QUOTING */}
                  {['INSPECTION', 'QUOTING'].includes(selectedOrder.status) && (
                    <button 
                      className="btn-request-parts"
                      onClick={() => {
                        // Lưu replacement items vào localStorage để PartsRequest đọc
                        if (replacementItems.length > 0) {
                          localStorage.setItem('replacementItems', JSON.stringify(replacementItems));
                        }
                        navigate(`/technician/parts-request?orderId=${selectedOrder.orderId}`);
                      }}
                    >
                      <FiPackage />
                      {selectedOrder.status === 'INSPECTION' ? 'Chọn phụ tùng cần thay' : 'Chỉnh sửa phụ tùng'}
                      {replacementItems.length > 0 && (
                        <span className="replacement-count">{replacementItems.length}</span>
                      )}
                    </button>
                  )}
                  
                  {selectedOrder.status === 'IN_PROGRESS' && (
                    <button 
                      className="btn-complete"
                      onClick={() => handleCompleteWork(selectedOrder.orderId)}
                    >
                      <FiCheckCircle />
                      Hoàn thành
                    </button>
                  )}
                </div>
              </div>

              {/* Customer & Vehicle info */}
              <div className="detail-info-grid">
                <div className="info-card">
                  <h4><FiUser /> Thông tin khách hàng</h4>
                  <p><strong>Tên:</strong> {selectedOrder.customerName}</p>
                  <p><strong>SĐT:</strong> {selectedOrder.customerPhone || 'N/A'}</p>
                </div>
                <div className="info-card">
                  <h4><FaCar /> Thông tin xe</h4>
                  <p><strong>Xe:</strong> {selectedOrder.vehicleBrand} {selectedOrder.vehicleModel}</p>
                  <p><strong>Biển số:</strong> {selectedOrder.licensePlate}</p>
                </div>
                <div className="info-card">
                  <h4><FiCalendar /> Lịch hẹn</h4>
                  {selectedOrder.createdAt && (
                    <p><strong>Đặt lúc:</strong> {(() => {
                      const date = new Date(selectedOrder.createdAt);
                      return date.toLocaleString('vi-VN', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    })()}</p>
                  )}
                  <p><strong>Ngày hẹn:</strong> {selectedOrder.appointmentDate}</p>
                  <p><strong>Giờ hẹn:</strong> {selectedOrder.appointmentTime}</p>
                </div>
              </div>

              {/* Services with inline checklist */}
              <div className="services-section">
                <h3 className="section-title">
                  <FiTool />
                  Dịch vụ cần thực hiện
                </h3>

                {orderItems.length === 0 ? (
                  <div className="empty-services">
                    <p>Không có dịch vụ nào</p>
                  </div>
                ) : (
                  <div className="services-accordion">
                    {orderItems.map((item, index) => {
                      const serviceId = item.serviceId;
                      const isExpanded = expandedServiceId === serviceId;
                      const progress = getServiceProgress(serviceId);

                      return (
                        <div 
                          key={item.orderItemId || item.itemId || `service-${serviceId}-${index}`}
                          className={`service-accordion-item ${isExpanded ? 'expanded' : ''}`}
                        >
                          <div 
                            className="service-accordion-header"
                            onClick={() => handleServiceClick(item)}
                          >
                            <div className="service-info">
                              <span className="service-icon">
                                <FiTool />
                              </span>
                              <div className="service-details">
                                <h4>{item.serviceName || item.itemName}</h4>
                                {item.unitPrice && (
                                  <span className="service-price">
                                    {Number(item.unitPrice).toLocaleString('vi-VN')} VNĐ
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="service-meta">
                              {serviceChecklists[serviceId] && (
                                <div className="service-progress">
                                  <div className="mini-progress-bar">
                                    <div 
                                      className="mini-progress-fill"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                  <span>{progress}%</span>
                                </div>
                              )}
                              <span className={`accordion-icon ${isExpanded ? 'rotated' : ''}`}>
                                <FiChevronDown />
                              </span>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="service-accordion-body">
                              {renderInlineChecklist(serviceId, item.serviceName || item.itemName)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notes section */}
              {advisorNotes && (
                <div className="notes-section">
                  <h4><FiMessageSquare /> Ghi chú từ Advisor</h4>
                  <p>{advisorNotes}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal xem ảnh lớn */}
      {imagePreview && (
        <div className="image-preview-modal" onClick={handleClosePreview}>
          <div className="image-preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-preview" onClick={handleClosePreview}>
              <FiX />
            </button>
            <img src={imagePreview.url} alt="Preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;
