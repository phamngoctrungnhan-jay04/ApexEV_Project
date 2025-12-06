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


USE apexev;UPDATE users
SET role = 'ADMIN'
WHERE email = 'admin@gmail.com';
-- SET role = 'SERVICE_ADVISOR'
-- WHERE email = 'advisor@gmail.com';

-- 1. Kiểm tra FK constraints hiện tại
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'apexev' 
AND TABLE_NAME = 'service_orders'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- =====================================================
-- DỮ LIỆU PHỤ TÙNG CHO XE ĐIỆN APEX EV
-- Chạy trực tiếp để insert dữ liệu
-- =====================================================

-- Tạo bảng parts nếu chưa có
CREATE TABLE IF NOT EXISTS parts (
    part_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_name NVARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    description NTEXT,
    quantity_in_stock INT DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL
);

-- Xóa dữ liệu cũ
DELETE FROM parts;

-- 1. PHỤ TÙNG HỆ THỐNG PIN (BATTERY)
INSERT INTO parts (part_name, sku, description, quantity_in_stock, price) VALUES
(N'Module pin Lithium-ion 12S', 'BAT-MOD-12S-001', N'Module pin Lithium-ion 12 cell chuỗi, dung lượng 5.3kWh', 5, 15000000.00),
(N'Cell pin 21700 Samsung SDI', 'BAT-CELL-21700-SAM', N'Cell pin 21700 Samsung SDI 5000mAh, 3.6V', 200, 150000.00),
(N'Cell pin 18650 LG Chem', 'BAT-CELL-18650-LG', N'Cell pin 18650 LG Chem 3500mAh, 3.6V', 300, 120000.00),
(N'BMS (Battery Management System)', 'BAT-BMS-48V-100A', N'Bo mạch quản lý pin 48V 100A, cân bằng cell tự động', 10, 3500000.00),
(N'Cảm biến nhiệt độ pin NTC 10K', 'BAT-SENS-NTC10K', N'Cảm biến nhiệt độ NTC 10K ohm cho pack pin', 50, 85000.00),
(N'Dây cáp cao áp HV 35mm²', 'BAT-CAB-HV35', N'Dây cáp cao áp 35mm², cách điện 1000V', 100, 250000.00),
(N'Đầu nối cao áp Anderson SB175', 'BAT-CONN-SB175', N'Đầu nối cao áp Anderson SB175, 175A', 30, 450000.00),
(N'Cầu chì cao áp 150A', 'BAT-FUSE-150A', N'Cầu chì bảo vệ dòng cao áp 150A, 500V DC', 20, 380000.00),
(N'Contactor cao áp 400A', 'BAT-CONT-400A', N'Contactor cắt nguồn cao áp 400A, 800V DC', 8, 2800000.00),
(N'Vỏ hộp pin Aluminum', 'BAT-CASE-ALU-01', N'Vỏ hộp chứa module pin bằng nhôm, IP67', 3, 8500000.00);

-- 2. PHỤ TÙNG HỆ THỐNG LÀM MÁT (COOLING)
INSERT INTO parts (part_name, sku, description, quantity_in_stock, price) VALUES
(N'Nước làm mát xe điện EV Coolant 4L', 'COOL-FLUID-EV-4L', N'Dung dịch làm mát chuyên dụng xe điện, không dẫn điện', 50, 450000.00),
(N'Bơm nước làm mát điện 12V', 'COOL-PUMP-12V-40W', N'Bơm nước làm mát điện 12V 40W, 20L/phút', 15, 1800000.00),
(N'Két làm mát pin (Radiator)', 'COOL-RAD-BAT-01', N'Bộ tản nhiệt cho hệ thống pin, 400x300mm', 5, 3200000.00),
(N'Két làm mát motor (Radiator)', 'COOL-RAD-MOT-01', N'Bộ tản nhiệt cho motor điện, 350x250mm', 5, 2800000.00),
(N'Ống nước làm mát silicon 19mm', 'COOL-HOSE-SIL-19', N'Ống dẫn nước làm mát silicon, 19mm, 1m', 30, 180000.00),
(N'Van xả nước làm mát', 'COOL-VALVE-DRAIN', N'Van xả nước làm mát bằng đồng', 20, 95000.00),
(N'Cảm biến nhiệt độ nước làm mát', 'COOL-SENS-TEMP', N'Cảm biến nhiệt độ nước PT100, 0-150°C', 25, 280000.00),
(N'Bình chứa nước làm mát', 'COOL-TANK-1L', N'Bình chứa nước làm mát 1L, có vạch đo', 10, 350000.00),
(N'Quạt làm mát 24V 200W', 'COOL-FAN-24V-200W', N'Quạt làm mát điện 24V 200W, 280mm', 8, 1500000.00);

