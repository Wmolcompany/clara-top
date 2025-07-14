<?php
require_once 'includes/auth.php';
$user_id = requireAuth();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clara - Sua Amiga Virtual 💚</title>
    <meta name="description" content="Clara é sua amiga virtual acolhedora, pronta para escutar, apoiar e conversar com carinho.">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="header-content">
            <div class="logo">💚</div>
            <div class="header-title">
                <h1>Clara</h1>
                <p>Sua amiga virtual acolhedora</p>
            </div>
            <div class="header-actions">
                <button class="btn-icon purple" data-action="show-history" title="Ver histórico">
                    📚
                </button>
                <button class="btn-icon blue" data-action="show-reports" title="Relatórios">
                    📊
                </button>
                <button class="btn-icon orange" data-action="reset-day" title="Novo dia">
                    🔄
                </button>
            </div>
        </div>
    </header>

    <!-- Container Principal -->
    <div class="container">
        <!-- Navigation Tabs -->
        <nav class="nav-tabs">
            <a href="index.php" class="nav-tab active" data-section="home">
                🏠 Início
            </a>
            <a href="desabafo.php" class="nav-tab" data-section="desabafo">
                💬 Desabafo
            </a>
            <a href="diario.php" class="nav-tab" data-section="diario">
                📔 Diário
            </a>
            <a href="financas.php" class="nav-tab" data-section="financas">
                💸 Finanças
            </a>
            <a href="rotina.php" class="nav-tab" data-section="rotina">
                📅 Rotina
            </a>
        </nav>

        <!-- Welcome Section -->
        <section class="welcome-section">
            <div class="welcome-avatar">💚</div>
            <h2>Bem-vinda de volta!</h2>
            <p>Escolha uma das opções abaixo para começarmos nossa conversa. Estou aqui para te apoiar em tudo que precisar.</p>
        </section>

        <!-- Function Cards -->
        <div class="function-cards">
            <a href="desabafo.php" class="function-card" data-section="desabafo">
                <div class="function-icon green">💬</div>
                <h3>Desabafo</h3>
                <p>Conversas e apoio emocional</p>
                <div class="function-stats">Sempre disponível para você</div>
            </a>

            <a href="diario.php" class="function-card" data-section="diario">
                <div class="function-icon purple">📔</div>
                <h3>Diário</h3>
                <p>Registre seus sentimentos</p>
                <div class="function-stats"><span data-stat="diary_count">0</span> registros salvos</div>
            </a>

            <a href="financas.php" class="function-card" data-section="financas">
                <div class="function-icon blue">💸</div>
                <h3>Finanças</h3>
                <p>Controle seus gastos</p>
                <div class="function-stats">R$ <span data-stat="finance_total">0,00</span> em gastos</div>
            </a>

            <a href="rotina.php" class="function-card" data-section="rotina">
                <div class="function-icon orange">📅</div>
                <h3>Rotina</h3>
                <p>Planeje seu dia</p>
                <div class="function-stats"><span data-stat="routine_count">0</span> tarefas planejadas</div>
            </a>
        </div>

        <!-- Quick Stats -->
        <div class="quick-stats">
            <h3>✨ Resumo do Dia</h3>
            <div class="stats-grid">
                <div class="stat-item purple">
                    <div class="stat-number" data-stat="diary_count">0</div>
                    <div class="stat-label">Registros</div>
                </div>
                <div class="stat-item blue">
                    <div class="stat-number">R$ <span data-stat="finance_total">0</span></div>
                    <div class="stat-label">Gastos</div>
                </div>
                <div class="stat-item orange">
                    <div class="stat-number" data-stat="routine_count">0</div>
                    <div class="stat-label">Tarefas</div>
                </div>
            </div>
        </div>
    </div>

    <script src="assets/js/main.js"></script>
    <script>
        // Carregar estatísticas iniciais
        fetch('api/stats.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Object.entries(data.stats).forEach(([key, value]) => {
                        const elements = document.querySelectorAll(`[data-stat="${key}"]`);
                        elements.forEach(el => el.textContent = value);
                    });
                }
            })
            .catch(error => console.error('Erro ao carregar estatísticas:', error));
    </script>
</body>
</html>