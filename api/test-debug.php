<?php
/**
 * Debug API for dothome deployment testing
 * dothome 배포 테스트용 디버그 API
 */

// Error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON response header
header('Content-Type: application/json; charset=utf-8');

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Test database connection
    require_once '../config/config.php';
    
    $db = getDB();
    $dbTest = "Database connection successful";
    
    // Test basic query
    $stmt = $db->query("SELECT 1 as test");
    $result = $stmt->fetch();
    $queryTest = $result ? "Query test successful" : "Query test failed";
    
    // Test session
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $sessionTest = "Session started successfully";
    
    // Test CSRF token generation
    $csrfToken = generateCSRFToken();
    $csrfTest = "CSRF token generated: " . substr($csrfToken, 0, 10) . "...";
    
    echo json_encode([
        'success' => true,
        'message' => 'Debug test completed',
        'tests' => [
            'database' => $dbTest,
            'query' => $queryTest,
            'session' => $sessionTest,
            'csrf' => $csrfTest
        ],
        'environment' => [
            'php_version' => PHP_VERSION,
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
            'script_name' => $_SERVER['SCRIPT_NAME'] ?? 'Unknown',
            'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'Unknown',
            'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'Not set'
        ],
        'config' => [
            'site_url' => SITE_URL,
            'db_host' => DB_HOST,
            'db_name' => DB_NAME,
            'db_user' => DB_USER,
            'debug_mode' => DEBUG_MODE
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
