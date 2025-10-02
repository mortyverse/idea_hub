<?php
/**
 * 아이디어 삭제 API
 * Idea Delete API
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
header('Access-Control-Allow-Methods: DELETE, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow DELETE and POST requests
if (!in_array($_SERVER['REQUEST_METHOD'], ['DELETE', 'POST'])) {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed. Only DELETE and POST requests are accepted.'
    ]);
    exit();
}

try {
    // Get request data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => '유효하지 않은 JSON 데이터입니다.'
        ]);
        exit();
    }
    
    // Validate required fields
    $requiredFields = ['idea_id', 'original_writer'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => "필수 필드가 누락되었습니다: {$field}"
            ]);
            exit();
        }
    }
    
    // Sanitize and validate input data
    $ideaId = (int)$data['idea_id'];
    $originalWriter = trim($data['original_writer']);
    
    // Validate idea ID
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
    
    // Check if idea exists and get current data
    $currentIdea = getCurrentIdea($db, $ideaId);
    if (!$currentIdea) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => '아이디어를 찾을 수 없습니다.'
        ]);
        exit();
    }
    
    // Verify writer permission (simple check)
    // In production, this should use proper authentication
    if ($currentIdea['writer'] !== $originalWriter) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => '삭제 권한이 없습니다. 작성자만 삭제할 수 있습니다.'
        ]);
        exit();
    }
    
    // Start transaction
    $db->beginTransaction();
    
    try {
        // Soft delete idea (set status to 'deleted')
        $deleteIdeaResult = deleteIdea($db, $ideaId);
        
        if (!$deleteIdeaResult) {
            throw new Exception('아이디어 상태 업데이트에 실패했습니다. 아이디어 ID: ' . $ideaId);
        }
        
        // Soft delete related comments
        $deleteCommentsResult = deleteIdeaComments($db, $ideaId);
        
        if (!$deleteCommentsResult) {
            throw new Exception('관련 댓글 상태 업데이트에 실패했습니다. 아이디어 ID: ' . $ideaId);
        }
        
        // Remove idea-tag relationships
        $removeTagsResult = removeIdeaTags($db, $ideaId);
        
        if (!$removeTagsResult) {
            throw new Exception('태그 연결 해제에 실패했습니다. 아이디어 ID: ' . $ideaId);
        }
        
        // Commit transaction
        $db->commit();
        
        // Log the deletion
        logError("Idea deleted", [
            'idea_id' => $ideaId,
            'title' => $currentIdea['title'],
            'writer' => $originalWriter
        ]);
        
        // Return success response
        echo json_encode([
            'success' => true,
            'message' => '아이디어가 성공적으로 삭제되었습니다.',
            'data' => [
                'idea_id' => $ideaId,
                'title' => $currentIdea['title'],
                'deleted_at' => date('Y-m-d H:i:s')
            ]
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction
        $db->rollback();
        
        // Log detailed transaction error
        logError("Transaction failed in delete operation", [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'idea_id' => $ideaId,
            'writer' => $originalWriter
        ]);
        
        throw new Exception("삭제 트랜잭션 실패: " . $e->getMessage());
    }
    
} catch (Exception $e) {
    // Log error
    logError("Idea delete API failed", [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'idea_id' => $ideaId ?? 0,
        'writer' => $originalWriter ?? 'unknown'
    ]);
    
    http_response_code(500);
    
    // In debug mode, show detailed error
    if (defined('DEBUG_MODE') && DEBUG_MODE) {
        echo json_encode([
            'success' => false,
            'error' => '아이디어 삭제 중 오류가 발생했습니다.',
            'debug_error' => $e->getMessage(),
            'debug_trace' => $e->getTraceAsString()
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => '아이디어 삭제 중 오류가 발생했습니다.'
        ]);
    }
}

/**
 * Get current idea data
 * 현재 아이디어 데이터 가져오기
 */
function getCurrentIdea($db, $ideaId) {
    $sql = "SELECT id, title, content, writer, created_at, updated_at, status
            FROM ideas 
            WHERE id = :idea_id AND status = 'active'";
    
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
    $stmt->execute();
    
    return $stmt->fetch();
}

/**
 * Soft delete idea (set status to 'deleted')
 * 아이디어 소프트 삭제 (상태를 'deleted'로 변경)
 */
function deleteIdea($db, $ideaId) {
    try {
        $sql = "UPDATE ideas 
                SET status = 'deleted', 
                    updated_at = NOW()
                WHERE id = :idea_id AND status = 'active'";
        
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
        
        $result = $stmt->execute();
        
        // Check if any rows were affected
        if ($result && $stmt->rowCount() === 0) {
            logError("No rows affected in deleteIdea", [
                'idea_id' => $ideaId,
                'sql' => $sql
            ]);
            return false;
        }
        
        return $result;
    } catch (PDOException $e) {
        logError("PDO Error in deleteIdea", [
            'error' => $e->getMessage(),
            'idea_id' => $ideaId,
            'sql' => $sql ?? 'N/A'
        ]);
        return false;
    }
}

/**
 * Soft delete all comments related to the idea
 * 아이디어와 관련된 모든 댓글 소프트 삭제
 */
function deleteIdeaComments($db, $ideaId) {
    try {
        $sql = "UPDATE comments 
                SET status = 'deleted', 
                    updated_at = NOW()
                WHERE idea_id = :idea_id AND status = 'active'";
        
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
        
        $result = $stmt->execute();
        
        // Log affected rows for debugging
        logError("Comments deletion result", [
            'idea_id' => $ideaId,
            'affected_rows' => $stmt->rowCount(),
            'result' => $result
        ]);
        
        return $result;
    } catch (PDOException $e) {
        logError("PDO Error in deleteIdeaComments", [
            'error' => $e->getMessage(),
            'idea_id' => $ideaId,
            'sql' => $sql ?? 'N/A'
        ]);
        return false;
    }
}

/**
 * Remove idea-tag relationships
 * 아이디어-태그 연결 제거
 */
function removeIdeaTags($db, $ideaId) {
    try {
        // Get current tags to decrease usage count
        $getTagsSql = "SELECT tag_id FROM idea_tags WHERE idea_id = :idea_id";
        $getTagsStmt = $db->prepare($getTagsSql);
        $getTagsStmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
        $getTagsStmt->execute();
        
        $tagIds = $getTagsStmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Decrease usage count for each tag
        foreach ($tagIds as $tagId) {
            $updateTagSql = "UPDATE tags 
                           SET usage_count = GREATEST(usage_count - 1, 0) 
                           WHERE id = :tag_id";
            $updateTagStmt = $db->prepare($updateTagSql);
            $updateTagStmt->bindParam(':tag_id', $tagId, PDO::PARAM_INT);
            $updateTagStmt->execute();
        }
        
        // Remove idea-tag relationships
        $deleteSql = "DELETE FROM idea_tags WHERE idea_id = :idea_id";
        $deleteStmt = $db->prepare($deleteSql);
        $deleteStmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
        
        return $deleteStmt->execute();
        
    } catch (Exception $e) {
        logError("Failed to remove idea tags", [
            'error' => $e->getMessage(),
            'idea_id' => $ideaId
        ]);
        return false;
    }
}

/**
 * Log activity (using logError function from functions.php)
 * 활동 로그
 */
function logActivity($message, $context = []) {
    logError($message, $context);
}
?>
