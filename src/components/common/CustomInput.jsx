import { Form } from 'react-bootstrap';

function CustomInput({ 
  label,
  type = 'text',
  error,
  helpText,
  required = false,
  icon = null,
  ...props 
}) {
  return (
    <Form.Group className="mb-3">
      {label && (
        <Form.Label>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}
      
      <div className="position-relative">
        {icon && (
          <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
            {icon}
          </div>
        )}
        <Form.Control
          type={type}
          isInvalid={!!error}
          className={icon ? 'ps-5' : ''}
          {...props}
        />
        {error && (
          <Form.Control.Feedback type="invalid">
            {error}
          </Form.Control.Feedback>
        )}
      </div>
      
      {helpText && !error && (
        <Form.Text className="text-muted">
          {helpText}
        </Form.Text>
      )}
    </Form.Group>
  );
}

export default CustomInput;
