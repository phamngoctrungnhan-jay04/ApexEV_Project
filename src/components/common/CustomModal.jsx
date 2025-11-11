import { Modal, Button } from 'react-bootstrap';

function CustomModal({ 
  show,
  onHide,
  title,
  children,
  size = 'md',
  footer = true,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  confirmVariant = 'primary',
  loading = false,
  ...props 
}) {
  return (
    <Modal show={show} onHide={onHide} size={size} centered {...props}>
      {title && (
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
      )}
      
      <Modal.Body>{children}</Modal.Body>
      
      {footer && (
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            {cancelText}
          </Button>
          {onConfirm && (
            <Button 
              variant={confirmVariant} 
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : confirmText}
            </Button>
          )}
        </Modal.Footer>
      )}
    </Modal>
  );
}

export default CustomModal;
