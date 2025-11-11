import { Form } from 'react-bootstrap';

function CustomSelect({ 
  label,
  options = [],
  error,
  helpText,
  required = false,
  placeholder = 'Chọn...',
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
      
      <Form.Select
        isInvalid={!!error}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </Form.Select>
      
      {error && (
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      )}
      
      {helpText && !error && (
        <Form.Text className="text-muted">
          {helpText}
        </Form.Text>
      )}
    </Form.Group>
  );
}

export default CustomSelect;
