<?php
/**
 * 아이디어 상세 API
 * Idea Detail API
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
    // Get idea ID from query parameter
    $ideaId = (int)($_GET['id'] ?? 0);
    
    if ($ideaId <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => '유효하지 않은 아이디어 ID입니다.'
        ]);
        exit();
    }
    
    // Get database connection
    $db = getDB();
    
    // Get idea details
    $idea = getIdeaDetails($db, $ideaId);
    
    if (!$idea) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => '아이디어를 찾을 수 없습니다.'
        ]);
        exit();
    }
    
    // Update view count
    updateViewCount($db, $ideaId);
    
    // Get comments
    $comments = getComments($db, $ideaId);
    
    // Get related ideas (same tags)
    $relatedIdeas = getRelatedIdeas($db, $ideaId);
    
    // Format response
    $formattedIdea = [
        'id' => (int)$idea['id'],
        'title' => $idea['title'],
        'content' => $idea['content'],
        'writer' => $idea['writer'],
        'created_at' => $idea['created_at'],
        'updated_at' => $idea['updated_at'],
        'view_count' => (int)$idea['view_count'] + 1, // Include the view count increment
        'fork_count' => (int)$idea['fork_count'],
        'comment_count' => (int)$idea['comment_count'],
        'tags' => $idea['tags'] ? explode(',', $idea['tags']) : [],
        'relative_time' => getRelativeTime($idea['created_at']),
        'comments' => $comments,
        'related_ideas' => $relatedIdeas
    ];
    
    // Return success response
    echo json_encode([
        'success' => true,
        'data' => $formattedIdea
    ]);
    
} catch (Exception $e) {
    // Log error
    logError("Idea detail API failed", [
        'error' => $e->getMessage(),
        'idea_id' => $ideaId ?? 0
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => '아이디어 상세 정보를 가져오는 중 오류가 발생했습니다.'
    ]);
}

/**
 * Get idea details
 * 아이디어 상세 정보 가져오기
 */
function getIdeaDetails($db, $ideaId) {
    $sql = "SELECT i.*, 
                   GROUP_CONCAT(t.name ORDER BY t.usage_count DESC) as tags
            FROM ideas i
            LEFT JOIN idea_tags it ON i.id = it.idea_id
            LEFT JOIN tags t ON it.tag_id = t.id
            WHERE i.id = :idea_id AND i.status = 'active'
            GROUP BY i.id";
    
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
    $stmt->execute();
    
    return $stmt->fetch();
}

/**
 * Update view count
 * 조회수 업데이트
 */
function updateViewCount($db, $ideaId) {
    $sql = "UPDATE ideas SET view_count = view_count + 1 WHERE id = :idea_id";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
    $stmt->execute();
}

/**
 * Get comments for the idea
 * 아이디어의 댓글 가져오기
 */
function getComments($db, $ideaId) {
    $sql = "SELECT id, writer, content, created_at, updated_at
            FROM comments 
            WHERE idea_id = :idea_id AND status = 'active'
            ORDER BY created_at ASC
            LIMIT 50";
    
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
    $stmt->execute();
    
    $comments = $stmt->fetchAll();
    
    return array_map(function($comment) {
        return [
            'id' => (int)$comment['id'],
            'writer' => $comment['writer'],
            'content' => $comment['content'],
            'created_at' => $comment['created_at'],
            'relative_time' => getRelativeTime($comment['created_at'])
        ];
    }, $comments);
}

/**
 * Get related ideas (same tags)
 * 관련 아이디어 가져오기 (같은 태그)
 */
function getRelatedIdeas($db, $ideaId) {
    $sql = "SELECT DISTINCT i.id, i.title, i.writer, i.created_at, i.view_count, i.fork_count, i.comment_count
            FROM ideas i
            JOIN idea_tags it1 ON i.id = it1.idea_id
            JOIN idea_tags it2 ON it1.tag_id = it2.tag_id
            WHERE it2.idea_id = :idea_id 
            AND i.id != :idea_id 
            AND i.status = 'active'
            ORDER BY i.view_count DESC, i.created_at DESC
            LIMIT 5";
    
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
    $stmt->execute();
    
    $ideas = $stmt->fetchAll();
    
    return array_map(function($idea) {
        return [
            'id' => (int)$idea['id'],
            'title' => $idea['title'],
            'writer' => $idea['writer'],
            'created_at' => $idea['created_at'],
            'view_count' => (int)$idea['view_count'],
            'fork_count' => (int)$idea['fork_count'],
            'comment_count' => (int)$idea['comment_count'],
            'relative_time' => getRelativeTime($idea['created_at'])
        ];
    }, $ideas);
}
?>
