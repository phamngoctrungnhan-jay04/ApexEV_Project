-- Fix: Cho phép template_id = NULL trong bảng service_checklists
-- Nguyên nhân: Không phải service nào cũng có template cố định

USE apexev;

-- Bước 1: Xóa foreign key constraint cũ (nếu có)
ALTER TABLE service_checklists 
DROP FOREIGN KEY IF EXISTS fk_service_checklists_template;

-- Bước 2: Thay đổi column thành NULLABLE
ALTER TABLE service_checklists 
MODIFY COLUMN template_id BIGINT NULL;

-- Bước 3: Thêm lại foreign key constraint (với nullable)
ALTER TABLE service_checklists
ADD CONSTRAINT fk_service_checklists_template
FOREIGN KEY (template_id) 
REFERENCES checklist_templates(template_id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Kiểm tra kết quả
DESCRIBE service_checklists;
