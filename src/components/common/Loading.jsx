import { Spinner } from 'react-bootstrap';

function Loading({ size = 'md', text = 'Đang tải...', fullScreen = false }) {
  const spinnerSize = {
    sm: { width: '1rem', height: '1rem' },
    md: { width: '2rem', height: '2rem' },
    lg: { width: '3rem', height: '3rem' }
  }[size];

  const content = (
    <div className="text-center">
      <Spinner 
        animation="border" 
        variant="primary" 
        style={spinnerSize}
      />
      {text && <div className="mt-2 text-muted">{text}</div>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        {content}
      </div>
    );
  }

  return content;
}

export default Loading;
