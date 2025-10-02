<?php
/**
 * Database Configuration
 * 데이터베이스 연결 설정
 */

// Database connection settings
// 데이터베이스 연결 설정
// dothome 호스팅 설정
define('DB_HOST', 'localhost');
define('DB_NAME', 'leehan8422'); // dothome에서 제공하는 데이터베이스명
define('DB_USER', 'leehan8422'); // dothome에서 제공하는 사용자명
define('DB_PASS', 'wjdgks2399!'); // dothome에서 설정한 비밀번호
define('DB_CHARSET', 'utf8mb4');

// Database connection class
// 데이터베이스 연결 클래스
class Database {
    private $connection;
    private static $instance = null;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ]);
        } catch(PDOException $e) {
            // Database connection error
            // 데이터베이스 연결 오류
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
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
