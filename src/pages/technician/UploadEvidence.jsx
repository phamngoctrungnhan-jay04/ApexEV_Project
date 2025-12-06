import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Badge, ProgressBar, Toast, ToastContainer } from 'react-bootstrap';
import { FiUpload, FiTrash2, FiEye, FiImage, FiVideo, FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import { uploadTechnicianFile, deleteFile, validateFile } from '../../services/uploadService';
import './UploadEvidence.css';

const UploadEvidence = () => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  // File validation constants
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'];
  const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Process and validate files
  const handleFiles = (fileList) => {
    const validFiles = [];
    const errors = [];

    Array.from(fileList).forEach((file) => {
      // Validate file type
      if (!ALL_ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Định dạng không hợp lệ. Chỉ chấp nhận ảnh (jpg, png, gif, webp) và video (mp4, mov, avi).`);
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Kích thước quá lớn. Tối đa 50MB.`);
        return;
      }

      // Create file object with preview
      const fileObj = {
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        status: 'pending' // pending, uploading, uploaded, error
      };

      validFiles.push(fileObj);
    });

    // Show errors if any
    if (errors.length > 0) {
      showToast(errors.join('\n'), 'danger');
    }

    // Upload valid files
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      validFiles.forEach(fileObj => {
        uploadToS3(fileObj);
      });
    }
  };

  // Upload file to AWS S3
  const uploadToS3 = async (fileObj) => {
    // Update status to uploading
    setFiles(prev => prev.map(f => 
      f.id === fileObj.id ? { ...f, status: 'uploading' } : f
    ));
    setUploadProgress(prev => ({ ...prev, [fileObj.id]: 10 }));

    try {
      // Simulate progress updates
      setUploadProgress(prev => ({ ...prev, [fileObj.id]: 30 }));
      
      // Upload to S3
      const response = await uploadTechnicianFile(fileObj.file, 'evidence');
      
      setUploadProgress(prev => ({ ...prev, [fileObj.id]: 80 }));
      
      // Update file with S3 key
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id 
          ? { ...f, status: 'uploaded', s3Key: response.s3Key, mediaType: response.mediaType } 
          : f
      ));
      
      setUploadProgress(prev => ({ ...prev, [fileObj.id]: 100 }));
      
      // Remove progress after a short delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileObj.id];
          return newProgress;
        });
      }, 500);
      
      showToast(`✅ Upload thành công: ${fileObj.name}`, 'success');
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, status: 'error' } : f
      ));
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileObj.id];
        return newProgress;
      });
      showToast(`❌ Upload thất bại: ${fileObj.name}`, 'danger');
    }
  };

  // Delete file
  const handleDeleteFile = (fileId) => {
    setFileToDelete(fileId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (fileToDelete) {
      const fileToRemove = files.find(f => f.id === fileToDelete);
      
      try {
        // Nếu file đã upload lên S3, xóa trên S3
        if (fileToRemove?.s3Key) {
          await deleteS3File(fileToRemove.s3Key);
          showToast('✅ Đã xóa file thành công', 'success');
        }
      } catch (error) {
        console.error('Error deleting from S3:', error);
        showToast('⚠️ Không thể xóa file trên S3', 'warning');
      }

      // Xóa khỏi state local
      setFiles(prev => {
        const file = prev.find(f => f.id === fileToDelete);
        if (file && file.preview) {
          URL.revokeObjectURL(file.preview);
        }
        return prev.filter(f => f.id !== fileToDelete);
      });
      setShowDeleteConfirm(false);
      setFileToDelete(null);
    }
  };

  // View file in gallery
  const handleViewFile = (file) => {
    setSelectedFile(file);
    setShowGallery(true);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file type icon
  const getFileTypeIcon = (type) => {
    if (ALLOWED_IMAGE_TYPES.includes(type)) {
      return <FiImage className="file-type-icon image" />;
    } else if (ALLOWED_VIDEO_TYPES.includes(type)) {
      return <FiVideo className="file-type-icon video" />;
    }
    return null;
  };

  // Calculate total uploaded files
  const uploadedCount = files.filter(f => f.status === 'uploaded').length;
  const uploadingCount = files.filter(f => f.status === 'uploading').length;

  return (
    <Container fluid className="upload-evidence-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Upload Ảnh/Video Bằng Chứng</h2>
          <p className="text-muted">Tải lên hình ảnh và video minh chứng cho quá trình bảo dưỡng</p>
        </div>
        <div className="header-stats">
          <Badge bg="success" className="stat-badge">
            <FiCheckCircle /> {uploadedCount} đã tải lên
          </Badge>
          {uploadingCount > 0 && (
            <Badge bg="warning" className="stat-badge">
              <FiUpload /> {uploadingCount} đang tải
            </Badge>
          )}
        </div>
      </div>

      <Row>
        {/* Upload Zone */}
        <Col lg={4} className="mb-4">
          <Card className="upload-card">
            <Card.Body>
              <h5 className="mb-3">Tải lên tệp</h5>
              
              {/* Drag & Drop Zone */}
              <div
                className={`drop-zone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <FiUpload className="upload-icon" />
                <p className="mb-2"><strong>Kéo thả tệp vào đây</strong></p>
                <p className="text-muted mb-3">hoặc</p>
                <Button variant="primary" size="sm">
                  Chọn tệp
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ALL_ALLOWED_TYPES.join(',')}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>

              {/* File Info */}
              <Alert variant="info" className="mt-3 file-info">
                <FiAlertCircle className="me-2" />
                <small>
                  <strong>Định dạng:</strong> JPG, PNG, GIF, WEBP, MP4, MOV, AVI<br />
                  <strong>Kích thước tối đa:</strong> 50MB/tệp
                </small>
              </Alert>

              {/* AWS S3 Info */}
              <Alert variant="success" className="mt-2">
                <small>
                  <strong>📦 Storage:</strong> AWS S3<br />
                  <em>Tệp được lưu trữ an toàn trên Amazon S3</em>
                </small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>

        {/* File Preview Grid */}
        <Col lg={8}>
          <Card className="files-card">
            <Card.Body>
              <h5 className="mb-3">Tệp đã tải lên ({files.length})</h5>
              
              {files.length === 0 ? (
                <div className="empty-state">
                  <FiImage size={64} className="text-muted mb-3" />
                  <p className="text-muted">Chưa có tệp nào được tải lên</p>
                  <p className="text-muted"><small>Kéo thả hoặc chọn tệp để bắt đầu</small></p>
                </div>
              ) : (
                <Row className="file-grid">
                  {files.map((file) => (
                    <Col key={file.id} sm={6} md={4} lg={3} className="mb-3">
                      <Card className="file-preview-card">
                        {/* File Preview */}
                        <div className="file-preview" onClick={() => handleViewFile(file)}>
                          {ALLOWED_IMAGE_TYPES.includes(file.type) ? (
                            <img src={file.preview} alt={file.name} />
                          ) : (
                            <div className="video-preview">
                              <video src={file.preview} />
                              <div className="video-overlay">
                                <FiVideo size={32} />
                              </div>
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          {file.status === 'uploaded' && (
                            <div className="status-badge success">
                              <FiCheckCircle size={16} />
                            </div>
                          )}
                          {file.status === 'uploading' && (
                            <div className="status-badge warning">
                              <FiUpload size={16} />
                            </div>
                          )}
                        </div>

                        {/* Upload Progress */}
                        {file.status === 'uploading' && uploadProgress[file.id] && (
                          <ProgressBar 
                            now={uploadProgress[file.id]} 
                            variant="warning" 
                            className="upload-progress"
                            label={`${Math.round(uploadProgress[file.id])}%`}
                          />
                        )}

                        {/* File Info */}
                        <Card.Body className="p-2">
                          <div className="d-flex align-items-start justify-content-between mb-1">
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                              <p className="file-name mb-0" title={file.name}>
                                {getFileTypeIcon(file.type)}
                                {file.name}
                              </p>
                              <small className="text-muted">{formatFileSize(file.size)}</small>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="file-actions">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleViewFile(file)}
                            >
                              <FiEye size={14} />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteFile(file.id)}
                              disabled={file.status === 'uploading'}
                            >
                              <FiTrash2 size={14} />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gallery Modal */}
      <Modal 
        show={showGallery} 
        onHide={() => setShowGallery(false)} 
        size="lg" 
        centered
        className="gallery-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedFile && (
              <>
                {getFileTypeIcon(selectedFile.type)}
                {selectedFile.name}
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFile && (
            <>
              <div className="gallery-preview">
                {ALLOWED_IMAGE_TYPES.includes(selectedFile.type) ? (
                  <img src={selectedFile.preview} alt={selectedFile.name} />
                ) : (
                  <video src={selectedFile.preview} controls />
                )}
              </div>
              <div className="gallery-info mt-3">
                <Row>
                  <Col md={6}>
                    <p><strong>Kích thước:</strong> {formatFileSize(selectedFile.size)}</p>
                    <p><strong>Định dạng:</strong> {selectedFile.type}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Tải lên lúc:</strong> {new Date(selectedFile.uploadedAt).toLocaleString('vi-VN')}</p>
                    <p><strong>Trạng thái:</strong> 
                      {selectedFile.status === 'uploaded' && (
                        <Badge bg="success" className="ms-2">
                          <FiCheckCircle /> Đã tải lên
                        </Badge>
                      )}
                    </p>
                  </Col>
                </Row>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowGallery(false)}>
            Đóng
          </Button>
          <Button 
            variant="danger" 
            onClick={() => {
              setShowGallery(false);
              handleDeleteFile(selectedFile.id);
            }}
          >
            <FiTrash2 className="me-2" />
            Xóa tệp
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        show={showDeleteConfirm} 
        onHide={() => setShowDeleteConfirm(false)} 
        centered
        className="delete-confirm-modal"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            <FiAlertCircle className="text-danger me-2" />
            Xác nhận xóa
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa tệp này không?</p>
          <p className="text-muted"><small>Hành động này không thể hoàn tác.</small></p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowDeleteConfirm(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <FiTrash2 className="me-2" />
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast 
          show={toast.show} 
          onClose={() => setToast({ ...toast, show: false })}
          delay={3000}
          autohide
          bg={toast.variant}
        >
          <Toast.Header>
            <strong className="me-auto">Thông báo</strong>
          </Toast.Header>
          <Toast.Body className={toast.variant === 'success' || toast.variant === 'danger' ? 'text-white' : ''}>
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default UploadEvidence;
