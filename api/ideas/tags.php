<?php
/**
 * 태그 목록 API
 * Tags List API
 */

// Include configuration and functions with error handling
// Try multiple paths for dothome hosting
$configPaths = [
    '../../config/config.php',
    '../config/config.php',
    '/config/config.php',
    'config/config.php'
];

$configLoaded = false;
foreach ($configPaths as $path) {
    if (file_exists($path)) {
        try {
            require_once $path;
            $configLoaded = true;
            break;
        } catch (Exception $e) {
            continue;
        }
    }
}

if (!$configLoaded) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Configuration file not found'
    ]);
    exit();
}

// Set JSON response header
header('Content-Type: application/json; charset=utf-8');

// Enable CORS for development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed. Only GET requests are accepted.'
    ]);
    exit();
}

try {
    // Get query parameters
    $search = $_GET['search'] ?? '';
    $limit = min((int)($_GET['limit'] ?? 20), 50); // Max 50 tags
    $sort = $_GET['sort'] ?? 'usage_count'; // usage_count, name, created_at
    
    // Validate sort parameter
    $allowedSorts = ['usage_count', 'name', 'created_at'];
    if (!in_array($sort, $allowedSorts)) {
        $sort = 'usage_count';
    }
    
    // Get database connection
    $db = getDB();
    
    // Build query
    $sql = "SELECT id, name, usage_count, created_at 
            FROM tags 
            WHERE 1=1";
    $params = [];
    
    // Add search condition
    if (!empty($search)) {
        $sql .= " AND name LIKE :search";
        $params[':search'] = '%' . $search . '%';
    }
    
    // Add sorting
    $sql .= " ORDER BY " . $sort . " DESC, name ASC";
    
    // Add limit
    $sql .= " LIMIT :limit";
    $params[':limit'] = $limit;
    
    $stmt = $db->prepare($sql);
    
    // Bind parameters
    foreach ($params as $key => $value) {
        if ($key === ':limit') {
            $stmt->bindValue($key, $value, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($key, $value, PDO::PARAM_STR);
        }
    }
    
    $stmt->execute();
    $tags = $stmt->fetchAll();
    
    // Format response
    $formattedTags = array_map(function($tag) {
        return [
            'id' => (int)$tag['id'],
            'name' => $tag['name'],
            'usage_count' => (int)$tag['usage_count'],
            'created_at' => $tag['created_at']
        ];
    }, $tags);
    
    // Return success response
    echo json_encode([
        'success' => true,
        'data' => [
            'tags' => $formattedTags,
            'total' => count($formattedTags),
            'search' => $search,
            'sort' => $sort
        ]
    ]);
    
} catch (Exception $e) {
    // Log error
    logError("Tags API failed", [
        'error' => $e->getMessage(),
        'search' => $search ?? '',
        'limit' => $limit ?? 20
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => '태그 목록을 가져오는 중 오류가 발생했습니다.'
    ]);
}
?>
