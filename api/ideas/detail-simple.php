<?php
/**
 * 간단한 아이디어 상세 API (테스트용)
 * Simple Idea Detail API (for testing)
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
    
    // Load ideas from file-based storage
    $dataFile = '../../data/ideas.json';
    $sampleIdeas = [];
    
    if (file_exists($dataFile)) {
        $ideasData = json_decode(file_get_contents($dataFile), true) ?: [];
        foreach ($ideasData as $idea) {
            $sampleIdeas[$idea['id']] = $idea;
        }
    }
    
    // If no ideas found, create some sample data
    if (empty($sampleIdeas)) {
        $sampleIdeas = [
            1 => [
                'id' => 1,
                'title' => '샘플 아이디어',
                'content' => '이것은 샘플 아이디어입니다. 실제 아이디어를 작성해보세요!',
                'writer' => '샘플작성자',
                'created_at' => date('Y-m-d H:i:s', time() - 7200), // 2시간 전
                'view_count' => 0,
                'fork_count' => 0,
                'comment_count' => 0,
                'tags' => ['샘플']
            ]
        ];
    }
    
    // Check if idea exists
    if (!isset($sampleIdeas[$ideaId])) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => '아이디어를 찾을 수 없습니다.'
        ]);
        exit();
    }
    
    $idea = $sampleIdeas[$ideaId];
    
    // Load comments from file
    $commentsFile = '../../data/comments.json';
    $comments = [];
    
    if (file_exists($commentsFile)) {
        $allComments = json_decode(file_get_contents($commentsFile), true) ?: [];
        foreach ($allComments as $comment) {
            if ($comment['idea_id'] == $ideaId && $comment['status'] == 'active') {
                $comments[] = [
                    'id' => $comment['id'],
                    'writer' => $comment['writer'],
                    'content' => $comment['content'],
                    'created_at' => $comment['created_at'],
                    'relative_time' => getRelativeTime($comment['created_at'])
                ];
            }
        }
    }
    
    // Generate related ideas (other sample ideas)
    $relatedIdeas = [];
    foreach ($sampleIdeas as $id => $relatedIdea) {
        if ($id !== $ideaId) {
            $relatedIdeas[] = [
                'id' => $relatedIdea['id'],
                'title' => $relatedIdea['title'],
                'writer' => $relatedIdea['writer'],
                'created_at' => $relatedIdea['created_at'],
                'view_count' => $relatedIdea['view_count'],
                'fork_count' => $relatedIdea['fork_count'],
                'comment_count' => $relatedIdea['comment_count'],
                'relative_time' => getRelativeTime($relatedIdea['created_at'])
            ];
        }
    }
    
    // Format response
    $formattedIdea = [
        'id' => $idea['id'],
        'title' => $idea['title'],
        'content' => $idea['content'],
        'writer' => $idea['writer'],
        'created_at' => $idea['created_at'],
        'updated_at' => $idea['created_at'],
        'view_count' => $idea['view_count'],
        'fork_count' => $idea['fork_count'],
        'comment_count' => $idea['comment_count'],
        'tags' => $idea['tags'],
        'relative_time' => getRelativeTime($idea['created_at']),
        'comments' => $comments,
        'related_ideas' => array_slice($relatedIdeas, 0, 3) // 최대 3개
    ];
    
    // Return success response
    echo json_encode([
        'success' => true,
        'data' => $formattedIdea
    ]);
    
} catch (Exception $e) {
    // Log error
    error_log("Simple idea detail API failed: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => '아이디어 상세 정보를 가져오는 중 오류가 발생했습니다.'
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
