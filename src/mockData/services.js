// Mock Services Data
export const services = [
  {
    id: 1,
    name: 'Bảo dưỡng định kỳ cơ bản',
    nameEn: 'Basic Periodic Maintenance',
    category: 'maintenance',
    description: 'Kiểm tra tổng quan hệ thống điện, kiểm tra phanh, lốp xe, đèn chiếu sáng',
    descriptionEn: 'General electrical system check, brake inspection, tire check, lighting check',
    duration: 60, // minutes
    basePrice: 500000,
    icon: 'FiTool',
    popular: true,
    status: 'active'
  },
  {
    id: 2,
    name: 'Bảo dưỡng định kỳ nâng cao',
    nameEn: 'Advanced Periodic Maintenance',
    category: 'maintenance',
    description: 'Kiểm tra chuyên sâu hệ thống pin, động cơ điện, hệ thống làm mát, cập nhật phần mềm',
    descriptionEn: 'In-depth battery system check, electric motor inspection, cooling system check, software update',
    duration: 120,
    basePrice: 1200000,
    icon: 'FiSettings',
    popular: true,
    status: 'active'
  },
  {
    id: 3,
    name: 'Kiểm tra và bảo dưỡng pin',
    nameEn: 'Battery Check & Maintenance',
    category: 'battery',
    description: 'Kiểm tra sức khỏe pin, cân bằng cell, làm sạch cực pin, kiểm tra hệ thống quản lý pin (BMS)',
    descriptionEn: 'Battery health check, cell balancing, terminal cleaning, BMS inspection',
    duration: 90,
    basePrice: 800000,
    icon: 'FiBattery',
    popular: true,
    status: 'active'
  },
  {
    id: 4,
    name: 'Thay lốp xe',
    nameEn: 'Tire Replacement',
    category: 'tire',
    description: 'Thay lốp mới, cân bằng, kiểm tra áp suất',
    descriptionEn: 'New tire installation, balancing, pressure check',
    duration: 45,
    basePrice: 2500000, // includes tire cost
    icon: 'FiCircle',
    popular: false,
    status: 'active'
  },
  {
    id: 5,
    name: 'Vá, sửa lốp',
    nameEn: 'Tire Repair',
    category: 'tire',
    description: 'Sửa chữa lốp bị thủng, kiểm tra và bơm lốp',
    descriptionEn: 'Puncture repair, tire inspection and inflation',
    duration: 30,
    basePrice: 100000,
    icon: 'FiCircle',
    popular: false,
    status: 'active'
  },
  {
    id: 6,
    name: 'Kiểm tra và thay phanh',
    nameEn: 'Brake Inspection & Replacement',
    category: 'brake',
    description: 'Kiểm tra má phanh, đĩa phanh, hệ thống phanh tái sinh năng lượng',
    descriptionEn: 'Brake pad inspection, rotor check, regenerative braking system check',
    duration: 75,
    basePrice: 1500000,
    icon: 'FiAlertOctagon',
    popular: false,
    status: 'active'
  },
  {
    id: 7,
    name: 'Cập nhật phần mềm hệ thống',
    nameEn: 'System Software Update',
    category: 'software',
    description: 'Cập nhật firmware, phần mềm điều khiển xe, hệ thống giải trí',
    descriptionEn: 'Firmware update, vehicle control software, entertainment system update',
    duration: 60,
    basePrice: 300000,
    icon: 'FiDownload',
    popular: true,
    status: 'active'
  },
  {
    id: 8,
    name: 'Vệ sinh và chăm sóc nội thất',
    nameEn: 'Interior Cleaning & Care',
    category: 'cleaning',
    description: 'Vệ sinh nội thất, hút bụi, làm sạch ghế da, khử mùi',
    descriptionEn: 'Interior cleaning, vacuuming, leather seat cleaning, odor removal',
    duration: 90,
    basePrice: 600000,
    icon: 'FiDroplet',
    popular: false,
    status: 'active'
  },
  {
    id: 9,
    name: 'Rửa xe và đánh bóng',
    nameEn: 'Car Wash & Polishing',
    category: 'cleaning',
    description: 'Rửa xe toàn bộ, đánh bóng sơn, bảo vệ lớp sơn',
    descriptionEn: 'Full car wash, paint polishing, paint protection',
    duration: 60,
    basePrice: 400000,
    icon: 'FiDroplet',
    popular: false,
    status: 'active'
  },
  {
    id: 10,
    name: 'Kiểm tra hệ thống điều hòa',
    nameEn: 'Air Conditioning System Check',
    category: 'hvac',
    description: 'Kiểm tra và bảo dưỡng hệ thống điều hòa, thay lọc gió cabin',
    descriptionEn: 'AC system check and maintenance, cabin air filter replacement',
    duration: 45,
    basePrice: 500000,
    icon: 'FiWind',
    popular: false,
    status: 'active'
  },
  {
    id: 11,
    name: 'Kiểm tra hệ thống treo',
    nameEn: 'Suspension System Check',
    category: 'suspension',
    description: 'Kiểm tra giảm xóc, thanh giằng, hệ thống treo',
    descriptionEn: 'Shock absorber check, stabilizer bar inspection, suspension system check',
    duration: 60,
    basePrice: 700000,
    icon: 'FiActivity',
    popular: false,
    status: 'active'
  },
  {
    id: 12,
    name: 'Cân chỉnh và định vị bánh xe',
    nameEn: 'Wheel Alignment',
    category: 'tire',
    description: 'Cân chỉnh góc đặt bánh xe, kiểm tra hệ thống lái',
    descriptionEn: 'Wheel alignment adjustment, steering system check',
    duration: 45,
    basePrice: 400000,
    icon: 'FiTarget',
    popular: false,
    status: 'active'
  },
  {
    id: 13,
    name: 'Cứu hộ khẩn cấp',
    nameEn: 'Emergency Roadside Assistance',
    category: 'emergency',
    description: 'Hỗ trợ khẩn cấp khi gặp sự cố trên đường, sạc pin tại chỗ',
    descriptionEn: 'Emergency roadside support, on-site battery charging',
    duration: 120,
    basePrice: 1000000,
    icon: 'FiAlertTriangle',
    popular: false,
    status: 'active'
  },
  {
    id: 14,
    name: 'Kiểm tra toàn diện',
    nameEn: 'Comprehensive Inspection',
    category: 'inspection',
    description: 'Kiểm tra 360° toàn bộ xe, chẩn đoán điện tử, báo cáo chi tiết',
    descriptionEn: '360° full vehicle inspection, electronic diagnostics, detailed report',
    duration: 150,
    basePrice: 1500000,
    icon: 'FiCheckCircle',
    popular: false,
    status: 'active'
  },
  {
    id: 15,
    name: 'Thay nước làm mát',
    nameEn: 'Coolant Replacement',
    category: 'cooling',
    description: 'Thay nước làm mát hệ thống pin và động cơ',
    descriptionEn: 'Battery and motor cooling system fluid replacement',
    duration: 60,
    basePrice: 600000,
    icon: 'FiDroplet',
    popular: false,
    status: 'active'
  }
];

// Service categories for filtering
export const serviceCategories = [
  { id: 'all', name: 'Tất cả dịch vụ', nameEn: 'All Services' },
  { id: 'maintenance', name: 'Bảo dưỡng định kỳ', nameEn: 'Periodic Maintenance' },
  { id: 'battery', name: 'Pin & Điện', nameEn: 'Battery & Electric' },
  { id: 'tire', name: 'Lốp xe', nameEn: 'Tires' },
  { id: 'brake', name: 'Phanh', nameEn: 'Brakes' },
  { id: 'software', name: 'Phần mềm', nameEn: 'Software' },
  { id: 'cleaning', name: 'Vệ sinh', nameEn: 'Cleaning' },
  { id: 'hvac', name: 'Điều hòa', nameEn: 'HVAC' },
  { id: 'suspension', name: 'Hệ thống treo', nameEn: 'Suspension' },
  { id: 'emergency', name: 'Cứu hộ', nameEn: 'Emergency' },
  { id: 'inspection', name: 'Kiểm tra', nameEn: 'Inspection' },
  { id: 'cooling', name: 'Làm mát', nameEn: 'Cooling' }
];

export default services;
