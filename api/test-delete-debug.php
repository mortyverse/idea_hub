<?php
/**
 * 삭제 API 디버깅 테스트
 * Delete API Debug Test
 */

// Include configuration
require_once '../config/config.php';

// Set JSON response header
header('Content-Type: application/json; charset=utf-8');

try {
    // Test database connection
    $db = getDB();
    echo json_encode([
        'success' => true,
        'message' => '데이터베이스 연결 성공',
        'debug_info' => [
            'php_version' => PHP_VERSION,
            'pdo_available' => extension_loaded('pdo'),
            'pdo_mysql_available' => extension_loaded('pdo_mysql'),
            'debug_mode' => DEBUG_MODE,
            'log_errors' => LOG_ERRORS,
            'current_time' => date('Y-m-d H:i:s')
        ]
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug_info' => [
            'php_version' => PHP_VERSION,
            'pdo_available' => extension_loaded('pdo'),
            'pdo_mysql_available' => extension_loaded('pdo_mysql'),
            'debug_mode' => DEBUG_MODE ?? 'undefined',
            'log_errors' => LOG_ERRORS ?? 'undefined'
        ]
    ]);
}
?>
