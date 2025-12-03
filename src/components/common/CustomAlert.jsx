import { Alert } from 'react-bootstrap';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';

function CustomAlert({ 
  variant = 'info',
  title,
  children,
  dismissible = false,
  onClose,
  icon = true,
  floating = false,
  ...props 
}) {
  const icons = {
    success: <FiCheckCircle size={20} />,
    danger: <FiXCircle size={20} />,
    warning: <FiAlertCircle size={20} />,
    info: <FiInfo size={20} />
  };

  const floatingStyle = floating ? {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    minWidth: '300px',
    maxWidth: '400px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
  } : {};

  return (
    <Alert 
      variant={variant} 
      dismissible={dismissible}
      onClose={onClose}
      className="d-flex align-items-start gap-2"
      style={floatingStyle}
      {...props}
    >
      {icon && <div className="mt-1">{icons[variant]}</div>}
      <div className="flex-grow-1">
        {title && <Alert.Heading className="h6 mb-2">{title}</Alert.Heading>}
        <div>{children}</div>
      </div>
    </Alert>
  );
}

export default CustomAlert;
