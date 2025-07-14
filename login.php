<?php
require_once 'includes/auth.php';

$auth = new Auth();
$error = '';
$success = '';

// Verificar se já está logado
if ($auth->isLoggedIn()) {
    $userType = $auth->getUserType();
    switch ($userType) {
        case 'admin':
            header('Location: admin/dashboard.php');
            break;
        case 'afiliado':
            header('Location: afiliado/dashboard.php');
            break;
        default:
            header('Location: dashboard.php');
            break;
    }
    exit;
}

if ($_POST) {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        $error = 'Por favor, preencha todos os campos.';
    } elseif ($auth->login($email, $password)) {
        $userType = $auth->getUserType();
        switch ($userType) {
            case 'admin':
                header('Location: admin/dashboard.php');
                break;
            case 'afiliado':
                header('Location: afiliado/dashboard.php');
                break;
            default:
                header('Location: dashboard.php');
                break;
        }
        exit;
    } else {
        $error = 'E-mail ou senha incorretos.';
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Clara Zen</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <div class="auth-logo">Clara Zen</div>
                <p class="auth-subtitle">Sua assistente virtual inteligente</p>
            </div>

            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <?php if ($success): ?>
                <div class="alert alert-success"><?php echo htmlspecialchars($success); ?></div>
            <?php endif; ?>

            <form method="POST" id="loginForm">
                <div class="form-group">
                    <label class="form-label" for="email">E-mail</label>
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
                    <label class="form-label" for="password">Senha</label>
                    <input 
                        type="password" 
                        id="password"
                        name="password" 
                        class="form-input" 
                        required
                        placeholder="Sua senha"
                    >
                </div>
                
                <button type="submit" class="btn btn-primary btn-full">
                    <i class="fas fa-sign-in-alt"></i>
                    Entrar
                </button>
            </form>

            <div class="auth-links">
                <p>
                    <a href="forgot-password.php">Esqueci minha senha</a>
                </p>
                <p>
                    Não tem conta? <a href="register.php">Cadastre-se aqui</a>
                </p>
            </div>
        </div>
    </div>

    <script src="assets/js/main.js"></script>
    <script>
        // Inicializar validação do formulário
        new FormValidator('#loginForm');
    </script>
</body>
</html>