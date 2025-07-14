<?php
header('Content-Type: application/json');
require_once '../includes/auth.php';
require_once '../classes/ClaraChat.php';

$user_id = requireAuth();

try {
    $clara = new ClaraChat($user_id);
    $stats = $clara->getStats();
    
    echo json_encode([
        'success' => true,
        'stats' => $stats
    ]);
    
} catch (Exception $e) {
    error_log("Stats API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro interno do servidor']);
}
?>