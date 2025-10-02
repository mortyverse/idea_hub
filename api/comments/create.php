<?php
/**
 * 댓글 생성 API
 * Comment Creation API
 */

// Simple comment creation without database dependency
// 데이터베이스 의존성 없이 간단한 댓글 생성

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
    
    // Generate comment ID
    $commentId = time() + rand(1000, 9999);
    
    // Create comment data
    $commentData = [
        'id' => $commentId,
        'idea_id' => $ideaId,
        'writer' => $writer,
        'content' => $content,
        'parent_comment_id' => $parentCommentId,
        'created_at' => date('Y-m-d H:i:s'),
        'status' => 'active'
    ];
    
    // Save comment to file
    $commentsFile = '../../data/comments.json';
    $commentsDir = dirname($commentsFile);
    
    if (!file_exists($commentsDir)) {
        mkdir($commentsDir, 0755, true);
    }
    
    $existingComments = [];
    if (file_exists($commentsFile)) {
        $existingComments = json_decode(file_get_contents($commentsFile), true) ?: [];
    }
    
    $existingComments[] = $commentData;
    file_put_contents($commentsFile, json_encode($existingComments, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    // Update idea comment count
    $ideasFile = '../../data/ideas.json';
    if (file_exists($ideasFile)) {
        $ideasData = json_decode(file_get_contents($ideasFile), true) ?: [];
        foreach ($ideasData as &$idea) {
            if ($idea['id'] == $ideaId) {
                $idea['comment_count'] = ($idea['comment_count'] ?? 0) + 1;
                break;
            }
        }
        file_put_contents($ideasFile, json_encode($ideasData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'data' => [
            'comment_id' => $commentId,
            'message' => '댓글이 성공적으로 등록되었습니다.'
        ]
    ]);
    
} catch (Exception $e) {
    // Log error
    error_log("Comment creation failed: " . $e->getMessage());
    
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
    
    // Check if input is null
    if ($input === null) {
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
 * Sanitize input data
 * 입력 데이터 정리
 */
function sanitizeInput($input) {
    return trim(htmlspecialchars($input, ENT_QUOTES, 'UTF-8'));
}

?>