-- 3. PHỤ TÙNG HỆ THỐNG PHANH (BRAKE)
INSERT INTO parts (part_name, sku, description, quantity_in_stock, price) VALUES
(N'Má phanh trước (bộ 4 miếng)', 'BRK-PAD-FR-SET', N'Bộ má phanh trước ceramic, ít bụi', 20, 850000.00),
(N'Má phanh sau (bộ 4 miếng)', 'BRK-PAD-RR-SET', N'Bộ má phanh sau ceramic, ít bụi', 20, 750000.00),
(N'Đĩa phanh trước (cái)', 'BRK-DISC-FR', N'Đĩa phanh trước thông gió, 320mm', 10, 1200000.00),
(N'Đĩa phanh sau (cái)', 'BRK-DISC-RR', N'Đĩa phanh sau đặc, 280mm', 10, 950000.00),
(N'Dầu phanh DOT4 1L', 'BRK-FLUID-DOT4-1L', N'Dầu phanh DOT4 chính hãng, 1L', 30, 180000.00),
(N'Ống dầu phanh mềm', 'BRK-HOSE-FLEX', N'Ống dầu phanh mềm cao su, 50cm', 15, 320000.00),
(N'Caliper phanh trước', 'BRK-CALIPER-FR', N'Caliper phanh trước 4 piston', 4, 4500000.00),
(N'Cảm biến bàn đạp phanh', 'BRK-SENS-PEDAL', N'Cảm biến vị trí bàn đạp phanh', 8, 650000.00),
(N'Motor phanh đỗ điện tử (EPB)', 'BRK-EPB-MOTOR', N'Motor actuator phanh đỗ điện tử', 5, 2200000.00);

-- 4. PHỤ TÙNG LỐP XE (TIRE)
INSERT INTO parts (part_name, sku, description, quantity_in_stock, price) VALUES
(N'Lốp Michelin E.Primacy 205/55R16', 'TIRE-MICH-EP-205', N'Lốp Michelin tiết kiệm năng lượng', 16, 2800000.00),
(N'Lốp Continental EcoContact 215/50R17', 'TIRE-CONT-EC-215', N'Lốp Continental cho xe điện', 12, 3200000.00),
(N'Lốp Bridgestone Ecopia 225/45R18', 'TIRE-BRID-EC-225', N'Lốp Bridgestone Ecopia EV', 8, 3500000.00),
(N'Mâm xe nhôm 17 inch', 'TIRE-RIM-ALU-17', N'Mâm xe đúc nhôm 17 inch', 8, 2500000.00),
(N'Mâm xe nhôm 18 inch', 'TIRE-RIM-ALU-18', N'Mâm xe đúc nhôm 18 inch', 8, 3000000.00),
(N'Van lốp cao su', 'TIRE-VALVE-RUB', N'Van lốp cao su tiêu chuẩn', 50, 25000.00),
(N'Cảm biến áp suất lốp TPMS', 'TIRE-TPMS-SENS', N'Cảm biến áp suất lốp 433MHz', 20, 550000.00),
(N'Miếng vá lốp Mushroom Plug', 'TIRE-PATCH-MUSH', N'Miếng vá lốp dạng nấm combo', 100, 45000.00),
(N'Keo vá lốp', 'TIRE-GLUE-100ML', N'Keo dán vá lốp chuyên dụng, 100ml', 30, 65000.00),
(N'Đối trọng cân bằng bánh xe', 'TIRE-WEIGHT-SET', N'Bộ đối trọng cân bằng 5g-60g', 50, 35000.00);

