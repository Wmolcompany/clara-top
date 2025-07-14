<?php
header('Content-Type: application/json');
require_once '../includes/auth.php';
require_once '../config/database.php';

$user_id = requireAuth();

try {
    $db = getDB();
    $reports = [];
    
    // Relatório do Diário (última semana)
    $stmt = $db->prepare("
        SELECT 
            DATE(date_created) as date,
            COUNT(*) as entries,
            GROUP_CONCAT(SUBSTRING(content, 1, 100) SEPARATOR ' | ') as sample_content
        FROM diary_entries 
        WHERE user_id = ? AND date_created >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(date_created)
        ORDER BY date_created DESC
    ");
    $stmt->execute([$user_id]);
    $reports['diary_weekly'] = $stmt->fetchAll();
    
    // Relatório Financeiro (última semana)
    $stmt = $db->prepare("
        SELECT 
            category,
            SUM(amount) as total,
            COUNT(*) as transactions
        FROM finance_entries 
        WHERE user_id = ? AND date_created >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY category
        ORDER BY total DESC
    ");
    $stmt->execute([$user_id]);
    $reports['finance_weekly'] = $stmt->fetchAll();
    
    // Relatório de Rotina (última semana)
    $stmt = $db->prepare("
        SELECT 
            DATE(date_created) as date,
            COUNT(*) as total_tasks,
            SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_tasks
        FROM routine_entries 
        WHERE user_id = ? AND date_created >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(date_created)
        ORDER BY date_created DESC
    ");
    $stmt->execute([$user_id]);
    $reports['routine_weekly'] = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'reports' => $reports
    ]);
    
} catch (Exception $e) {
    error_log("Reports API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro interno do servidor']);
}
?>