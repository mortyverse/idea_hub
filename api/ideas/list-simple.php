<?php
/**
 * 간단한 아이디어 목록 API (테스트용)
 * Simple Ideas List API (for testing)
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
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min((int)($_GET['limit'] ?? 10), 50); // Max 50 per page
    $sort = $_GET['sort'] ?? 'created_at';
    $order = strtoupper($_GET['order'] ?? 'DESC');
    $search = $_GET['search'] ?? '';
    $tag = $_GET['tag'] ?? '';
    $writer = $_GET['writer'] ?? '';
    
    // Load ideas from file-based storage
    $dataFile = '../../data/ideas.json';
    $allIdeas = [];
    
    if (file_exists($dataFile)) {
        $ideasData = json_decode(file_get_contents($dataFile), true) ?: [];
        $allIdeas = $ideasData;
    }
    
    // If no ideas found, provide some sample data
    if (empty($allIdeas)) {
        $allIdeas = [
            [
                'id' => 1,
                'title' => '샘플 아이디어',
                'content' => '이것은 샘플 아이디어입니다. 실제 아이디어를 작성해보세요!',
                'writer' => '샘플작성자',
                'created_at' => date('Y-m-d H:i:s', time() - 7200),
                'view_count' => 0,
                'fork_count' => 0,
                'comment_count' => 0,
                'tags' => ['샘플']
            ]
        ];
    }
    
    // Apply filters
    $filteredIdeas = $allIdeas;
    
    // Search filter
    if (!empty($search)) {
        $filteredIdeas = array_filter($filteredIdeas, function($idea) use ($search) {
            return stripos($idea['title'], $search) !== false || 
                   stripos($idea['content'], $search) !== false;
        });
    }
    
    // Tag filter
    if (!empty($tag)) {
        $filteredIdeas = array_filter($filteredIdeas, function($idea) use ($tag) {
            return in_array($tag, $idea['tags']);
        });
    }
    
    // Writer filter
    if (!empty($writer)) {
        $filteredIdeas = array_filter($filteredIdeas, function($idea) use ($writer) {
            return stripos($idea['writer'], $writer) !== false;
        });
    }
    
    // Sort ideas
    usort($filteredIdeas, function($a, $b) use ($sort, $order) {
        $valueA = $a[$sort];
        $valueB = $b[$sort];
        
        if (is_numeric($valueA) && is_numeric($valueB)) {
            return $order === 'ASC' ? $valueA - $valueB : $valueB - $valueA;
        } else {
            return $order === 'ASC' ? strcmp($valueA, $valueB) : strcmp($valueB, $valueA);
        }
    });
    
    // Calculate pagination
    $totalCount = count($filteredIdeas);
    $totalPages = ceil($totalCount / $limit);
    $offset = ($page - 1) * $limit;
    
    // Get page data
    $pageIdeas = array_slice($filteredIdeas, $offset, $limit);
    
    // Format response
    $formattedIdeas = array_map(function($idea) {
        return [
            'id' => $idea['id'],
            'title' => $idea['title'],
            'content' => mb_substr($idea['content'], 0, 200) . (mb_strlen($idea['content']) > 200 ? '...' : ''),
            'writer' => $idea['writer'],
            'created_at' => $idea['created_at'],
            'view_count' => $idea['view_count'],
            'fork_count' => $idea['fork_count'],
            'comment_count' => $idea['comment_count'],
            'tags' => $idea['tags'],
            'relative_time' => getRelativeTime($idea['created_at'])
        ];
    }, $pageIdeas);
    
    // Calculate pagination info
    $hasNext = $page < $totalPages;
    $hasPrev = $page > 1;
    
    // Return success response
    echo json_encode([
        'success' => true,
        'data' => [
            'ideas' => $formattedIdeas,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'total_count' => $totalCount,
                'per_page' => $limit,
                'has_next' => $hasNext,
                'has_prev' => $hasPrev
            ],
            'filters' => [
                'search' => $search,
                'tag' => $tag,
                'writer' => $writer,
                'sort' => $sort,
                'order' => $order
            ]
        ]
    ]);
    
} catch (Exception $e) {
    // Log error
    error_log("Simple ideas list API failed: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => '아이디어 목록을 가져오는 중 오류가 발생했습니다.'
    ]);
}

/**
 * Get relative time string
 * 상대 시간 문자열 생성
 */
function getRelativeTime($datetime) {
    $time = time() - strtotime($datetime);
    
    if ($time < 60) {
        return '방금 전';
    } elseif ($time < 3600) {
        return floor($time / 60) . '분 전';
    } elseif ($time < 86400) {
        return floor($time / 3600) . '시간 전';
    } elseif ($time < 2592000) {
        return floor($time / 86400) . '일 전';
    } else {
        return date('Y-m-d', strtotime($datetime));
    }
}
?>
