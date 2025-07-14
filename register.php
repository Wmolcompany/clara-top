<?php
require_once 'includes/auth.php';

$auth = new Auth();
$error = '';
$success = '';

// Verificar se já está logado
if ($auth->isLoggedIn()) {
    header('Location: dashboard.php');
    exit;
}

// Verificar código de afiliado na URL
$afiliado_codigo = $_GET['ref'] ?? '';

if ($_POST) {
    $nome = $_POST['nome'] ?? '';
    $email = $_POST['email'] ?? '';
    $cpf = $_POST['cpf'] ?? '';
    $whatsapp = $_POST['whatsapp'] ?? '';
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $afiliado_ref = $_POST['afiliado_ref'] ?? '';
    
    // Validações básicas
    if (empty($nome) || empty($email) || empty($cpf) || empty($whatsapp) || empty($password)) {
        $error = 'Por favor, preencha todos os campos obrigatórios.';
    } elseif ($password !== $confirm_password) {
        $error = 'As senhas não coincidem.';
    } elseif (strlen($password) < 6) {
        $error = 'A senha deve ter pelo menos 6 caracteres.';
    } else {
        $result = $auth->register($nome, $email, $cpf, $whatsapp, $password, $afiliado_ref);
        
        if ($result['success']) {
            $success = $result['message'] . ' Você pode fazer login agora.';
        } else {
            $error = $result['message'];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro - Clara Zen</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <div class="auth-logo">Clara Zen</div>
                <p class="auth-subtitle">Crie sua conta e comece a conversar</p>
            </div>

            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <?php if ($success): ?>
                <div class="alert alert-success"><?php echo htmlspecialchars($success); ?></div>
            <?php endif; ?>

            <form method="POST" id="registerForm">
                <div class="form-group">
                    <label class="form-label" for="nome">Nome Completo *</label>
                    <input 
                        type="text" 
                        id="nome"
                        name="nome" 
                        class="form-input" 
                        required
                        value="<?php echo htmlspecialchars($_POST['nome'] ?? ''); ?>"
                        placeholder="Seu nome completo"
                    >
                </div>

                <div class="form-group">
                    <label class="form-label" for="email">E-mail *</label>
                    <input 
                        type="email" 
                        id="email"
                        name="email" 
                        class="form-input" 
                        required
                        value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>"
                        placeholder="seu@email.com"
                    >
                </div>

                <div class="form-group">
                    <label class="form-label" for="cpf">CPF *</label>
                    <input 
                        type="text" 
                        id="cpf"
                        name="cpf" 
                        class="form-input" 
                        required
                        data-validate="cpf"
                        value="<?php echo htmlspecialchars($_POST['cpf'] ?? ''); ?>"
                        placeholder="000.000.000-00"
                        maxlength="14"
                    >
                </div>

                <div class="form-group">
                    <label class="form-label" for="whatsapp">WhatsApp *</label>
                    <input 
                        type="tel" 
                        id="whatsapp"
                        name="whatsapp" 
                        class="form-input" 
                        required
                        data-validate="phone"
                        value="<?php echo htmlspecialchars($_POST['whatsapp'] ?? ''); ?>"
                        placeholder="(11) 99999-9999"
                    >
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="password">Senha *</label>
                    <input 
                        type="password" 
                        id="password"
                        name="password" 
                        class="form-input" 
                        required
                        placeholder="Mínimo 6 caracteres"
                        minlength="6"
                    >
                </div>

                <div class="form-group">
                    <label class="form-label" for="confirm_password">Confirmar Senha *</label>
                    <input 
                        type="password" 
                        id="confirm_password"
                        name="confirm_password" 
                        class="form-input" 
                        required
                        placeholder="Digite a senha novamente"
                    >
                </div>

                <?php if ($afiliado_codigo): ?>
                    <div class="form-group">
                        <label class="form-label">Código de Indicação</label>
                        <input 
                            type="text" 
                            name="afiliado_ref" 
                            class="form-input" 
                            value="<?php echo htmlspecialchars($afiliado_codigo); ?>"
                            readonly
                        >
                        <small style="color: var(--success);">
                            <i class="fas fa-check"></i>
                            Você foi indicado por um parceiro!
                        </small>
                    </div>
                <?php else: ?>
                    <div class="form-group">
                        <label class="form-label" for="afiliado_ref">Código de Indicação (opcional)</label>
                        <input 
                            type="text" 
                            id="afiliado_ref"
                            name="afiliado_ref" 
                            class="form-input" 
                            value="<?php echo htmlspecialchars($_POST['afiliado_ref'] ?? ''); ?>"
                            placeholder="Código do seu indicador"
                        >
                    </div>
                <?php endif; ?>
                
                <button type="submit" class="btn btn-primary btn-full">
                    <i class="fas fa-user-plus"></i>
                    Criar Conta
                </button>
            </form>

            <div class="auth-links">
                <p>
                    Já tem conta? <a href="login.php">Faça login aqui</a>
                </p>
            </div>
        </div>
    </div>

    <script src="assets/js/main.js"></script>
    <script>
        // Inicializar validação do formulário
        new FormValidator('#registerForm');

        // Máscaras para CPF e telefone
        document.getElementById('cpf').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });

        document.getElementById('whatsapp').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
            e.target.value = value;
        });

        // Validação de confirmação de senha
        document.getElementById('confirm_password').addEventListener('input', function(e) {
            const password = document.getElementById('password').value;
            const confirmPassword = e.target.value;
            
            if (password !== confirmPassword) {
                e.target.setCustomValidity('As senhas não coincidem');
            } else {
                e.target.setCustomValidity('');
            }
        });
    </script>
</body>
</html>