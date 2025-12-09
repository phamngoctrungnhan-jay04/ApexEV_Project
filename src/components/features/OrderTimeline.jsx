// File: src/components/features/OrderTimeline.jsx
// Component Timeline hiển thị quy trình bảo dưỡng (APEX Modern UI - với Kết quả kiểm tra)

import React, { useState } from 'react';
import { 
  FiCheckCircle, 
  FiClock, 
  FiTool, 
  FiPackage, 
  FiClipboard,
  FiFileText,
  FiXCircle,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiImage,
  FiEye,
  FiDollarSign
} from 'react-icons/fi';
import { Badge } from 'react-bootstrap';
import './OrderTimeline.css';

const OrderTimeline = ({ currentStatus, checklists = [], checklistItems = [], isChecklistCompleted = false }) => {
  const [expandedStep, setExpandedStep] = useState(null);

  // Debug log
  console.log('OrderTimeline - currentStatus:', currentStatus);
  console.log('OrderTimeline - checklistItems:', checklistItems);
  console.log('OrderTimeline - checklistItems.length:', checklistItems.length);
  console.log('OrderTimeline - isChecklistCompleted:', isChecklistCompleted);

  // Kiểm tra xem checklist đã được đánh dấu hoàn thành chưa
  // CHỈ hiển thị kết quả khi kỹ thuật viên bấm "Hoàn tất kiểm tra"
  const isInspectionCompleted = () => {
    console.log('🔍 Checking isInspectionCompleted:', {
      isChecklistCompleted,
      itemsLength: checklistItems.length,
      hasItems: checklistItems.length > 0
    });
    return isChecklistCompleted === true;
  };

  // Kiểm tra xem tất cả services đã hoàn thành chưa
  const isAllServicesCompleted = () => {
    if (!checklistItems || checklistItems.length === 0) return false;
    const pendingCount = checklistItems.filter(item => !item.status || item.status === 'PENDING').length;
    return pendingCount === 0 && checklistItems.length > 0;
  };

  // Toggle expansion
  const handleStepClick = (stepKey) => {
    console.log('Clicked step:', stepKey);
    // INSPECTION_RESULT có thể mở khi checklist đã hoàn thành
    if (stepKey === 'INSPECTION_RESULT' && isInspectionCompleted()) {
      setExpandedStep(expandedStep === stepKey ? null : stepKey);
    }
  };
  // Định nghĩa các bước trong quy trình (CẬP NHẬT: Thêm Kết quả kiểm tra + Từ chối báo giá)
  const timeline = [
    { 
      key: 'RECEPTION', 
      label: 'Tiếp nhận', 
      icon: FiClipboard,
      description: 'Xe đã được tiếp nhận và ghi nhận thông tin'
    },
    { 
      key: 'INSPECTION', 
      label: 'Kiểm tra', 
      icon: FiTool,
      description: 'Kỹ thuật viên đang kiểm tra tình trạng xe'
    },
    { 
      key: 'INSPECTION_RESULT', 
      label: 'Kết quả kiểm tra', 
      icon: FiEye,
      description: 'Báo cáo kết quả kiểm tra chi tiết',
      hasReport: true,
      isVirtual: true // Không phải status thật từ backend
    },
    { 
      key: 'QUOTING', 
      label: 'Báo giá', 
      icon: FiFileText,
      description: 'Đang chuẩn bị báo giá phụ tùng cần thay (nếu có)'
    },
    { 
      key: 'QUOTE_REJECTED', 
      label: 'Từ chối báo giá', 
      icon: FiXCircle,
      description: 'Khách hàng từ chối báo giá phụ tùng. Advisor sẽ liên hệ để tư vấn lại.',
      isVirtual: true, // Không phải bước chính thức trong flow
      isRejection: true // Đánh dấu là bước từ chối
    },
    { 
      key: 'WAITING_FOR_PARTS', 
      label: 'Chờ phụ tùng', 
      icon: FiPackage,
      description: 'Đang chờ phụ tùng thay thế về kho'
    },
    { 
      key: 'IN_PROGRESS', 
      label: 'Đang thực hiện', 
      icon: FiTool,
      description: 'Kỹ thuật viên đang thay phụ tùng và bảo dưỡng'
    },
    { 
      key: 'READY_FOR_INVOICE', 
      label: 'Hoàn thành', 
      icon: FiCheckCircle,
      description: 'Đã hoàn thành bảo dưỡng, sẵn sàng thanh toán'
    },
    { 
      key: 'INVOICED', 
      label: 'Xuất hóa đơn', 
      icon: FiDollarSign,
      description: 'Advisor đã xuất hóa đơn thanh toán'
    },
    { 
      key: 'COMPLETED', 
      label: 'Đã giao xe', 
      icon: FiCheckCircle,
      description: 'Đã thanh toán và giao xe cho khách hàng'
    }
  ];

  // Xác định trạng thái hiện tại
  const getCurrentIndex = () => {
    // Tìm index của status thật (không phải virtual step)
    const realTimeline = timeline.filter(step => !step.isVirtual);
    const index = realTimeline.findIndex(step => step.key === currentStatus);
    
    // Map về timeline đầy đủ (có virtual steps)
    if (index < 0) return 0;
    
    // Tìm vị trí trong timeline đầy đủ
    const realStep = realTimeline[index];
    return timeline.findIndex(step => step.key === realStep.key);
  };

  const currentIndex = getCurrentIndex();
  const isCancelled = currentStatus === 'CANCELLED';
  const allServicesCompleted = isAllServicesCompleted();

  // Render Inspection Report
  const renderInspectionReport = (items) => {
    if (!items || items.length === 0) {
      return <p className="text-muted text-center py-3">Chưa có dữ liệu kiểm tra</p>;
    }

    // Group items by service
    const groupedByService = items.reduce((acc, item) => {
      const serviceId = item.serviceId || 'unknown';
      const serviceName = item.serviceName || 'Dịch vụ không xác định';
      
      if (!acc[serviceId]) {
        acc[serviceId] = {
          serviceName,
          items: []
        };
      }
      acc[serviceId].items.push(item);
      return acc;
    }, {});

    return (
      <div className="inspection-report">
        <div className="report-header">
          <FiFileText size={20} />
          <h6>Báo cáo kết quả kiểm tra chi tiết</h6>
        </div>

        {/* Summary Statistics */}
        <div className="report-summary">
          <div className="summary-card passed">
            <FiCheckCircle size={24} />
            <div>
              <span className="summary-number">{items.filter(i => i.status === 'PASSED').length}</span>
              <span className="summary-label">Đạt yêu cầu</span>
            </div>
          </div>
          <div className="summary-card failed">
            <FiXCircle size={24} />
            <div>
              <span className="summary-number">{items.filter(i => i.status === 'FAILED').length}</span>
              <span className="summary-label">Lỗi nghiêm trọng</span>
            </div>
          </div>
          <div className="summary-card attention">
            <FiAlertCircle size={24} />
            <div>
              <span className="summary-number">{items.filter(i => i.status === 'NEEDS_ATTENTION').length}</span>
              <span className="summary-label">Cần chú ý</span>
            </div>
          </div>
          <div className="summary-card replacement">
            <FiTool size={24} />
            <div>
              <span className="summary-number">{items.filter(i => i.status === 'NEEDS_REPLACEMENT').length}</span>
              <span className="summary-label">Cần thay thế</span>
            </div>
          </div>
        </div>

        {/* Detailed Report by Service */}
        <div className="report-services">
          {Object.entries(groupedByService).map(([serviceId, { serviceName, items: serviceItems }]) => (
            <div key={serviceId} className="report-service-section">
              <h6 className="service-section-title">
                <FiTool className="me-2" />
                {serviceName}
              </h6>
              <div className="service-items-list">
                {serviceItems.map((item, idx) => (
                  <div key={idx} className={`report-item status-${item.status?.toLowerCase() || 'pending'}`}>
                    <div className="report-item-header">
                      <div className={`item-status-badge ${item.status?.toLowerCase() || 'pending'}`}>
                        {item.status === 'PASSED' && (
                          <>
                            <FiCheckCircle className="status-icon" /> 
                            <span className="status-text">Đạt yêu cầu</span>
                          </>
                        )}
                        {item.status === 'FAILED' && (
                          <>
                            <FiXCircle className="status-icon" /> 
                            <span className="status-text">Lỗi nghiêm trọng</span>
                          </>
                        )}
                        {item.status === 'NEEDS_ATTENTION' && (
                          <>
                            <FiAlertCircle className="status-icon" /> 
                            <span className="status-text">Cần chú ý</span>
                          </>
                        )}
                        {item.status === 'NEEDS_REPLACEMENT' && (
                          <>
                            <FiTool className="status-icon" /> 
                            <span className="status-text">Cần thay thế</span>
                          </>
                        )}
                        {(!item.status || item.status === 'PENDING') && (
                          <>
                            <FiClock className="status-icon" /> 
                            <span className="status-text">Đang kiểm tra</span>
                          </>
                        )}
                      </div>
                      <span className="item-name">{item.itemName}</span>
                    </div>
                    
                    {/* Hiển thị mô tả item nếu có */}
                    {item.itemDescription && (
                      <div className="item-description-section">
                        <span className="item-description-text">{item.itemDescription}</span>
                      </div>
                    )}
                    
                    {/* Hiển thị ghi chú của kỹ thuật viên */}
                    {item.technicianNotes && (
                      <div className="item-notes-section">
                        <div className="notes-header">
                          <FiFileText size={14} className="notes-icon" />
                          <span className="notes-label">Ghi chú của kỹ thuật viên:</span>
                        </div>
                        <p className="notes-content">{item.technicianNotes}</p>
                      </div>
                    )}
                    
                    {/* Hiển thị hình ảnh minh chứng */}
                    {item.mediaUrl && (
                      <div className="item-image-section">
                        <div className="image-header">
                          <FiImage size={14} className="image-icon" />
                          <span className="image-label">Hình ảnh minh chứng:</span>
                        </div>
                        <div className="image-wrapper">
                          <img 
                            src={item.mediaUrl} 
                            alt={item.itemName} 
                            className="item-evidence-img"
                            onClick={() => window.open(item.mediaUrl, '_blank')}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isCancelled) {
    return (
      <div className="order-timeline cancelled">
        <div className="timeline-step cancelled">
          <div className="timeline-icon">
            <FiXCircle />
          </div>
          <div className="timeline-content">
            <h5>Đơn hàng đã hủy</h5>
            <p className="text-muted">Đơn hàng đã được hủy bỏ</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-timeline">
      {timeline.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const isPending = index > currentIndex;
        
        // Xử lý riêng cho INSPECTION_RESULT (virtual step)
        const isInspectionResult = step.key === 'INSPECTION_RESULT';
        let stepIsCompleted = isCompleted;
        let stepIsActive = isActive;
        
        if (isInspectionResult) {
          // INSPECTION_RESULT chỉ hiển thị khi kỹ thuật viên đã bấm "Hoàn tất kiểm tra"
          const completed = isInspectionCompleted();
          stepIsCompleted = completed;
          stepIsActive = false; // Không bao giờ active (vì không phải status thật)
        }
        
        // ⚠️ Xử lý riêng cho QUOTE_REJECTED (virtual step khi customer từ chối báo giá)
        const isQuoteRejected = step.key === 'QUOTE_REJECTED';
        if (isQuoteRejected) {
          // CHỈ hiển thị bước này khi currentStatus === 'QUOTE_REJECTED'
          if (currentStatus !== 'QUOTE_REJECTED') {
            return null; // Ẩn bước này nếu không phải trạng thái từ chối
          }
          stepIsCompleted = false; // Không đánh dấu hoàn thành
          stepIsActive = true; // Đang active vì đây là trạng thái hiện tại
        }
        
        // ✅ Xử lý riêng cho bước "Hoàn thành" (READY_FOR_INVOICE)
        // Khi kỹ thuật viên bấm nút hoàn thành, bước này phải xanh lá
        if (step.key === 'READY_FOR_INVOICE' && 
            (currentStatus === 'READY_FOR_INVOICE' || currentStatus === 'INVOICED' || currentStatus === 'COMPLETED')) {
          stepIsCompleted = true;
          stepIsActive = (currentStatus === 'READY_FOR_INVOICE'); // Chỉ active khi đúng ở trạng thái này
        }
        
        // ✅ Xử lý riêng cho bước "Xuất hóa đơn" (INVOICED)
        // Khi advisor bấm xuất hóa đơn, bước này mới chuyển sang xanh lá
        if (step.key === 'INVOICED') {
          if (currentStatus === 'INVOICED' || currentStatus === 'COMPLETED') {
            stepIsCompleted = true;
            stepIsActive = (currentStatus === 'INVOICED'); // Active khi đang ở trạng thái này
          } else {
            stepIsCompleted = false;
            stepIsActive = false;
          }
        }
        
        // ✅ Xử lý riêng cho bước cuối "Đã giao xe" (COMPLETED)
        // CHỈ khi advisor bấm giao xe (status = COMPLETED), bước này mới xanh lá
        if (step.key === 'COMPLETED') {
          if (currentStatus === 'COMPLETED') {
            stepIsCompleted = true;
            stepIsActive = false; // Không active vì đã hoàn thành
          } else {
            // Khi status là INVOICED hoặc bất kỳ trạng thái nào khác, bước này vẫn là xanh dương (pending/active)
            stepIsCompleted = false;
            stepIsActive = false;
          }
        }
        
        const isExpanded = expandedStep === step.key;
        const canExpand = isInspectionResult && isInspectionCompleted();

        const Icon = step.icon;

        return (
          <div 
            key={step.key} 
            className={`timeline-step ${stepIsActive ? 'active' : ''} ${stepIsCompleted ? 'completed' : ''} ${isPending && !isInspectionResult && !isQuoteRejected ? 'pending' : ''} ${isExpanded ? 'expanded' : ''} ${canExpand ? 'clickable' : ''} ${isQuoteRejected && stepIsActive ? 'rejected' : ''}`}
            onClick={() => handleStepClick(step.key)}
          >
            <div className="timeline-connector" />
            <div className="timeline-icon">
              {isInspectionResult ? (
                stepIsCompleted ? <FiCheckCircle /> : <Icon />
              ) : (
                stepIsCompleted ? <FiCheckCircle /> : <Icon />
              )}
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <h5>{step.label}</h5>
                {canExpand && (
                  <button className="expand-btn">
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                )}
              </div>
              <p className="text-muted">{step.description}</p>
              {stepIsActive && !isInspectionResult && !isQuoteRejected && (
                <span className="badge-status">
                  <FiClock className="me-1" />
                  Đang thực hiện
                </span>
              )}
              {/* Badge đặc biệt cho bước từ chối báo giá */}
              {isQuoteRejected && stepIsActive && (
                <span className="badge-status rejected">
                  <FiAlertCircle className="me-1" />
                  Chúng tôi sẽ liên hệ tư vấn
                </span>
              )}
              {isInspectionResult && isInspectionCompleted() && !isExpanded && (
                <span className="badge-status completed" onClick={() => setExpandedStep(step.key)}>
                  <FiCheckCircle className="me-1" />
                  {isAllServicesCompleted() ? '✓ Xem kết quả kiểm tra đầy đủ' : '✓ Xem kết quả kiểm tra'}
                </span>
              )}
              {isInspectionResult && !isInspectionCompleted() && checklistItems.length > 0 && (
                <span className="badge-status pending-inspection">
                  <FiClock className="me-1" />
                  Đang kiểm tra... ({checklistItems.filter(i => i.status && i.status !== 'PENDING').length}/{checklistItems.length})
                </span>
              )}

              {/* Inspection Report - Only for INSPECTION_RESULT step */}
              {isInspectionResult && isExpanded && isInspectionCompleted() && (
                <div className="inspection-report-expansion">
                  {renderInspectionReport(checklistItems)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
