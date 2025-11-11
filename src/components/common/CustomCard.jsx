import { Card } from 'react-bootstrap';

function CustomCard({ 
  title,
  subtitle,
  children,
  footer,
  hover = false,
  className = '',
  headerActions = null,
  ...props 
}) {
  return (
    <Card 
      className={`${hover ? 'card-hover' : ''} ${className}`}
      {...props}
    >
      {(title || subtitle || headerActions) && (
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            {title && <Card.Title className="mb-0">{title}</Card.Title>}
            {subtitle && <Card.Subtitle className="text-muted mt-1">{subtitle}</Card.Subtitle>}
          </div>
          {headerActions && <div>{headerActions}</div>}
        </Card.Header>
      )}
      
      <Card.Body>{children}</Card.Body>
      
      {footer && <Card.Footer>{footer}</Card.Footer>}
    </Card>
  );
}

export default CustomCard;
