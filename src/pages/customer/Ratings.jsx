import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal, Badge } from 'react-bootstrap';
import { FiStar, FiMessageSquare, FiFilter, FiSearch, FiCalendar, FiCheck } from 'react-icons/fi';
import { getReviewsByCustomer, getOrdersByCustomer } from '../../mockData';
import './Ratings.css';

const Ratings = () => {
  // Mock current user
  const currentUserId = 1;
  const customerReviews = getReviewsByCustomer(currentUserId);
  const customerOrders = getOrdersByCustomer(currentUserId)
    .filter(order => order.status === 'completed' && !customerReviews.some(r => r.orderId === order.id));

  // States
  const [reviews, setReviews] = useState(customerReviews);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterRating, setFilterRating] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    serviceQuality: 0,
    staffAttitude: 0,
    cleanliness: 0,
    pricing: 0,
    timeliness: 0,
    comment: ''
  });

  const aspects = [
    { key: 'serviceQuality', label: 'Chất lượng dịch vụ', icon: '🔧' },
    { key: 'staffAttitude', label: 'Thái độ nhân viên', icon: '👨‍🔧' },
    { key: 'cleanliness', label: 'Vệ sinh sạch sẽ', icon: '✨' },
    { key: 'pricing', label: 'Giá cả hợp lý', icon: '💰' },
    { key: 'timeliness', label: 'Đúng giờ hẹn', icon: '⏰' }
  ];

  // Calculate average rating
  const calculateAverage = (review) => {
    const sum = review.serviceQuality + review.staffAttitude + review.cleanliness + 
                review.pricing + review.timeliness;
    return (sum / 5).toFixed(1);
  };

  // Calculate overall stats
  const stats = {
    total: reviews.length,
    average: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + parseFloat(calculateAverage(r)), 0) / reviews.length).toFixed(1)
      : 0,
    fiveStar: reviews.filter(r => calculateAverage(r) >= 4.5).length,
    fourStar: reviews.filter(r => calculateAverage(r) >= 3.5 && calculateAverage(r) < 4.5).length,
    threeStar: reviews.filter(r => calculateAverage(r) >= 2.5 && calculateAverage(r) < 3.5).length,
    twoStar: reviews.filter(r => calculateAverage(r) >= 1.5 && calculateAverage(r) < 2.5).length,
    oneStar: reviews.filter(r => calculateAverage(r) < 1.5).length
  };

  // Handlers
  const handleShowReviewModal = (order) => {
    setSelectedOrder(order);
    setReviewForm({
      serviceQuality: 0,
      staffAttitude: 0,
      cleanliness: 0,
      pricing: 0,
      timeliness: 0,
      comment: ''
    });
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedOrder(null);
  };

  const handleRatingChange = (aspect, rating) => {
    setReviewForm(prev => ({ ...prev, [aspect]: rating }));
  };

  const handleSubmitReview = () => {
    // Validate all ratings are given
    const allRated = aspects.every(aspect => reviewForm[aspect.key] > 0);
    if (!allRated) {
      alert('Vui lòng đánh giá tất cả các tiêu chí!');
      return;
    }

    if (!reviewForm.comment.trim()) {
      alert('Vui lòng nhập nhận xét!');
      return;
    }

    // Create new review
    const newReview = {
      id: reviews.length + 1,
      orderId: selectedOrder.id,
      customerId: currentUserId,
      technicianId: selectedOrder.technicianId,
      orderNumber: selectedOrder.orderNumber,
      serviceName: selectedOrder.services.map(s => s.name).join(', '),
      serviceQuality: reviewForm.serviceQuality,
      staffAttitude: reviewForm.staffAttitude,
      cleanliness: reviewForm.cleanliness,
      pricing: reviewForm.pricing,
      timeliness: reviewForm.timeliness,
      comment: reviewForm.comment,
      createdAt: new Date().toISOString(),
      technicianResponse: null
    };

    setReviews([newReview, ...reviews]);
    alert('Đánh giá đã được gửi thành công!');
    handleCloseReviewModal();
  };

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const avgRating = parseFloat(calculateAverage(review));
    const matchesRating = filterRating === 'all' || 
      (filterRating === '5' && avgRating >= 4.5) ||
      (filterRating === '4' && avgRating >= 3.5 && avgRating < 4.5) ||
      (filterRating === '3' && avgRating >= 2.5 && avgRating < 3.5) ||
      (filterRating === '2' && avgRating >= 1.5 && avgRating < 2.5) ||
      (filterRating === '1' && avgRating < 1.5);

    const matchesSearch = review.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRating && matchesSearch;
  });

  // Render star rating
  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <FiStar
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <> {/* <--- ĐÃ THÊM THẺ MỞ FRAGMENT TẠI ĐÂY */}
      <div className="ratings-page">
        <Container fluid>
          <div className="page-header">
            <h1 className="page-title">
              <FiStar className="me-2" />
              Đánh giá dịch vụ
            </h1>
            <p className="page-subtitle">Chia sẻ trải nghiệm của bạn về dịch vụ bảo dưỡng</p>
          </div>

          <Row className="mb-4">
            {/* Stats Card */}
            <Col lg={4}>
              <Card className="stats-card">
                <Card.Body className="text-center">
                  <div className="overall-rating">
                    <h1 className="rating-number">{stats.average}</h1>
                    <div className="rating-stars">
                      {renderStars(Math.round(stats.average))}
                    </div>
                    <p className="rating-count">{stats.total} đánh giá</p>
                  </div>

                  <div className="rating-breakdown">
                    {[5, 4, 3, 2, 1].map(star => (
                      <div key={star} className="rating-row">
                        <span className="star-label">{star} <FiStar size={14} /></span>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${stats.total > 0 ? (stats[`${['five', 'four', 'three', 'two', 'one'][5 - star]}Star`] / stats.total * 100) : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="count">{stats[`${['five', 'four', 'three', 'two', 'one'][5 - star]}Star`]}</span>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Pending Reviews */}
            <Col lg={8}>
              <Card className="pending-reviews-card">
                <Card.Header>
                  <h5>Dịch vụ chưa đánh giá ({customerOrders.length})</h5>
                </Card.Header>
                <Card.Body>
                  {customerOrders.length === 0 ? (
                    <div className="text-center text-muted py-3">
                      <FiCheck size={48} className="mb-2 opacity-25" />
                      <p>Bạn đã đánh giá tất cả các dịch vụ!</p>
                    </div>
                  ) : (
                    <div className="pending-list">
                      {customerOrders.slice(0, 3).map(order => (
                        <div key={order.id} className="pending-item">
                          <div className="pending-info">
                            <h6 className="mb-1">{order.orderNumber}</h6>
                            <p className="mb-1 text-muted small">
                              {order.services.map(s => s.name).join(', ')}
                            </p>
                            <p className="mb-0 text-muted small">
                              <FiCalendar size={14} className="me-1" />
                              {new Date(order.completedDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <Button 
                            variant="primary"
                            size="sm"
                            onClick={() => handleShowReviewModal(order)}
                          >
                            Đánh giá
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filters and Search */}
          <Card className="filter-card mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={6}>
                  <div className="search-box">
                    <FiSearch className="search-icon" />
                    <Form.Control
                      type="text"
                      placeholder="Tìm kiếm theo mã đơn, dịch vụ, nhận xét..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className="filter-buttons">
                    <FiFilter className="me-2" />
                    <Button
                      variant={filterRating === 'all' ? 'primary' : 'outline-secondary'}
                      size="sm"
                      onClick={() => setFilterRating('all')}
                    >
                      Tất cả
                    </Button>
                    {[5, 4, 3, 2, 1].map(star => (
                      <Button
                        key={star}
                        variant={filterRating === star.toString() ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => setFilterRating(star.toString())}
                      >
                        {star} <FiStar size={12} />
                      </Button>
                    ))}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Reviews List */}
          <Row>
            <Col lg={12}>
              {filteredReviews.length === 0 ? (
                <Card className="empty-state">
                  <Card.Body className="text-center py-5">
                    <FiMessageSquare size={64} className="mb-3 opacity-25" />
                    <h5>Chưa có đánh giá nào</h5>
                    <p className="text-muted">Các đánh giá của bạn sẽ hiển thị ở đây</p>
                  </Card.Body>
                </Card>
              ) : (
                filteredReviews.map(review => (
                  <Card key={review.id} className="review-card mb-3">
                    <Card.Body>
                      <div className="review-header">
                        <div>
                          <h6 className="mb-1">{review.orderNumber}</h6>
                          <p className="mb-0 text-muted small">{review.serviceName}</p>
                        </div>
                        <div className="text-end">
                          <div className="overall-stars mb-1">
                            {renderStars(Math.round(parseFloat(calculateAverage(review))))}
                            <span className="ms-2 fw-bold">{calculateAverage(review)}</span>
                          </div>
                          <p className="mb-0 text-muted small">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      <div className="aspects-rating mt-3">
                        {aspects.map(aspect => (
                          <div key={aspect.key} className="aspect-row">
                            <span className="aspect-label">
                              <span className="aspect-icon">{aspect.icon}</span>
                              {aspect.label}
                            </span>
                            {renderStars(review[aspect.key])}
                          </div>
                        ))}
                      </div>

                      <div className="review-comment mt-3">
                        <p className="mb-0">{review.comment}</p>
                      </div>

                      {review.response && (
                        <div className="review-response mt-3">
                          <Badge bg="info" className="mb-2">Phản hồi từ cửa hàng</Badge>
                          <p className="mb-0">{review.response}</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                ))
              )}
            </Col>
          </Row>
        </Container>

        {/* Review Modal */}
        <Modal show={showReviewModal} onHide={handleCloseReviewModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <FiStar className="me-2" />
              Đánh giá dịch vụ
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <>
                <div className="order-info mb-4">
                  <h6>{selectedOrder.orderNumber}</h6>
                  <p className="text-muted mb-0">
                    {selectedOrder.services.map(s => s.name).join(', ')}
                  </p>
                </div>

                <div className="aspects-form">
                  {aspects.map(aspect => (
                    <div key={aspect.key} className="aspect-form-row">
                      <div className="aspect-info">
                        <span className="aspect-icon">{aspect.icon}</span>
                        <span className="aspect-label">{aspect.label}</span>
                      </div>
                      {renderStars(
                        reviewForm[aspect.key], 
                        true, 
                        (rating) => handleRatingChange(aspect.key, rating)
                      )}
                    </div>
                  ))}
                </div>

                <Form.Group className="mt-4">
                  <Form.Label>Nhận xét của bạn *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseReviewModal}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSubmitReview}>
              <FiCheck className="me-2" />
              Gửi đánh giá
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default Ratings;