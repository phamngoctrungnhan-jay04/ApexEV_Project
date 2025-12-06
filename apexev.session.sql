USE apexev;

-- Xóa bảng cũ (nếu có)
DROP TABLE IF EXISTS services;

-- Tạo lại bảng services khớp với Entity MaintenanceService.java
CREATE TABLE services (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Cột dữ liệu chính
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_price DECIMAL(10, 2),        -- Khớp với unitPrice (giá)
    estimated_duration INT,           -- Khớp với estimatedDuration (thời gian)
    
    -- Cột đa ngôn ngữ và Mock Data
    name_en VARCHAR(255) NULL,
    description_en TEXT NULL,
    category VARCHAR(50) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1 -- Khớp với isActive
);

USE apexev; -- Đảm bảo chọn đúng Database


-- Sửa lại: Dữ liệu phải được chèn vào `unit_price` và `estimated_duration`

-- Dữ liệu đã sửa (Sử dụng tên cột chính xác theo DDL mới nhất của bạn)
INSERT INTO services (id, name, description, unit_price, estimated_duration, name_en, description_en, category, is_active) VALUES
(1, 'Bảo dưỡng định kỳ cơ bản', 'Kiểm tra tổng quan hệ thống điện, kiểm tra phanh, lốp xe, đèn chiếu sáng', 500000.00, 60, 'Basic Periodic Maintenance', 'General electrical system check, brake inspection, tire check, lighting check', 'maintenance', 1),
(2, 'Bảo dưỡng định kỳ nâng cao', 'Kiểm tra chuyên sâu hệ thống pin, động cơ điện, hệ thống làm mát, cập nhật phần mềm', 1200000.00, 120, 'Advanced Periodic Maintenance', 'In-depth battery system check, electric motor inspection, cooling system check, software update', 'maintenance', 1),
(3, 'Kiểm tra và bảo dưỡng pin', 'Kiểm tra sức khỏe pin, cân bằng cell, làm sạch cực pin, kiểm tra hệ thống quản lý pin (BMS)', 800000.00, 90, 'Battery Check & Maintenance', 'Battery health check, cell balancing, terminal cleaning, BMS inspection', 'battery', 1),
(4, 'Thay lốp xe', 'Thay lốp mới, cân bằng, kiểm tra áp suất', 2500000.00, 45, 'Tire Replacement', 'New tire installation, balancing, pressure check', 'tire', 0),
(5, 'Vá, sửa lốp', 'Sửa chữa lốp bị thủng, kiểm tra và bơm lốp', 100000.00, 30, 'Tire Repair', 'Puncture repair, tire inspection and inflation', 'tire', 0),
(6, 'Kiểm tra và thay phanh', 'Kiểm tra má phanh, đĩa phanh, hệ thống phanh tái sinh năng lượng', 1500000.00, 75, 'Brake Inspection & Replacement', 'Brake pad inspection, rotor check, regenerative braking system check', 'brake', 0),
(7, 'Cập nhật phần mềm hệ thống', 'Cập nhật firmware, phần mềm điều khiển xe, hệ thống giải trí', 300000.00, 60, 'System Software Update', 'Firmware update, vehicle control software, entertainment system update', 'software', 1),
(8, 'Vệ sinh và chăm sóc nội thất', 'Vệ sinh nội thất, hút bụi, làm sạch ghế da, khử mùi', 600000.00, 90, 'Interior Cleaning & Care', 'Interior cleaning, vacuuming, leather seat cleaning, odor removal', 'cleaning', 0),
(9, 'Rửa xe và đánh bóng', 'Rửa xe toàn bộ, đánh bóng sơn, bảo vệ lớp sơn', 400000.00, 60, 'Car Wash & Polishing', 'Full car wash, paint polishing, paint protection', 'cleaning', 0),
(10, 'Kiểm tra hệ thống điều hòa', 'Kiểm tra và bảo dưỡng hệ thống điều hòa, thay lọc gió cabin', 500000.00, 45, 'Air Conditioning System Check', 'AC system check and maintenance, cabin air filter replacement', 'hvac', 0),
(11, 'Kiểm tra hệ thống treo', 'Kiểm tra giảm xóc, thanh giằng, hệ thống treo', 700000.00, 60, 'Suspension System Check', 'Shock absorber check, stabilizer bar inspection, suspension system check', 'suspension', 0),
(12, 'Cân chỉnh và định vị bánh xe', 'Cân chỉnh góc đặt bánh xe, kiểm tra hệ thống lái', 400000.00, 45, 'Wheel Alignment', 'Wheel alignment adjustment, steering system check', 'tire', 0),
(13, 'Cứu hộ khẩn cấp', 'Hỗ trợ khẩn cấp khi gặp sự cố trên đường, sạc pin tại chỗ', 1000000.00, 120, 'Emergency Roadside Assistance', 'Emergency roadside support, on-site battery charging', 'emergency', 0),
(14, 'Kiểm tra toàn diện', 'Kiểm tra 360° toàn bộ xe, chẩn đoán điện tử, báo cáo chi tiết', 1500000.00, 150, 'Comprehensive Inspection', '360° full vehicle inspection, electronic diagnostics, detailed report', 'inspection', 0),
(15, 'Thay nước làm mát', 'Thay nước làm mát hệ thống pin và động cơ', 600000.00, 60, 'Coolant Replacement', 'Battery and motor cooling system fluid replacement', 'cooling', 0);