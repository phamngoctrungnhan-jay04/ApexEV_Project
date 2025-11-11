// Status constants
export const STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  WAITING_PARTS: 'waiting-parts',
  READY: 'ready'
};

export const STATUS_LABELS = {
  [STATUS.PENDING]: 'Chờ xử lý',
  [STATUS.IN_PROGRESS]: 'Đang thực hiện',
  [STATUS.COMPLETED]: 'Hoàn thành',
  [STATUS.CANCELLED]: 'Đã hủy',
  [STATUS.WAITING_PARTS]: 'Chờ phụ tùng',
  [STATUS.READY]: 'Sẵn sàng'
};

export const STATUS_COLORS = {
  [STATUS.PENDING]: 'warning',
  [STATUS.IN_PROGRESS]: 'primary',
  [STATUS.COMPLETED]: 'success',
  [STATUS.CANCELLED]: 'danger',
  [STATUS.WAITING_PARTS]: 'info',
  [STATUS.READY]: 'secondary'
};

export default STATUS;
