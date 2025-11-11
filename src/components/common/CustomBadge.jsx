import { Badge } from 'react-bootstrap';
import { STATUS_COLORS } from '../../constants/status';

function CustomBadge({ 
  children,
  variant = 'primary',
  status = null,
  pill = false,
  icon = null,
  ...props 
}) {
  const badgeVariant = status ? STATUS_COLORS[status] : variant;
  
  return (
    <Badge 
      bg={badgeVariant} 
      pill={pill}
      className="d-inline-flex align-items-center gap-1"
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </Badge>
  );
}

export default CustomBadge;
