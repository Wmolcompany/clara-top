// Clara Zen - JavaScript Principal
class ClaraZen {
    constructor() {
        this.isLoading = false;
        this.sidebarOpen = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.initSidebar();
        this.initChat();
        this.autoResizeTextarea();
    }

    bindEvents() {
        // Menu toggle
        document.addEventListener('click', (e) => {
            if (e.target.matches('.menu-toggle') || e.target.closest('.menu-toggle')) {
                this.toggleSidebar();
            }

            // Fechar sidebar ao clicar fora (mobile)
            if (this.sidebarOpen && !e.target.closest('.sidebar') && !e.target.closest('.menu-toggle')) {
                this.closeSidebar();
            }
        });

        // Chat form
        const chatForm = document.querySelector('.chat-input-form');
        if (chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }

        // Enter para enviar (Shift+Enter para nova linha)
        const chatInput = document.querySelector('.chat-input');
        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Auto-resize textarea
        if (chatInput) {
            chatInput.addEventListener('input', () => {
                this.autoResizeTextarea();
            });
        }
    }

    initSidebar() {
        // Marcar item ativo baseado na URL
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && currentPath.includes(href)) {
                item.classList.add('active');
            }
        });
    }

    initChat() {
        // Scroll para o final das mensagens
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Carregar mensagens anteriores se necessário
        this.loadChatHistory();
    }

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (this.sidebarOpen) {
            sidebar.classList.add('open');
            if (window.innerWidth > 768) {
                mainContent.classList.add('sidebar-open');
            }
        } else {
            sidebar.classList.remove('open');
            mainContent.classList.remove('sidebar-open');
        }
    }

    closeSidebar() {
        if (this.sidebarOpen) {
            this.sidebarOpen = false;
            document.querySelector('.sidebar').classList.remove('open');
            document.querySelector('.main-content').classList.remove('sidebar-open');
        }
    }

    async sendMessage() {
        const input = document.querySelector('.chat-input');
        const sendBtn = document.querySelector('.chat-send-btn');
        
        if (!input || !input.value.trim() || this.isLoading) return;

        const message = input.value.trim();
        this.isLoading = true;

        // Mostrar loading
        sendBtn.innerHTML = '<div class="spinner"></div>';
        sendBtn.disabled = true;

        try {
            // Adicionar mensagem do usuário
            this.addMessage(message, 'user');
            input.value = '';
            this.autoResizeTextarea();

            // Enviar para o servidor
            const response = await fetch('api/chat.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    context: this.getCurrentContext()
                })
            });

            const data = await response.json();
            
            if (data.success) {
                // Adicionar resposta da Clara com delay para parecer mais natural
                setTimeout(() => {
                    this.addMessage(data.response, 'clara');
                }, 500);
            } else {
                throw new Error(data.error || 'Erro ao enviar mensagem');
            }

        } catch (error) {
            console.error('Erro:', error);
            setTimeout(() => {
                this.addMessage('Desculpe, ocorreu um erro. Tente novamente.', 'clara');
            }, 500);
        } finally {
            this.isLoading = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            sendBtn.disabled = false;
            input.focus();
        }
    }

    addMessage(text, sender) {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const now = new Date();
        const time = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const avatar = sender === 'clara' ? 'C' : 'U';
        const avatarClass = sender === 'clara' ? 'clara' : 'user';

        messageDiv.innerHTML = `
            <div class="message-avatar ${avatarClass}">${avatar}</div>
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(text)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    getCurrentContext() {
        // Determinar contexto baseado na página atual
        const path = window.location.pathname;
        if (path.includes('diario')) return 'diario';
        if (path.includes('financas')) return 'financas';
        if (path.includes('rotina')) return 'rotina';
        return 'chat';
    }

    async loadChatHistory() {
        try {
            const context = this.getCurrentContext();
            const response = await fetch(`api/messages.php?context=${context}&limit=20`);
            const data = await response.json();
            
            if (data.success && data.messages.length > 0) {
                const chatMessages = document.querySelector('.chat-messages');
                if (chatMessages) {
                    // Limpar mensagens existentes (exceto mensagem inicial)
                    const initialMessage = chatMessages.querySelector('.message');
                    chatMessages.innerHTML = '';
                    
                    // Adicionar mensagens do histórico
                    data.messages.forEach(msg => {
                        this.addMessageFromHistory(msg);
                    });
                    
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            }
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        }
    }

    addMessageFromHistory(msg) {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.sender}`;
        
        const avatar = msg.sender === 'clara' ? 'C' : 'U';
        const avatarClass = msg.sender === 'clara' ? 'clara' : 'user';

        messageDiv.innerHTML = `
            <div class="message-avatar ${avatarClass}">${avatar}</div>
            <div class="message-content">
                <div class="message-text">${msg.message}</div>
                <div class="message-time">${msg.time}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
    }

    autoResizeTextarea() {
        const textarea = document.querySelector('.chat-input');
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Utility functions
    showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        const container = document.querySelector('.main-content') || document.body;
        container.insertBefore(alertDiv, container.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    }

    formatDateTime(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new ClaraZen();
});

// Funções globais para uso em outras páginas
window.ClaraZen = ClaraZen;

// Auto-save para formulários longos
class AutoSave {
    constructor(formSelector, saveInterval = 30000) {
        this.form = document.querySelector(formSelector);
        this.saveInterval = saveInterval;
        this.timeoutId = null;
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('input', () => {
            this.scheduleAutoSave();
        });

        // Salvar ao sair da página
        window.addEventListener('beforeunload', () => {
            this.saveNow();
        });
    }

    scheduleAutoSave() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        
        this.timeoutId = setTimeout(() => {
            this.saveNow();
        }, this.saveInterval);
    }

    saveNow() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        // Salvar no localStorage como backup
        localStorage.setItem(`autosave_${this.form.id}`, JSON.stringify({
            data: data,
            timestamp: Date.now()
        }));
    }

    restore() {
        const saved = localStorage.getItem(`autosave_${this.form.id}`);
        if (saved) {
            try {
                const { data, timestamp } = JSON.parse(saved);
                
                // Só restaurar se for recente (menos de 1 hora)
                if (Date.now() - timestamp < 3600000) {
                    Object.entries(data).forEach(([key, value]) => {
                        const field = this.form.querySelector(`[name="${key}"]`);
                        if (field) {
                            field.value = value;
                        }
                    });
                }
            } catch (error) {
                console.error('Erro ao restaurar auto-save:', error);
            }
        }
    }
}

// Validação de formulários
class FormValidator {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        this.errors = {};
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            if (!this.validate()) {
                e.preventDefault();
                this.showErrors();
            }
        });

        // Validação em tempo real
        this.form.addEventListener('input', (e) => {
            this.validateField(e.target);
        });
    }

    validate() {
        this.errors = {};
        const fields = this.form.querySelectorAll('[required], [data-validate]');
        
        fields.forEach(field => {
            this.validateField(field);
        });

        return Object.keys(this.errors).length === 0;
    }

    validateField(field) {
        const name = field.name;
        const value = field.value.trim();
        const type = field.type;
        
        // Remover erro anterior
        delete this.errors[name];
        field.classList.remove('error');

        // Validar campo obrigatório
        if (field.hasAttribute('required') && !value) {
            this.errors[name] = 'Este campo é obrigatório';
            return;
        }

        // Validações específicas por tipo
        if (value) {
            switch (type) {
                case 'email':
                    if (!this.isValidEmail(value)) {
                        this.errors[name] = 'E-mail inválido';
                    }
                    break;
                    
                case 'password':
                    if (value.length < 6) {
                        this.errors[name] = 'Senha deve ter pelo menos 6 caracteres';
                    }
                    break;
            }

            // Validações customizadas
            const validateType = field.dataset.validate;
            if (validateType) {
                switch (validateType) {
                    case 'cpf':
                        if (!this.isValidCPF(value)) {
                            this.errors[name] = 'CPF inválido';
                        }
                        break;
                        
                    case 'phone':
                        if (!this.isValidPhone(value)) {
                            this.errors[name] = 'Telefone inválido';
                        }
                        break;
                }
            }
        }

        // Mostrar erro no campo
        if (this.errors[name]) {
            field.classList.add('error');
        }
    }

    showErrors() {
        Object.entries(this.errors).forEach(([field, message]) => {
            const fieldElement = this.form.querySelector(`[name="${field}"]`);
            if (fieldElement) {
                fieldElement.classList.add('error');
                
                // Mostrar tooltip ou mensagem de erro
                this.showFieldError(fieldElement, message);
            }
        });
    }

    showFieldError(field, message) {
        // Remover erro anterior
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Adicionar nova mensagem de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = 'var(--error)';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    isValidCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(9))) return false;

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        
        return remainder === parseInt(cpf.charAt(10));
    }

    isValidPhone(phone) {
        const cleaned = phone.replace(/[^\d]/g, '');
        return cleaned.length >= 10 && cleaned.length <= 11;
    }
}