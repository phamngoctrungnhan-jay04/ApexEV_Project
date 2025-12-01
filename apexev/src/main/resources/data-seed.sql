-- Seed data for HR Management Module
-- Run this after database schema is created

-- Insert Leave Types
INSERT INTO leave_types (code, name, is_paid, accrual_rate, max_days_per_year, requires_document, is_active)
VALUES 
    ('ANNUAL', 'Phép năm', true, 1.0, 12, false, true),
    ('SICK', 'Nghỉ ốm', true, NULL, 7, true, true),
    ('UNPAID', 'Nghỉ không lương', false, NULL, NULL, false, true),
    ('MATERNITY', 'Nghỉ thai sản', true, NULL, 180, true, true),
    ('PATERNITY', 'Nghỉ chăm con', true, NULL, 10, false, true);

-- Insert KPIs
INSERT INTO kpis (name, description, weight, is_active)
VALUES 
    ('Năng suất làm việc', 'Đánh giá khả năng hoàn thành công việc đúng hạn và chất lượng', 0.25, true),
    ('Chất lượng công việc', 'Đánh giá mức độ chính xác và chuyên nghiệp trong công việc', 0.25, true),
    ('Tinh thần làm việc nhóm', 'Đánh giá khả năng hợp tác và hỗ trợ đồng nghiệp', 0.15, true),
    ('Sáng tạo và đổi mới', 'Đánh giá khả năng đưa ra giải pháp mới và cải tiến quy trình', 0.15, true),
    ('Kỷ luật và trách nhiệm', 'Đánh giá sự tuân thủ quy định và ý thức trách nhiệm', 0.20, true);

