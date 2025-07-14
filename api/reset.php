<?php
header('Content-Type: application/json');
require_once '../includes/auth.php';
require_once '../config/database.php';

$user_id = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

try {
    $db = getDB();
    
    // Limpar dados do dia atual (opcional - pode manter histórico)
    // Por segurança, vamos apenas limpar as mensagens de chat do dia
    $stmt = $db->prepare("
        DELETE FROM chat_messages 
        WHERE user_id = ? AND DATE(created_at) = CURDATE()
    ");
    $stmt->execute([$user_id]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Novo dia iniciado! 🌞'
    ]);
    
} catch (Exception $e) {
    error_log("Reset API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro interno do servidor']);
}
?>