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
    INVOICES: '/customer/invoices',
    CHAT: '/customer/chat',
    RATINGS: '/customer/ratings',
    SETTINGS: '/customer/settings'
  },
  
  // Technician routes
  TECHNICIAN: {
    DASHBOARD: '/technician/dashboard',
    WORK_LIST: '/technician/work-list',
    WORK_DETAIL: '/technician/work-detail/:id',
    DOCUMENTS: '/technician/documents'
  },
  
  // Service Advisor routes
  ADVISOR: {
    DASHBOARD: '/advisor/dashboard',
    PROFILE: '/advisor/profile',
    APPOINTMENTS: '/advisor/appointments',
    ORDERS: '/advisor/orders',
    ORDER_DETAIL: '/advisor/orders/:id',
    CHAT: '/advisor/chat'
  },
  
  // Manager routes
  MANAGER: {
    DASHBOARD: '/manager/dashboard',
    EMPLOYEES: '/manager/employees',
    SHIFTS: '/manager/shifts',
    FINANCE: '/manager/finance',
    PARTS: '/manager/parts'
  },
  
  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    REGISTER_USER: '/admin/register-user',
    PROFILE: '/admin/profile',
    ROLES: '/admin/roles',
    SERVICES: '/admin/services',
    CHECKLISTS: '/admin/checklists',
    TEMPLATES: '/admin/templates',
    SETTINGS: '/admin/settings',
    LOGS: '/admin/logs'
  }
};

export default ROUTES;