-- 5. PHỤ TÙNG ĐỘNG CƠ ĐIỆN (MOTOR)
INSERT INTO parts (part_name, sku, description, quantity_in_stock, price) VALUES
(N'Vòng bi motor trước', 'MOT-BEAR-FR-6206', N'Vòng bi SKF 6206-2RS', 10, 450000.00),
(N'Vòng bi motor sau', 'MOT-BEAR-RR-6208', N'Vòng bi SKF 6208-2RS', 10, 520000.00),
(N'Cảm biến vị trí rotor (Resolver)', 'MOT-SENS-RESOLV', N'Cảm biến vị trí rotor resolver 12 bit', 5, 1800000.00),
(N'Cảm biến nhiệt độ motor PTC', 'MOT-SENS-TEMP-PTC', N'Cảm biến nhiệt độ cuộn dây motor', 15, 280000.00),
(N'Dây cáp 3 pha motor 16mm²', 'MOT-CAB-3PH-16', N'Dây cáp động lực 3 pha 16mm²', 20, 650000.00),
(N'Đầu nối motor 3 pha', 'MOT-CONN-3PH', N'Đầu nối động lực 3 pha IP67', 10, 850000.00),
(N'Mỡ bôi trơn vòng bi motor', 'MOT-GREASE-100G', N'Mỡ bôi trơn chịu nhiệt, 100g', 20, 120000.00);

-- 6. PHỤ TÙNG INVERTER/CHARGER
INSERT INTO parts (part_name, sku, description, quantity_in_stock, price) VALUES
(N'IGBT Module 600V 400A', 'INV-IGBT-600V-400A', N'Module IGBT Infineon 600V 400A', 3, 8500000.00),
(N'Tụ điện DC Link 450V 1000uF', 'INV-CAP-450V-1000', N'Tụ điện DC Link film capacitor', 5, 2200000.00),
(N'Cảm biến dòng điện Hall 500A', 'INV-SENS-CURR-500A', N'Cảm biến dòng điện Hall 500A', 8, 950000.00),
(N'Quạt làm mát inverter 24V', 'INV-FAN-24V-80MM', N'Quạt làm mát inverter 80x80mm', 15, 280000.00),
(N'Keo tản nhiệt Thermal Paste', 'INV-THERM-PASTE', N'Keo tản nhiệt cho IGBT, 30g', 20, 180000.00),
(N'Sạc trên xe OBC 6.6kW', 'CHG-OBC-6.6KW', N'On-Board Charger 6.6kW AC', 2, 18000000.00),
(N'Cổng sạc AC Type 2', 'CHG-PORT-AC-T2', N'Cổng sạc AC Type 2 có khóa', 5, 1500000.00),
(N'Cổng sạc DC CCS2', 'CHG-PORT-DC-CCS2', N'Cổng sạc nhanh DC CCS Combo 2', 3, 3500000.00);

