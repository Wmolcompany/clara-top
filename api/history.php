<?php
header('Content-Type: application/json');
require_once '../includes/auth.php';
require_once '../classes/ClaraChat.php';

$user_id = requireAuth();

try {
    $clara = new ClaraChat($user_id);
    $history = $clara->getHistory();
    
    echo json_encode([
        'success' => true,
        'history' => $history
    ]);
    
} catch (Exception $e) {
    error_log("History API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro interno do servidor']);
}
?>