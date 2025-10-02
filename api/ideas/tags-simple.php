<?php
/**
 * 간단한 태그 목록 API (테스트용)
 * Simple Tags List API (for testing)
 */

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
    $sort = $_GET['sort'] ?? 'usage_count';
    
    // Load tags from ideas data
    $dataFile = '../../data/ideas.json';
    $allTags = [];
    
    if (file_exists($dataFile)) {
        $ideasData = json_decode(file_get_contents($dataFile), true) ?: [];
        $tagCounts = [];
        
        // Count tag usage from ideas
        foreach ($ideasData as $idea) {
            if (isset($idea['tags']) && is_array($idea['tags'])) {
                foreach ($idea['tags'] as $tag) {
                    $tagCounts[$tag] = ($tagCounts[$tag] ?? 0) + 1;
                }
            }
        }
        
        // Convert to array format
        $id = 1;
        foreach ($tagCounts as $tagName => $count) {
            $allTags[] = [
                'id' => $id++,
                'name' => $tagName,
                'usage_count' => $count,
                'created_at' => date('Y-m-d H:i:s')
            ];
        }
    }
    
    // If no tags found, provide some default tags
    if (empty($allTags)) {
        $allTags = [
            ['id' => 1, 'name' => '기술', 'usage_count' => 0, 'created_at' => date('Y-m-d H:i:s')],
            ['id' => 2, 'name' => '창의', 'usage_count' => 0, 'created_at' => date('Y-m-d H:i:s')],
            ['id' => 3, 'name' => '교육', 'usage_count' => 0, 'created_at' => date('Y-m-d H:i:s')],
            ['id' => 4, 'name' => '환경', 'usage_count' => 0, 'created_at' => date('Y-m-d H:i:s')],
            ['id' => 5, 'name' => 'AI', 'usage_count' => 0, 'created_at' => date('Y-m-d H:i:s')],
            ['id' => 6, 'name' => '협업', 'usage_count' => 0, 'created_at' => date('Y-m-d H:i:s')],
            ['id' => 7, 'name' => '비즈니스', 'usage_count' => 0, 'created_at' => date('Y-m-d H:i:s')],
            ['id' => 8, 'name' => '디자인', 'usage_count' => 0, 'created_at' => date('Y-m-d H:i:s')]
        ];
    }
    
    // Apply search filter
    $filteredTags = $allTags;
    if (!empty($search)) {
        $filteredTags = array_filter($filteredTags, function($tag) use ($search) {
            return stripos($tag['name'], $search) !== false;
        });
    }
    
    // Sort tags
    usort($filteredTags, function($a, $b) use ($sort) {
        switch ($sort) {
            case 'usage_count':
                return $b['usage_count'] - $a['usage_count'];
            case 'name':
                return strcmp($a['name'], $b['name']);
            case 'created_at':
                return strcmp($b['created_at'], $a['created_at']);
            default:
                return $b['usage_count'] - $a['usage_count'];
        }
    });
    
    // Apply limit
    $limitedTags = array_slice($filteredTags, 0, $limit);
    
    // Format response
    $formattedTags = array_map(function($tag) {
        return [
            'id' => (int)$tag['id'],
            'name' => $tag['name'],
            'usage_count' => (int)$tag['usage_count'],
            'created_at' => $tag['created_at']
        ];
    }, $limitedTags);
    
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
    error_log("Simple tags API failed: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => '태그 목록을 가져오는 중 오류가 발생했습니다.'
    ]);
}
?>