-- 7. PHỤ TÙNG HỆ THỐNG TREO (SUSPENSION)
INSERT INTO parts (part_name, sku, description, quantity_in_stock, price) VALUES
(N'Giảm xóc trước (cái)', 'SUS-SHOCK-FR', N'Giảm xóc trước dầu-gas, chịu tải cao', 8, 2200000.00),
(N'Giảm xóc sau (cái)', 'SUS-SHOCK-RR', N'Giảm xóc sau dầu-gas, chịu tải cao', 8, 1800000.00),
(N'Lò xo trước (cái)', 'SUS-SPRING-FR', N'Lò xo xoắn trước, độ cứng tăng cường', 8, 650000.00),
(N'Lò xo sau (cái)', 'SUS-SPRING-RR', N'Lò xo xoắn sau, độ cứng tăng cường', 8, 550000.00),
(N'Thanh cân bằng trước', 'SUS-SWAY-FR', N'Thanh cân bằng trước 24mm', 4, 1200000.00),
(N'Thanh cân bằng sau', 'SUS-SWAY-RR', N'Thanh cân bằng sau 18mm', 4, 950000.00),
(N'Cao su chân máy motor', 'SUS-MOUNT-MOT', N'Cao su chân máy chịu rung động', 10, 450000.00),
(N'Rotuyn trước (cái)', 'SUS-BALL-FR', N'Rotuyn trước', 12, 380000.00),
(N'Rotuyn sau (cái)', 'SUS-BALL-RR', N'Rotuyn sau', 12, 320000.00),
(N'Cao su thanh giằng (bộ)', 'SUS-BUSH-SWAY', N'Cao su thanh cân bằng bộ 4 cái', 15, 250000.00);

-- 8. PHỤ TÙNG ĐIỀU HÒA (HVAC)
INSERT INTO parts (part_name, sku, description, quantity_in_stock, price) VALUES
(N'Lọc gió cabin (Carbon)', 'HVAC-FILT-CAB-C', N'Lọc gió cabin than hoạt tính, PM2.5', 30, 280000.00),
(N'Lọc gió cabin (Standard)', 'HVAC-FILT-CAB-S', N'Lọc gió cabin tiêu chuẩn', 50, 150000.00),
(N'Gas lạnh R1234yf 500g', 'HVAC-GAS-R1234YF', N'Gas lạnh R1234yf thân thiện môi trường', 20, 850000.00),
(N'Gas lạnh R134a 1kg', 'HVAC-GAS-R134A', N'Gas lạnh R134a truyền thống', 30, 320000.00),
(N'Máy nén điều hòa điện 400V', 'HVAC-COMP-EV-400V', N'Máy nén điều hòa điện cao áp', 3, 12000000.00),
(N'Bộ sưởi PTC 3kW', 'HVAC-HEAT-PTC-3KW', N'Bộ sưởi điện PTC 3kW', 5, 2500000.00),
(N'Quạt gió trong xe (Blower)', 'HVAC-BLOWER-12V', N'Quạt gió trong xe 12V PWM', 8, 1200000.00),
(N'Dung dịch vệ sinh dàn lạnh', 'HVAC-CLEAN-EVAP', N'Dung dịch khử khuẩn dàn lạnh, 500ml', 40, 85000.00),
(N'Cảm biến nhiệt độ cabin', 'HVAC-SENS-CABIN', N'Cảm biến nhiệt độ trong cabin', 15, 180000.00);

-- 9. PHỤ TÙNG ĐIỆN 12V & CHIẾU SÁNG
INSERT INTO parts (part_name, sku, description, quantity_in_stock, price) VALUES
(N'Ắc quy 12V 60Ah AGM', 'ELEC-BATT-12V-60', N'Ắc quy phụ 12V 60Ah AGM', 10, 2800000.00),
(N'Ắc quy 12V 45Ah Lithium', 'ELEC-BATT-12V-45L', N'Ắc quy phụ 12V 45Ah Lithium', 5, 4500000.00),
(N'Bóng đèn pha LED H7', 'ELEC-BULB-LED-H7', N'Bóng đèn pha LED H7 6000K', 30, 650000.00),
(N'Bóng đèn pha LED H11', 'ELEC-BULB-LED-H11', N'Bóng đèn pha LED H11 6000K', 30, 680000.00),
(N'Bóng đèn xi nhan LED', 'ELEC-BULB-LED-TURN', N'Bóng đèn xi nhan LED T20 vàng', 50, 120000.00),
(N'Bóng đèn phanh LED', 'ELEC-BULB-LED-STOP', N'Bóng đèn phanh LED T20 đỏ', 50, 150000.00),
(N'Cầu chì 12V (bộ hỗn hợp)', 'ELEC-FUSE-12V-SET', N'Bộ cầu chì 12V 5A-30A', 30, 45000.00),
(N'Còi xe 12V (cặp)', 'ELEC-HORN-12V', N'Còi xe 12V bộ 2 cái', 15, 280000.00),
(N'Motor gạt mưa', 'ELEC-WIPER-MOT', N'Motor gạt mưa trước 12V', 8, 850000.00),
(N'Lưỡi gạt mưa 22 inch', 'ELEC-WIPER-BLD-22', N'Lưỡi gạt mưa silicone 22 inch', 40, 180000.00),
(N'Lưỡi gạt mưa 18 inch', 'ELEC-WIPER-BLD-18', N'Lưỡi gạt mưa silicone 18 inch', 40, 150000.00);

