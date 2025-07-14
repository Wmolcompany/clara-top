<?php
require_once 'config/database.php';

class AffiliateSystem {
    private $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function createAffiliate($user_id) {
        try {
            // Verificar se já é afiliado
            $stmt = $this->db->prepare("SELECT id FROM afiliados WHERE user_id = ?");
            $stmt->execute([$user_id]);
            if ($stmt->fetch()) {
                return ['success' => false, 'message' => 'Usuário já é afiliado'];
            }

            // Gerar código único
            $codigo = $this->generateUniqueCode();
            $link = $this->generateAffiliateLink($codigo);

            $stmt = $this->db->prepare("
                INSERT INTO afiliados (user_id, codigo_afiliado, link_personalizado) 
                VALUES (?, ?, ?)
            ");
            
            if ($stmt->execute([$user_id, $codigo, $link])) {
                // Atualizar tipo do usuário
                $stmt = $this->db->prepare("UPDATE users SET tipo = 'afiliado' WHERE id = ?");
                $stmt->execute([$user_id]);
                
                return [
                    'success' => true,
                    'codigo' => $codigo,
                    'link' => $link
                ];
            }

            return ['success' => false, 'message' => 'Erro ao criar afiliado'];

        } catch (Exception $e) {
            error_log("Create affiliate error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro interno do servidor'];
        }
    }

    public function trackClick($codigo_afiliado, $ip = null, $user_agent = null) {
        try {
            $stmt = $this->db->prepare("SELECT id FROM afiliados WHERE codigo_afiliado = ? AND status = 'ativo'");
            $stmt->execute([$codigo_afiliado]);
            $afiliado = $stmt->fetch();

            if (!$afiliado) {
                return false;
            }

            // Registrar clique
            $stmt = $this->db->prepare("
                INSERT INTO cliques_afiliado (afiliado_id, ip_address, user_agent) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$afiliado['id'], $ip, $user_agent]);

            // Atualizar contador de cliques
            $stmt = $this->db->prepare("UPDATE afiliados SET cliques = cliques + 1 WHERE id = ?");
            $stmt->execute([$afiliado['id']]);

            return true;

        } catch (Exception $e) {
            error_log("Track click error: " . $e->getMessage());
            return false;
        }
    }

    public function processConversion($user_id, $valor_pagamento, $afiliado_id = null) {
        try {
            if (!$afiliado_id) {
                // Buscar afiliado do usuário
                $stmt = $this->db->prepare("SELECT afiliado_id FROM users WHERE id = ?");
                $stmt->execute([$user_id]);
                $user = $stmt->fetch();
                $afiliado_id = $user['afiliado_id'] ?? null;
            }

            if (!$afiliado_id) {
                return ['success' => true, 'message' => 'Sem afiliado']; // Não é erro
            }

            // Buscar dados do afiliado
            $stmt = $this->db->prepare("
                SELECT id, percentual_comissao 
                FROM afiliados 
                WHERE user_id = ? AND status = 'ativo'
            ");
            $stmt->execute([$afiliado_id]);
            $afiliado = $stmt->fetch();

            if (!$afiliado) {
                return ['success' => false, 'message' => 'Afiliado não encontrado'];
            }

            // Calcular comissões
            $percentual = $afiliado['percentual_comissao'];
            $valor_afiliado = ($valor_pagamento * $percentual) / 100;
            $valor_admin = $valor_pagamento - $valor_afiliado;

            // Atualizar ganhos do afiliado
            $stmt = $this->db->prepare("
                UPDATE afiliados 
                SET ganhos_totais = ganhos_totais + ?, 
                    ganhos_disponiveis = ganhos_disponiveis + ? 
                WHERE id = ?
            ");
            $stmt->execute([$valor_afiliado, $valor_afiliado, $afiliado['id']]);

            return [
                'success' => true,
                'valor_afiliado' => $valor_afiliado,
                'valor_admin' => $valor_admin
            ];

        } catch (Exception $e) {
            error_log("Process conversion error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro interno do servidor'];
        }
    }

    public function requestWithdrawal($afiliado_user_id, $valor, $metodo, $dados_bancarios) {
        try {
            // Buscar dados do afiliado
            $stmt = $this->db->prepare("
                SELECT id, ganhos_disponiveis 
                FROM afiliados 
                WHERE user_id = ? AND status = 'ativo'
            ");
            $stmt->execute([$afiliado_user_id]);
            $afiliado = $stmt->fetch();

            if (!$afiliado) {
                return ['success' => false, 'message' => 'Afiliado não encontrado'];
            }

            $valor_minimo = floatval(getConfig('valor_minimo_saque', 50));
            
            if ($valor < $valor_minimo) {
                return ['success' => false, 'message' => "Valor mínimo para saque é R$ " . number_format($valor_minimo, 2, ',', '.')];
            }

            if ($valor > $afiliado['ganhos_disponiveis']) {
                return ['success' => false, 'message' => 'Saldo insuficiente'];
            }

            // Criar solicitação de saque
            $stmt = $this->db->prepare("
                INSERT INTO saques (afiliado_id, valor, metodo_saque, dados_bancarios) 
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([
                $afiliado['id'], 
                $valor, 
                $metodo, 
                json_encode($dados_bancarios)
            ]);

            // Reduzir saldo disponível
            $stmt = $this->db->prepare("
                UPDATE afiliados 
                SET ganhos_disponiveis = ganhos_disponiveis - ? 
                WHERE id = ?
            ");
            $stmt->execute([$valor, $afiliado['id']]);

            return ['success' => true, 'message' => 'Solicitação de saque criada com sucesso'];

        } catch (Exception $e) {
            error_log("Request withdrawal error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro interno do servidor'];
        }
    }

    public function getAffiliateStats($user_id) {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    a.*,
                    COUNT(DISTINCT c.id) as total_cliques,
                    COUNT(DISTINCT CASE WHEN c.converteu = 1 THEN c.id END) as total_conversoes,
                    COALESCE(SUM(CASE WHEN s.status = 'pago' THEN s.valor ELSE 0 END), 0) as total_sacado
                FROM afiliados a
                LEFT JOIN cliques_afiliado c ON a.id = c.afiliado_id
                LEFT JOIN saques s ON a.id = s.afiliado_id
                WHERE a.user_id = ?
                GROUP BY a.id
            ");
            $stmt->execute([$user_id]);
            $stats = $stmt->fetch();

            if (!$stats) {
                return null;
            }

            // Estatísticas por período
            $stmt = $this->db->prepare("
                SELECT 
                    DATE(c.created_at) as data,
                    COUNT(*) as cliques,
                    COUNT(CASE WHEN c.converteu = 1 THEN 1 END) as conversoes
                FROM cliques_afiliado c
                JOIN afiliados a ON c.afiliado_id = a.id
                WHERE a.user_id = ? AND c.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(c.created_at)
                ORDER BY data DESC
            ");
            $stmt->execute([$user_id]);
            $stats['historico_30_dias'] = $stmt->fetchAll();

            return $stats;

        } catch (Exception $e) {
            error_log("Get affiliate stats error: " . $e->getMessage());
            return null;
        }
    }

    public function getTopAffiliates($limit = 10) {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    u.nome,
                    u.email,
                    a.ganhos_totais,
                    a.conversoes,
                    a.cliques,
                    a.created_at
                FROM afiliados a
                JOIN users u ON a.user_id = u.id
                WHERE a.status = 'ativo'
                ORDER BY a.ganhos_totais DESC
                LIMIT ?
            ");
            $stmt->execute([$limit]);
            return $stmt->fetchAll();

        } catch (Exception $e) {
            error_log("Get top affiliates error: " . $e->getMessage());
            return [];
        }
    }

    private function generateUniqueCode() {
        do {
            $codigo = strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
            $stmt = $this->db->prepare("SELECT id FROM afiliados WHERE codigo_afiliado = ?");
            $stmt->execute([$codigo]);
        } while ($stmt->fetch());

        return $codigo;
    }

    private function generateAffiliateLink($codigo) {
        $base_url = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $protocol = isset($_SERVER['HTTPS']) ? 'https://' : 'http://';
        return $protocol . $base_url . '/register.php?ref=' . $codigo;
    }
}
?>