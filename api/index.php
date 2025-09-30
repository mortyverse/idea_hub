<?php
/**
 * API Endpoints for Idea Hub
 * 아이디어 허브 API 엔드포인트
 */

// Include configuration and functions
require_once '../config/config.php';
require_once '../includes/functions.php';

// Set JSON response header
header('Content-Type: application/json; charset=utf-8');

// Enable CORS for development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the requested endpoint
$endpoint = $_GET['endpoint'] ?? '';

try {
    switch ($endpoint) {
        case 'auth-status':
            handleAuthStatus();
            break;
            
        case 'user-info':
            handleUserInfo();
            break;
            
        case 'site-config':
            handleSiteConfig();
            break;
            
        default:
            throw new Exception('Invalid endpoint');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

/**
 * Handle authentication status check
 * 인증 상태 확인 처리
 */
function handleAuthStatus() {
    $isLoggedIn = isLoggedIn();
    
    echo json_encode([
        'success' => true,
        'data' => [
            'isLoggedIn' => $isLoggedIn,
            'userId' => $isLoggedIn ? getCurrentUserId() : null
        ]
    ]);
}

/**
 * Handle user info request
 * 사용자 정보 요청 처리
 */
function handleUserInfo() {
    if (!isLoggedIn()) {
        throw new Exception('User not logged in');
    }
    
    $user = getCurrentUser();
    
    echo json_encode([
        'success' => true,
        'data' => $user
    ]);
}

/**
 * Handle site configuration request
 * 사이트 설정 요청 처리
 */
function handleSiteConfig() {
    echo json_encode([
        'success' => true,
        'data' => [
            'siteName' => SITE_NAME,
            'siteDescription' => SITE_DESCRIPTION,
            'siteUrl' => SITE_URL,
            'assetsUrl' => ASSETS_URL,
            'uploadsUrl' => UPLOADS_URL
        ]
    ]);
}
?>