-- 10. PHỤ TÙNG VỆ SINH & CHĂM SÓC
INSERT INTO parts (part_name, sku, description, quantity_in_stock, price) VALUES
(N'Dung dịch rửa xe pH trung tính 5L', 'CARE-WASH-PH7-5L', N'Dung dịch rửa xe an toàn cho sơn', 20, 250000.00),
(N'Dung dịch vệ sinh nội thất 1L', 'CARE-INT-CLEAN-1L', N'Dung dịch vệ sinh nội thất đa năng', 30, 180000.00),
(N'Kem dưỡng da ghế 500ml', 'CARE-LEATH-COND', N'Kem dưỡng da ghế cao cấp', 25, 320000.00),
(N'Dung dịch đánh bóng sơn', 'CARE-POLISH-500', N'Dung dịch đánh bóng sơn 500ml', 20, 280000.00),
(N'Dung dịch phủ nano ceramic', 'CARE-NANO-COAT', N'Dung dịch phủ nano ceramic 100ml', 15, 450000.00),
(N'Khăn microfiber (bộ 5 cái)', 'CARE-CLOTH-MICRO', N'Khăn lau microfiber cao cấp', 50, 120000.00),
(N'Silicon bảo dưỡng gioăng', 'CARE-SILICON-SEAL', N'Silicon bảo dưỡng gioăng 200ml', 30, 95000.00),
(N'Dung dịch khử mùi xe', 'CARE-DEODOR-300', N'Dung dịch khử mùi trong xe 300ml', 40, 150000.00),
(N'Dung dịch làm sạch mâm xe', 'CARE-WHEEL-CLEAN', N'Dung dịch chuyên dụng mâm xe 500ml', 25, 180000.00);

-- 11. PHỤ TÙNG CỨU HỘ & KHẨN CẤP
INSERT INTO parts (part_name, sku, description, quantity_in_stock, price) VALUES
(N'Bộ sạc di động EV 3.5kW', 'EMRG-CHARGE-PORT', N'Bộ sạc di động cho xe điện 3.5kW', 5, 6500000.00),
(N'Cáp sạc khẩn cấp 10m', 'EMRG-CABLE-10M', N'Cáp sạc Type 2 dài 10m', 10, 2800000.00),
(N'Dây kéo xe nylon 5 tấn', 'EMRG-TOW-ROPE-5T', N'Dây kéo xe nylon 5 tấn, 5m', 20, 350000.00),
(N'Kích nâng thủy lực 3 tấn', 'EMRG-JACK-3T', N'Kích nâng xe thủy lực 3 tấn', 8, 850000.00),
(N'Bình cứu hỏa bột ABC 2kg', 'EMRG-FIRE-EXT-2KG', N'Bình cứu hỏa bột ABC 2kg', 15, 280000.00),
(N'Găng tay cách điện 1000V', 'EMRG-GLOVE-1KV', N'Găng tay cách điện 1000V', 10, 850000.00),
(N'Thảm cách điện 1m x 1m', 'EMRG-MAT-INSUL', N'Thảm cách điện cao su 20kV', 5, 1200000.00);

-- Kiểm tra kết quả
SELECT COUNT(*) AS total_parts FROM parts;
SELECT * FROM parts ORDER BY part_id;

