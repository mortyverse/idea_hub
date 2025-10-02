<?php
/**
 * 간단한 아이디어 생성 API (테스트용)
 * Simple Idea Creation API (for testing)
 */

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
    $rawInput = file_get_contents('php://input');
    
    // Log raw input for debugging
    error_log("Raw input received: " . $rawInput);
    
    $input = json_decode($rawInput, true);
    
    // Check JSON decode error
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("JSON decode error: " . json_last_error_msg());
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid JSON input: ' . json_last_error_msg(),
            'debug' => [
                'raw_input' => $rawInput,
                'json_error' => json_last_error_msg()
            ]
        ]);
        exit();
    }
    
    // Log parsed input for debugging
    error_log("Parsed input: " . print_r($input, true));
    
    // Validate input
    $validation = validateInput($input);
    if (!$validation['valid']) {
        http_response_code(400);
        
        $validationResponse = [
            'success' => false,
            'error' => $validation['error']
        ];
        
        // Ensure clean output
        ob_clean();
        echo json_encode($validationResponse, JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    // Extract validated data
    $title = $validation['data']['title'];
    $content = $validation['data']['content'];
    $writer = $validation['data']['writer'];
    $tags = $validation['data']['tags'];
    
    // Generate a simple idea ID (for demo purposes)
    $ideaId = time() + rand(1000, 9999);
    
    // For dothome hosting, we'll use a simple file-based storage
    // 실제 데이터베이스 대신 파일 기반 저장소 사용
    $ideaData = [
        'id' => $ideaId,
        'title' => $title,
        'content' => $content,
        'writer' => $writer,
        'tags' => $tags,
        'created_at' => date('Y-m-d H:i:s'),
        'view_count' => 0,
        'fork_count' => 0,
        'comment_count' => 0
    ];
    
    // Save to a simple JSON file (for demo purposes)
    $dataFile = '../../data/ideas.json';
    $dataDir = dirname($dataFile);
    
    if (!file_exists($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    
    $existingIdeas = [];
    if (file_exists($dataFile)) {
        $existingIdeas = json_decode(file_get_contents($dataFile), true) ?: [];
    }
    
    $existingIdeas[] = $ideaData;
    file_put_contents($dataFile, json_encode($existingIdeas, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    // Log successful creation
    error_log("Simple idea created successfully: ID=" . $ideaId . ", Title=" . $title);
    
    // Return success response
    $response = [
        'success' => true,
        'data' => [
            'idea_id' => $ideaId,
            'message' => '아이디어가 성공적으로 등록되었습니다.',
            'redirect_url' => '../pages/ideas/detail.html?id=' . $ideaId,
            'debug_info' => [
                'title' => $title,
                'writer' => $writer,
                'tags' => $tags,
                'content_length' => strlen($content),
                'api_version' => 'simple'
            ]
        ]
    ];
    
    // Ensure clean output
    ob_clean();
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
    
} catch (Exception $e) {
    // Log error
    error_log("Simple idea creation failed: " . $e->getMessage());
    
    http_response_code(500);
    
    $errorResponse = [
        'success' => false,
        'error' => '아이디어 등록 중 오류가 발생했습니다. 다시 시도해주세요.',
        'debug' => [
            'error_message' => $e->getMessage(),
            'input' => $input ?? null,
            'api_version' => 'simple'
        ]
    ];
    
    // Ensure clean output
    ob_clean();
    echo json_encode($errorResponse, JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Validate input data
 * 입력 데이터 검증
 */
function validateInput($input) {
    $errors = [];
    
    // Log input for debugging
    error_log("Validating input: " . print_r($input, true));
    
    // Check if input is null (JSON decode failed)
    if ($input === null) {
        error_log("Input is null");
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
 * Sanitize input data
 * 입력 데이터 정리
 */
function sanitizeInput($input) {
    return trim(htmlspecialchars($input, ENT_QUOTES, 'UTF-8'));
}
?>