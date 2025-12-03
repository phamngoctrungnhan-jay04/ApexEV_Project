-- =====================================================
-- CHECKLIST ITEMS CHO CÁC DỊCH VỤ XE ĐIỆN APEX EV
-- Tập trung: Pin, Motor điện, BMS, Phanh tái sinh, 
-- Hệ thống làm mát pin, và Phần mềm
-- KHÔNG có hạng mục xe xăng (dầu động cơ, bugi, lọc xăng)
-- =====================================================
use apexev;
-- Tạo bảng service_checklist_items nếu chưa có
CREATE TABLE IF NOT EXISTS service_checklist_items (
    item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_name NVARCHAR(255) NOT NULL,
    item_name_en VARCHAR(255),
    item_description TEXT,
    item_description_en TEXT,
    step_order INT NOT NULL,
    category VARCHAR(50),
    estimated_time INT,
    is_required BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    service_id BIGINT NOT NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- =====================================================
-- SERVICE 1: Bảo dưỡng định kỳ nâng cao (ID = 1)
-- Category: maintenance (Bảo dưỡng)
-- =====================================================
INSERT INTO service_checklist_items (service_id, step_order, category, item_name, item_name_en, item_description, item_description_en, estimated_time, is_required) VALUES

-- Pin cao áp (High Voltage Battery)
(1, 1, 'battery', N'Kiểm tra điện áp tổng pack pin HV', 'Check HV battery pack total voltage', N'Đo điện áp tổng của pack pin cao áp (350V-400V), so sánh với thông số kỹ thuật', 'Measure total HV battery pack voltage (350V-400V), compare with specifications', 15, TRUE),
(1, 2, 'battery', N'Kiểm tra điện áp từng module pin', 'Check individual battery module voltage', N'Đo và ghi nhận điện áp từng module pin, phát hiện cell yếu hoặc lỗi', 'Measure and record voltage of each battery module, detect weak or faulty cells', 20, TRUE),
(1, 3, 'battery', N'Kiểm tra cân bằng cell pin (Cell Balancing)', 'Check battery cell balancing', N'Kiểm tra độ chênh lệch điện áp giữa các cell, max delta < 50mV', 'Check voltage difference between cells, max delta < 50mV', 15, TRUE),
(1, 4, 'battery', N'Kiểm tra tình trạng SOH (State of Health)', 'Check battery SOH (State of Health)', N'Đọc % SOH qua OBD, đánh giá tuổi thọ còn lại của pin', 'Read SOH% via OBD, evaluate remaining battery life', 10, TRUE),

-- Hệ thống làm mát pin (Battery Thermal Management)
(1, 5, 'cooling', N'Kiểm tra mức nước làm mát pin', 'Check battery coolant level', N'Kiểm tra mức dung dịch làm mát trong bình chứa, bổ sung nếu cần', 'Check coolant level in reservoir, top up if needed', 5, TRUE),
(1, 6, 'cooling', N'Kiểm tra nhiệt độ hoạt động pin', 'Check battery operating temperature', N'Đo nhiệt độ pin khi hoạt động, đảm bảo trong khoảng 20-40°C', 'Measure battery temperature during operation, ensure 20-40°C range', 10, TRUE),
(1, 7, 'cooling', N'Kiểm tra bơm nước làm mát pin', 'Check battery coolant pump', N'Kiểm tra hoạt động của bơm nước làm mát, nghe tiếng kêu bất thường', 'Check coolant pump operation, listen for abnormal sounds', 10, TRUE),
(1, 8, 'cooling', N'Kiểm tra đường ống làm mát pin', 'Check battery cooling hoses', N'Kiểm tra rò rỉ, nứt vỡ đường ống làm mát hệ thống pin', 'Inspect cooling hoses for leaks, cracks in battery cooling system', 10, TRUE),

-- Motor điện & Inverter
(1, 9, 'motor', N'Kiểm tra động cơ điện (traction motor)', 'Check electric traction motor', N'Kiểm tra tiếng kêu, rung động bất thường của motor điện', 'Check for abnormal sounds, vibrations from electric motor', 15, TRUE),
(1, 10, 'motor', N'Kiểm tra inverter/bộ biến tần', 'Check inverter', N'Kiểm tra nhiệt độ và mã lỗi inverter qua chẩn đoán', 'Check inverter temperature and error codes via diagnostics', 10, TRUE),
(1, 11, 'motor', N'Kiểm tra cáp cao áp motor', 'Check HV motor cables', N'Kiểm tra vỏ bọc cáp cao áp, đầu nối, không bị hư hại', 'Inspect HV cable insulation, connectors, ensure no damage', 10, TRUE),

-- BMS (Battery Management System)
(1, 12, 'bms', N'Chẩn đoán hệ thống BMS', 'Diagnose BMS system', N'Đọc mã lỗi BMS, kiểm tra giao tiếp với các sensor', 'Read BMS error codes, check communication with sensors', 15, TRUE),
(1, 13, 'bms', N'Kiểm tra sensor nhiệt độ pin', 'Check battery temperature sensors', N'Kiểm tra tất cả sensor nhiệt độ trong pack pin hoạt động chính xác', 'Verify all temperature sensors in battery pack work correctly', 10, TRUE),

-- Phanh tái sinh (Regenerative Braking)
(1, 14, 'regen', N'Kiểm tra hệ thống phanh tái sinh', 'Check regenerative braking system', N'Test chức năng phanh tái sinh, đo năng lượng thu hồi', 'Test regen braking function, measure energy recovery', 15, TRUE),
(1, 15, 'regen', N'Kiểm tra các chế độ phanh tái sinh', 'Check regen braking modes', N'Kiểm tra các mức phanh tái sinh (Low/Mid/High) hoạt động đúng', 'Verify regen braking levels (Low/Mid/High) work correctly', 10, TRUE),

-- Phần mềm & OTA
(1, 16, 'software', N'Cập nhật firmware ECU chính', 'Update main ECU firmware', N'Kiểm tra và cập nhật phiên bản firmware ECU điều khiển chính', 'Check and update main control ECU firmware version', 20, TRUE),
(1, 17, 'software', N'Cập nhật phần mềm BMS', 'Update BMS software', N'Cập nhật phần mềm quản lý pin mới nhất từ nhà sản xuất', 'Update to latest battery management software from manufacturer', 15, TRUE),
(1, 18, 'software', N'Cập nhật bản đồ và hệ thống giải trí', 'Update maps and infotainment', N'Cập nhật bản đồ, phần mềm màn hình giải trí', 'Update maps, infotainment system software', 15, FALSE);

-- =====================================================
-- SERVICE 2: Kiểm tra và bảo dưỡng pin (ID = 2)
-- Category: battery (Pin & Điện)
-- =====================================================
INSERT INTO service_checklist_items (service_id, step_order, category, item_name, item_name_en, item_description, item_description_en, estimated_time, is_required) VALUES

-- Kiểm tra tổng quan pin
(2, 1, 'battery', N'Kiểm tra ngoại quan pack pin', 'Visual inspection of battery pack', N'Kiểm tra vỏ ngoài pack pin, phát hiện biến dạng, hư hại, rò rỉ', 'Inspect battery pack exterior for deformation, damage, leaks', 10, TRUE),
(2, 2, 'battery', N'Đo điện áp mạch hở (OCV)', 'Measure Open Circuit Voltage', N'Đo OCV của pack pin sau khi xe nghỉ ít nhất 2 giờ', 'Measure pack OCV after vehicle rested for at least 2 hours', 10, TRUE),
(2, 3, 'battery', N'Kiểm tra dung lượng pin thực tế', 'Check actual battery capacity', N'Thực hiện test dung lượng, so sánh với dung lượng danh định', 'Perform capacity test, compare with rated capacity', 30, TRUE),

-- Kiểm tra từng cell/module
(2, 4, 'battery', N'Quét điện áp tất cả cell', 'Scan all cell voltages', N'Sử dụng thiết bị chẩn đoán đọc điện áp từng cell pin', 'Use diagnostic tool to read voltage of each battery cell', 20, TRUE),
(2, 5, 'battery', N'Phát hiện cell bất thường', 'Detect abnormal cells', N'Xác định cell có điện áp quá cao/thấp, cell yếu cần thay thế', 'Identify cells with abnormal voltage, weak cells needing replacement', 15, TRUE),
(2, 6, 'battery', N'Kiểm tra điện trở nội cell', 'Check cell internal resistance', N'Đo điện trở nội của các cell, phát hiện cell lão hóa', 'Measure internal resistance of cells, detect aging cells', 20, TRUE),

-- Cân bằng cell
(2, 7, 'battery', N'Thực hiện cân bằng cell thụ động', 'Perform passive cell balancing', N'Chạy quy trình cân bằng cell để đồng đều điện áp', 'Run cell balancing procedure to equalize voltages', 30, TRUE),
(2, 8, 'battery', N'Kiểm tra sau cân bằng', 'Post-balancing verification', N'Đo lại điện áp các cell sau khi cân bằng, delta < 30mV', 'Re-measure cell voltages after balancing, delta < 30mV', 15, TRUE),

-- BMS
(2, 9, 'bms', N'Đọc log lỗi BMS', 'Read BMS error logs', N'Đọc và phân tích lịch sử lỗi từ BMS', 'Read and analyze error history from BMS', 10, TRUE),
(2, 10, 'bms', N'Reset BMS nếu cần', 'Reset BMS if needed', N'Thực hiện reset BMS sau khi sửa lỗi', 'Perform BMS reset after fixing issues', 10, FALSE),
(2, 11, 'bms', N'Hiệu chuẩn SOC', 'Calibrate SOC', N'Hiệu chuẩn lại chỉ số State of Charge nếu sai lệch', 'Recalibrate State of Charge reading if inaccurate', 15, FALSE),

-- Hệ thống làm mát
(2, 12, 'cooling', N'Kiểm tra dung dịch làm mát pin', 'Check battery coolant', N'Kiểm tra màu sắc, nồng độ dung dịch làm mát', 'Check coolant color, concentration', 10, TRUE),
(2, 13, 'cooling', N'Làm sạch bộ tản nhiệt pin', 'Clean battery heat exchanger', N'Vệ sinh bộ trao đổi nhiệt của hệ thống làm mát pin', 'Clean heat exchanger of battery cooling system', 15, TRUE);

-- =====================================================
-- SERVICE 3: Thay lốp xe (ID = 3)
-- Category: tire (Lốp xe)
-- =====================================================
INSERT INTO service_checklist_items (service_id, step_order, category, item_name, item_name_en, item_description, item_description_en, estimated_time, is_required) VALUES

(3, 1, 'tire', N'Kiểm tra độ mòn lốp hiện tại', 'Check current tire wear', N'Đo độ sâu gai lốp, kiểm tra mòn không đều', 'Measure tread depth, check for uneven wear', 10, TRUE),
(3, 2, 'tire', N'Tháo lốp cũ', 'Remove old tires', N'Tháo 4 bánh xe, kiểm tra tình trạng mâm', 'Remove all 4 wheels, inspect rim condition', 20, TRUE),
(3, 3, 'tire', N'Kiểm tra mâm xe', 'Inspect wheel rims', N'Kiểm tra vết nứt, cong vênh, hư hại mâm xe', 'Check for cracks, bends, damage on rims', 10, TRUE),
(3, 4, 'tire', N'Lắp lốp mới', 'Mount new tires', N'Lắp lốp mới vào mâm, đảm bảo đúng chiều xoay', 'Mount new tires on rims, ensure correct rotation direction', 20, TRUE),
(3, 5, 'tire', N'Cân bằng động bánh xe', 'Dynamic wheel balancing', N'Cân bằng động tất cả 4 bánh xe', 'Dynamically balance all 4 wheels', 20, TRUE),
(3, 6, 'tire', N'Bơm áp suất theo chuẩn xe điện', 'Inflate to EV standard pressure', N'Bơm áp suất cao hơn xe thường do trọng lượng pin (thường 42-45 PSI)', 'Inflate higher than regular cars due to battery weight (usually 42-45 PSI)', 10, TRUE),
(3, 7, 'tire', N'Reset cảm biến TPMS', 'Reset TPMS sensors', N'Reset hệ thống cảm biến áp suất lốp sau khi thay', 'Reset tire pressure monitoring system after replacement', 10, TRUE),
(3, 8, 'tire', N'Test lái thử', 'Test drive', N'Lái thử kiểm tra rung lắc, tiếng ồn bất thường', 'Test drive to check vibration, abnormal noise', 15, TRUE);

-- =====================================================
-- SERVICE 4: Vá, sửa lốp (ID = 4)
-- Category: tire (Lốp xe)
-- =====================================================
INSERT INTO service_checklist_items (service_id, step_order, category, item_name, item_name_en, item_description, item_description_en, estimated_time, is_required) VALUES

(4, 1, 'tire', N'Xác định vị trí thủng', 'Locate puncture', N'Ngâm nước hoặc dùng xà phòng tìm vị trí thủng', 'Submerge in water or use soap to find puncture location', 10, TRUE),
(4, 2, 'tire', N'Đánh giá mức độ hư hại', 'Assess damage level', N'Kiểm tra kích thước lỗ thủng, quyết định vá hay thay', 'Check puncture size, decide to patch or replace', 5, TRUE),
(4, 3, 'tire', N'Tháo lốp khỏi mâm', 'Demount tire from rim', N'Sử dụng máy tháo lốp chuyên dụng', 'Use professional tire demounting machine', 10, TRUE),
(4, 4, 'tire', N'Xử lý bề mặt trong', 'Prepare inner surface', N'Mài nhám, làm sạch vùng cần vá', 'Roughen, clean area to be patched', 10, TRUE),
(4, 5, 'tire', N'Dán miếng vá', 'Apply patch', N'Dán miếng vá combo (nút + miếng) từ trong ra', 'Apply combo patch (plug + patch) from inside', 15, TRUE),
(4, 6, 'tire', N'Lắp lốp và bơm hơi', 'Mount tire and inflate', N'Lắp lại lốp, bơm áp suất chuẩn xe điện', 'Remount tire, inflate to EV standard pressure', 10, TRUE),
(4, 7, 'tire', N'Kiểm tra rò rỉ', 'Check for leaks', N'Ngâm nước kiểm tra không còn rò rỉ', 'Submerge to verify no remaining leaks', 5, TRUE),
(4, 8, 'tire', N'Cân bằng lại bánh xe', 'Rebalance wheel', N'Cân bằng động bánh xe đã sửa', 'Dynamically rebalance repaired wheel', 10, TRUE);

-- =====================================================
-- SERVICE 5: Kiểm tra hệ thống phanh (ID = 5)
-- Category: brake (Phanh)
-- =====================================================
INSERT INTO service_checklist_items (service_id, step_order, category, item_name, item_name_en, item_description, item_description_en, estimated_time, is_required) VALUES

-- Phanh cơ khí
(5, 1, 'brake', N'Kiểm tra độ dày má phanh trước', 'Check front brake pad thickness', N'Đo độ dày má phanh trước, tối thiểu 3mm', 'Measure front brake pad thickness, minimum 3mm', 10, TRUE),
(5, 2, 'brake', N'Kiểm tra độ dày má phanh sau', 'Check rear brake pad thickness', N'Đo độ dày má phanh sau, tối thiểu 3mm', 'Measure rear brake pad thickness, minimum 3mm', 10, TRUE),
(5, 3, 'brake', N'Kiểm tra đĩa phanh', 'Check brake rotors', N'Đo độ dày, kiểm tra rãnh, vết nứt đĩa phanh', 'Measure thickness, check grooves, cracks on rotors', 15, TRUE),
(5, 4, 'brake', N'Kiểm tra dầu phanh', 'Check brake fluid', N'Kiểm tra mức và chất lượng dầu phanh DOT4', 'Check DOT4 brake fluid level and quality', 5, TRUE),
(5, 5, 'brake', N'Kiểm tra đường ống phanh', 'Check brake lines', N'Kiểm tra rò rỉ, nứt vỡ đường ống dầu phanh', 'Inspect for leaks, cracks in brake lines', 10, TRUE),

-- Phanh tái sinh (đặc thù xe điện)
(5, 6, 'regen', N'Kiểm tra hệ thống phanh tái sinh', 'Check regenerative braking system', N'Test chức năng phanh tái sinh qua OBD', 'Test regenerative braking function via OBD', 15, TRUE),
(5, 7, 'regen', N'Đo hiệu suất phanh tái sinh', 'Measure regen braking efficiency', N'Đo năng lượng thu hồi khi phanh, so sánh với chuẩn', 'Measure energy recovered during braking, compare with standard', 15, TRUE),
(5, 8, 'regen', N'Kiểm tra phối hợp phanh blend', 'Check brake blending', N'Kiểm tra sự phối hợp giữa phanh tái sinh và phanh cơ khí', 'Check coordination between regen and mechanical braking', 10, TRUE),
(5, 9, 'regen', N'Kiểm tra sensor bàn đạp phanh', 'Check brake pedal sensor', N'Kiểm tra sensor vị trí bàn đạp phanh điều khiển phanh tái sinh', 'Check brake pedal position sensor controlling regen', 10, TRUE),

-- Phanh đỗ điện tử
(5, 10, 'brake', N'Kiểm tra phanh đỗ điện tử (EPB)', 'Check Electronic Parking Brake', N'Test chức năng đóng/mở phanh đỗ điện tử', 'Test electronic parking brake engage/release', 10, TRUE),
(5, 11, 'brake', N'Kiểm tra Auto Hold', 'Check Auto Hold function', N'Test chức năng giữ phanh tự động khi dừng xe', 'Test automatic brake hold function when stopped', 5, TRUE);

-- =====================================================
-- SERVICE 6: Cập nhật phần mềm hệ thống (ID = 6)
-- Category: software (Phần mềm)
-- =====================================================
INSERT INTO service_checklist_items (service_id, step_order, category, item_name, item_name_en, item_description, item_description_en, estimated_time, is_required) VALUES

(6, 1, 'software', N'Sao lưu cấu hình hiện tại', 'Backup current configuration', N'Sao lưu tất cả cài đặt, cấu hình hiện tại của xe', 'Backup all current vehicle settings and configurations', 10, TRUE),
(6, 2, 'software', N'Kiểm tra phiên bản firmware hiện tại', 'Check current firmware versions', N'Ghi nhận phiên bản firmware của tất cả ECU', 'Record firmware versions of all ECUs', 10, TRUE),
(6, 3, 'software', N'Kiểm tra bản cập nhật có sẵn', 'Check available updates', N'Kết nối server nhà sản xuất kiểm tra bản cập nhật mới', 'Connect to manufacturer server to check new updates', 10, TRUE),
(6, 4, 'software', N'Cập nhật ECU điều khiển chính (VCU)', 'Update main VCU', N'Cập nhật firmware Vehicle Control Unit', 'Update Vehicle Control Unit firmware', 20, TRUE),
(6, 5, 'software', N'Cập nhật phần mềm BMS', 'Update BMS software', N'Cập nhật Battery Management System firmware', 'Update Battery Management System firmware', 15, TRUE),
(6, 6, 'software', N'Cập nhật MCU (Motor Control Unit)', 'Update MCU', N'Cập nhật firmware điều khiển động cơ điện', 'Update electric motor control firmware', 15, TRUE),
(6, 7, 'software', N'Cập nhật phần mềm sạc (OBC)', 'Update OBC software', N'Cập nhật On-Board Charger firmware', 'Update On-Board Charger firmware', 15, TRUE),
(6, 8, 'software', N'Cập nhật màn hình giải trí', 'Update infotainment', N'Cập nhật phần mềm màn hình trung tâm', 'Update center display software', 15, TRUE),
(6, 9, 'software', N'Cập nhật hệ thống ADAS', 'Update ADAS system', N'Cập nhật phần mềm hỗ trợ lái xe nâng cao', 'Update Advanced Driver Assistance System software', 20, FALSE),
(6, 10, 'software', N'Cập nhật bản đồ điều hướng', 'Update navigation maps', N'Cập nhật dữ liệu bản đồ và điểm sạc', 'Update map data and charging station POIs', 15, FALSE),
(6, 11, 'software', N'Khởi động lại và kiểm tra', 'Restart and verify', N'Khởi động lại xe, kiểm tra tất cả chức năng hoạt động bình thường', 'Restart vehicle, verify all functions work normally', 15, TRUE),
(6, 12, 'software', N'Xóa mã lỗi sau cập nhật', 'Clear post-update error codes', N'Xóa mã lỗi tạm thời phát sinh trong quá trình cập nhật', 'Clear temporary error codes generated during update', 5, TRUE);

-- =====================================================
-- SERVICE 7: Vệ sinh và chăm sóc nội thất (ID = 7)
-- Category: cleaning (Vệ sinh)
-- =====================================================
INSERT INTO service_checklist_items (service_id, step_order, category, item_name, item_name_en, item_description, item_description_en, estimated_time, is_required) VALUES

(7, 1, 'cleaning', N'Hút bụi toàn bộ nội thất', 'Vacuum entire interior', N'Hút bụi ghế, sàn, khe ghế, cốp sau', 'Vacuum seats, floor, seat crevices, trunk', 20, TRUE),
(7, 2, 'cleaning', N'Vệ sinh ghế da/nỉ', 'Clean leather/fabric seats', N'Làm sạch ghế bằng dung dịch chuyên dụng', 'Clean seats with specialized solution', 25, TRUE),
(7, 3, 'cleaning', N'Vệ sinh taplo và bề mặt nhựa', 'Clean dashboard and plastic surfaces', N'Lau chùi, dưỡng bề mặt taplo, cửa, console', 'Wipe and condition dashboard, doors, console surfaces', 15, TRUE),
(7, 4, 'cleaning', N'Vệ sinh màn hình cảm ứng', 'Clean touchscreen displays', N'Vệ sinh màn hình bằng khăn microfiber và dung dịch chuyên dụng', 'Clean screens with microfiber cloth and specialized solution', 10, TRUE),
(7, 5, 'cleaning', N'Vệ sinh kính trong xe', 'Clean interior glass', N'Lau kính chắn gió, cửa sổ từ bên trong', 'Clean windshield, windows from inside', 10, TRUE),
(7, 6, 'cleaning', N'Vệ sinh cửa gió điều hòa', 'Clean AC vents', N'Làm sạch bụi bẩn trong các cửa gió điều hòa', 'Clean dust from AC vents', 10, TRUE),
(7, 7, 'cleaning', N'Khử mùi nội thất', 'Deodorize interior', N'Xử lý khử mùi hôi, mùi ẩm mốc trong xe', 'Treat and remove odors, musty smells', 15, TRUE),
(7, 8, 'cleaning', N'Dưỡng bề mặt da', 'Condition leather surfaces', N'Thoa kem dưỡng da cho ghế và các chi tiết da', 'Apply leather conditioner to seats and leather parts', 15, FALSE);

-- =====================================================
-- SERVICE 8: Rửa xe và đánh bóng (ID = 8)
-- Category: cleaning (Vệ sinh)
-- =====================================================
INSERT INTO service_checklist_items (service_id, step_order, category, item_name, item_name_en, item_description, item_description_en, estimated_time, is_required) VALUES

(8, 1, 'cleaning', N'Rửa sơ bộ loại bỏ bụi bẩn', 'Pre-wash to remove dirt', N'Xịt nước áp lực loại bỏ bụi, bùn đất', 'Pressure wash to remove dust, mud', 10, TRUE),
(8, 2, 'cleaning', N'Rửa xe bằng dung dịch chuyên dụng', 'Wash with car shampoo', N'Rửa toàn bộ thân xe với dung dịch trung tính', 'Wash entire body with pH-neutral solution', 20, TRUE),
(8, 3, 'cleaning', N'Rửa sạch lazang và lốp', 'Clean wheels and tires', N'Vệ sinh mâm xe, lốp xe bằng dung dịch chuyên dụng', 'Clean rims, tires with specialized solution', 15, TRUE),
(8, 4, 'cleaning', N'Rửa sạch cổng sạc', 'Clean charging port', N'Vệ sinh cẩn thận cổng sạc, kiểm tra không có nước đọng', 'Carefully clean charging port, ensure no water residue', 5, TRUE),
(8, 5, 'cleaning', N'Thổi khô toàn bộ xe', 'Blow dry entire vehicle', N'Thổi khô bằng máy thổi chuyên dụng', 'Blow dry with professional air blower', 15, TRUE),
(8, 6, 'cleaning', N'Đánh bóng sơn (nếu có gói)', 'Polish paint (if included)', N'Đánh bóng xử lý vết xước nhẹ trên sơn', 'Polish to treat minor scratches on paint', 30, FALSE),
(8, 7, 'cleaning', N'Phủ nano bảo vệ sơn', 'Apply nano coating', N'Phủ lớp nano bảo vệ bề mặt sơn xe', 'Apply nano protection layer on paint', 20, FALSE),
(8, 8, 'cleaning', N'Vệ sinh và bảo dưỡng gioăng cửa', 'Clean and treat door seals', N'Vệ sinh, thoa silicon bảo dưỡng gioăng cao su', 'Clean, apply silicone to rubber door seals', 10, TRUE);

-- =====================================================
-- SERVICE 9: Kiểm tra hệ thống điều hòa (ID = 9)
-- Category: hvac (Điều hòa)
-- =====================================================
INSERT INTO service_checklist_items (service_id, step_order, category, item_name, item_name_en, item_description, item_description_en, estimated_time, is_required) VALUES

(9, 1, 'hvac', N'Kiểm tra hoạt động máy nén điện', 'Check electric compressor operation', N'Kiểm tra máy nén điều hòa điện hoạt động bình thường', 'Check electric AC compressor operates normally', 10, TRUE),
(9, 2, 'hvac', N'Đo áp suất gas lạnh', 'Measure refrigerant pressure', N'Đo áp suất gas R134a hoặc R1234yf', 'Measure R134a or R1234yf refrigerant pressure', 10, TRUE),
(9, 3, 'hvac', N'Kiểm tra rò rỉ gas', 'Check for refrigerant leaks', N'Sử dụng thiết bị dò gas kiểm tra rò rỉ', 'Use gas detector to check for leaks', 15, TRUE),
(9, 4, 'hvac', N'Kiểm tra nhiệt độ cửa gió', 'Check vent temperature', N'Đo nhiệt độ không khí tại cửa gió, phải đạt 4-8°C', 'Measure air temperature at vents, should be 4-8°C', 10, TRUE),
(9, 5, 'hvac', N'Kiểm tra lọc gió cabin', 'Check cabin air filter', N'Kiểm tra tình trạng lọc gió điều hòa', 'Inspect cabin air filter condition', 5, TRUE),
(9, 6, 'hvac', N'Thay lọc gió cabin (nếu cần)', 'Replace cabin air filter (if needed)', N'Thay thế lọc gió mới nếu bẩn hoặc quá hạn', 'Replace with new filter if dirty or expired', 10, FALSE),
(9, 7, 'hvac', N'Vệ sinh dàn lạnh', 'Clean evaporator', N'Phun dung dịch vệ sinh khử khuẩn dàn lạnh', 'Spray cleaning/disinfecting solution on evaporator', 15, TRUE),
(9, 8, 'hvac', N'Kiểm tra hệ thống sưởi PTC', 'Check PTC heater system', N'Kiểm tra bộ sưởi PTC điện (thay thế sưởi xăng)', 'Check electric PTC heater (replaces fuel heater)', 10, TRUE),
(9, 9, 'hvac', N'Kiểm tra bơm nhiệt (Heat Pump)', 'Check heat pump', N'Kiểm tra hoạt động bơm nhiệt cho xe có trang bị', 'Check heat pump operation for equipped vehicles', 15, FALSE),
(9, 10, 'hvac', N'Kiểm tra quạt gió trong xe', 'Check blower motor', N'Kiểm tra quạt gió hoạt động ở các tốc độ', 'Check blower operates at all speeds', 5, TRUE);

-- =====================================================
-- SERVICE 10: Kiểm tra hệ thống treo (ID = 10)
-- Category: suspension (Hệ thống treo)
-- =====================================================
INSERT INTO service_checklist_items (service_id, step_order, category, item_name, item_name_en, item_description, item_description_en, estimated_time, is_required) VALUES

(10, 1, 'suspension', N'Kiểm tra giảm xóc trước', 'Check front shock absorbers', N'Kiểm tra rò rỉ dầu, đàn hồi giảm xóc trước', 'Check for oil leaks, rebound of front shocks', 10, TRUE),
(10, 2, 'suspension', N'Kiểm tra giảm xóc sau', 'Check rear shock absorbers', N'Kiểm tra rò rỉ dầu, đàn hồi giảm xóc sau', 'Check for oil leaks, rebound of rear shocks', 10, TRUE),
(10, 3, 'suspension', N'Kiểm tra lò xo', 'Check springs', N'Kiểm tra vết nứt, gãy, độ cao lò xo', 'Check for cracks, breaks, spring height', 10, TRUE),
(10, 4, 'suspension', N'Kiểm tra thanh giằng', 'Check strut bars', N'Kiểm tra thanh cân bằng, thanh giằng', 'Check stabilizer bars, strut bars', 10, TRUE),
(10, 5, 'suspension', N'Kiểm tra cao su chân máy/gầm', 'Check bushings and mounts', N'Kiểm tra cao su chân máy (motor mount), cao su gầm', 'Check motor mounts, subframe bushings', 15, TRUE),
(10, 6, 'suspension', N'Kiểm tra rotuyn', 'Check ball joints', N'Kiểm tra độ rơ của rotuyn', 'Check ball joint play', 10, TRUE),
(10, 7, 'suspension', N'Kiểm tra hệ thống treo khí (nếu có)', 'Check air suspension (if equipped)', N'Kiểm tra túi khí, máy nén cho xe có treo khí', 'Check air bags, compressor for air suspension equipped vehicles', 15, FALSE),
(10, 8, 'suspension', N'Kiểm tra cảm biến độ cao', 'Check ride height sensors', N'Kiểm tra cảm biến điều chỉnh độ cao gầm xe', 'Check sensors controlling ride height', 10, FALSE);

-- =====================================================
-- SERVICE 11: Cân chỉnh và định vị bánh xe (ID = 11)
-- Category: tire (Lốp xe)
-- =====================================================
INSERT INTO service_checklist_items (service_id, step_order, category, item_name, item_name_en, item_description, item_description_en, estimated_time, is_required) VALUES

(11, 1, 'tire', N'Kiểm tra áp suất lốp', 'Check tire pressure', N'Kiểm tra và điều chỉnh áp suất 4 lốp theo chuẩn xe điện', 'Check and adjust pressure of all 4 tires to EV standard', 10, TRUE),
(11, 2, 'tire', N'Kiểm tra độ mòn lốp', 'Check tire wear pattern', N'Quan sát kiểu mòn lốp để phát hiện vấn đề góc đặt bánh', 'Observe tire wear pattern to detect alignment issues', 10, TRUE),
(11, 3, 'tire', N'Đưa xe lên bệ cân chỉnh', 'Position vehicle on alignment rack', N'Đặt xe lên thiết bị cân chỉnh góc đặt bánh', 'Position vehicle on wheel alignment equipment', 5, TRUE),
(11, 4, 'tire', N'Đo góc Camber', 'Measure Camber angle', N'Đo góc nghiêng ngang bánh xe, chuẩn: -0.5° đến 0°', 'Measure wheel tilt angle, standard: -0.5° to 0°', 10, TRUE),
(11, 5, 'tire', N'Đo góc Caster', 'Measure Caster angle', N'Đo góc nghiêng trục lái, đảm bảo cân bằng 2 bên', 'Measure steering axis tilt, ensure both sides balanced', 10, TRUE),
(11, 6, 'tire', N'Đo góc Toe', 'Measure Toe angle', N'Đo độ chụm bánh xe, điều chỉnh theo thông số', 'Measure wheel toe, adjust to specifications', 10, TRUE),
(11, 7, 'tire', N'Điều chỉnh góc đặt bánh', 'Adjust wheel alignment', N'Điều chỉnh các góc đặt bánh theo thông số nhà sản xuất', 'Adjust alignment angles to manufacturer specifications', 20, TRUE),
(11, 8, 'tire', N'In báo cáo cân chỉnh', 'Print alignment report', N'In báo cáo trước/sau cân chỉnh cho khách hàng', 'Print before/after alignment report for customer', 5, TRUE),
(11, 9, 'tire', N'Kiểm tra hệ thống lái', 'Check steering system', N'Kiểm tra độ rơ vô lăng, khớp lái', 'Check steering wheel play, steering joints', 10, TRUE);

-- =====================================================
-- SERVICE 12: Kiểm tra toàn diện (ID = 12)
-- Category: inspection (Kiểm tra)
-- =====================================================
INSERT INTO service_checklist_items (service_id, step_order, category, item_name, item_name_en, item_description, item_description_en, estimated_time, is_required) VALUES

-- Pin & BMS
(12, 1, 'battery', N'Kiểm tra tổng quan hệ thống pin HV', 'HV battery system overview check', N'Kiểm tra nhanh điện áp, SOC, SOH pin cao áp', 'Quick check of HV battery voltage, SOC, SOH', 15, TRUE),
(12, 2, 'bms', N'Đọc mã lỗi BMS', 'Read BMS error codes', N'Quét và đọc tất cả mã lỗi hệ thống quản lý pin', 'Scan and read all battery management system error codes', 10, TRUE),
(12, 3, 'cooling', N'Kiểm tra hệ thống làm mát pin', 'Check battery cooling system', N'Kiểm tra mức nước làm mát, nhiệt độ pin', 'Check coolant level, battery temperature', 10, TRUE),

-- Motor & Inverter
(12, 4, 'motor', N'Kiểm tra động cơ điện', 'Check electric motor', N'Kiểm tra tiếng kêu, rung động, nhiệt độ motor', 'Check motor noise, vibration, temperature', 10, TRUE),
(12, 5, 'motor', N'Kiểm tra inverter', 'Check inverter', N'Kiểm tra nhiệt độ, mã lỗi inverter', 'Check inverter temperature, error codes', 10, TRUE),

-- Phanh
(12, 6, 'brake', N'Kiểm tra hệ thống phanh', 'Check brake system', N'Kiểm tra má phanh, đĩa phanh, dầu phanh', 'Check brake pads, rotors, brake fluid', 15, TRUE),
(12, 7, 'regen', N'Kiểm tra phanh tái sinh', 'Check regenerative braking', N'Test chức năng phanh tái sinh', 'Test regenerative braking function', 10, TRUE),

-- Lốp & Treo
(12, 8, 'tire', N'Kiểm tra lốp xe', 'Check tires', N'Kiểm tra áp suất, độ mòn 4 lốp', 'Check pressure, wear of all 4 tires', 10, TRUE),
(12, 9, 'suspension', N'Kiểm tra hệ thống treo', 'Check suspension', N'Kiểm tra giảm xóc, thanh giằng, cao su', 'Check shocks, stabilizer bars, bushings', 10, TRUE),

-- Điện & Điều hòa
(12, 10, 'electrical', N'Kiểm tra hệ thống điện 12V', 'Check 12V electrical system', N'Kiểm tra ắc quy 12V, đèn, còi, gạt mưa', 'Check 12V battery, lights, horn, wipers', 10, TRUE),
(12, 11, 'hvac', N'Kiểm tra điều hòa', 'Check AC system', N'Kiểm tra hoạt động làm mát, sưởi', 'Check cooling, heating operation', 10, TRUE),
(12, 12, 'electrical', N'Kiểm tra cổng sạc', 'Check charging port', N'Kiểm tra cổng sạc AC/DC, kiểm tra đèn báo', 'Check AC/DC charging port, indicator lights', 10, TRUE),

-- Phần mềm
(12, 13, 'software', N'Chẩn đoán toàn xe (OBD)', 'Full vehicle diagnostics (OBD)', N'Quét toàn bộ ECU, đọc và phân tích mã lỗi', 'Scan all ECUs, read and analyze error codes', 15, TRUE),
(12, 14, 'software', N'Kiểm tra phiên bản phần mềm', 'Check software versions', N'Ghi nhận phiên bản firmware các hệ thống', 'Record firmware versions of all systems', 10, TRUE),
(12, 15, 'software', N'Lập báo cáo kiểm tra chi tiết', 'Create detailed inspection report', N'Tổng hợp kết quả kiểm tra, đề xuất bảo dưỡng', 'Compile inspection results, recommend maintenance', 15, TRUE);

-- =====================================================
-- SERVICE 13: Thay nước làm mát (ID = 13)
-- Category: cooling (Làm mát)
-- =====================================================
INSERT INTO service_checklist_items (service_id, step_order, category, item_name, item_name_en, item_description, item_description_en, estimated_time, is_required) VALUES

(13, 1, 'cooling', N'Kiểm tra màu và tình trạng nước làm mát cũ', 'Check old coolant condition', N'Đánh giá màu sắc, độ đục của nước làm mát hiện tại', 'Evaluate color, clarity of current coolant', 5, TRUE),
(13, 2, 'cooling', N'Xả nước làm mát hệ thống pin', 'Drain battery coolant', N'Xả sạch nước làm mát mạch pin qua van xả', 'Drain battery circuit coolant through drain valve', 15, TRUE),
(13, 3, 'cooling', N'Xả nước làm mát motor/inverter', 'Drain motor/inverter coolant', N'Xả nước làm mát mạch motor và inverter', 'Drain motor and inverter circuit coolant', 15, TRUE),
(13, 4, 'cooling', N'Vệ sinh hệ thống làm mát', 'Flush cooling system', N'Xả rửa hệ thống bằng nước sạch loại bỏ cặn bẩn', 'Flush system with clean water to remove deposits', 20, TRUE),
(13, 5, 'cooling', N'Kiểm tra đường ống và khớp nối', 'Check hoses and fittings', N'Kiểm tra rò rỉ, nứt vỡ đường ống làm mát', 'Check for leaks, cracks in cooling hoses', 10, TRUE),
(13, 6, 'cooling', N'Châm nước làm mát mới - Pin', 'Fill new coolant - Battery', N'Châm dung dịch làm mát mới cho mạch pin (loại non-conductive)', 'Fill new coolant for battery circuit (non-conductive type)', 15, TRUE),
(13, 7, 'cooling', N'Châm nước làm mát mới - Motor', 'Fill new coolant - Motor', N'Châm dung dịch làm mát mới cho mạch motor', 'Fill new coolant for motor circuit', 15, TRUE),
(13, 8, 'cooling', N'Xả khí hệ thống làm mát', 'Bleed cooling system', N'Xả hết khí trong hệ thống, đảm bảo tuần hoàn tốt', 'Bleed all air from system, ensure good circulation', 15, TRUE),
(13, 9, 'cooling', N'Kiểm tra rò rỉ sau khi châm', 'Check for leaks after filling', N'Chạy thử và kiểm tra rò rỉ tại các điểm nối', 'Run and check for leaks at all connection points', 10, TRUE),
(13, 10, 'cooling', N'Test nhiệt độ hoạt động', 'Test operating temperature', N'Vận hành xe, theo dõi nhiệt độ pin và motor', 'Operate vehicle, monitor battery and motor temperature', 15, TRUE);

-- =====================================================
-- SERVICE 14: Bảo dưỡng định kỳ cơ bản (ID = 14)
-- Category: maintenance (Bảo dưỡng)
-- =====================================================
INSERT INTO service_checklist_items (service_id, step_order, category, item_name, item_name_en, item_description, item_description_en, estimated_time, is_required) VALUES

(14, 1, 'battery', N'Kiểm tra điện áp pin HV', 'Check HV battery voltage', N'Đo và ghi nhận điện áp pack pin cao áp', 'Measure and record HV battery pack voltage', 10, TRUE),
(14, 2, 'battery', N'Kiểm tra SOH pin', 'Check battery SOH', N'Đọc State of Health qua OBD', 'Read State of Health via OBD', 5, TRUE),
(14, 3, 'cooling', N'Kiểm tra mức nước làm mát', 'Check coolant level', N'Kiểm tra mức nước làm mát pin và motor', 'Check battery and motor coolant levels', 5, TRUE),
(14, 4, 'brake', N'Kiểm tra má phanh', 'Check brake pads', N'Kiểm tra độ dày má phanh 4 bánh', 'Check thickness of all 4 brake pads', 15, TRUE),
(14, 5, 'brake', N'Kiểm tra dầu phanh', 'Check brake fluid', N'Kiểm tra mức và màu dầu phanh', 'Check brake fluid level and color', 5, TRUE),
(14, 6, 'tire', N'Kiểm tra áp suất lốp', 'Check tire pressure', N'Đo và điều chỉnh áp suất 4 lốp', 'Measure and adjust pressure of all 4 tires', 10, TRUE),
(14, 7, 'tire', N'Kiểm tra độ mòn lốp', 'Check tire wear', N'Đo độ sâu gai, kiểm tra mòn không đều', 'Measure tread depth, check uneven wear', 10, TRUE),
(14, 8, 'electrical', N'Kiểm tra đèn chiếu sáng', 'Check lights', N'Kiểm tra tất cả đèn pha, xi nhan, đèn phanh', 'Check all headlights, turn signals, brake lights', 10, TRUE),
(14, 9, 'electrical', N'Kiểm tra ắc quy 12V', 'Check 12V battery', N'Đo điện áp ắc quy 12V phụ', 'Measure auxiliary 12V battery voltage', 5, TRUE),
(14, 10, 'electrical', N'Kiểm tra gạt mưa', 'Check wipers', N'Kiểm tra tình trạng lưỡi gạt, hoạt động', 'Check wiper blade condition, operation', 5, TRUE),
(14, 11, 'software', N'Chẩn đoán nhanh OBD', 'Quick OBD diagnostics', N'Quét nhanh mã lỗi các hệ thống', 'Quick scan for error codes in all systems', 10, TRUE);

-- =====================================================
-- SERVICE 15: Cứu hộ khẩn cấp (ID = 15)
-- Category: emergency (Cứu hộ)
-- =====================================================
INSERT INTO service_checklist_items (service_id, step_order, category, item_name, item_name_en, item_description, item_description_en, estimated_time, is_required) VALUES

(15, 1, 'emergency', N'Tiếp nhận thông tin sự cố', 'Receive incident information', N'Ghi nhận vị trí, tình trạng xe, loại sự cố', 'Record location, vehicle condition, type of incident', 5, TRUE),
(15, 2, 'emergency', N'Hướng dẫn an toàn qua điện thoại', 'Phone safety guidance', N'Hướng dẫn khách hàng các bước an toàn cần thiết', 'Guide customer on necessary safety steps', 5, TRUE),
(15, 3, 'emergency', N'Kiểm tra an toàn khi đến nơi', 'On-site safety check', N'Đánh giá rủi ro, đảm bảo an toàn khu vực', 'Assess risks, ensure area safety', 10, TRUE),
(15, 4, 'emergency', N'Kiểm tra hệ thống HV có an toàn', 'Check HV system safety', N'Kiểm tra không có rò rỉ HV, không có nguy cơ cháy', 'Check no HV leaks, no fire risk', 10, TRUE),
(15, 5, 'emergency', N'Ngắt nguồn HV nếu cần', 'Disconnect HV if needed', N'Sử dụng quy trình ngắt nguồn HV an toàn', 'Use safe HV disconnection procedure', 10, FALSE),
(15, 6, 'emergency', N'Chẩn đoán nhanh sự cố', 'Quick fault diagnosis', N'Xác định nguyên nhân không khởi động/không chạy được', 'Determine cause of no-start/no-drive condition', 15, TRUE),
(15, 7, 'emergency', N'Sạc pin khẩn cấp (nếu hết pin)', 'Emergency charging (if battery depleted)', N'Sạc tối thiểu để xe có thể di chuyển', 'Charge minimum for vehicle to move', 30, FALSE),
(15, 8, 'emergency', N'Kích hoạt chế độ vận chuyển', 'Activate transport mode', N'Đưa xe vào chế độ vận chuyển an toàn', 'Put vehicle in safe transport mode', 5, FALSE),
(15, 9, 'emergency', N'Kéo xe về xưởng (nếu cần)', 'Tow to workshop (if needed)', N'Sử dụng xe cứu hộ chuyên dụng cho xe điện', 'Use EV-specialized tow truck', 30, FALSE),
(15, 10, 'emergency', N'Lập biên bản cứu hộ', 'Create rescue report', N'Ghi nhận chi tiết sự cố và các bước đã thực hiện', 'Document incident details and steps taken', 10, TRUE);

-- =====================================================
-- INDEX để tăng performance query
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_service_checklist_items_service_id ON service_checklist_items(service_id);
CREATE INDEX IF NOT EXISTS idx_service_checklist_items_category ON service_checklist_items(category);
CREATE INDEX IF NOT EXISTS idx_service_checklist_items_step_order ON service_checklist_items(service_id, step_order);
