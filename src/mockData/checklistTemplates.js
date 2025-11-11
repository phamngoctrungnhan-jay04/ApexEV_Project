// Mock Checklist Templates Data

export const checklistTemplates = [
  {
    id: 1,
    name: 'Bảo dưỡng định kỳ - Xe Sedan',
    nameEn: 'Periodic Maintenance - Sedan',
    vehicleType: 'sedan',
    category: 'general-maintenance',
    estimatedDuration: 120, // minutes
    description: 'Quy trình kiểm tra và bảo dưỡng định kỳ cho xe Sedan điện',
    descriptionEn: 'Periodic inspection and maintenance procedure for electric Sedan',
    items: [
      // Battery System
      { id: 1, category: 'battery', task: 'Kiểm tra điện áp pin', taskEn: 'Check battery voltage', isRequired: true, estimatedTime: 10 },
      { id: 2, category: 'battery', task: 'Kiểm tra hệ thống làm mát pin', taskEn: 'Check battery cooling system', isRequired: true, estimatedTime: 15 },
      { id: 3, category: 'battery', task: 'Kiểm tra cáp và đầu nối pin', taskEn: 'Check battery cables and connectors', isRequired: true, estimatedTime: 10 },
      { id: 4, category: 'battery', task: 'Kiểm tra độ cân bằng cell pin', taskEn: 'Check battery cell balance', isRequired: true, estimatedTime: 15 },
      
      // Motor & Powertrain
      { id: 5, category: 'motor', task: 'Kiểm tra động cơ điện', taskEn: 'Check electric motor', isRequired: true, estimatedTime: 10 },
      { id: 6, category: 'motor', task: 'Kiểm tra hộp số (nếu có)', taskEn: 'Check transmission (if any)', isRequired: false, estimatedTime: 10 },
      { id: 7, category: 'motor', task: 'Kiểm tra hệ thống truyền động', taskEn: 'Check drivetrain system', isRequired: true, estimatedTime: 10 },
      
      // Brake System
      { id: 8, category: 'brake', task: 'Kiểm tra má phanh trước', taskEn: 'Check front brake pads', isRequired: true, estimatedTime: 10 },
      { id: 9, category: 'brake', task: 'Kiểm tra má phanh sau', taskEn: 'Check rear brake pads', isRequired: true, estimatedTime: 10 },
      { id: 10, category: 'brake', task: 'Kiểm tra dầu phanh', taskEn: 'Check brake fluid', isRequired: true, estimatedTime: 5 },
      { id: 11, category: 'brake', task: 'Kiểm tra đĩa phanh', taskEn: 'Check brake rotors', isRequired: true, estimatedTime: 10 },
      
      // Tire & Suspension
      { id: 12, category: 'tire', task: 'Kiểm tra áp suất lốp', taskEn: 'Check tire pressure', isRequired: true, estimatedTime: 5 },
      { id: 13, category: 'tire', task: 'Kiểm tra độ mòn lốp', taskEn: 'Check tire wear', isRequired: true, estimatedTime: 5 },
      { id: 14, category: 'suspension', task: 'Kiểm tra hệ thống treo', taskEn: 'Check suspension system', isRequired: true, estimatedTime: 10 },
      
      // Electrical System
      { id: 15, category: 'electrical', task: 'Kiểm tra đèn chiếu sáng', taskEn: 'Check lighting system', isRequired: true, estimatedTime: 5 },
      { id: 16, category: 'electrical', task: 'Kiểm tra hệ thống điện 12V', taskEn: 'Check 12V electrical system', isRequired: true, estimatedTime: 10 },
      { id: 17, category: 'electrical', task: 'Kiểm tra cổng sạc', taskEn: 'Check charging port', isRequired: true, estimatedTime: 5 },
      
      // Interior & HVAC
      { id: 18, category: 'hvac', task: 'Kiểm tra hệ thống điều hòa', taskEn: 'Check HVAC system', isRequired: true, estimatedTime: 10 },
      { id: 19, category: 'interior', task: 'Kiểm tra hệ thống giải trí', taskEn: 'Check entertainment system', isRequired: false, estimatedTime: 5 },
      
      // Software & Diagnostics
      { id: 20, category: 'software', task: 'Chạy chẩn đoán hệ thống', taskEn: 'Run system diagnostics', isRequired: true, estimatedTime: 15 },
      { id: 21, category: 'software', task: 'Kiểm tra phần mềm cần cập nhật', taskEn: 'Check software updates', isRequired: true, estimatedTime: 10 }
    ]
  },
  {
    id: 2,
    name: 'Bảo dưỡng định kỳ - SUV/Crossover',
    nameEn: 'Periodic Maintenance - SUV/Crossover',
    vehicleType: 'suv',
    category: 'general-maintenance',
    estimatedDuration: 150,
    description: 'Quy trình bảo dưỡng cho xe SUV/Crossover điện',
    descriptionEn: 'Maintenance procedure for electric SUV/Crossover',
    items: [
      { id: 1, category: 'battery', task: 'Kiểm tra điện áp pin cao áp', taskEn: 'Check high voltage battery', isRequired: true, estimatedTime: 15 },
      { id: 2, category: 'battery', task: 'Kiểm tra hệ thống làm mát pin', taskEn: 'Check battery cooling system', isRequired: true, estimatedTime: 20 },
      { id: 3, category: 'battery', task: 'Kiểm tra cách điện pin', taskEn: 'Check battery insulation', isRequired: true, estimatedTime: 15 },
      { id: 4, category: 'motor', task: 'Kiểm tra động cơ điện (trước/sau)', taskEn: 'Check electric motors (front/rear)', isRequired: true, estimatedTime: 15 },
      { id: 5, category: 'motor', task: 'Kiểm tra hệ thống 4WD (nếu có)', taskEn: 'Check 4WD system (if equipped)', isRequired: false, estimatedTime: 15 },
      { id: 6, category: 'brake', task: 'Kiểm tra phanh tái sinh', taskEn: 'Check regenerative braking', isRequired: true, estimatedTime: 10 },
      { id: 7, category: 'brake', task: 'Kiểm tra má phanh 4 bánh', taskEn: 'Check all 4 brake pads', isRequired: true, estimatedTime: 20 },
      { id: 8, category: 'brake', task: 'Kiểm tra phanh đỗ điện tử', taskEn: 'Check electronic parking brake', isRequired: true, estimatedTime: 10 },
      { id: 9, category: 'tire', task: 'Kiểm tra áp suất 4 lốp + dự phòng', taskEn: 'Check all 5 tire pressures', isRequired: true, estimatedTime: 10 },
      { id: 10, category: 'tire', task: 'Cân chỉnh độ nghiêng bánh xe', taskEn: 'Check wheel alignment', isRequired: true, estimatedTime: 15 },
      { id: 11, category: 'suspension', task: 'Kiểm tra giảm xóc', taskEn: 'Check shock absorbers', isRequired: true, estimatedTime: 15 },
      { id: 12, category: 'suspension', task: 'Kiểm tra hệ thống treo khí (nếu có)', taskEn: 'Check air suspension (if equipped)', isRequired: false, estimatedTime: 15 },
      { id: 13, category: 'electrical', task: 'Kiểm tra hệ thống đèn LED', taskEn: 'Check LED lighting system', isRequired: true, estimatedTime: 10 },
      { id: 14, category: 'electrical', task: 'Kiểm tra cảm biến 360', taskEn: 'Check 360 sensors', isRequired: true, estimatedTime: 10 },
      { id: 15, category: 'hvac', task: 'Kiểm tra điều hòa 3 vùng', taskEn: 'Check tri-zone climate control', isRequired: true, estimatedTime: 15 },
      { id: 16, category: 'software', task: 'Cập nhật phần mềm ADAS', taskEn: 'Update ADAS software', isRequired: true, estimatedTime: 20 },
      { id: 17, category: 'software', task: 'Kiểm tra hệ thống tự lái', taskEn: 'Check autonomous driving system', isRequired: false, estimatedTime: 15 }
    ]
  },
  {
    id: 3,
    name: 'Kiểm tra nhanh trước xuất xưởng',
    nameEn: 'Quick Pre-delivery Inspection',
    vehicleType: 'all',
    category: 'inspection',
    estimatedDuration: 45,
    description: 'Kiểm tra nhanh trước khi giao xe cho khách hàng',
    descriptionEn: 'Quick inspection before vehicle delivery',
    items: [
      { id: 1, category: 'battery', task: 'Kiểm tra % pin', taskEn: 'Check battery percentage', isRequired: true, estimatedTime: 2 },
      { id: 2, category: 'battery', task: 'Kiểm tra cổng sạc hoạt động', taskEn: 'Test charging port', isRequired: true, estimatedTime: 5 },
      { id: 3, category: 'tire', task: 'Kiểm tra áp suất lốp', taskEn: 'Check tire pressure', isRequired: true, estimatedTime: 5 },
      { id: 4, category: 'brake', task: 'Test phanh', taskEn: 'Test brakes', isRequired: true, estimatedTime: 5 },
      { id: 5, category: 'electrical', task: 'Kiểm tra đèn', taskEn: 'Check all lights', isRequired: true, estimatedTime: 5 },
      { id: 6, category: 'electrical', task: 'Kiểm tra còi', taskEn: 'Check horn', isRequired: true, estimatedTime: 2 },
      { id: 7, category: 'electrical', task: 'Kiểm tra gạt nước', taskEn: 'Check wipers', isRequired: true, estimatedTime: 3 },
      { id: 8, category: 'hvac', task: 'Test điều hòa', taskEn: 'Test A/C', isRequired: true, estimatedTime: 5 },
      { id: 9, category: 'interior', task: 'Kiểm tra màn hình', taskEn: 'Check display screen', isRequired: true, estimatedTime: 5 },
      { id: 10, category: 'interior', task: 'Test hệ thống âm thanh', taskEn: 'Test audio system', isRequired: true, estimatedTime: 3 },
      { id: 11, category: 'software', task: 'Chạy chẩn đoán nhanh', taskEn: 'Run quick diagnostics', isRequired: true, estimatedTime: 5 }
    ]
  },
  {
    id: 4,
    name: 'Bảo dưỡng sâu - Hệ thống Pin',
    nameEn: 'Deep Maintenance - Battery System',
    vehicleType: 'all',
    category: 'battery',
    estimatedDuration: 180,
    description: 'Bảo dưỡng chuyên sâu cho hệ thống pin',
    descriptionEn: 'Deep maintenance for battery system',
    items: [
      { id: 1, category: 'battery', task: 'Kiểm tra tổng thể pack pin', taskEn: 'Inspect battery pack', isRequired: true, estimatedTime: 30 },
      { id: 2, category: 'battery', task: 'Kiểm tra từng module pin', taskEn: 'Check individual battery modules', isRequired: true, estimatedTime: 40 },
      { id: 3, category: 'battery', task: 'Kiểm tra BMS (Battery Management System)', taskEn: 'Check BMS', isRequired: true, estimatedTime: 20 },
      { id: 4, category: 'battery', task: 'Đo điện trở cách điện', taskEn: 'Measure insulation resistance', isRequired: true, estimatedTime: 15 },
      { id: 5, category: 'battery', task: 'Kiểm tra hệ thống làm mát', taskEn: 'Check cooling system', isRequired: true, estimatedTime: 20 },
      { id: 6, category: 'battery', task: 'Thay dung dịch làm mát (nếu cần)', taskEn: 'Replace coolant (if needed)', isRequired: false, estimatedTime: 30 },
      { id: 7, category: 'battery', task: 'Cân bằng cell pin', taskEn: 'Balance battery cells', isRequired: true, estimatedTime: 25 }
    ]
  },
  {
    id: 5,
    name: 'Bảo dưỡng Pickup/Truck điện',
    nameEn: 'Electric Pickup/Truck Maintenance',
    vehicleType: 'truck',
    category: 'general-maintenance',
    estimatedDuration: 180,
    description: 'Quy trình bảo dưỡng cho xe bán tải điện',
    descriptionEn: 'Maintenance procedure for electric pickup trucks',
    items: [
      { id: 1, category: 'battery', task: 'Kiểm tra pin công suất cao', taskEn: 'Check high-capacity battery', isRequired: true, estimatedTime: 20 },
      { id: 2, category: 'motor', task: 'Kiểm tra động cơ kéo', taskEn: 'Check towing motor', isRequired: true, estimatedTime: 15 },
      { id: 3, category: 'motor', task: 'Kiểm tra hệ thống 4x4', taskEn: 'Check 4x4 system', isRequired: true, estimatedTime: 20 },
      { id: 4, category: 'brake', task: 'Kiểm tra phanh tải nặng', taskEn: 'Check heavy-duty brakes', isRequired: true, estimatedTime: 25 },
      { id: 5, category: 'tire', task: 'Kiểm tra lốp off-road', taskEn: 'Check off-road tires', isRequired: true, estimatedTime: 15 },
      { id: 6, category: 'suspension', task: 'Kiểm tra hệ thống treo tải nặng', taskEn: 'Check heavy-duty suspension', isRequired: true, estimatedTime: 20 },
      { id: 7, category: 'electrical', task: 'Kiểm tra cổng sạc nhanh', taskEn: 'Check fast charging port', isRequired: true, estimatedTime: 10 },
      { id: 8, category: 'electrical', task: 'Kiểm tra hệ thống đèn LED công suất cao', taskEn: 'Check high-power LED lights', isRequired: true, estimatedTime: 10 },
      { id: 9, category: 'software', task: 'Cập nhật phần mềm kéo thông minh', taskEn: 'Update smart towing software', isRequired: true, estimatedTime: 20 },
      { id: 10, category: 'general', task: 'Kiểm tra thùng xe', taskEn: 'Inspect truck bed', isRequired: true, estimatedTime: 10 },
      { id: 11, category: 'general', task: 'Kiểm tra móc kéo', taskEn: 'Check tow hitch', isRequired: false, estimatedTime: 15 }
    ]
  }
];

