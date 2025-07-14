<?php
header('Content-Type: application/json');
require_once '../includes/auth.php';

$user_id = requireAuth();

$context = $_GET['context'] ?? 'chat';
$limit = intval($_GET['limit'] ?? 20);

try {
    $db = getDB();
    
    $stmt = $db->prepare("
        SELECT 
            pergunta as message,
            'user' as sender,
            DATE_FORMAT(created_at, '%H:%i') as time,
            created_at
        FROM interacoes 
        WHERE user_id = ? AND pergunta != ''
        
        UNION ALL
        
        SELECT 
            resposta as message,
            'clara' as sender,
            DATE_FORMAT(created_at, '%H:%i') as time,
            created_at
        FROM interacoes 
        WHERE user_id = ? AND resposta != ''
        
        ORDER BY created_at ASC
        LIMIT ?
    ");
    
    $stmt->execute([$user_id, $user_id, $limit * 2]);
    $messages = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'messages' => $messages
    ]);
    
} catch (Exception $e) {
    error_log("Messages API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro interno do servidor']);
}
?>