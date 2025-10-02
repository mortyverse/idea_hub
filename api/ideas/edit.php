<?php
/**
 * 아이디어 수정 API
 * Idea Edit API
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
header('Access-Control-Allow-Methods: PUT, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow PUT and POST requests
if (!in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'POST'])) {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed. Only PUT and POST requests are accepted.'
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
    $requiredFields = ['idea_id', 'title', 'content', 'original_writer'];
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
    $title = trim($data['title']);
    $content = trim($data['content']);
    $originalWriter = trim($data['original_writer']);
    $tags = isset($data['tags']) && is_array($data['tags']) ? $data['tags'] : [];
    
    // Validate idea ID
    if ($ideaId <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => '유효하지 않은 아이디어 ID입니다.'
        ]);
        exit();
    }
    
    // Validate title
    if (mb_strlen($title) > 100) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => '제목은 100자 이하로 입력해주세요.'
        ]);
        exit();
    }
    
    // Validate content
    if (mb_strlen($content) > 5000) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => '내용은 5000자 이하로 입력해주세요.'
        ]);
        exit();
    }
    
    // Validate tags
    if (count($tags) > 10) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => '태그는 최대 10개까지 추가할 수 있습니다.'
        ]);
        exit();
    }
    
    foreach ($tags as $tag) {
        if (mb_strlen(trim($tag)) > 20) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => '태그는 각각 20자 이하로 입력해주세요.'
            ]);
            exit();
        }
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
            'error' => '수정 권한이 없습니다. 작성자만 수정할 수 있습니다.'
        ]);
        exit();
    }
    
    // Start transaction
    $db->beginTransaction();
    
    try {
        // Update idea
        $updateResult = updateIdea($db, $ideaId, $title, $content);
        
        if (!$updateResult) {
            throw new Exception('아이디어 업데이트에 실패했습니다.');
        }
        
        // Update tags
        $tagsResult = updateIdeaTags($db, $ideaId, $tags);
        
        if (!$tagsResult) {
            throw new Exception('태그 업데이트에 실패했습니다.');
        }
        
        // Commit transaction
        $db->commit();
        
        // Log the update
        logActivity("Idea updated", [
            'idea_id' => $ideaId,
            'title' => $title,
            'writer' => $originalWriter,
            'tags_count' => count($tags)
        ]);
        
        // Return success response
        echo json_encode([
            'success' => true,
            'message' => '아이디어가 성공적으로 수정되었습니다.',
            'data' => [
                'idea_id' => $ideaId,
                'title' => $title,
                'updated_at' => date('Y-m-d H:i:s')
            ]
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction
        $db->rollback();
        throw $e;
    }
    
} catch (Exception $e) {
    // Log error
    logError("Idea edit API failed", [
        'error' => $e->getMessage(),
        'idea_id' => $ideaId ?? 0,
        'writer' => $originalWriter ?? 'unknown'
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => '아이디어 수정 중 오류가 발생했습니다.'
    ]);
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
 * Update idea information
 * 아이디어 정보 업데이트
 */
function updateIdea($db, $ideaId, $title, $content) {
    $sql = "UPDATE ideas 
            SET title = :title, 
                content = :content, 
                updated_at = NOW()
            WHERE id = :idea_id AND status = 'active'";
    
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
    $stmt->bindParam(':title', $title, PDO::PARAM_STR);
    $stmt->bindParam(':content', $content, PDO::PARAM_STR);
    
    return $stmt->execute();
}

/**
 * Update idea tags
 * 아이디어 태그 업데이트
 */
function updateIdeaTags($db, $ideaId, $tags) {
    try {
        // First, remove all existing tags for this idea
        $deleteSql = "DELETE FROM idea_tags WHERE idea_id = :idea_id";
        $deleteStmt = $db->prepare($deleteSql);
        $deleteStmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
        $deleteStmt->execute();
        
        // If no tags provided, we're done
        if (empty($tags)) {
            return true;
        }
        
        // Add new tags
        foreach ($tags as $tagName) {
            $tagName = trim($tagName);
            if (empty($tagName)) continue;
            
            // Get or create tag
            $tagId = getOrCreateTag($db, $tagName);
            
            if ($tagId) {
                // Link tag to idea
                $linkSql = "INSERT INTO idea_tags (idea_id, tag_id) VALUES (:idea_id, :tag_id)";
                $linkStmt = $db->prepare($linkSql);
                $linkStmt->bindParam(':idea_id', $ideaId, PDO::PARAM_INT);
                $linkStmt->bindParam(':tag_id', $tagId, PDO::PARAM_INT);
                $linkStmt->execute();
            }
        }
        
        return true;
        
    } catch (Exception $e) {
        logError("Failed to update idea tags", [
            'error' => $e->getMessage(),
            'idea_id' => $ideaId,
            'tags' => $tags
        ]);
        return false;
    }
}

/**
 * Get existing tag or create new one
 * 기존 태그 가져오기 또는 새 태그 생성
 */
function getOrCreateTag($db, $tagName) {
    try {
        // Check if tag already exists
        $checkSql = "SELECT id FROM tags WHERE name = :name";
        $checkStmt = $db->prepare($checkSql);
        $checkStmt->bindParam(':name', $tagName, PDO::PARAM_STR);
        $checkStmt->execute();
        
        $existingTag = $checkStmt->fetch();
        
        if ($existingTag) {
            // Update usage count
            $updateSql = "UPDATE tags SET usage_count = usage_count + 1 WHERE id = :id";
            $updateStmt = $db->prepare($updateSql);
            $updateStmt->bindParam(':id', $existingTag['id'], PDO::PARAM_INT);
            $updateStmt->execute();
            
            return $existingTag['id'];
        } else {
            // Create new tag
            $createSql = "INSERT INTO tags (name, usage_count) VALUES (:name, 1)";
            $createStmt = $db->prepare($createSql);
            $createStmt->bindParam(':name', $tagName, PDO::PARAM_STR);
            $createStmt->execute();
            
            return $db->lastInsertId();
        }
        
    } catch (Exception $e) {
        logError("Failed to get or create tag", [
            'error' => $e->getMessage(),
            'tag_name' => $tagName
        ]);
        return null;
    }
}
?>
