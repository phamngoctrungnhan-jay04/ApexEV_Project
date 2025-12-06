// File: src/components/features/InvoicePreview.jsx
// Component hiển thị hóa đơn chi tiết (Dịch vụ + Phụ tùng phát sinh)

import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { 
  FiDollarSign, 
  FiFileText, 
  FiTool, 
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiXCircle
} from 'react-icons/fi';
import './InvoicePreview.css';

const InvoicePreview = ({ invoice, orderItems = [] }) => {
  if (!invoice && (!orderItems || orderItems.length === 0)) {
    return (
      <Card className="invoice-preview-card">
        <Card.Body className="text-center py-5">
          <FiFileText size={48} className="text-muted mb-3" />
          <p className="text-muted">Chưa có hóa đơn</p>
        </Card.Body>
      </Card>
    );
  }

  // Tách dịch vụ và phụ tùng
  const services = orderItems.filter(item => item.itemType === 'SERVICE');
  const parts = orderItems.filter(item => item.itemType === 'PART');

  // Tính tổng
  const calculateSubtotal = (items) => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.unitPrice || 0);
      const qty = parseInt(item.quantity || 0);
      return sum + (price * qty);
    }, 0);
  };

  const serviceTotal = calculateSubtotal(services);
  const partTotal = calculateSubtotal(parts);
  const grandTotal = invoice?.totalAmount || (serviceTotal + partTotal);

  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Status badge
  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return <Badge bg="success"><FiCheckCircle className="me-1" />Đã thanh toán</Badge>;
      case 'PENDING':
        return <Badge bg="warning" text="dark"><FiClock className="me-1" />Chờ thanh toán</Badge>;
      case 'CANCELLED':
        return <Badge bg="danger"><FiXCircle className="me-1" />Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">{status || 'N/A'}</Badge>;
    }
  };

  return (
    <Card className="invoice-preview-card">
      <Card.Header className="invoice-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-1">
              <FiFileText className="me-2" />
              Hóa đơn chi tiết
            </h5>
            {invoice?.invoiceCode && (
              <small className="text-muted">Mã: {invoice.invoiceCode}</small>
            )}
          </div>
          <div>
            {invoice?.status && getStatusBadge(invoice.status)}
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        {/* Dịch vụ */}
        {services.length > 0 && (
          <div className="invoice-section mb-4">
            <h6 className="section-title">
              <FiTool className="me-2" />
              Dịch vụ bảo dưỡng
            </h6>
            <Table responsive className="invoice-table">
              <thead>
                <tr>
                  <th>Dịch vụ</th>
                  <th className="text-center">SL</th>
                  <th className="text-end">Đơn giá</th>
                  <th className="text-end">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {services.map((item, index) => (
                  <tr key={index}>
                    <td>{item.serviceName || `Dịch vụ #${item.itemRefId}`}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-end fw-bold">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="subtotal-row">
                  <td colSpan="3" className="text-end">Tổng dịch vụ:</td>
                  <td className="text-end fw-bold">{formatCurrency(serviceTotal)}</td>
                </tr>
              </tfoot>
            </Table>
          </div>
        )}

        {/* Phụ tùng phát sinh */}
        {parts.length > 0 && (
          <div className="invoice-section mb-4">
            <h6 className="section-title text-warning">
              <FiPackage className="me-2" />
              Phụ tùng thay thế (Phát sinh)
            </h6>
            <Table responsive className="invoice-table">
              <thead>
                <tr>
                  <th>Phụ tùng</th>
                  <th className="text-center">SL</th>
                  <th className="text-end">Đơn giá</th>
                  <th className="text-end">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((item, index) => (
                  <tr key={index}>
                    <td>
                      {item.serviceName || `Phụ tùng #${item.itemRefId}`}
                      <Badge bg="warning" text="dark" className="ms-2 badge-sm">Phát sinh</Badge>
                    </td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-end fw-bold text-warning">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="subtotal-row">
                  <td colSpan="3" className="text-end">Tổng phụ tùng:</td>
                  <td className="text-end fw-bold text-warning">{formatCurrency(partTotal)}</td>
                </tr>
              </tfoot>
            </Table>
          </div>
        )}

        {/* Tổng cộng */}
        <div className="invoice-total">
          <div className="total-row">
            <span className="total-label">
              <FiDollarSign className="me-2" />
              TỔNG HÓA ĐƠN:
            </span>
            <span className="total-amount">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* Ghi chú */}
        {invoice?.notes && (
          <div className="invoice-notes mt-3">
            <small className="text-muted">
              <strong>Ghi chú:</strong> {invoice.notes}
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default InvoicePreview;
