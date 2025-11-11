import { Button } from 'react-bootstrap';
import { Spinner } from 'react-bootstrap';

function CustomButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  fullWidth = false,
  ...props 
}) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={`${fullWidth ? 'w-100' : ''} d-inline-flex align-items-center justify-content-center gap-2`}
      {...props}
    >
      {loading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          <span>Đang xử lý...</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </Button>
  );
}

export default CustomButton;
