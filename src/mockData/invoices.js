// Mock Invoices Data
export const invoices = [
  {
    id: 1,
    invoiceNumber: 'INV-2024-001',
    orderId: 1,
    customerId: 1,
    vehicleId: 1,
    issueDate: '2024-11-20',
    dueDate: '2024-12-05',
    paidDate: '2024-11-20',
    status: 'paid',
    subtotal: 1300000,
    discount: 0,
    discountType: null,
    tax: 0, // VAT included
    totalAmount: 1300000,
    paidAmount: 1300000,
    paymentMethod: 'credit-card',
    items: [
      {
        type: 'service',
        id: 1,
        name: 'Bảo dưỡng định kỳ cơ bản',
        quantity: 1,
        unitPrice: 500000,
        subtotal: 500000
      },
      {
        type: 'service',
        id: 3,
        name: 'Kiểm tra và bảo dưỡng pin',
        quantity: 1,
        unitPrice: 800000,
        subtotal: 800000
      }
    ],
    notes: 'Thanh toán đầy đủ',
    createdAt: '2024-11-20T11:30:00Z'
  },
  {
    id: 2,
    invoiceNumber: 'INV-2024-002',
    orderId: 2,
    customerId: 2,
    vehicleId: 2,
    issueDate: '2024-11-15',
    dueDate: '2024-11-30',
    paidDate: '2024-11-15',
    status: 'paid',
    subtotal: 1500000,
    discount: 0,
    discountType: null,
    tax: 0,
    totalAmount: 1500000,
    paidAmount: 1500000,
    paymentMethod: 'e-wallet',
    items: [
      {
        type: 'service',
        id: 2,
        name: 'Bảo dưỡng định kỳ nâng cao',
        quantity: 1,
        unitPrice: 1200000,
        subtotal: 1200000
      },
      {
        type: 'service',
        id: 7,
        name: 'Cập nhật phần mềm hệ thống',
        quantity: 1,
        unitPrice: 300000,
        subtotal: 300000
      }
    ],
    notes: 'Thanh toán qua MoMo',
    createdAt: '2024-11-15T17:00:00Z'
  },
  {
    id: 3,
    invoiceNumber: 'INV-2024-003',
    orderId: 3,
    customerId: 3,
    vehicleId: 3,
    issueDate: '2024-11-28',
    dueDate: '2024-12-13',
    paidDate: '2024-11-28',
    status: 'paid',
    subtotal: 3200000,
    discount: 200000,
    discountType: 'loyalty',
    tax: 0,
    totalAmount: 3000000,
    paidAmount: 3000000,
    paymentMethod: 'bank-transfer',
    items: [
      {
        type: 'service',
        id: 6,
        name: 'Kiểm tra và thay phanh',
        quantity: 1,
        unitPrice: 700000,
        subtotal: 700000
      },
      {
        type: 'part',
        id: 1,
        name: 'Má phanh trước',
        quantity: 1,
        unitPrice: 1200000,
        subtotal: 1200000
      },
      {
        type: 'part',
        id: 13,
        name: 'Đĩa phanh trước',
        quantity: 1,
        unitPrice: 1300000,
        subtotal: 1300000
      }
    ],
    notes: 'Giảm giá khách hàng thân thiết 200.000đ',
    createdAt: '2024-11-28T09:30:00Z'
  },
  {
    id: 4,
    invoiceNumber: 'INV-2024-004',
    orderId: 4,
    customerId: 4,
    vehicleId: 4,
    issueDate: '2024-10-28',
    dueDate: '2024-11-12',
    paidDate: '2024-10-28',
    status: 'paid',
    subtotal: 950000,
    discount: 0,
    discountType: null,
    tax: 0,
    totalAmount: 950000,
    paidAmount: 950000,
    paymentMethod: 'cash',
    items: [
      {
        type: 'service',
        id: 10,
        name: 'Kiểm tra hệ thống điều hòa',
        quantity: 1,
        unitPrice: 500000,
        subtotal: 500000
      },
      {
        type: 'part',
        id: 5,
        name: 'Lọc gió cabin HEPA',
        quantity: 1,
        unitPrice: 450000,
        subtotal: 450000
      }
    ],
    notes: 'Thanh toán tiền mặt',
    createdAt: '2024-10-28T11:00:00Z'
  },
  {
    id: 5,
    invoiceNumber: 'INV-2024-005',
    orderId: 5,
    customerId: 5,
    vehicleId: 5,
    issueDate: '2024-11-25',
    dueDate: '2024-12-10',
    paidDate: '2024-11-25',
    status: 'paid',
    subtotal: 1600000,
    discount: 100000,
    discountType: 'package',
    tax: 0,
    totalAmount: 1500000,
    paidAmount: 1500000,
    paymentMethod: 'credit-card',
    items: [
      {
        type: 'service',
        id: 1,
        name: 'Bảo dưỡng định kỳ cơ bản',
        quantity: 1,
        unitPrice: 500000,
        subtotal: 500000
      },
      {
        type: 'service',
        id: 8,
        name: 'Vệ sinh và chăm sóc nội thất',
        quantity: 1,
        unitPrice: 600000,
        subtotal: 600000
      },
      {
        type: 'service',
        id: 9,
        name: 'Rửa xe và đánh bóng',
        quantity: 1,
        unitPrice: 400000,
        subtotal: 400000
      }
    ],
    notes: 'Gói combo giảm 100.000đ',
    createdAt: '2024-11-25T15:30:00Z'
  },
  {
    id: 15,
    invoiceNumber: 'INV-2024-015',
    orderId: 15,
    customerId: 1,
    vehicleId: 1,
    issueDate: '2024-09-10',
    dueDate: '2024-09-25',
    paidDate: '2024-09-10',
    status: 'paid',
    subtotal: 600000,
    discount: 0,
    discountType: null,
    tax: 0,
    totalAmount: 600000,
    paidAmount: 600000,
    paymentMethod: 'e-wallet',
    items: [
      {
        type: 'service',
        id: 15,
        name: 'Thay nước làm mát',
        quantity: 1,
        unitPrice: 600000,
        subtotal: 600000
      }
    ],
    notes: 'Thanh toán ZaloPay',
    createdAt: '2024-09-10T11:15:00Z'
  },
  {
    id: 16,
    invoiceNumber: 'INV-2024-016',
    orderId: 16,
    customerId: 3,
    vehicleId: 3,
    issueDate: '2024-08-15',
    dueDate: '2024-08-30',
    paidDate: '2024-08-15',
    status: 'paid',
    subtotal: 2200000,
    discount: 100000,
    discountType: 'loyalty',
    tax: 0,
    totalAmount: 2100000,
    paidAmount: 2100000,
    paymentMethod: 'bank-transfer',
    items: [
      {
        type: 'service',
        id: 2,
        name: 'Bảo dưỡng định kỳ nâng cao',
        quantity: 1,
        unitPrice: 1200000,
        subtotal: 1200000
      },
      {
        type: 'service',
        id: 7,
        name: 'Cập nhật phần mềm hệ thống',
        quantity: 1,
        unitPrice: 300000,
        subtotal: 300000
      },
      {
        type: 'service',
        id: 15,
        name: 'Thay nước làm mát',
        quantity: 1,
        unitPrice: 600000,
        subtotal: 600000
      },
      {
        type: 'part',
        id: 6,
        name: 'Nước làm mát EV chuyên dụng',
        quantity: 1,
        unitPrice: 100000,
        subtotal: 100000
      }
    ],
    notes: 'Khách hàng VIP - giảm 100.000đ',
    createdAt: '2024-08-15T11:30:00Z'
  },
  {
    id: 17,
    invoiceNumber: 'INV-2024-017',
    orderId: 17,
    customerId: 5,
    vehicleId: 5,
    issueDate: '2024-07-20',
    dueDate: '2024-08-05',
    paidDate: '2024-07-20',
    status: 'paid',
    subtotal: 3200000,
    discount: 0,
    discountType: null,
    tax: 0,
    totalAmount: 3200000,
    paidAmount: 3200000,
    paymentMethod: 'credit-card',
    items: [
      {
        type: 'service',
        id: 11,
        name: 'Kiểm tra hệ thống treo',
        quantity: 1,
        unitPrice: 700000,
        subtotal: 700000
      },
      {
        type: 'part',
        id: 10,
        name: 'Giảm xóc trước',
        quantity: 2,
        unitPrice: 1250000,
        subtotal: 2500000
      }
    ],
    notes: 'Đã thay 2 giảm xóc trước',
    createdAt: '2024-07-20T10:30:00Z'
  },
  {
    id: 18,
    invoiceNumber: 'INV-2024-018',
    orderId: 18,
    customerId: 9,
    vehicleId: 9,
    issueDate: '2024-06-25',
    dueDate: '2024-07-10',
    paidDate: '2024-06-25',
    status: 'paid',
    subtotal: 800000,
    discount: 0,
    discountType: null,
    tax: 0,
    totalAmount: 800000,
    paidAmount: 800000,
    paymentMethod: 'e-wallet',
    items: [
      {
        type: 'service',
        id: 1,
        name: 'Bảo dưỡng định kỳ cơ bản',
        quantity: 1,
        unitPrice: 500000,
        subtotal: 500000
      },
      {
        type: 'service',
        id: 7,
        name: 'Cập nhật phần mềm hệ thống',
        quantity: 1,
        unitPrice: 300000,
        subtotal: 300000
      }
    ],
    notes: 'Bảo dưỡng 10.000km',
    createdAt: '2024-06-25T16:00:00Z'
  },
  {
    id: 19,
    invoiceNumber: 'INV-2024-019',
    orderId: 19,
    customerId: 7,
    vehicleId: 7,
    issueDate: '2024-05-10',
    dueDate: '2024-05-25',
    paidDate: '2024-05-10',
    status: 'paid',
    subtotal: 800000,
    discount: 0,
    discountType: null,
    tax: 0,
    totalAmount: 800000,
    paidAmount: 800000,
    paymentMethod: 'cash',
    items: [
      {
        type: 'service',
        id: 3,
        name: 'Kiểm tra và bảo dưỡng pin',
        quantity: 1,
        unitPrice: 800000,
        subtotal: 800000
      }
    ],
    notes: 'Pin trong tình trạng tốt - 96%',
    createdAt: '2024-05-10T11:45:00Z'
  },
  {
    id: 20,
    invoiceNumber: 'INV-2024-020',
    orderId: 20,
    customerId: 2,
    vehicleId: 2,
    issueDate: '2024-04-18',
    dueDate: '2024-05-03',
    paidDate: '2024-04-18',
    status: 'paid',
    subtotal: 1000000,
    discount: 0,
    discountType: null,
    tax: 0,
    totalAmount: 1000000,
    paidAmount: 1000000,
    paymentMethod: 'credit-card',
    items: [
      {
        type: 'service',
        id: 8,
        name: 'Vệ sinh và chăm sóc nội thất',
        quantity: 1,
        unitPrice: 600000,
        subtotal: 600000
      },
      {
        type: 'service',
        id: 9,
        name: 'Rửa xe và đánh bóng',
        quantity: 1,
        unitPrice: 400000,
        subtotal: 400000
      }
    ],
    notes: 'Gói chăm sóc nội thất',
    createdAt: '2024-04-18T13:00:00Z'
  },
  {
    id: 6,
    invoiceNumber: 'INV-2024-006',
    orderId: 6,
    customerId: 1,
    vehicleId: 1,
    issueDate: '2024-12-05',
    dueDate: '2024-12-20',
    status: 'unpaid',
    subtotal: 300000,
    discount: 0,
    discountType: null,
    tax: 0,
    totalAmount: 300000,
    paidAmount: 0,
    paymentMethod: null,
    items: [
      {
        type: 'service',
        id: 7,
        name: 'Cập nhật phần mềm hệ thống',
        quantity: 1,
        unitPrice: 300000,
        subtotal: 300000
      }
    ],
    notes: 'Đang thực hiện dịch vụ',
    createdAt: '2024-12-05T09:00:00Z'
  },
  {
    id: 7,
    invoiceNumber: 'INV-2024-007',
    orderId: 7,
    customerId: 6,
    vehicleId: 6,
    issueDate: '2024-12-10',
    dueDate: '2024-12-25',
    status: 'pending',
    subtotal: 500000,
    discount: 0,
    discountType: null,
    tax: 0,
    totalAmount: 500000,
    paidAmount: 0,
    paymentMethod: null,
    items: [
      {
        type: 'service',
        id: 1,
        name: 'Bảo dưỡng định kỳ cơ bản',
        quantity: 1,
        unitPrice: 500000,
        subtotal: 500000
      }
    ],
    notes: 'Chưa thực hiện dịch vụ',
    createdAt: '2024-12-03T10:15:00Z'
  },
  {
    id: 8,
    invoiceNumber: 'INV-2024-008',
    orderId: 8,
    customerId: 7,
    vehicleId: 7,
    issueDate: '2024-12-08',
    dueDate: '2024-12-23',
    status: 'pending',
    subtotal: 10500000,
    discount: 0,
    discountType: null,
    tax: 0,
    totalAmount: 10500000,
    paidAmount: 0,
    paymentMethod: null,
    items: [
      {
        type: 'service',
        id: 4,
        name: 'Thay lốp xe',
        quantity: 1,
        unitPrice: 500000,
        subtotal: 500000
      },
      {
        type: 'part',
        id: 3,
        name: 'Lốp xe Michelin 235/55R19',
        quantity: 4,
        unitPrice: 2500000,
        subtotal: 10000000
      }
    ],
    notes: 'Đặt hàng lốp Michelin',
    createdAt: '2024-12-02T14:50:00Z'
  }
];

