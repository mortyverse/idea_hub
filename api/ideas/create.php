<?php
/**
 * 아이디어 생성 API
 * Idea Creation API
 */

// Include configuration and functions
require_once '../../config/config.php';

// Set JSON response header
header('Content-Type: application/json; charset=utf-8');

// Enable CORS for development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed. Only POST requests are accepted.'
    ]);
    exit();
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate input
    $validation = validateInput($input);
    if (!$validation['valid']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $validation['error']
        ]);
        exit();
    }
    
    // Extract validated data
    $title = $validation['data']['title'];
    $content = $validation['data']['content'];
    $writer = $validation['data']['writer'];
    $tags = $validation['data']['tags'];
    
    // Get database connection
    $db = getDB();
    
    // Start transaction
    $db->beginTransaction();
    
    try {
        // Insert idea into database
        $ideaId = insertIdea($db, $title, $content, $writer);
        
        // Process tags
        if (!empty($tags)) {
            processTags($db, $ideaId, $tags);
        }
        
        // Commit transaction
        $db->commit();
        
        // Log successful creation
        logError("Idea created successfully", [
            'idea_id' => $ideaId,
            'title' => $title,
            'writer' => $writer,
            'tags_count' => count($tags)
        ]);
        
        // Return success response
        echo json_encode([
            'success' => true,
            'data' => [
                'idea_id' => $ideaId,
                'message' => '아이디어가 성공적으로 등록되었습니다.',
                'redirect_url' => '../pages/ideas/detail.html?id=' . $ideaId
            ]
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction
        $db->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    // Log error
    logError("Idea creation failed", [
        'error' => $e->getMessage(),
        'input' => $input ?? null
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => '아이디어 등록 중 오류가 발생했습니다. 다시 시도해주세요.'
    ]);
}

/**
 * Validate input data
 * 입력 데이터 검증
 */
function validateInput($input) {
    $errors = [];
    
    // Check if input is valid JSON
    if (json_last_error() !== JSON_ERROR_NONE) {
        return [
            'valid' => false,
            'error' => 'Invalid JSON input'
        ];
    }
    
    // Check required fields
    if (!isset($input['title']) || empty(trim($input['title']))) {
        $errors[] = '제목을 입력해주세요.';
    } elseif (strlen(trim($input['title'])) > 100) {
        $errors[] = '제목은 100자 이하로 입력해주세요.';
    }
    
    if (!isset($input['content']) || empty(trim($input['content']))) {
        $errors[] = '내용을 입력해주세요.';
    } elseif (strlen(trim($input['content'])) > 5000) {
        $errors[] = '내용은 5000자 이하로 입력해주세요.';
    }
    
    if (!isset($input['writer']) || empty(trim($input['writer']))) {
        $errors[] = '작성자명을 입력해주세요.';
    } elseif (strlen(trim($input['writer'])) > 50) {
        $errors[] = '작성자명은 50자 이하로 입력해주세요.';
    }
    
    // Validate tags
    if (isset($input['tags']) && is_array($input['tags'])) {
        if (count($input['tags']) > 10) {
            $errors[] = '태그는 최대 10개까지 입력할 수 있습니다.';
        }
        
        foreach ($input['tags'] as $tag) {
            if (strlen(trim($tag)) > 20) {
                $errors[] = '태그는 20자 이하로 입력해주세요.';
                break;
            }
        }
    }
    
    // Check CSRF token (if provided)
    if (isset($input['csrf_token'])) {
        if (!verifyCSRFToken($input['csrf_token'])) {
            $errors[] = '보안 토큰이 유효하지 않습니다.';
        }
    }
    
    if (!empty($errors)) {
        return [
            'valid' => false,
            'error' => implode(' ', $errors)
        ];
    }
    
    return [
        'valid' => true,
        'data' => [
            'title' => sanitizeInput($input['title']),
            'content' => sanitizeInput($input['content']),
            'writer' => sanitizeInput($input['writer']),
            'tags' => isset($input['tags']) ? array_map('sanitizeInput', $input['tags']) : []
        ]
    ];
}

/**
 * Insert idea into database
 * 데이터베이스에 아이디어 삽입
 */
function insertIdea($db, $title, $content, $writer) {
    $sql = "INSERT INTO ideas (title, content, writer, created_at, status) 
            VALUES (:title, :content, :writer, NOW(), 'active')";
    
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':title', $title, PDO::PARAM_STR);
    $stmt->bindParam(':content', $content, PDO::PARAM_STR);
    $stmt->bindParam(':writer', $writer, PDO::PARAM_STR);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to insert idea');
    }
    
    return $db->lastInsertId();
}

/**
 * Process tags for the idea
 * 아이디어의 태그 처리
 */
function processTags($db, $ideaId, $tags) {
    foreach ($tags as $tagName) {
        $tagName = trim($tagName);
        if (empty($tagName)) continue;
        
        // Get or create tag
        $tagId = getOrCreateTag($db, $tagName);
        
        // Link tag to idea
        linkTagToIdea($db, $ideaId, $tagId);
    }
}

/**
 * Get existing tag or create new one
 * 기존 태그 가져오기 또는 새 태그 생성
 */
function getOrCreateTag($db, $tagName) {
    // First, try to get existing tag
    $sql = "SELECT id FROM tags WHERE name = :name";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':name', $tagName, PDO::PARAM_STR);
    $stmt->execute();
    
    $tag = $stmt->fetch();
    if ($tag) {
        return $tag['id'];
    }
    
    // Create new tag
    $sql = "INSERT INTO tags (name, usage_count, created_at) 
            VALUES (:name, 0, NOW())";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':name', $tagName, PDO::PARAM_STR);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to create tag: ' . $tagName);
    }
    
    return $db->lastInsertId();
}

/**
 * Link tag to idea
 * 태그를 아이디어에 연결
 */
function linkTagToIdea($db, $ideaId, $tagId) {
    // Check if link already exists
    $sql = "SELECT COUNT(*) FROM idea_tags WHERE idea_id = :idea_id AND tag_id = :tag_id";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
    $stmt->bindParam(':tag_id', $tagId, PDO::PARAM_INT);
    $stmt->execute();
    
    if ($stmt->fetchColumn() > 0) {
        return; // Link already exists
    }
    
    // Create link
    $sql = "INSERT INTO idea_tags (idea_id, tag_id, created_at) 
            VALUES (:idea_id, :tag_id, NOW())";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
    $stmt->bindParam(':tag_id', $tagId, PDO::PARAM_INT);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to link tag to idea');
    }
}

/**
 * Get idea details for response
 * 응답용 아이디어 상세 정보 가져오기
 */
function getIdeaDetails($db, $ideaId) {
    $sql = "SELECT i.*, 
                   GROUP_CONCAT(t.name) as tags,
                   COUNT(c.id) as comment_count
            FROM ideas i
            LEFT JOIN idea_tags it ON i.id = it.idea_id
            LEFT JOIN tags t ON it.tag_id = t.id
            LEFT JOIN comments c ON i.id = c.idea_id AND c.status = 'active'
            WHERE i.id = :idea_id AND i.status = 'active'
            GROUP BY i.id";
    
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
    $stmt->execute();
    
    return $stmt->fetch();
}
?>
