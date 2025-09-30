<?php
/**
 * Global Configuration
 * 전역 설정 파일
 */

// Site information
// 사이트 정보
define('SITE_NAME', '아이디어 허브');
define('SITE_DESCRIPTION', '집단지성으로 아이디어를 발전시키는 오픈소스 아이디어 플랫폼');
define('SITE_URL', 'http://localhost');
define('SITE_VERSION', '1.0.0');

// Paths
// 경로 설정
define('ROOT_PATH', dirname(__DIR__));
define('INCLUDES_PATH', ROOT_PATH . '/includes');
define('COMPONENTS_PATH', ROOT_PATH . '/components');
define('ASSETS_PATH', ROOT_PATH . '/assets');
define('UPLOADS_PATH', ROOT_PATH . '/uploads');

// URLs
// URL 설정
define('ASSETS_URL', SITE_URL . '/assets');
define('UPLOADS_URL', SITE_URL . '/uploads');

// Pagination settings
// 페이지네이션 설정
define('ITEMS_PER_PAGE', 10);
define('MAX_PAGES_DISPLAY', 5);

// File upload settings
// 파일 업로드 설정
define('MAX_FILE_SIZE', 2 * 1024 * 1024); // 2MB
define('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif']);
define('ALLOWED_DOCUMENT_TYPES', ['pdf', 'doc', 'docx', 'txt']);

// Security settings
// 보안 설정
define('SESSION_TIMEOUT', 3600); // 1 hour
define('CSRF_TOKEN_NAME', 'csrf_token');
define('PASSWORD_MIN_LENGTH', 8);

// Debug settings
// 디버그 설정
define('DEBUG_MODE', true);
define('LOG_ERRORS', true);

// Timezone
// 시간대 설정
date_default_timezone_set('Asia/Seoul');

// Error reporting
// 오류 보고 설정
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Session settings
// 세션 설정
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 0); // Set to 1 for HTTPS

// Include database configuration
// 데이터베이스 설정 포함
require_once ROOT_PATH . '/config/database.php';

// Utility functions
// 유틸리티 함수들

/**
 * Generate CSRF token
 * CSRF 토큰 생성
 */
function generateCSRFToken() {
    if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    return $_SESSION[CSRF_TOKEN_NAME];
}

/**
 * Verify CSRF token
 * CSRF 토큰 검증
 */
function verifyCSRFToken($token) {
    return isset($_SESSION[CSRF_TOKEN_NAME]) && hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
}

/**
 * Sanitize input
 * 입력값 정화
 */
function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Format date
 * 날짜 포맷팅
 */
function formatDate($date, $format = 'Y-m-d H:i:s') {
    return date($format, strtotime($date));
}

/**
 * Get relative time
 * 상대적 시간 표시
 */
function getRelativeTime($datetime) {
    $time = time() - strtotime($datetime);
    
    if ($time < 60) return '방금 전';
    if ($time < 3600) return floor($time/60) . '분 전';
    if ($time < 86400) return floor($time/3600) . '시간 전';
    if ($time < 2592000) return floor($time/86400) . '일 전';
    if ($time < 31536000) return floor($time/2592000) . '개월 전';
    return floor($time/31536000) . '년 전';
}
?>
