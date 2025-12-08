// src/pages/technician/JobList.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiClock, FiUser, FiTool, FiCalendar, FiChevronRight, FiChevronDown, 
  FiCheckCircle, FiXCircle, FiAlertTriangle, FiPlay, FiRefreshCw, 
  FiFileText, FiSave, FiMessageSquare, FiLoader, FiAlertCircle,
  FiCamera, FiImage, FiTrash2, FiX, FiPackage, FiRepeat, FiInfo
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import './JobList.css';
import technicianWorkService from '../../services/technicianWorkService';
import checklistService from '../../services/checklistService';
import { uploadTechnicianFile, getFileViewUrl } from '../../services/uploadService';
import { getPartRequestsByOrder } from '../../services/partService';

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
  const [completedOrders, setCompletedOrders] = useState([]); // Danh sách đơn đã hoàn thành
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [advisorNotes, setAdvisorNotes] = useState(''); // Ghi chú từ Advisor
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' hoặc 'completed'

  // State cho inline checklist
  const [expandedServiceId, setExpandedServiceId] = useState(null);
  const [serviceChecklists, setServiceChecklists] = useState({}); // { serviceId: { items: [], results: {} } }
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [savingItem, setSavingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(null); // itemId đang upload
  const [imagePreview, setImagePreview] = useState(null); // { itemId, url } để xem ảnh lớn
  const [replacementItems, setReplacementItems] = useState([]); // Danh sách items cần thay thế
  const [partRequests, setPartRequests] = useState([]); // ✅ Danh sách part requests từ API
  const fileInputRefs = useRef({}); // Refs cho input file của từng item
  const [showSaveToast, setShowSaveToast] = useState(false); // Toast thông báo auto-save
  
  // ✅ Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Fetch danh sách công việc
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch cả 2 loại: đang làm và đã hoàn thành
      const [activeData, completedData] = await Promise.all([
        technicianWorkService.getMyOrders(),
        technicianWorkService.getMyCompletedOrders()
      ]);
      
      setOrders(activeData || []);
      setCompletedOrders(completedData || []);
      
      // Debug log - Kiểm tra dữ liệu TRƯỚC khi setState
      console.log('🔍 [BEFORE setState] Raw data:', {
        activeFirst: activeData?.[0],
        completedFirst: completedData?.[0]
      });
      
      // Debug: In ra TOÀN BỘ object để xem cấu trúc thật
      if (completedData?.[0]) {
        console.log('🔍 [RAW API Response] Completed order FULL:', JSON.stringify(completedData[0], null, 2));
      }
      
      // Debug log - Kiểm tra state SAU khi setState (sẽ chạy ở render tiếp theo)
      console.log('🔍 [JobList] Fetched orders:', { 
        activeCount: activeData?.length, 
        completedCount: completedData?.length,
        sampleOrder: activeData?.[0] || completedData?.[0]
      });
      
      if (activeData?.[0]) {
        console.log('🔍 Sample active order keys:', Object.keys(activeData[0]));
      }
      if (completedData?.[0]) {
        console.log('🔍 Sample completed order keys:', Object.keys(completedData[0]));
      }
    } catch (err) {
      setError('Không thể tải danh sách công việc');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debug: Theo dõi state thay đổi
  useEffect(() => {
    console.log('🔍 [State Changed] orders:', orders.length, 'first:', orders[0]);
    console.log('🔍 [State Changed] completedOrders:', completedOrders.length, 'first:', completedOrders[0]);
  }, [orders, completedOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Fetch chi tiết order khi chọn
  const handleSelectOrder = async (order) => {
    console.log('🔍 [handleSelectOrder] Selected order:', order);
    
    if (!order || !order.orderId) {
      console.error('❌ Invalid order or missing orderId:', order);
      return;
    }
    
    setSelectedOrder(order);
    setExpandedServiceId(null);
    setServiceChecklists({});
    setAdvisorNotes('');
    setPartRequests([]); // ✅ Reset part requests
    
    try {
      const detail = await technicianWorkService.getOrderItems(order.orderId);
      setOrderItems(detail.orderItems || []);
      setAdvisorNotes(detail.advisorNotes || '');
      
      // ✅ Nếu order đang QUOTING, fetch part requests
      if (order.status === 'QUOTING') {
        try {
          const requests = await getPartRequestsByOrder(order.orderId);
          setPartRequests(requests || []);
          console.log('✅ Loaded part requests:', requests);
        } catch (err) {
          console.warn('⚠️ Could not load part requests:', err);
          setPartRequests([]);
        }
      }
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
        // ✅ Lấy checklist items VÀ results đã lưu từ API
        const checklistItems = await checklistService.getChecklistItemsByService(serviceId);
        
        // ✅ Fetch kết quả đã lưu cho order này
        let savedResults = {};
        if (selectedOrder?.orderId) {
          try {
            const orderResults = await checklistService.getChecklistResultsByOrder(selectedOrder.orderId);
            console.log('🔍 Loaded saved checklist results:', orderResults);
            
            // Map results theo itemId
            orderResults.forEach(result => {
              savedResults[result.serviceChecklistItemId] = {
                status: result.status,
                notes: result.notes || '',
                images: result.imageUrl ? [{ url: result.imageUrl }] : [],
                needsReplacement: result.needsReplacement || false,
                itemName: result.itemName || ''
              };
            });
          } catch (err) {
            console.warn('⚠️ Could not load saved results:', err);
          }
        }

        // Khởi tạo results cho mỗi item (merge với saved results)
        const results = {};
        checklistItems.forEach(checkItem => {
          results[checkItem.id] = savedResults[checkItem.id] || {
            status: ITEM_STATUS.PENDING,
            notes: '',
            images: [],
            needsReplacement: false,
            itemName: checkItem.name
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

  // Cập nhật status của checklist item VÀ TỰ ĐỘNG LƯU
  const handleItemStatusChange = async (serviceId, itemId, status) => {
    // Lấy result hiện tại TRƯỚC KHI update state
    const currentResult = serviceChecklists[serviceId]?.results[itemId] || {};
    
    // Cập nhật state local ngay lập tức để UI responsive
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

    // TỰ ĐỘNG LƯU kết quả lên server
    try {
      const s3Key = currentResult?.images?.[0]?.s3Key || null; // Lấy s3Key của ảnh đầu tiên (nếu có)
      
      console.log('📝 Saving item:', { itemId, orderId: selectedOrder.orderId, currentResult });
      console.log('📝 S3 Key to send:', s3Key);
      
      // Gọi API lưu kết quả với serviceOrderId và itemId
      await checklistService.saveChecklistItemResult(
        selectedOrder.orderId, // serviceOrderId
        itemId, // service_checklist_item id
        status,
        currentResult?.notes || '',
        s3Key
      );
      
      // Hiển thị toast thông báo
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2000);
      
      console.log('✓ Đã lưu tự động:', { orderId: selectedOrder.orderId, itemId, status });
    } catch (err) {
      console.error('Error auto-saving checklist item:', err);
      // Không hiển thị alert để không làm gián đoạn workflow
      // Người dùng vẫn có thể dùng nút Lưu thủ công nếu cần
    }
  };

  // Cập nhật notes của checklist item VÀ TỰ ĐỘNG LƯU
  const handleItemNotesChange = async (serviceId, itemId, notes) => {
    // Cập nhật state local
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
    
    // Auto-save notes sau 1 giây (debounced)
    const currentResult = serviceChecklists[serviceId]?.results[itemId] || {};
    const currentStatus = currentResult.status || 'PENDING';
    const s3Key = currentResult?.images?.[0]?.s3Key || null;
    
    // Clear timeout cũ nếu có
    if (window.notesDebounceTimeout) {
      clearTimeout(window.notesDebounceTimeout);
    }
    
    // Set timeout mới để lưu sau 1.5 giây
    window.notesDebounceTimeout = setTimeout(async () => {
      try {
        console.log('💾 Auto-saving notes:', { itemId, notes, s3Key });
        await checklistService.saveChecklistItemResult(
          selectedOrder.orderId,
          itemId,
          currentStatus,
          notes,
          s3Key
        );
        console.log('✅ Notes saved!');
      } catch (err) {
        console.error('Error auto-saving notes:', err);
      }
    }, 1500);
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
      console.log('Upload response:', response);
      
      // Lấy URL từ response (có thể là url, fileUrl, hoặc s3Key)
      let imageUrl = response.url || response.fileUrl;
      
      // Nếu chỉ có s3Key, cần lấy presigned URL
      if (!imageUrl && response.s3Key) {
        const viewUrlResponse = await getFileViewUrl(response.s3Key, 1440); // 24 giờ
        imageUrl = viewUrlResponse.url || viewUrlResponse.presignedUrl;
      }
      
      if (!imageUrl) {
        throw new Error('Không nhận được URL ảnh từ server');
      }
      
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
                images: [...currentImages, { 
                  url: imageUrl, 
                  name: file.name,
                  s3Key: response.s3Key // Lưu s3Key để xóa sau này
                }]
              }
            }
          }
        };
      });
      
      console.log('✅ Image uploaded and displayed:', imageUrl);
    } catch (err) {
      console.error('❌ Error uploading image:', err);
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

  // ✅ Helper: Show custom confirm modal
  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm
    });
  };

  const handleConfirmModalClose = () => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
  };

  const handleConfirmModalOk = () => {
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm();
    }
    handleConfirmModalClose();
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
          // Bước 2: Kiểm tra xong → Đánh dấu checklist hoàn thành → Chuyển status
          
          // ✅ VALIDATION: Kiểm tra xem có ít nhất 1 mục checklist đánh dấu cần thay thế không
          let hasReplacementNeeded = false;
          console.log('🔍 Checking for NEEDS_REPLACEMENT items...');
          console.log('serviceChecklists:', serviceChecklists);
          
          Object.entries(serviceChecklists).forEach(([serviceId, checklist]) => {
            console.log(`Service ${serviceId}:`, checklist);
            Object.entries(checklist.results || {}).forEach(([itemId, result]) => {
              console.log(`  Item ${itemId}:`, result);
              // ✅ FIX: Kiểm tra status thay vì needsReplacement
              if (result.status === 'NEEDS_REPLACEMENT') {
                hasReplacementNeeded = true;
                console.log('✓ Found NEEDS_REPLACEMENT item!');
              }
            });
          });

          console.log('hasReplacementNeeded:', hasReplacementNeeded);

          // Kiểm tra xem có cần phụ tùng không
          if (hasReplacementNeeded) {
            // Có ít nhất 1 mục cần thay → Hiển thị alert và giữ ở INSPECTION
            // Kỹ thuật viên cần bấm nút "Yêu cầu phụ tùng" để chọn parts
            alert('⚠️ Bạn đã đánh dấu có phụ tùng cần thay thế.\n\nVui lòng bấm nút "Yêu cầu phụ tùng thay thế" để chọn phụ tùng cần thiết.');
            return; // Không chuyển trạng thái, giữ ở INSPECTION
          }

          // Không cần phụ tùng → Complete checklist và chuyển sang IN_PROGRESS
          try {
            await checklistService.completeServiceOrderChecklists(orderId);
            console.log('✓ No replacement needed, marked checklist as completed');
          } catch (error) {
            console.error('Error marking checklist completed:', error);
            alert('Lỗi khi hoàn tất kiểm tra. Vui lòng thử lại.');
            return;
          }

          console.log('✓ Transitioning to IN_PROGRESS');
          nextStatus = 'IN_PROGRESS';
          break;
        case 'QUOTING':
          // Bước 3: Customer đã duyệt báo giá → Chuyển sang WAITING_FOR_PARTS
          // Logic này được trigger khi Kỹ thuật viên bấm "Xác nhận phụ tùng"
          // (sau khi all partRequests có status === FULFILLED)
          nextStatus = 'WAITING_FOR_PARTS';
          break;
        case 'WAITING_FOR_PARTS':
          // Bước 4: Phụ tùng đã về → Bắt đầu thực hiện
          showConfirm(
            'Xác nhận phụ tùng đã về',
            'Phụ tùng đã về đầy đủ. Bắt đầu thực hiện?',
            async () => {
              try {
                await technicianWorkService.updateWorkStatus(orderId, 'IN_PROGRESS');
                fetchOrders();
                setSelectedOrder(prev => ({ ...prev, status: 'IN_PROGRESS' }));
              } catch (err) {
                alert('Lỗi khi cập nhật trạng thái: ' + err.message);
              }
            }
          );
          return; // Exit early vì confirm modal sẽ handle việc cập nhật
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
      showConfirm(
        'Xác nhận hoàn thành công việc',
        'Một số hạng mục kiểm tra chưa hoàn thành. Bạn có chắc muốn hoàn thành công việc?',
        async () => {
          try {
            await technicianWorkService.completeWork(orderId);
            fetchOrders();
            if (selectedOrder && selectedOrder.orderId === orderId) {
              setSelectedOrder({ ...selectedOrder, status: 'READY_FOR_INVOICE' });
            }
          } catch (err) {
            alert('Lỗi khi hoàn thành công việc: ' + err.message);
          }
        }
      );
      return;
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
  const filteredOrders = activeTab === 'active' ? orders : completedOrders;

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
                                onError={(e) => {
                                  console.error('Image load error:', img.url);
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
                                  e.target.style.border = '2px solid #ef4444';
                                }}
                                onLoad={() => console.log('✅ Image loaded:', img.name)}
                                loading="lazy"
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
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Đang làm ({orders.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Đã hoàn thành ({completedOrders.length})
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
              {filteredOrders.map((order, index) => {
                // Debug: Log mỗi order khi render
                if (index === 0) {
                  console.log('🔍 [Render] First order in list:', order);
                }
                
                return (
                  <div 
                    key={order.orderId || `order-${index}`}
                    className={`order-card ${selectedOrder?.orderId === order.orderId ? 'selected' : ''}`}
                    onClick={() => {
                      console.log('🔍 [onClick] Clicking order:', order);
                      handleSelectOrder(order);
                    }}
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
                        {/* Hiển thị thông tin xe - ưu tiên vehicleName từ Backend */}
                        {order.vehicleName || order.licensePlate 
                          ? (order.vehicleName || `${order.vehicleBrand || ''} ${order.vehicleModel || ''} - ${order.licensePlate || ''}`.trim())
                          : 'Chưa có thông tin xe'}
                      </span>
                      <FiChevronRight />
                    </div>
                  </div>
                );
              })}
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
                  {/* Hiện nút "Hoàn tất kiểm tra" CHỈ KHI không có replacement items */}
                  {(() => {
                    const isQuotingStatus = selectedOrder.status === 'QUOTING';
                    const hasApprovedParts = partRequests.length > 0 && partRequests.every(req => req.status === 'FULFILLED');
                    const canProceedFromQuoting = !isQuotingStatus || hasApprovedParts;

                    return (
                      ['CONFIRMED', 'RECEPTION', 'INSPECTION', 'QUOTING', 'WAITING_FOR_PARTS'].includes(selectedOrder.status) && 
                      !(selectedOrder.status === 'INSPECTION' && replacementItems.length > 0) && (
                        <button 
                          className="btn-start"
                          onClick={() => handleStartWork(selectedOrder.orderId)}
                          disabled={isQuotingStatus && !hasApprovedParts}
                          title={isQuotingStatus && !hasApprovedParts ? 'Vui lòng chờ khách hàng duyệt báo giá phụ tùng' : ''}
                        >
                          <FiPlay />
                          {selectedOrder.status === 'CONFIRMED' ? 'Tiếp nhận xe' :
                           selectedOrder.status === 'RECEPTION' ? 'Bắt đầu kiểm tra xe' : 
                           selectedOrder.status === 'INSPECTION' ? 'Hoàn tất kiểm tra' : 
                           selectedOrder.status === 'QUOTING' ? (hasApprovedParts ? 'Chuyển sang Chờ phụ tùng' : '⏳ Chờ duyệt báo giá') :
                           selectedOrder.status === 'WAITING_FOR_PARTS' ? 'Phụ tùng đã về' : 'Tiếp tục'}
                        </button>
                      )
                    );
                  })()}
                  
                  {/* NÚT YÊU CẦU PHỤ TÙNG - Hiện khi có NEEDS_REPLACEMENT, thay thế nút "Hoàn tất kiểm tra"
                      Flow: Đánh dấu "Cần thay thế" → Click nút này → Chọn phụ tùng → Gửi yêu cầu
                  */}
                  {['INSPECTION'].includes(selectedOrder.status) && replacementItems.length > 0 && (
                    <button 
                      className="btn-request-parts"
                      onClick={() => {
                        // Lưu replacement items vào localStorage để PartsRequest đọc
                        if (replacementItems.length > 0) {
                          localStorage.setItem('replacementItems', JSON.stringify(replacementItems));
                        }
                        // ✅ Lưu order status để PartsRequest validate
                        localStorage.setItem('orderStatus', JSON.stringify(selectedOrder.status));
                        navigate(`/technician/parts-request?orderId=${selectedOrder.orderId}`);
                      }}
                    >
                      <FiPackage />
                      Yêu cầu phụ tùng thay thế
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

              {/* Banner thông báo trạng thái QUOTING - Chờ duyệt phụ tùng */}
              {selectedOrder.status === 'QUOTING' && (() => {
                // ✅ Sử dụng partRequests từ API thay vì đếm từ state
                const replacementCount = partRequests.length;
                const replacementItemsList = partRequests.map(req => ({
                  name: req.partName || 'Phụ tùng',
                  notes: req.notes,
                  quantity: req.quantity,
                  urgency: req.urgency
                }));

                return (
                  <div className="quoting-status-banner">
                    <div className="banner-icon">
                      <FiClock size={24} />
                    </div>
                    <div className="banner-content">
                      <h4>⏳ Đang chờ duyệt phụ tùng ({replacementCount} mục)</h4>
                      <p>
                        Yêu cầu phụ tùng thay thế đã được gửi. 
                        Advisor đang xem xét và gửi báo giá cho khách hàng.
                        Bạn sẽ nhận được thông báo khi được phê duyệt.
                      </p>
                      {replacementItemsList.length > 0 && (
                        <div className="pending-parts-summary">
                          <strong>Mục cần thay thế:</strong>
                          <ul>
                            {replacementItemsList.slice(0, 5).map((item, idx) => (
                              <li key={idx}>
                                <strong>{item.name}</strong> x {item.quantity}
                                {item.urgency && item.urgency !== 'NORMAL' && (
                                  <span className="urgency-badge urgency-{item.urgency.toLowerCase()}">
                                    {item.urgency === 'URGENT' ? '⚡ Khẩn cấp' : '🔥 Rất khẩn'}
                                  </span>
                                )}
                                {item.notes && <span className="item-note"> - {item.notes}</span>}
                              </li>
                            ))}
                            {replacementItemsList.length > 5 && (
                              <li>...và {replacementItemsList.length - 5} mục khác</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

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

                {/* Hướng dẫn cho kỹ thuật viên ở bước INSPECTION */}
                {selectedOrder.status === 'INSPECTION' && (
                  <div className="inspection-guide">
                    <FiInfo />
                    <div>
                      <strong>Hướng dẫn kiểm tra:</strong>
                      <p>
                        Kiểm tra từng mục bên dưới. Nếu phát hiện cần thay phụ tùng, 
                        đánh dấu ✅ "Cần thay thế" và ghi chú chi tiết. 
                        Sau đó click <strong>"Hoàn tất kiểm tra"</strong> ở trên.
                      </p>
                    </div>
                  </div>
                )}

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

      {/* Toast thông báo auto-save */}
      {showSaveToast && (
        <div className="save-toast">
          <FiCheckCircle />
          <span>Đã lưu tự động</span>
        </div>
      )}

      {/* ✅ Custom Confirmation Modal */}
      {confirmModal.show && (
        <div className="confirm-modal-overlay" onClick={handleConfirmModalClose}>
          <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <FiAlertCircle className="confirm-icon" />
              <h3>{confirmModal.title}</h3>
            </div>
            <div className="confirm-modal-body">
              <p>{confirmModal.message}</p>
            </div>
            <div className="confirm-modal-footer">
              <button className="btn-cancel" onClick={handleConfirmModalClose}>
                Hủy
              </button>
              <button className="btn-confirm" onClick={handleConfirmModalOk}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;
