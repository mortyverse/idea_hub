<?php
/**
 * 아이디어 목록 API
 * Ideas List API
 */

// Include configuration and functions
require_once '../../config/config.php';

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
    $sort = $_GET['sort'] ?? 'created_at'; // created_at, view_count, fork_count, comment_count
    $order = strtoupper($_GET['order'] ?? 'DESC'); // ASC, DESC
    $search = $_GET['search'] ?? '';
    $tag = $_GET['tag'] ?? '';
    $writer = $_GET['writer'] ?? '';
    
    // Validate parameters
    $allowedSorts = ['created_at', 'view_count', 'fork_count', 'comment_count', 'title'];
    if (!in_array($sort, $allowedSorts)) {
        $sort = 'created_at';
    }
    
    if (!in_array($order, ['ASC', 'DESC'])) {
        $order = 'DESC';
    }
    
    // Calculate offset
    $offset = ($page - 1) * $limit;
    
    // Get database connection
    $db = getDB();
    
    // Build query
    $sql = "SELECT i.id, i.title, i.content, i.writer, i.created_at, 
                   i.view_count, i.fork_count, i.comment_count,
                   GROUP_CONCAT(t.name ORDER BY t.usage_count DESC) as tags
            FROM ideas i
            LEFT JOIN idea_tags it ON i.id = it.idea_id
            LEFT JOIN tags t ON it.tag_id = t.id
            WHERE i.status = 'active'";
    
    $params = [];
    
    // Add search condition
    if (!empty($search)) {
        $sql .= " AND (i.title LIKE :search OR i.content LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }
    
    // Add tag filter
    if (!empty($tag)) {
        $sql .= " AND i.id IN (
                    SELECT it2.idea_id 
                    FROM idea_tags it2 
                    JOIN tags t2 ON it2.tag_id = t2.id 
                    WHERE t2.name = :tag
                  )";
        $params[':tag'] = $tag;
    }
    
    // Add writer filter
    if (!empty($writer)) {
        $sql .= " AND i.writer LIKE :writer";
        $params[':writer'] = '%' . $writer . '%';
    }
    
    // Group by idea
    $sql .= " GROUP BY i.id";
    
    // Add sorting
    $sql .= " ORDER BY i." . $sort . " " . $order . ", i.created_at DESC";
    
    // Add pagination
    $sql .= " LIMIT :limit OFFSET :offset";
    $params[':limit'] = $limit;
    $params[':offset'] = $offset;
    
    $stmt = $db->prepare($sql);
    
    // Bind parameters
    foreach ($params as $key => $value) {
        if (in_array($key, [':limit', ':offset'])) {
            $stmt->bindValue($key, $value, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($key, $value, PDO::PARAM_STR);
        }
    }
    
    $stmt->execute();
    $ideas = $stmt->fetchAll();
    
    // Get total count for pagination
    $countSql = "SELECT COUNT(DISTINCT i.id) as total
                 FROM ideas i
                 LEFT JOIN idea_tags it ON i.id = it.idea_id
                 LEFT JOIN tags t ON it.tag_id = t.id
                 WHERE i.status = 'active'";
    
    $countParams = [];
    
    // Add same conditions as main query
    if (!empty($search)) {
        $countSql .= " AND (i.title LIKE :search OR i.content LIKE :search)";
        $countParams[':search'] = '%' . $search . '%';
    }
    
    if (!empty($tag)) {
        $countSql .= " AND i.id IN (
                        SELECT it2.idea_id 
                        FROM idea_tags it2 
                        JOIN tags t2 ON it2.tag_id = t2.id 
                        WHERE t2.name = :tag
                      )";
        $countParams[':tag'] = $tag;
    }
    
    if (!empty($writer)) {
        $countSql .= " AND i.writer LIKE :writer";
        $countParams[':writer'] = '%' . $writer . '%';
    }
    
    $countStmt = $db->prepare($countSql);
    foreach ($countParams as $key => $value) {
        $countStmt->bindValue($key, $value, PDO::PARAM_STR);
    }
    
    $countStmt->execute();
    $totalCount = $countStmt->fetchColumn();
    
    // Format response
    $formattedIdeas = array_map(function($idea) {
        return [
            'id' => (int)$idea['id'],
            'title' => $idea['title'],
            'content' => mb_substr($idea['content'], 0, 200) . (mb_strlen($idea['content']) > 200 ? '...' : ''),
            'writer' => $idea['writer'],
            'created_at' => $idea['created_at'],
            'view_count' => (int)$idea['view_count'],
            'fork_count' => (int)$idea['fork_count'],
            'comment_count' => (int)$idea['comment_count'],
            'tags' => $idea['tags'] ? explode(',', $idea['tags']) : [],
            'relative_time' => getRelativeTime($idea['created_at'])
        ];
    }, $ideas);
    
    // Calculate pagination info
    $totalPages = ceil($totalCount / $limit);
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
                'total_count' => (int)$totalCount,
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
    logError("Ideas list API failed", [
        'error' => $e->getMessage(),
        'page' => $page ?? 1,
        'limit' => $limit ?? 10
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => '아이디어 목록을 가져오는 중 오류가 발생했습니다.'
    ]);
}
?>
