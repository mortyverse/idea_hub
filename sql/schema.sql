-- =============================================
-- 아이디어 허브 데이터베이스 스키마
-- Idea Hub Database Schema
-- =============================================

-- 데이터베이스 생성 (필요시)
-- CREATE DATABASE IF NOT EXISTS idea_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE idea_hub;

-- =============================================
-- 1. 아이디어 테이블 (ideas)
-- =============================================
CREATE TABLE IF NOT EXISTS `ideas` (
    `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '아이디어 고유 번호',
    `title` VARCHAR(255) NOT NULL COMMENT '아이디어 제목',
    `content` TEXT NOT NULL COMMENT '아이디어 상세 설명',
    `writer` VARCHAR(100) NOT NULL COMMENT '작성자',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    `view_count` INT(11) DEFAULT 0 COMMENT '조회수',
    `fork_count` INT(11) DEFAULT 0 COMMENT '포크 수',
    `comment_count` INT(11) DEFAULT 0 COMMENT '댓글 수',
    `forked_from_id` INT(11) NULL COMMENT '원본 아이디어 ID (포크된 경우)',
    `status` ENUM('active', 'deleted', 'draft') DEFAULT 'active' COMMENT '상태',
    PRIMARY KEY (`id`),
    INDEX `idx_writer` (`writer`),
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_view_count` (`view_count`),
    INDEX `idx_fork_count` (`fork_count`),
    INDEX `idx_forked_from` (`forked_from_id`),
    INDEX `idx_status` (`status`),
    FOREIGN KEY (`forked_from_id`) REFERENCES `ideas`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='아이디어 게시판';

-- =============================================
-- 2. 태그 테이블 (tags)
-- =============================================
CREATE TABLE IF NOT EXISTS `tags` (
    `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '태그 고유 번호',
    `name` VARCHAR(50) NOT NULL COMMENT '태그 이름',
    `usage_count` INT(11) DEFAULT 1 COMMENT '사용 횟수',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_tag_name` (`name`),
    INDEX `idx_usage_count` (`usage_count`),
    INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='태그';

-- =============================================
-- 3. 아이디어-태그 연결 테이블 (idea_tags)
-- =============================================
CREATE TABLE IF NOT EXISTS `idea_tags` (
    `idea_id` INT(11) NOT NULL COMMENT '아이디어 ID',
    `tag_id` INT(11) NOT NULL COMMENT '태그 ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '연결일',
    PRIMARY KEY (`idea_id`, `tag_id`),
    INDEX `idx_tag_id` (`tag_id`),
    FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='아이디어-태그 연결';

-- =============================================
-- 4. 댓글 테이블 (comments)
-- =============================================
CREATE TABLE IF NOT EXISTS `comments` (
    `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '댓글 고유 번호',
    `idea_id` INT(11) NOT NULL COMMENT '아이디어 ID',
    `writer` VARCHAR(100) NOT NULL COMMENT '작성자',
    `content` TEXT NOT NULL COMMENT '댓글 내용',
    `parent_comment_id` INT(11) NULL COMMENT '부모 댓글 ID (대댓글용)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    `status` ENUM('active', 'deleted') DEFAULT 'active' COMMENT '상태',
    PRIMARY KEY (`id`),
    INDEX `idx_idea_id` (`idea_id`),
    INDEX `idx_writer` (`writer`),
    INDEX `idx_parent_comment` (`parent_comment_id`),
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_status` (`status`),
    FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`parent_comment_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='댓글';

-- =============================================
-- 5. 마인드맵 노드 테이블 (mindmap_nodes)
-- =============================================
CREATE TABLE IF NOT EXISTS `mindmap_nodes` (
    `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '노드 고유 번호',
    `idea_id` INT(11) NOT NULL COMMENT '아이디어 ID',
    `node_text` VARCHAR(500) NOT NULL COMMENT '노드 텍스트',
    `parent_node_id` INT(11) NULL COMMENT '부모 노드 ID',
    `position_x` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'X좌표',
    `position_y` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Y좌표',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    `created_by` VARCHAR(100) NOT NULL COMMENT '생성자',
    PRIMARY KEY (`id`),
    INDEX `idx_idea_id` (`idea_id`),
    INDEX `idx_parent_node` (`parent_node_id`),
    INDEX `idx_position` (`position_x`, `position_y`),
    FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`parent_node_id`) REFERENCES `mindmap_nodes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='마인드맵 노드';

-- =============================================
-- 6. 사용자 테이블 (users) - 향후 확장용
-- =============================================
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '사용자 고유 번호',
    `username` VARCHAR(50) NOT NULL COMMENT '사용자명',
    `email` VARCHAR(100) NOT NULL COMMENT '이메일',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '비밀번호 해시',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '가입일',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    `status` ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '상태',
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_username` (`username`),
    UNIQUE KEY `unique_email` (`email`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자';

-- =============================================
-- 트리거: 아이디어 삭제 시 댓글 수 업데이트
-- =============================================
DELIMITER $$
CREATE TRIGGER `update_comment_count_on_delete` 
AFTER DELETE ON `comments`
FOR EACH ROW
BEGIN
    UPDATE `ideas` 
    SET `comment_count` = (
        SELECT COUNT(*) 
        FROM `comments` 
        WHERE `idea_id` = OLD.idea_id 
        AND `status` = 'active'
    )
    WHERE `id` = OLD.idea_id;
END$$
DELIMITER ;

-- =============================================
-- 트리거: 댓글 추가 시 아이디어 댓글 수 업데이트
-- =============================================
DELIMITER $$
CREATE TRIGGER `update_comment_count_on_insert` 
AFTER INSERT ON `comments`
FOR EACH ROW
BEGIN
    UPDATE `ideas` 
    SET `comment_count` = (
        SELECT COUNT(*) 
        FROM `comments` 
        WHERE `idea_id` = NEW.idea_id 
        AND `status` = 'active'
    )
    WHERE `id` = NEW.idea_id;
END$$
DELIMITER ;

-- =============================================
-- 트리거: 태그 사용 시 사용 횟수 업데이트
-- =============================================
DELIMITER $$
CREATE TRIGGER `update_tag_usage_on_insert` 
AFTER INSERT ON `idea_tags`
FOR EACH ROW
BEGIN
    UPDATE `tags` 
    SET `usage_count` = `usage_count` + 1 
    WHERE `id` = NEW.tag_id;
END$$
DELIMITER ;

-- =============================================
-- 트리거: 태그 연결 해제 시 사용 횟수 업데이트
-- =============================================
DELIMITER $$
CREATE TRIGGER `update_tag_usage_on_delete` 
AFTER DELETE ON `idea_tags`
FOR EACH ROW
BEGIN
    UPDATE `tags` 
    SET `usage_count` = GREATEST(`usage_count` - 1, 0) 
    WHERE `id` = OLD.tag_id;
END$$
DELIMITER ;

-- =============================================
-- 인덱스 최적화를 위한 추가 인덱스
-- =============================================

-- 복합 인덱스들
CREATE INDEX `idx_ideas_status_created` ON `ideas` (`status`, `created_at` DESC);
CREATE INDEX `idx_ideas_writer_created` ON `ideas` (`writer`, `created_at` DESC);
CREATE INDEX `idx_comments_idea_status` ON `comments` (`idea_id`, `status`, `created_at` ASC);

-- =============================================
-- 완료 메시지
-- =============================================
SELECT 'Database schema created successfully!' as message;
