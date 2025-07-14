<?php
// Clara Zen - Configuração do Banco de Dados
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        // Configurações para Hostinger Business
        // IMPORTANTE: Altere estas configurações com os dados do seu painel
        $this->host = 'localhost'; // ou o host fornecido pela Hostinger
        $this->db_name = 'u123456789_clarazen'; // substitua pelo nome do seu banco
        $this->username = 'u123456789_user'; // substitua pelo seu usuário
        $this->password = 'SuaSenhaSegura123'; // substitua pela sua senha
    }

    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]
            );
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            die("Erro de conexão com o banco de dados.");
        }

        return $this->conn;
    }

    public function closeConnection() {
        $this->conn = null;
    }
}

// Função helper para obter conexão
function getDB() {
    $database = new Database();
    return $database->getConnection();
}

// Função para obter configuração
function getConfig($chave, $default = '') {
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT valor FROM configuracoes WHERE chave = ?");
        $stmt->execute([$chave]);
        $result = $stmt->fetch();
        return $result ? $result['valor'] : $default;
    } catch (Exception $e) {
        error_log("Config error: " . $e->getMessage());
        return $default;
    }
}

// Função para salvar configuração
function setConfig($chave, $valor, $descricao = '') {
    try {
        $db = getDB();
        $stmt = $db->prepare("
            INSERT INTO configuracoes (chave, valor, descricao) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE valor = ?, descricao = ?
        ");
        return $stmt->execute([$chave, $valor, $descricao, $valor, $descricao]);
    } catch (Exception $e) {
        error_log("Config save error: " . $e->getMessage());
        return false;
    }
}
?>