-- 为现有的contact_messages表添加待办事项相关字段
ALTER TABLE `contact_messages` 
ADD COLUMN `is_processed` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已处理' AFTER `created_at`,
ADD COLUMN `processed_at` datetime NULL COMMENT '处理时间' AFTER `is_processed`,
ADD COLUMN `todo_status` enum('待定', '进行中', '完成') NOT NULL DEFAULT 'pending' COMMENT '待办状态' AFTER `processed_at`,
ADD COLUMN `todo_notes` text COMMENT '待办备注' AFTER `todo_status`,
ADD INDEX `idx_is_processed` (`is_processed`),
ADD INDEX `idx_todo_status` (`todo_status`);
