// Mock Data Index - Central export for all mock data

// Import data files
import customersData from './customers.js';
import vehiclesData from './vehicles.js';
import servicesData from './services.js';
import partsData from './parts.js';
import techniciansData from './technicians.js';
import ordersData from './orders.js';
import invoicesData from './invoices.js';
import notificationsData from './notifications.js';
import reviewsData from './reviews.js';
import checklistTemplatesData from './checklistTemplates.js';

// Data files
export { default as customers } from './customers.js';
export { default as vehicles } from './vehicles.js';
export { default as services, serviceCategories } from './services.js';
export { default as parts, partCategories } from './parts.js';
export { default as technicians, technicianRoles, specializations } from './technicians.js';
export { default as orders, orderStatuses, paymentStatuses, paymentMethods } from './orders.js';
export { default as invoices, invoiceStatuses, discountTypes } from './invoices.js';
export { default as notifications, notificationTypes } from './notifications.js';
export { default as reviews, reviewAspects, getReviewStats } from './reviews.js';
export { 
  default as checklistTemplates, 
  checklistCategories, 
  vehicleTypes, 
  getTemplateById, 
  getTemplatesByVehicleType, 
  getTemplatesByCategory 
} from './checklistTemplates.js';

// Helper functions to get related data
export const getCustomerById = (customerId) => {
  return customersData.find(c => c.id === customerId);
};

export const getVehicleById = (vehicleId) => {
  return vehiclesData.find(v => v.id === vehicleId);
};

export const getVehiclesByCustomer = (customerId) => {
  return vehiclesData.filter(v => v.customerId === customerId);
};

export const getServiceById = (serviceId) => {
  return servicesData.find(s => s.id === serviceId);
};

export const getTechnicianById = (technicianId) => {
  return techniciansData.find(t => t.id === technicianId);
};

export const getOrdersByCustomer = (customerId) => {
  return ordersData.filter(o => o.customerId === customerId);
};

export const getOrdersByTechnician = (technicianId) => {
  return ordersData.filter(o => o.technicianId === technicianId);
};

export const getInvoicesByCustomer = (customerId) => {
  return invoicesData.filter(i => i.customerId === customerId);
};

export const getNotificationsByUser = (userId, userRole) => {
  return notificationsData.filter(n => n.userId === userId && n.userRole === userRole);
};

export const getUnreadNotifications = (userId, userRole) => {
  return notificationsData.filter(n => n.userId === userId && n.userRole === userRole && !n.isRead);
};

export const getReviewsByCustomer = (customerId) => {
  return reviewsData.filter(r => r.customerId === customerId);
};

export const getReviewsByTechnician = (technicianId) => {
  return reviewsData.filter(r => r.technicianId === technicianId);
};

export const getUpcomingOrders = (customerId) => {
  const now = new Date();
  return ordersData
    .filter(o => o.customerId === customerId && (o.status === 'pending' || o.status === 'confirmed'))
    .filter(o => new Date(o.scheduledDate) >= now)
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
};

export const getActiveOrders = (customerId) => {
  return ordersData.filter(o => o.customerId === customerId && o.status === 'in-progress');
};

export const getCompletedOrders = (customerId) => {
  return ordersData
    .filter(o => o.customerId === customerId && o.status === 'completed')
    .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
};

export const getPendingInvoices = (customerId) => {
  return invoicesData.filter(i => i.customerId === customerId && (i.status === 'pending' || i.status === 'unpaid'));
};

export const calculateCustomerStats = (customerId) => {
  const customerOrders = ordersData.filter(o => o.customerId === customerId);
  const completedOrders = customerOrders.filter(o => o.status === 'completed');
  const totalSpent = invoicesData
    .filter(i => i.customerId === customerId && i.status === 'paid')
    .reduce((sum, i) => sum + i.totalAmount, 0);
  const upcomingBookings = customerOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;

  return {
    totalMaintenance: completedOrders.length,
    totalSpent,
    upcomingBookings,
    completedOrders: completedOrders.length
  };
};
