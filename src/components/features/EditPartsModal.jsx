// File: src/components/features/EditPartsModal.jsx
// Modal chỉnh sửa phụ tùng cho đơn hàng đang ở trạng thái QUOTING

import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import { FiEdit, FiPlus, FiTrash2, FiSend, FiPackage, FiDollarSign, FiHash } from 'react-icons/fi';
import { 
  getPartRequestsByOrder, 
  approvePartRequest, 
  rejectPartRequest,
  removePartRequest,
  searchParts,
  sendQuoteEmail 
} from '../../services/partService';
import './EditPartsModal.css';

const EditPartsModal = ({ orderId, show, onHide, onComplete }) => {
  const [partRequests, setPartRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // State cho thêm phụ tùng mới
  const [showAddPartForm, setShowAddPartForm] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (show && orderId) {
      fetchPartRequests();
    }
  }, [show, orderId]);

  const fetchPartRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const requests = await getPartRequestsByOrder(orderId);
      setPartRequests(requests);
    } catch (err) {
      console.error('Error fetching part requests:', err);
      setError('Không thể tải danh sách phụ tùng.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchParts = async () => {
    if (!searchKeyword.trim()) return;
    
    try {
      setSearching(true);
      const results = await searchParts(searchKeyword);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching parts:', err);
      setError('Không thể tìm kiếm phụ tùng.');
    } finally {
      setSearching(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setProcessing(true);
      await approvePartRequest(requestId, '');
      await fetchPartRequests();
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Không thể duyệt yêu cầu.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setProcessing(true);
      await rejectPartRequest(requestId, 'Không cần thiết');
      await fetchPartRequests();
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Không thể từ chối yêu cầu.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveRequest = async (requestId) => {
    try {
      setProcessing(true);
      await removePartRequest(requestId, 'Xóa khỏi báo giá');
      await fetchPartRequests();
    } catch (err) {
      console.error('Error removing request:', err);
      setError('Không thể xóa phụ tùng.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendQuote = async () => {
    try {
      setProcessing(true);
      await sendQuoteEmail(orderId);
      onComplete();
    } catch (err) {
      console.error('Error sending quote:', err);
      setError('Không thể gửi báo giá. Vui lòng thử lại.');
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', text: 'Chờ duyệt' },
      APPROVED: { variant: 'success', text: 'Đã duyệt' },
      REJECTED: { variant: 'danger', text: 'Từ chối' },
      QUOTED: { variant: 'info', text: 'Đã báo giá' }
    };
    const config = statusMap[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const totalAmount = partRequests
    .filter(req => req.status === 'APPROVED')
    .reduce((sum, req) => sum + (req.partPrice * req.quantityRequested), 0);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      backdrop="static"
      className="edit-parts-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FiEdit className="me-2" />
          Chỉnh sửa báo giá phụ tùng - Đơn #{orderId}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Đang tải danh sách phụ tùng...</p>
          </div>
        ) : (
          <>
            <Alert variant="info" className="mb-4">
              <FiPackage className="me-2" />
              <strong>Hướng dẫn:</strong> Duyệt/từ chối các phụ tùng hiện có hoặc thêm phụ tùng mới. 
              Sau khi hoàn tất, nhấn <strong>"Gửi báo giá"</strong> để gửi email cho khách hàng.
            </Alert>

            {/* Danh sách phụ tùng hiện tại */}
            <div className="parts-list-section mb-4">
              <h5 className="mb-3">
                <FiPackage className="me-2" />
                Danh sách phụ tùng ({partRequests.length})
              </h5>
              
              {partRequests.length === 0 ? (
                <Alert variant="warning">
                  Chưa có yêu cầu phụ tùng nào. Nhấn "Thêm phụ tùng" để bắt đầu.
                </Alert>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Mã phụ tùng</th>
                      <th>Tên</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partRequests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <FiHash className="me-1" />
                          {request.partSku}
                        </td>
                        <td>{request.partName}</td>
                        <td className="text-center">{request.quantityRequested}</td>
                        <td>{formatCurrency(request.partPrice)}</td>
                        <td>
                          <strong>{formatCurrency(request.partPrice * request.quantityRequested)}</strong>
                        </td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>
                          {request.status === 'PENDING' && (
                            <div className="btn-group btn-group-sm">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleApproveRequest(request.id)}
                                disabled={processing}
                              >
                                Duyệt
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRejectRequest(request.id)}
                                disabled={processing}
                              >
                                Từ chối
                              </Button>
                            </div>
                          )}
                          {request.status === 'APPROVED' && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleRemoveRequest(request.id)}
                              disabled={processing}
                            >
                              <FiTrash2 /> Xóa
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-info">
                      <td colSpan="4" className="text-end"><strong>Tổng cộng (đã duyệt):</strong></td>
                      <td colSpan="3"><strong>{formatCurrency(totalAmount)}</strong></td>
                    </tr>
                  </tfoot>
                </Table>
              )}
            </div>

            {/* Nút thêm phụ tùng */}
            <div className="text-center mb-3">
              <Button
                variant="outline-primary"
                onClick={() => setShowAddPartForm(!showAddPartForm)}
              >
                <FiPlus className="me-2" />
                {showAddPartForm ? 'Ẩn form thêm phụ tùng' : 'Thêm phụ tùng mới'}
              </Button>
            </div>

            {/* Form thêm phụ tùng */}
            {showAddPartForm && (
              <div className="add-part-section p-3 border rounded bg-light">
                <h6 className="mb-3">Tìm kiếm phụ tùng</h6>
                <Form.Group className="mb-3">
                  <div className="input-group">
                    <Form.Control
                      type="text"
                      placeholder="Nhập mã hoặc tên phụ tùng..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchParts()}
                    />
                    <Button
                      variant="primary"
                      onClick={handleSearchParts}
                      disabled={searching}
                    >
                      {searching ? <Spinner size="sm" animation="border" /> : 'Tìm kiếm'}
                    </Button>
                  </div>
                </Form.Group>

                {searchResults.length > 0 && (
                  <div className="search-results">
                    <h6>Kết quả tìm kiếm:</h6>
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Mã</th>
                          <th>Tên</th>
                          <th>Giá</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((part) => (
                          <tr key={part.partId}>
                            <td>{part.partNumber}</td>
                            <td>{part.partName}</td>
                            <td>{formatCurrency(part.price)}</td>
                            <td>
                              <Button
                                variant="success"
                                size="sm"
                                disabled
                              >
                                Thêm
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <Alert variant="warning" className="mt-2">
                      <small>
                        <strong>Lưu ý:</strong> Hiện tại chỉ hỗ trợ duyệt/từ chối các yêu cầu có sẵn. 
                        Tính năng thêm phụ tùng mới đang được phát triển.
                      </small>
                    </Alert>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div className="w-100 d-flex justify-content-between align-items-center">
          <div>
            <FiDollarSign size={20} className="me-2 text-success" />
            <strong>Tổng: {formatCurrency(totalAmount)}</strong>
          </div>
          <div>
            <Button variant="secondary" onClick={onHide} disabled={processing}>
              Đóng
            </Button>
            <Button
              variant="primary"
              onClick={handleSendQuote}
              disabled={processing || partRequests.filter(r => r.status === 'APPROVED').length === 0}
              className="ms-2"
            >
              {processing ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <FiSend className="me-2" />
                  Gửi báo giá
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPartsModal;
