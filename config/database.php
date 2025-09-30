<?php
/**
 * Database Configuration
 * 데이터베이스 연결 설정
 */

// Database connection settings
// 데이터베이스 연결 설정
// 보안상 환경변수나 별도 설정 파일 사용 권장
define('DB_HOST', 'localhost');
define('DB_NAME', 'idea_hub');
define('DB_USER', 'root');
define('DB_PASS', ''); // 실제 배포 시 강력한 비밀번호 사용 필수!
define('DB_CHARSET', 'utf8mb4');

// Database connection class
// 데이터베이스 연결 클래스
class Database {
    private $connection;
    private static $instance = null;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $this->connection = new PDO($dsn, DB_USER, DB_PASS);
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            // Database connection error
            // 데이터베이스 연결 오류
            error_log("Database connection failed: " . $e->getMessage());
            die("Database connection failed. Please check your configuration.");
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    // Prevent cloning
    private function __clone() {}
    
    // Prevent unserialization
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

// Function to get database connection
// 데이터베이스 연결을 가져오는 함수
function getDB() {
    return Database::getInstance()->getConnection();
}
?>
