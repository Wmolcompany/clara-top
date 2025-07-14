<?php
require_once 'includes/auth.php';
require_once 'classes/ClaraAI.php';

$user_id = requireAuth();
$clara = new ClaraAI($user_id);

// Buscar texto inicial da Clara
$texto_inicial = getConfig('clara_texto_inicial', 'Olá! Sou a Clara, sua assistente virtual. Como posso te ajudar hoje?');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat com Clara - Clara Zen</title>
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
                <a href="dashboard.php" class="nav-item">
                    <i class="fas fa-home"></i>
                    Dashboard
                </a>
                <a href="chat.php" class="nav-item active">
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

            <!-- Chat Container -->
            <div class="chat-container">
                <div class="chat-messages" id="chatMessages">
                    <!-- Mensagem inicial da Clara -->
                    <div class="message clara">
                        <div class="message-avatar clara">C</div>
                        <div class="message-content">
                            <div class="message-text"><?php echo htmlspecialchars($texto_inicial); ?></div>
                            <div class="message-time"><?php echo date('H:i'); ?></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chat Input -->
            <div class="chat-input-container">
                <form class="chat-input-form" id="chatForm">
                    <textarea 
                        class="chat-input" 
                        id="chatInput"
                        placeholder="Digite sua mensagem para Clara..."
                        rows="1"
                        required
                    ></textarea>
                    <button type="submit" class="chat-send-btn" id="sendBtn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </main>
    </div>

    <script src="assets/js/main.js"></script>
    <script>
        // Carregar histórico de mensagens ao inicializar
        document.addEventListener('DOMContentLoaded', function() {
            loadChatHistory();
        });

        async function loadChatHistory() {
            try {
                const response = await fetch('api/messages.php?context=chat&limit=20');
                const data = await response.json();
                
                if (data.success && data.messages.length > 0) {
                    const chatMessages = document.getElementById('chatMessages');
                    
                    // Manter apenas a mensagem inicial
                    const initialMessage = chatMessages.querySelector('.message.clara');
                    chatMessages.innerHTML = '';
                    
                    // Adicionar mensagens do histórico
                    data.messages.forEach(msg => {
                        addMessageFromHistory(msg);
                    });
                    
                    // Se não há histórico, manter mensagem inicial
                    if (data.messages.length === 0) {
                        chatMessages.appendChild(initialMessage);
                    }
                    
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            } catch (error) {
                console.error('Erro ao carregar histórico:', error);
            }
        }

        function addMessageFromHistory(msg) {
            const chatMessages = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.sender}`;
            
            const avatar = msg.sender === 'clara' ? 'C' : '<?php echo strtoupper(substr($_SESSION['user_nome'], 0, 1)); ?>';
            
            messageDiv.innerHTML = `
                <div class="message-avatar ${msg.sender}">${avatar}</div>
                <div class="message-content">
                    <div class="message-text">${escapeHtml(msg.message)}</div>
                    <div class="message-time">${msg.time}</div>
                </div>
            `;
            
            chatMessages.appendChild(messageDiv);
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    </script>
</body>
</html>