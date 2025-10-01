<?php
/**
 * 댓글 생성 API
 * Comment Creation API
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
    $ideaId = $validation['data']['idea_id'];
    $writer = $validation['data']['writer'];
    $content = $validation['data']['content'];
    $parentCommentId = $validation['data']['parent_comment_id'] ?? null;
    
    // Get database connection
    $db = getDB();
    
    // Start transaction
    $db->beginTransaction();
    
    try {
        // Verify idea exists
        if (!ideaExists($db, $ideaId)) {
            throw new Exception('아이디어를 찾을 수 없습니다.');
        }
        
        // Insert comment
        $commentId = insertComment($db, $ideaId, $writer, $content, $parentCommentId);
        
        // Commit transaction
        $db->commit();
        
        // Log successful creation
        logError("Comment created successfully", [
            'comment_id' => $commentId,
            'idea_id' => $ideaId,
            'writer' => $writer,
            'parent_comment_id' => $parentCommentId
        ]);
        
        // Return success response
        echo json_encode([
            'success' => true,
            'data' => [
                'comment_id' => $commentId,
                'message' => '댓글이 성공적으로 등록되었습니다.'
            ]
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction
        $db->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    // Log error
    logError("Comment creation failed", [
        'error' => $e->getMessage(),
        'input' => $input ?? null
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => '댓글 등록 중 오류가 발생했습니다. 다시 시도해주세요.'
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
    if (!isset($input['idea_id']) || !is_numeric($input['idea_id']) || $input['idea_id'] <= 0) {
        $errors[] = '유효하지 않은 아이디어 ID입니다.';
    }
    
    if (!isset($input['writer']) || empty(trim($input['writer']))) {
        $errors[] = '작성자명을 입력해주세요.';
    } elseif (strlen(trim($input['writer'])) > 50) {
        $errors[] = '작성자명은 50자 이하로 입력해주세요.';
    }
    
    if (!isset($input['content']) || empty(trim($input['content']))) {
        $errors[] = '댓글 내용을 입력해주세요.';
    } elseif (strlen(trim($input['content'])) > 1000) {
        $errors[] = '댓글 내용은 1000자 이하로 입력해주세요.';
    }
    
    // Validate parent comment ID if provided
    if (isset($input['parent_comment_id']) && !empty($input['parent_comment_id'])) {
        if (!is_numeric($input['parent_comment_id']) || $input['parent_comment_id'] <= 0) {
            $errors[] = '유효하지 않은 부모 댓글 ID입니다.';
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
            'idea_id' => (int)$input['idea_id'],
            'writer' => sanitizeInput($input['writer']),
            'content' => sanitizeInput($input['content']),
            'parent_comment_id' => isset($input['parent_comment_id']) && !empty($input['parent_comment_id']) 
                ? (int)$input['parent_comment_id'] 
                : null
        ]
    ];
}

/**
 * Check if idea exists
 * 아이디어 존재 여부 확인
 */
function ideaExists($db, $ideaId) {
    $sql = "SELECT COUNT(*) FROM ideas WHERE id = :idea_id AND status = 'active'";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
    $stmt->execute();
    
    return $stmt->fetchColumn() > 0;
}

/**
 * Insert comment into database
 * 데이터베이스에 댓글 삽입
 */
function insertComment($db, $ideaId, $writer, $content, $parentCommentId = null) {
    $sql = "INSERT INTO comments (idea_id, writer, content, parent_comment_id, created_at, status) 
            VALUES (:idea_id, :writer, :content, :parent_comment_id, NOW(), 'active')";
    
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
    $stmt->bindParam(':writer', $writer, PDO::PARAM_STR);
    $stmt->bindParam(':content', $content, PDO::PARAM_STR);
    $stmt->bindParam(':parent_comment_id', $parentCommentId, PDO::PARAM_INT);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to insert comment');
    }
    
    return $db->lastInsertId();
}
?>
