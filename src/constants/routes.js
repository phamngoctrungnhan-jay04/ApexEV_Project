// Routes paths
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Customer routes
  CUSTOMER: {
    HOMEPAGE: '/Homepage',
    DASHBOARD: '/customer/dashboard',
    BOOKING: '/customer/booking',
    PROFILE: '/customer/profile',
    HISTORY: '/customer/history',
    ORDER_TRACKING: '/customer/order-tracking/:orderId',
    ORDER_DETAIL: '/customer/order/:orderId',
    INVOICES: '/customer/invoices',
    CHAT: '/customer/chat',
    RATINGS: '/customer/ratings',
    SETTINGS: '/customer/settings',
    VEHICLES: '/customer/vehicles'
  },
  
  // Technician routes
  TECHNICIAN: {
    DASHBOARD: '/technician/dashboard',
    JOBS: '/technician/jobs',
    CHECKLIST: '/technician/checklist',
    PARTS_REQUEST: '/technician/parts-request',
    UPLOAD_EVIDENCE: '/technician/upload-evidence',
    PROFILE: '/technician/profile',
    WORK_LIST: '/technician/work-list',
    WORK_DETAIL: '/technician/work-detail/:id',
    DOCUMENTS: '/technician/documents'
  },
  
  // Service Advisor routes
  ADVISOR: {
    DASHBOARD: '/advisor/dashboard',
    PROFILE: '/advisor/profile',
    APPOINTMENTS: '/advisor/appointments',
    PARTS_APPROVAL: '/advisor/parts-approval',
    ORDERS: '/advisor/orders',
    ORDER_DETAIL: '/advisor/orders/:id',
    CHAT: '/advisor/chat'
  },
  
  // Manager routes (BUSINESS_MANAGER - Quản lý Tài chính)
  MANAGER: {
    DASHBOARD: '/manager/dashboard',
    FINANCE: '/manager/finance',
    INVOICES: '/manager/invoices',
    OVERDUE: '/manager/overdue',
    REPORTS: '/manager/reports',
    PROFILE: '/manager/profile'
  },
  
  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    REGISTER_USER: '/admin/register-user',
    PROFILE: '/admin/profile',
    ROLES: '/admin/roles',
    SERVICES: '/admin/services',
    PARTS: '/admin/parts',
    CHECKLISTS: '/admin/checklists',
    TEMPLATES: '/admin/templates',
    SETTINGS: '/admin/settings',
    LOGS: '/admin/logs'
  }
};

export default ROUTES;
