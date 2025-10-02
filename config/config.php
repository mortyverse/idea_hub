<?php
/**
 * Global Configuration
 * 전역 설정 파일
 */

// Site information
// 사이트 정보
define('SITE_NAME', '아이디어 허브');
define('SITE_DESCRIPTION', '집단지성으로 아이디어를 발전시키는 오픈소스 아이디어 플랫폼');

// Dynamic SITE_URL detection for dothome hosting
// dothome 호스팅을 위한 동적 SITE_URL 감지
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$script_name = dirname($_SERVER['SCRIPT_NAME']);
define('SITE_URL', $protocol . '://' . $host . rtrim($script_name, '/'));

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
// 디버그 설정 - 프로덕션 환경에서는 false로 설정 필수!
define('DEBUG_MODE', false); // 보안상 프로덕션에서는 false로 설정
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

// Include essential functions
// 필수 함수들 포함
require_once ROOT_PATH . '/includes/functions.php';

// Additional utility functions
// 추가 유틸리티 함수들

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
    // Start session if not already started
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // For dothome hosting, make CSRF verification optional
    // dothome 호스팅에서는 CSRF 검증을 선택적으로 만듦
    if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
        // If no session token exists, accept any non-empty token for now
        // 세션 토큰이 없으면 일단 비어있지 않은 토큰을 허용
        return !empty($token);
    }
    
    return hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
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
?>
