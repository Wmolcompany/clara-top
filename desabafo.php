<?php
require_once 'includes/auth.php';
$user_id = requireAuth();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Desabafo - Clara 💚</title>
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
                <p>Desabafo - Apoio emocional</p>
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
            <a href="desabafo.php" class="nav-tab active" data-section="desabafo">
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

        <!-- Chat Header -->
        <div class="chat-header">
            <div class="chat-header-icon green">💬</div>
            <div>
                <h3>Desabafo</h3>
                <p>Conversas e apoio emocional</p>
            </div>
        </div>

        <!-- Chat Container -->
        <div class="chat-container">
            <div class="chat-messages" id="chatMessages">
                <div class="message clara">
                    <div class="message-content">
                        <div class="message-text">Oi! Estou aqui para te escutar 💚 Pode me contar o que está no seu coração hoje?</div>
                        <div class="message-time"><?php echo date('H:i'); ?></div>
                    </div>
                </div>
            </div>

            <form class="chat-input chat-form">
                <div class="input-group">
                    <textarea 
                        class="chat-textarea" 
                        placeholder="Conte-me como você está se sentindo..."
                        rows="2"
                    ></textarea>
                    <button type="submit" class="btn-send">
                        💚 Enviar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script src="assets/js/main.js"></script>
    <script>
        // Carregar mensagens anteriores
        fetch('api/messages.php?section=desabafo')
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