// Invoice statuses
export const invoiceStatuses = [
  { id: 'pending', name: 'Chờ xác nhận', nameEn: 'Pending', color: '#F59E0B' },
  { id: 'unpaid', name: 'Chưa thanh toán', nameEn: 'Unpaid', color: '#EF4444' },
  { id: 'partial', name: 'Thanh toán một phần', nameEn: 'Partially Paid', color: '#3B82F6' },
  { id: 'paid', name: 'Đã thanh toán', nameEn: 'Paid', color: '#10B981' },
  { id: 'overdue', name: 'Quá hạn', nameEn: 'Overdue', color: '#DC2626' },
  { id: 'cancelled', name: 'Đã hủy', nameEn: 'Cancelled', color: '#6B7280' }
];

// Discount types
export const discountTypes = [
  { id: 'loyalty', name: 'Khách hàng thân thiết', nameEn: 'Loyalty Discount' },
  { id: 'package', name: 'Gói combo', nameEn: 'Package Deal' },
  { id: 'promotion', name: 'Khuyến mãi', nameEn: 'Promotion' },
  { id: 'first-time', name: 'Khách hàng mới', nameEn: 'First-time Customer' },
  { id: 'seasonal', name: 'Theo mùa', nameEn: 'Seasonal Discount' }
];

export default invoices;
