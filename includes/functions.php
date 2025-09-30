<?php
/**
 * Common Functions
 * 공통 함수들
 */

// Start session if not already started
// 세션이 시작되지 않았다면 시작
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Include a component file
 * 컴포넌트 파일 포함
 */
function includeComponent($componentName, $data = []) {
    $componentPath = COMPONENTS_PATH . '/' . $componentName . '.html';
    if (file_exists($componentPath)) {
        // Extract data variables for use in component
        // 컴포넌트에서 사용할 데이터 변수 추출
        extract($data);
        include $componentPath;
    } else {
        error_log("Component not found: " . $componentName);
    }
}

/**
 * Include a page file
 * 페이지 파일 포함
 */
function includePage($pageName, $data = []) {
    $pagePath = ROOT_PATH . '/pages/' . $pageName . '.html';
    if (file_exists($pagePath)) {
        extract($data);
        include $pagePath;
    } else {
        error_log("Page not found: " . $pageName);
        include ROOT_PATH . '/pages/404.html';
    }
}

/**
 * Render a complete page
 * 완전한 페이지 렌더링
 */
function renderPage($pageName, $data = []) {
    // Set default data
    // 기본 데이터 설정
    $defaultData = [
        'title' => SITE_NAME,
        'description' => SITE_DESCRIPTION,
        'current_page' => $pageName
    ];
    
    $data = array_merge($defaultData, $data);
    
    // Include header
    // 헤더 포함
    include INCLUDES_PATH . '/header.html';
    
    // Include navigation
    // 네비게이션 포함
    include INCLUDES_PATH . '/navigation.html';
    
    // Include page content
    // 페이지 콘텐츠 포함
    includePage($pageName, $data);
    
    // Include footer
    // 푸터 포함
    include INCLUDES_PATH . '/footer.html';
}

/**
 * Check if user is logged in
 * 사용자 로그인 상태 확인
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Get current user ID
 * 현재 사용자 ID 가져오기
 */
function getCurrentUserId() {
    return isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
}

/**
 * Get current user data
 * 현재 사용자 데이터 가져오기
 */
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    // This would typically fetch from database
    // 일반적으로 데이터베이스에서 가져옴
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'] ?? 'Unknown',
        'email' => $_SESSION['email'] ?? ''
    ];
}

/**
 * Redirect to a page
 * 페이지로 리다이렉트
 */
function redirect($url) {
    header("Location: " . $url);
    exit();
}

/**
 * Validate email
 * 이메일 검증
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate password strength
 * 비밀번호 강도 검증
 */
function validatePassword($password) {
    if (strlen($password) < PASSWORD_MIN_LENGTH) {
        return false;
    }
    
    // Check for at least one letter and one number
    // 최소 하나의 문자와 하나의 숫자 확인
    return preg_match('/[A-Za-z]/', $password) && preg_match('/[0-9]/', $password);
}

/**
 * Generate random string
 * 랜덤 문자열 생성
 */
function generateRandomString($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Upload file
 * 파일 업로드
 */
function uploadFile($file, $uploadDir = 'uploads/', $allowedTypes = []) {
    if (!isset($file['error']) || is_array($file['error'])) {
        return ['success' => false, 'message' => 'Invalid file upload'];
    }
    
    switch ($file['error']) {
        case UPLOAD_ERR_OK:
            break;
        case UPLOAD_ERR_NO_FILE:
            return ['success' => false, 'message' => 'No file uploaded'];
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            return ['success' => false, 'message' => 'File too large'];
        default:
            return ['success' => false, 'message' => 'Unknown upload error'];
    }
    
    if ($file['size'] > MAX_FILE_SIZE) {
        return ['success' => false, 'message' => 'File exceeds maximum size'];
    }
    
    $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!empty($allowedTypes) && !in_array($fileExtension, $allowedTypes)) {
        return ['success' => false, 'message' => 'File type not allowed'];
    }
    
    $fileName = generateRandomString() . '.' . $fileExtension;
    $filePath = UPLOADS_PATH . '/' . $uploadDir . $fileName;
    
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        return ['success' => false, 'message' => 'Failed to move uploaded file'];
    }
    
    return [
        'success' => true,
        'filename' => $fileName,
        'path' => $filePath,
        'url' => UPLOADS_URL . '/' . $uploadDir . $fileName
    ];
}

/**
 * Log error
 * 오류 로그
 */
function logError($message, $context = []) {
    if (LOG_ERRORS) {
        $logMessage = date('Y-m-d H:i:s') . ' - ' . $message;
        if (!empty($context)) {
            $logMessage .= ' - Context: ' . json_encode($context);
        }
        error_log($logMessage);
    }
}

/**
 * Get pagination data
 * 페이지네이션 데이터 가져오기
 */
function getPaginationData($currentPage, $totalItems, $itemsPerPage = ITEMS_PER_PAGE) {
    $totalPages = ceil($totalItems / $itemsPerPage);
    $currentPage = max(1, min($currentPage, $totalPages));
    $offset = ($currentPage - 1) * $itemsPerPage;
    
    return [
        'current_page' => $currentPage,
        'total_pages' => $totalPages,
        'total_items' => $totalItems,
        'items_per_page' => $itemsPerPage,
        'offset' => $offset,
        'has_prev' => $currentPage > 1,
        'has_next' => $currentPage < $totalPages,
        'prev_page' => $currentPage - 1,
        'next_page' => $currentPage + 1
    ];
}

/**
 * Escape HTML output
 * HTML 출력 이스케이프
 */
function e($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

/**
 * Check if current page matches
 * 현재 페이지와 일치하는지 확인
 */
function isCurrentPage($pageName) {
    $currentPage = $_GET['page'] ?? 'home';
    return $currentPage === $pageName;
}
?>
