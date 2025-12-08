-- Manual fix: allow nullable templates + link checklist results to base items
-- Run this script inside the target database (default schema: apexev)

USE apexev;

-- =========================
-- 1) service_checklists.template_id -> nullable
-- =========================
SET @fk_sc_template := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'service_checklists'
      AND COLUMN_NAME = 'template_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);
SET @sql_sc_drop := IF(@fk_sc_template IS NOT NULL,
    CONCAT('ALTER TABLE service_checklists DROP FOREIGN KEY ', @fk_sc_template, ';'),
    'SELECT 1;'
);
PREPARE stmt FROM @sql_sc_drop;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE service_checklists
    MODIFY COLUMN template_id BIGINT NULL;

ALTER TABLE service_checklists
    ADD CONSTRAINT fk_service_checklists_template
    FOREIGN KEY (template_id)
    REFERENCES checklist_templates(template_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- =========================
-- 2) service_checklist_results: template item nullable + link to service item
-- =========================
SET @fk_scr_template := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'service_checklist_results'
      AND COLUMN_NAME = 'template_item_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);
SET @sql_scr_drop := IF(@fk_scr_template IS NOT NULL,
    CONCAT('ALTER TABLE service_checklist_results DROP FOREIGN KEY ', @fk_scr_template, ';'),
    'SELECT 1;'
);
PREPARE stmt2 FROM @sql_scr_drop;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

ALTER TABLE service_checklist_results
    MODIFY COLUMN template_item_id BIGINT NULL;

ALTER TABLE service_checklist_results
    ADD CONSTRAINT fk_scr_template_item
    FOREIGN KEY (template_item_id)
    REFERENCES checklist_template_items(template_item_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

SET @column_scr_item := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'service_checklist_results'
      AND COLUMN_NAME = 'service_checklist_item_id'
);
SET @sql_add_scr_item := IF(@column_scr_item = 0,
    'ALTER TABLE service_checklist_results ADD COLUMN service_checklist_item_id BIGINT NULL AFTER checklist_id;',
    'SELECT 1;'
);
PREPARE stmt_add_scr_item FROM @sql_add_scr_item;
EXECUTE stmt_add_scr_item;
DEALLOCATE PREPARE stmt_add_scr_item;

-- Drop FK if script rerun
SET @fk_scr_item := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'service_checklist_results'
      AND COLUMN_NAME = 'service_checklist_item_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);
SET @sql_scr_item_drop := IF(@fk_scr_item IS NOT NULL,
    CONCAT('ALTER TABLE service_checklist_results DROP FOREIGN KEY ', @fk_scr_item, ';'),
    'SELECT 1;'
);
PREPARE stmt3 FROM @sql_scr_item_drop;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

ALTER TABLE service_checklist_results
    ADD CONSTRAINT fk_scr_service_item
    FOREIGN KEY (service_checklist_item_id)
    REFERENCES service_checklist_items(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- =========================
-- 3) Fix service_checklists.technician_id FK (references wrong table name)
-- =========================
SET @fk_sc_technician := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'service_checklists'
      AND COLUMN_NAME = 'technician_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);
SET @sql_sc_tech_drop := IF(@fk_sc_technician IS NOT NULL,
    CONCAT('ALTER TABLE service_checklists DROP FOREIGN KEY ', @fk_sc_technician, ';'),
    'SELECT 1;'
);
PREPARE stmt_tech FROM @sql_sc_tech_drop;
EXECUTE stmt_tech;
DEALLOCATE PREPARE stmt_tech;

-- Make technician_id nullable and match data type with users.user_id (int, not bigint)
ALTER TABLE service_checklists
    MODIFY COLUMN technician_id INT NULL;

ALTER TABLE service_checklists
    ADD CONSTRAINT fk_service_checklists_technician
    FOREIGN KEY (technician_id)
    REFERENCES users(user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Optional sanity checks
DESCRIBE service_checklists;
DESCRIBE service_checklist_results;
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    COLUMN_TYPE,
    IS_NULLABLE
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'user_id';