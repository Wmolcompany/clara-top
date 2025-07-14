<?php
header('Content-Type: application/json');
require_once '../includes/auth.php';
require_once '../classes/ClaraAI.php';

$user_id = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['message'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Mensagem não fornecida']);
    exit;
}

$message = trim($input['message']);
$context = $input['context'] ?? 'chat';

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Mensagem não pode estar vazia']);
    exit;
}

try {
    $clara = new ClaraAI($user_id);
    $result = $clara->processMessage($message, $context);
    
    echo json_encode($result);
    
} catch (Exception $e) {
    error_log("Chat API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro interno do servidor']);
}
?>