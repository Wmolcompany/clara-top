<?php
require_once 'includes/auth.php';
$user_id = requireAuth();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Finanças - Clara 💚</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="header-content">
            <a href="index.php" class="logo">💚</a>
            <div class="header-title">
                <h1>Clara</h1>
                <p>Finanças - Controle seus gastos</p>
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
            <a href="index.php" class="nav-tab" data-section="home">
                🏠 Início
            </a>
            <a href="desabafo.php" class="nav-tab" data-section="desabafo">
                💬 Desabafo
            </a>
            <a href="diario.php" class="nav-tab" data-section="diario">
                📔 Diário
            </a>
            <a href="financas.php" class="nav-tab active" data-section="financas">
                💸 Finanças
            </a>
            <a href="rotina.php" class="nav-tab" data-section="rotina">
                📅 Rotina
            </a>
        </nav>

        <!-- Chat Header -->
        <div class="chat-header">
            <div class="chat-header-icon blue">💸</div>
            <div>
                <h3>Finanças</h3>
                <p>Controle seus gastos e organize sua vida financeira</p>
            </div>
        </div>

        <!-- Chat Container -->
        <div class="chat-container">
            <div class="chat-messages" id="chatMessages">
                <div class="message clara">
                    <div class="message-content">
                        <div class="message-text">Vamos cuidar das suas finanças juntas! 💸 Me conte sobre algum gasto que você fez ou quer registrar. Ex: "Gastei 30 reais com almoço"</div>
                        <div class="message-time"><?php echo date('H:i'); ?></div>
                    </div>
                </div>
            </div>

            <form class="chat-input chat-form">
                <div class="input-group">
                    <textarea 
                        class="chat-textarea" 
                        placeholder="Ex: Gastei 25 reais com supermercado, ou: Quero registrar um gasto..."
                        rows="2"
                    ></textarea>
                    <button type="submit" class="btn-send">
                        💰 Registrar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script src="assets/js/main.js"></script>
    <script>
        // Carregar mensagens anteriores
        fetch('api/messages.php?section=financas')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.messages.length > 1) {
                    const messagesContainer = document.getElementById('chatMessages');
                    messagesContainer.innerHTML = '';
                    
                    data.messages.forEach(msg => {
                        const messageDiv = document.createElement('div');
                        messageDiv.className = `message ${msg.sender}`;
                        messageDiv.innerHTML = `
                            <div class="message-content">
                                <div class="message-text">${msg.message}</div>
                                <div class="message-time">${msg.time}</div>
                            </div>
                        `;
                        messagesContainer.appendChild(messageDiv);
                    });
                    
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            })
            .catch(error => console.error('Erro ao carregar mensagens:', error));
    </script>
</body>
</html>