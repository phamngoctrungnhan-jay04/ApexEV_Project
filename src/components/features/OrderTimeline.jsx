// File: src/components/features/OrderTimeline.jsx
// Component Timeline hiển thị quy trình bảo dưỡng (APEX Modern UI - Full Screen with Expandable Checklist)

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
  FiImage
} from 'react-icons/fi';
import { Badge } from 'react-bootstrap';
import './OrderTimeline.css';

const OrderTimeline = ({ currentStatus, checklists = [] }) => {
  const [expandedStep, setExpandedStep] = useState(null);

  // Debug log
  console.log('OrderTimeline - currentStatus:', currentStatus);
  console.log('OrderTimeline - checklists:', checklists);
  console.log('OrderTimeline - checklists.length:', checklists.length);

  // Toggle expansion
  const handleStepClick = (stepKey) => {
    console.log('Clicked step:', stepKey);
    if (stepKey === 'INSPECTION' && checklists.length > 0) {
      setExpandedStep(expandedStep === stepKey ? null : stepKey);
      console.log('Toggled expandedStep to:', expandedStep === stepKey ? null : stepKey);
    } else {
      console.log('Cannot expand - checklists.length:', checklists.length);
    }
  };
  // Định nghĩa các bước trong quy trình (ĐÚNG THEO BUSINESS FLOW)
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
      icon: FiClipboard,
      description: 'Kỹ thuật viên đang kiểm tra tình trạng xe',
      hasChecklist: true // Đánh dấu bước này có checklist
    },
    { 
      key: 'QUOTING', 
      label: 'Báo giá', 
      icon: FiFileText,
      description: 'Đang chuẩn bị báo giá phụ tùng cần thay (nếu có)'
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
      key: 'COMPLETED', 
      label: 'Đã giao xe', 
      icon: FiCheckCircle,
      description: 'Đã thanh toán và giao xe cho khách hàng'
    }
  ];

  // Xác định trạng thái hiện tại
  const getCurrentIndex = () => {
    const index = timeline.findIndex(step => step.key === currentStatus);
    return index >= 0 ? index : 0;
  };

  const currentIndex = getCurrentIndex();
  const isCancelled = currentStatus === 'CANCELLED';

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
        const isInspection = step.key === 'INSPECTION';
        const isExpanded = expandedStep === step.key;
        const hasChecklists = isInspection && checklists.length > 0;

        const Icon = step.icon;

        return (
          <div 
            key={step.key} 
            className={`timeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isPending ? 'pending' : ''} ${isExpanded ? 'expanded' : ''} ${hasChecklists ? 'clickable' : ''}`}
            onClick={() => handleStepClick(step.key)}
          >
            <div className="timeline-connector" />
            <div className="timeline-icon">
              {isCompleted ? <FiCheckCircle /> : <Icon />}
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <h5>{step.label}</h5>
                {hasChecklists && (
                  <button className="expand-btn">
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                )}
              </div>
              <p className="text-muted">{step.description}</p>
              {isActive && (
                <span className="badge-status">
                  <FiClock className="me-1" />
                  Đang thực hiện
                </span>
              )}

              {/* Checklist Expansion - Only for INSPECTION step */}
              {isInspection && isExpanded && checklists.length > 0 && (
                <div className="checklist-expansion">
                  {checklists.map((checklist, idx) => (
                    <div key={checklist.checklistId || idx} className="checklist-card-inline">
                      <div className="checklist-card-header">
                        <FiFileText className="me-2" />
                        <h6>{checklist.templateName || `Checklist #${idx + 1}`}</h6>
                        <div className="checklist-badges">
                          <Badge bg="success" className="ms-2">
                            <FiCheckCircle className="me-1" />
                            {checklist.items?.filter(i => i.status === 'OK').length || 0}
                          </Badge>
                          <Badge bg="danger" className="ms-2">
                            <FiXCircle className="me-1" />
                            {checklist.items?.filter(i => i.status === 'NOT_OK').length || 0}
                          </Badge>
                          <Badge bg="secondary" className="ms-2">
                            <FiClock className="me-1" />
                            {checklist.items?.filter(i => i.status === 'NOT_CHECKED').length || 0}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="checklist-items-list">
                        {checklist.items && checklist.items.length > 0 ? (
                          checklist.items.map((item, itemIdx) => (
                            <div key={itemIdx} className={`checklist-item-inline status-${item.status?.toLowerCase()}`}>
                              <div className="item-status-icon">
                                {item.status === 'OK' && <FiCheckCircle className="text-success" />}
                                {item.status === 'NOT_OK' && <FiXCircle className="text-danger" />}
                                {item.status === 'NOT_CHECKED' && <FiClock className="text-secondary" />}
                              </div>
                              <div className="item-details">
                                <span className="item-name">{item.itemName}</span>
                                {item.notes && (
                                  <span className="item-notes">
                                    <FiAlertCircle className="me-1" />
                                    {item.notes}
                                  </span>
                                )}
                                {item.evidenceUrl && (
                                  <a href={item.evidenceUrl} target="_blank" rel="noopener noreferrer" className="item-evidence">
                                    <FiImage className="me-1" />
                                    Hình ảnh
                                  </a>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted text-center py-2">Chưa có dữ liệu</p>
                        )}
                      </div>
                    </div>
                  ))}
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
