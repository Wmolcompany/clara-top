<?php
require_once 'includes/auth.php';
require_once 'classes/ClaraAI.php';

$user_id = requireAuth();
$auth = new Auth();

// Verificar se é admin ou afiliado e redirecionar
if ($auth->isAdmin()) {
    header('Location: admin/dashboard.php');
    exit;
} elseif ($auth->isAfiliado()) {
    header('Location: afiliado/dashboard.php');
    exit;
}

$clara = new ClaraAI($user_id);
$stats = $clara->getUsageStats('today');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Clara Zen</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="app-container">
        <!-- Sidebar -->
        <nav class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">Clara Zen</div>
                <div class="sidebar-subtitle">Sua assistente virtual</div>
            </div>
            
            <div class="sidebar-nav">
                <a href="dashboard.php" class="nav-item active">
                    <i class="fas fa-home"></i>
                    Dashboard
                </a>
                <a href="chat.php" class="nav-item">
                    <i class="fas fa-comments"></i>
                    Chat com Clara
                </a>
                <a href="diario.php" class="nav-item">
                    <i class="fas fa-book"></i>
                    Diário
                </a>
                <a href="rotina.php" class="nav-item">
                    <i class="fas fa-calendar-alt"></i>
                    Rotina
                </a>
                <a href="financas.php" class="nav-item">
                    <i class="fas fa-dollar-sign"></i>
                    Finanças
                </a>
                <a href="historico.php" class="nav-item">
                    <i class="fas fa-history"></i>
                    Histórico
                </a>
                <hr style="border-color: rgba(255,255,255,0.1); margin: 1rem 0;">
                <a href="perfil.php" class="nav-item">
                    <i class="fas fa-user"></i>
                    Meu Perfil
                </a>
                <a href="logout.php" class="nav-item">
                    <i class="fas fa-sign-out-alt"></i>
                    Sair
                </a>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="main-content" id="mainContent">
            <!-- Header -->
            <header class="header">
                <div class="header-left">
                    <button class="menu-toggle" id="menuToggle">
                        <i class="fas fa-bars"></i>
                    </button>
                    <a href="dashboard.php" class="header-logo">Clara Zen</a>
                </div>
                
                <div class="header-right">
                    <div class="user-menu">
                        <div class="user-avatar">
                            <?php echo strtoupper(substr($_SESSION['user_nome'], 0, 1)); ?>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Dashboard Content -->
            <div class="dashboard-grid">
                <!-- Boas-vindas -->
                <div class="dashboard-card" style="grid-column: 1 / -1;">
                    <div class="card-header">
                        <div class="card-icon green">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div>
                            <h2 class="card-title">Olá, <?php echo htmlspecialchars($_SESSION['user_nome']); ?>! 👋</h2>
                            <p class="card-subtitle">Bem-vindo de volta ao Clara Zen. Como posso te ajudar hoje?</p>
                        </div>
                    </div>
                </div>

                <!-- Chat com Clara -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <div class="card-icon green">
                            <i class="fas fa-comments"></i>
                        </div>
                        <div>
                            <h3 class="card-title">Chat com Clara</h3>
                            <p class="card-subtitle">Converse com sua assistente virtual</p>
                        </div>
                    </div>
                    <p>Inicie uma conversa com Clara sobre qualquer assunto. Ela está aqui para te ajudar!</p>
                    <a href="chat.php" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-comment"></i>
                        Começar Conversa
                    </a>
                </div>

                <!-- Diário -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <div class="card-icon green">
                            <i class="fas fa-book"></i>
                        </div>
                        <div>
                            <h3 class="card-title">Diário Pessoal</h3>
                            <p class="card-subtitle">Registre seus sentimentos</p>
                        </div>
                    </div>
                    <p>Compartilhe seus pensamentos e sentimentos com Clara. Ela te ajudará a refletir.</p>
                    <a href="diario.php" class="btn btn-secondary" style="margin-top: 1rem;">
                        <i class="fas fa-pen"></i>
                        Escrever no Diário
                    </a>
                </div>

                <!-- Rotina -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <div class="card-icon green">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <div>
                            <h3 class="card-title">Organizar Rotina</h3>
                            <p class="card-subtitle">Planeje seu dia</p>
                        </div>
                    </div>
                    <p>Organize suas tarefas e compromissos com a ajuda da Clara.</p>
                    <a href="rotina.php" class="btn btn-secondary" style="margin-top: 1rem;">
                        <i class="fas fa-tasks"></i>
                        Planejar Dia
                    </a>
                </div>

                <!-- Finanças -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <div class="card-icon green">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div>
                            <h3 class="card-title">Controle Financeiro</h3>
                            <p class="card-subtitle">Gerencie seus gastos</p>
                        </div>
                    </div>
                    <p>Acompanhe suas finanças e receba dicas de economia da Clara.</p>
                    <a href="financas.php" class="btn btn-secondary" style="margin-top: 1rem;">
                        <i class="fas fa-chart-line"></i>
                        Ver Finanças
                    </a>
                </div>

                <!-- Estatísticas de Uso -->
                <div class="dashboard-card" style="grid-column: 1 / -1;">
                    <div class="card-header">
                        <div class="card-icon green">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <div>
                            <h3 class="card-title">Suas Estatísticas Hoje</h3>
                            <p class="card-subtitle">Acompanhe seu uso da plataforma</p>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                        <div style="text-align: center; padding: 1rem; background: var(--gray-50); border-radius: var(--border-radius);">
                            <div style="font-size: 2rem; font-weight: bold; color: var(--primary-green);">
                                <?php echo $stats['total_interactions']; ?>
                            </div>
                            <div style="color: var(--gray-600);">Conversas com Clara</div>
                        </div>
                        
                        <div style="text-align: center; padding: 1rem; background: var(--gray-50); border-radius: var(--border-radius);">
                            <div style="font-size: 2rem; font-weight: bold; color: var(--primary-green);">
                                <?php echo $_SESSION['user_plano'] === 'premium' ? 'Premium' : 'Gratuito'; ?>
                            </div>
                            <div style="color: var(--gray-600);">Seu Plano</div>
                        </div>
                        
                        <div style="text-align: center; padding: 1rem; background: var(--gray-50); border-radius: var(--border-radius);">
                            <div style="font-size: 2rem; font-weight: bold; color: var(--primary-green);">
                                <?php echo number_format($stats['total_tokens']); ?>
                            </div>
                            <div style="color: var(--gray-600);">Tokens Utilizados</div>
                        </div>
                    </div>
                </div>

                <!-- Upgrade para Premium -->
                <?php if ($_SESSION['user_plano'] === 'free'): ?>
                <div class="dashboard-card" style="grid-column: 1 / -1; background: linear-gradient(135deg, var(--primary-green), var(--primary-green-light)); color: white;">
                    <div class="card-header">
                        <div class="card-icon" style="background: rgba(255,255,255,0.2); color: white;">
                            <i class="fas fa-crown"></i>
                        </div>
                        <div>
                            <h3 class="card-title" style="color: white;">Upgrade para Premium</h3>
                            <p class="card-subtitle" style="color: rgba(255,255,255,0.9);">Desbloqueie todo o potencial da Clara</p>
                        </div>
                    </div>
                    <p style="margin: 1rem 0;">
                        • Conversas ilimitadas com Clara<br>
                        • Acesso a recursos avançados<br>
                        • Relatórios detalhados<br>
                        • Suporte prioritário
                    </p>
                    <a href="upgrade.php" class="btn" style="background: white; color: var(--primary-green); margin-top: 1rem;">
                        <i class="fas fa-star"></i>
                        Assinar Premium
                    </a>
                </div>
                <?php endif; ?>
            </div>
        </main>
    </div>

    <script src="assets/js/main.js"></script>
</body>
</html>