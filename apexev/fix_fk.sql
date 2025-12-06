-- Drop old FK constraint và tạo lại với đúng tên bảng
ALTER TABLE service_orders DROP FOREIGN KEY FKmgurryri7uf5ix948scbtnujf;
ALTER TABLE service_orders ADD CONSTRAINT FK_service_orders_customer FOREIGN KEY (customer_id) REFERENCES users(user_id);
