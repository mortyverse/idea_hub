<?php
/**
 * Essential Functions for Idea Hub
 * 아이디어 허브 핵심 함수들
 * 
 * 하이브리드 방식: 정적 HTML + 필요한 PHP 기능만 제공
 */

// Start session if not already started
// 세션이 시작되지 않았다면 시작
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Check if user is logged in
 * 사용자 로그인 상태 확인
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Get current user ID
 * 현재 사용자 ID 가져오기
 */
function getCurrentUserId() {
    return isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
}

/**
 * Get current user data
 * 현재 사용자 데이터 가져오기
 */
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'] ?? 'Unknown',
        'email' => $_SESSION['email'] ?? ''
    ];
}

/**
 * Escape HTML output
 * HTML 출력 이스케이프
 */
function e($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
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

/**
 * Generate random string
 * 랜덤 문자열 생성
 */
function generateRandomString($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Log error
 * 오류 로그
 */
function logError($message, $context = []) {
    if (LOG_ERRORS) {
        $logMessage = date('Y-m-d H:i:s') . ' - ' . $message;
        if (!empty($context)) {
            $logMessage .= ' - Context: ' . json_encode($context);
        }
        error_log($logMessage);
    }
}

/**
 * Redirect to a page
 * 페이지로 리다이렉트
 */
function redirect($url) {
    header("Location: " . $url);
    exit();
}

/**
 * Validate email
 * 이메일 검증
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate password strength
 * 비밀번호 강도 검증
 */
function validatePassword($password) {
    if (strlen($password) < PASSWORD_MIN_LENGTH) {
        return false;
    }
    
    // Check for at least one letter and one number
    // 최소 하나의 문자와 하나의 숫자 확인
    return preg_match('/[A-Za-z]/', $password) && preg_match('/[0-9]/', $password);
}
?>