// Checklist categories
export const checklistCategories = [
  { id: 'battery', name: 'Hệ thống Pin', nameEn: 'Battery System', icon: '🔋', color: '#10B981' },
  { id: 'motor', name: 'Động cơ & Truyền động', nameEn: 'Motor & Powertrain', icon: '⚙️', color: '#3B82F6' },
  { id: 'brake', name: 'Hệ thống Phanh', nameEn: 'Brake System', icon: '🛑', color: '#EF4444' },
  { id: 'tire', name: 'Lốp xe', nameEn: 'Tires', icon: '⚫', color: '#6B7280' },
  { id: 'suspension', name: 'Hệ thống Treo', nameEn: 'Suspension', icon: '🔧', color: '#F59E0B' },
  { id: 'electrical', name: 'Hệ thống Điện', nameEn: 'Electrical System', icon: '⚡', color: '#FBBF24' },
  { id: 'hvac', name: 'Điều hòa', nameEn: 'HVAC', icon: '❄️', color: '#06B6D4' },
  { id: 'interior', name: 'Nội thất', nameEn: 'Interior', icon: '🪑', color: '#8B5CF6' },
  { id: 'software', name: 'Phần mềm', nameEn: 'Software', icon: '💻', color: '#EC4899' },
  { id: 'general', name: 'Kiểm tra chung', nameEn: 'General Inspection', icon: '📋', color: '#14B8A6' }
];

// Vehicle types
export const vehicleTypes = [
  { id: 'all', name: 'Tất cả loại xe', nameEn: 'All Types' },
  { id: 'sedan', name: 'Sedan', nameEn: 'Sedan' },
  { id: 'suv', name: 'SUV/Crossover', nameEn: 'SUV/Crossover' },
  { id: 'truck', name: 'Pickup/Truck', nameEn: 'Pickup/Truck' },
  { id: 'hatchback', name: 'Hatchback', nameEn: 'Hatchback' }
];

// Helper functions
export const getTemplateById = (templateId) => {
  return checklistTemplates.find(t => t.id === templateId);
};

export const getTemplatesByVehicleType = (vehicleType) => {
  if (vehicleType === 'all') return checklistTemplates;
  return checklistTemplates.filter(t => t.vehicleType === vehicleType || t.vehicleType === 'all');
};

export const getTemplatesByCategory = (category) => {
  return checklistTemplates.filter(t => t.category === category);
};

export default checklistTemplates;
