<?php
session_start();

class Auth {
    private $db;

    public function __construct() {
        require_once 'config/database.php';
        $this->db = getDB();
    }

    public function login($email, $password) {
        try {
            $stmt = $this->db->prepare("
                SELECT id, nome, email, password_hash, tipo, plano, status 
                FROM users 
                WHERE email = ? AND status = 'ativo'
            ");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password_hash'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_nome'] = $user['nome'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['user_tipo'] = $user['tipo'];
                $_SESSION['user_plano'] = $user['plano'];
                
                // Atualizar último acesso
                $this->updateLastAccess($user['id']);
                
                return true;
            }
            return false;
        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            return false;
        }
    }

    public function register($nome, $email, $cpf, $whatsapp, $password, $afiliado_codigo = null) {
        try {
            // Verificar se já existe
            $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ? OR cpf = ?");
            $stmt->execute([$email, $cpf]);
            if ($stmt->fetch()) {
                return ['success' => false, 'message' => 'E-mail ou CPF já cadastrado'];
            }

            // Verificar afiliado se fornecido
            $afiliado_id = null;
            if ($afiliado_codigo) {
                $stmt = $this->db->prepare("
                    SELECT a.id, a.user_id 
                    FROM afiliados a 
                    WHERE a.codigo_afiliado = ? AND a.status = 'ativo'
                ");
                $stmt->execute([$afiliado_codigo]);
                $afiliado = $stmt->fetch();
                if ($afiliado) {
                    $afiliado_id = $afiliado['user_id'];
                }
            }

            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            
            $stmt = $this->db->prepare("
                INSERT INTO users (nome, email, cpf, whatsapp, password_hash, afiliado_id) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            
            if ($stmt->execute([$nome, $email, $cpf, $whatsapp, $password_hash, $afiliado_id])) {
                $user_id = $this->db->lastInsertId();
                
                // Se veio de afiliado, registrar clique como conversão
                if ($afiliado_id) {
                    $this->registrarConversao($afiliado_codigo, $user_id);
                }
                
                return ['success' => true, 'message' => 'Cadastro realizado com sucesso'];
            }
            
            return ['success' => false, 'message' => 'Erro ao realizar cadastro'];
            
        } catch (Exception $e) {
            error_log("Register error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro interno do servidor'];
        }
    }

    public function isLoggedIn() {
        return isset($_SESSION['user_id']);
    }

    public function getUserId() {
        return $_SESSION['user_id'] ?? null;
    }

    public function getUserType() {
        return $_SESSION['user_tipo'] ?? 'usuario';
    }

    public function getUserPlan() {
        return $_SESSION['user_plano'] ?? 'free';
    }

    public function isAdmin() {
        return $this->getUserType() === 'admin';
    }

    public function isAfiliado() {
        return $this->getUserType() === 'afiliado';
    }

    public function logout() {
        session_destroy();
    }

    public function requestPasswordReset($email) {
        try {
            // Verificar se usuário existe
            $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if (!$stmt->fetch()) {
                return ['success' => false, 'message' => 'E-mail não encontrado'];
            }

            // Gerar token
            $token = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

            // Salvar token
            $stmt = $this->db->prepare("
                INSERT INTO password_resets (email, token, expires_at) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$email, $token, $expires]);

            // Aqui você enviaria o e-mail com o link de reset
            // Por enquanto, vamos apenas retornar o token para teste
            return [
                'success' => true, 
                'message' => 'E-mail de recuperação enviado',
                'token' => $token // Remover em produção
            ];

        } catch (Exception $e) {
            error_log("Password reset error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro interno do servidor'];
        }
    }

    public function resetPassword($token, $newPassword) {
        try {
            // Verificar token
            $stmt = $this->db->prepare("
                SELECT email FROM password_resets 
                WHERE token = ? AND expires_at > NOW() AND used = FALSE
            ");
            $stmt->execute([$token]);
            $reset = $stmt->fetch();

            if (!$reset) {
                return ['success' => false, 'message' => 'Token inválido ou expirado'];
            }

            // Atualizar senha
            $password_hash = password_hash($newPassword, PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
            $stmt->execute([$password_hash, $reset['email']]);

            // Marcar token como usado
            $stmt = $this->db->prepare("UPDATE password_resets SET used = TRUE WHERE token = ?");
            $stmt->execute([$token]);

            return ['success' => true, 'message' => 'Senha alterada com sucesso'];

        } catch (Exception $e) {
            error_log("Reset password error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro interno do servidor'];
        }
    }

    private function updateLastAccess($user_id) {
        try {
            $stmt = $this->db->prepare("UPDATE users SET updated_at = NOW() WHERE id = ?");
            $stmt->execute([$user_id]);
        } catch (Exception $e) {
            error_log("Update last access error: " . $e->getMessage());
        }
    }

    private function registrarConversao($codigo_afiliado, $user_id) {
        try {
            // Buscar afiliado
            $stmt = $this->db->prepare("SELECT id FROM afiliados WHERE codigo_afiliado = ?");
            $stmt->execute([$codigo_afiliado]);
            $afiliado = $stmt->fetch();

            if ($afiliado) {
                // Atualizar conversões
                $stmt = $this->db->prepare("
                    UPDATE afiliados SET conversoes = conversoes + 1 WHERE id = ?
                ");
                $stmt->execute([$afiliado['id']]);

                // Registrar clique como conversão
                $stmt = $this->db->prepare("
                    INSERT INTO cliques_afiliado (afiliado_id, converteu, user_convertido_id, ip_address) 
                    VALUES (?, TRUE, ?, ?)
                ");
                $stmt->execute([$afiliado['id'], $user_id, $_SERVER['REMOTE_ADDR'] ?? '']);
            }
        } catch (Exception $e) {
            error_log("Conversao error: " . $e->getMessage());
        }
    }
}

// Função helper para verificar autenticação
function requireAuth() {
    $auth = new Auth();
    if (!$auth->isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
    return $auth->getUserId();
}

// Função helper para verificar se é admin
function requireAdmin() {
    $auth = new Auth();
    if (!$auth->isLoggedIn() || !$auth->isAdmin()) {
        header('Location: login.php');
        exit;
    }
    return $auth->getUserId();
}

// Função helper para verificar se é afiliado
function requireAfiliado() {
    $auth = new Auth();
    if (!$auth->isLoggedIn() || !$auth->isAfiliado()) {
        header('Location: dashboard.php');
        exit;
    }
    return $auth->getUserId();
}
?>