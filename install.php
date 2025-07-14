<?php
// Clara Zen - Instalador Automático
// Execute este arquivo apenas uma vez após fazer upload dos arquivos

// Verificar se já foi instalado
if (file_exists('config/.installed')) {
    die('Sistema já foi instalado. Remova o arquivo config/.installed para reinstalar.');
}

$errors = [];
$success = [];

// Verificar requisitos
if (version_compare(PHP_VERSION, '7.4.0') < 0) {
    $errors[] = 'PHP 7.4 ou superior é necessário. Versão atual: ' . PHP_VERSION;
}

if (!extension_loaded('pdo_mysql')) {
    $errors[] = 'Extensão PDO MySQL não está instalada';
}

if (!extension_loaded('curl')) {
    $errors[] = 'Extensão cURL não está instalada';
}

if (!is_writable('.')) {
    $errors[] = 'Diretório atual não tem permissão de escrita';
}

if ($_POST && empty($errors)) {
    $db_host = $_POST['db_host'] ?? 'localhost';
    $db_name = $_POST['db_name'] ?? '';
    $db_user = $_POST['db_user'] ?? '';
    $db_pass = $_POST['db_pass'] ?? '';
    $admin_nome = $_POST['admin_nome'] ?? '';
    $admin_email = $_POST['admin_email'] ?? '';
    $admin_password = $_POST['admin_password'] ?? '';
    
    try {
        // Testar conexão com banco
        $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Executar schema do banco
        $schema = file_get_contents('database/clara_zen_schema.sql');
        $pdo->exec($schema);
        $success[] = 'Banco de dados criado com sucesso';
        
        // Atualizar configurações do banco
        $config_content = file_get_contents('config/database.php');
        $config_content = str_replace('localhost', $db_host, $config_content);
        $config_content = str_replace('u123456789_clarazen', $db_name, $config_content);
        $config_content = str_replace('u123456789_user', $db_user, $config_content);
        $config_content = str_replace('SuaSenhaSegura123', $db_pass, $config_content);
        
        file_put_contents('config/database.php', $config_content);
        $success[] = 'Configurações do banco atualizadas';
        
        // Criar usuário admin
        $password_hash = password_hash($admin_password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("
            UPDATE users 
            SET nome = ?, email = ?, password_hash = ? 
            WHERE tipo = 'admin' 
            LIMIT 1
        ");
        $stmt->execute([$admin_nome, $admin_email, $password_hash]);
        $success[] = 'Usuário administrador criado';
        
        // Marcar como instalado
        if (!is_dir('config')) {
            mkdir('config', 0755, true);
        }
        file_put_contents('config/.installed', date('Y-m-d H:i:s'));
        
        $success[] = 'Instalação concluída com sucesso!';
        $success[] = 'Você pode fazer login com as credenciais de administrador.';
        
    } catch (Exception $e) {
        $errors[] = 'Erro na instalação: ' . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalação - Clara Zen</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #3f7c6e, #4a9085);
            min-height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        .install-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            padding: 2rem;
            width: 100%;
            max-width: 500px;
        }
        .logo {
            text-align: center;
            color: #3f7c6e;
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 2rem;
        }
        .form-group {
            margin-bottom: 1rem;
        }
        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #333;
        }
        .form-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
            box-sizing: border-box;
        }
        .form-input:focus {
            outline: none;
            border-color: #3f7c6e;
            box-shadow: 0 0 0 3px rgba(63, 124, 110, 0.1);
        }
        .btn {
            background: #3f7c6e;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: background 0.2s;
        }
        .btn:hover {
            background: #2d5a4f;
        }
        .alert {
            padding: 0.75rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        .alert-error {
            background: #fee;
            border: 1px solid #fcc;
            color: #c33;
        }
        .alert-success {
            background: #efe;
            border: 1px solid #cfc;
            color: #363;
        }
        .requirements {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        .req-item {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        .req-ok { color: #28a745; }
        .req-error { color: #dc3545; }
    </style>
</head>
<body>
    <div class="install-container">
        <div class="logo">Clara Zen</div>
        <div class="subtitle">Instalação do Sistema</div>

        <!-- Verificação de Requisitos -->
        <div class="requirements">
            <h3>Verificação de Requisitos:</h3>
            <div class="req-item">
                <span class="<?php echo version_compare(PHP_VERSION, '7.4.0') >= 0 ? 'req-ok' : 'req-error'; ?>">
                    <?php echo version_compare(PHP_VERSION, '7.4.0') >= 0 ? '✓' : '✗'; ?>
                </span>
                &nbsp; PHP 7.4+ (atual: <?php echo PHP_VERSION; ?>)
            </div>
            <div class="req-item">
                <span class="<?php echo extension_loaded('pdo_mysql') ? 'req-ok' : 'req-error'; ?>">
                    <?php echo extension_loaded('pdo_mysql') ? '✓' : '✗'; ?>
                </span>
                &nbsp; PDO MySQL
            </div>
            <div class="req-item">
                <span class="<?php echo extension_loaded('curl') ? 'req-ok' : 'req-error'; ?>">
                    <?php echo extension_loaded('curl') ? '✓' : '✗'; ?>
                </span>
                &nbsp; cURL
            </div>
            <div class="req-item">
                <span class="<?php echo is_writable('.') ? 'req-ok' : 'req-error'; ?>">
                    <?php echo is_writable('.') ? '✓' : '✗'; ?>
                </span>
                &nbsp; Permissões de escrita
            </div>
        </div>

        <?php foreach ($errors as $error): ?>
            <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
        <?php endforeach; ?>

        <?php foreach ($success as $msg): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($msg); ?></div>
        <?php endforeach; ?>

        <?php if (empty($errors) && empty($success)): ?>
            <form method="POST">
                <h3>Configurações do Banco de Dados:</h3>
                
                <div class="form-group">
                    <label class="form-label">Host do Banco</label>
                    <input type="text" name="db_host" class="form-input" value="localhost" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Nome do Banco</label>
                    <input type="text" name="db_name" class="form-input" placeholder="u123456789_clarazen" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Usuário do Banco</label>
                    <input type="text" name="db_user" class="form-input" placeholder="u123456789_user" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Senha do Banco</label>
                    <input type="password" name="db_pass" class="form-input" required>
                </div>

                <h3>Administrador do Sistema:</h3>
                
                <div class="form-group">
                    <label class="form-label">Nome Completo</label>
                    <input type="text" name="admin_nome" class="form-input" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">E-mail</label>
                    <input type="email" name="admin_email" class="form-input" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Senha</label>
                    <input type="password" name="admin_password" class="form-input" minlength="6" required>
                </div>
                
                <button type="submit" class="btn">Instalar Clara Zen</button>
            </form>
        <?php elseif (!empty($success)): ?>
            <div style="text-align: center; margin-top: 2rem;">
                <a href="login.php" class="btn">Ir para Login</a>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>