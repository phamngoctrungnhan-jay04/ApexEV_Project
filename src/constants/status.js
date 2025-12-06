// Status constants
export const STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_SERVICE: 'in-service',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  WAITING_PARTS: 'waiting-parts',
  READY: 'ready'
};

export const STATUS_LABELS = {
  [STATUS.PENDING]: 'Chờ xác nhận',
  [STATUS.CONFIRMED]: 'Đã xác nhận',
  [STATUS.IN_SERVICE]: 'Đang bảo dưỡng',
  [STATUS.IN_PROGRESS]: 'Đang thực hiện',
  [STATUS.COMPLETED]: 'Hoàn thành',
  [STATUS.CANCELLED]: 'Đã hủy',
  [STATUS.WAITING_PARTS]: 'Chờ phụ tùng',
  [STATUS.READY]: 'Sẵn sàng'
};

export const STATUS_COLORS = {
  [STATUS.PENDING]: 'warning',
  [STATUS.CONFIRMED]: 'info',
  [STATUS.IN_SERVICE]: 'primary',
  [STATUS.IN_PROGRESS]: 'primary',
  [STATUS.COMPLETED]: 'success',
  [STATUS.CANCELLED]: 'danger',
  [STATUS.WAITING_PARTS]: 'info',
  [STATUS.READY]: 'secondary'
};

export default STATUS;
