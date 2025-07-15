# Clara Zen - Sistema Completo com Afiliados

Clara Zen é uma plataforma SaaS completa de assistente virtual com IA, sistema de afiliados avançado, split de pagamentos e painéis administrativos modernos.

## 🚀 Funcionalidades Implementadas

### 👤 Para Usuários
- **Chat com IA**: Conversas inteligentes usando OpenAI GPT
- **Diário Pessoal**: Registro de sentimentos e experiências
- **Controle Financeiro**: Gestão de gastos e receitas
- **Organização de Rotina**: Planejamento de tarefas diárias
- **Relatórios Inteligentes**: Análises e insights personalizados
- **Planos Flexíveis**: Free, Premium Mensal e Anual

### 🤝 Sistema de Afiliados Completo
- **Cadastro de Afiliados**: CPF/CNPJ com escolha CPA ou Recorrência
- **Sub-afiliados**: Hierarquia de 2 níveis com comissões
- **Links Personalizados**: Geração automática de links de afiliado
- **Tracking Avançado**: Cliques, conversões e métricas detalhadas
- **Comissões Customizáveis**: Taxa por afiliado (% ou valor fixo)
- **Retenção de 7 dias**: Segurança antes da liberação
- **Dashboard Completo**: Estatísticas e relatórios em tempo real

### 💳 Split de Pagamento
- **Integração Stripe**: Checkout e webhooks configurados
- **Divisão Automática**: Comissões calculadas automaticamente
- **Múltiplos Planos**: Mensal, anual e trial
- **Gestão de Assinaturas**: Ativação, cancelamento e renovação

### 💰 Sistema de Saques PIX
- **Cadastro de Chave PIX**: Telefone, e-mail, CPF/CNPJ ou aleatória
- **Validação de Dados**: Nome da conta vs documento
- **Aprovação Manual**: Controle total pelo Super Admin
- **Histórico Completo**: Todas as transações registradas

### 🧑‍💼 Painel Administrativo (Master)
- **Configurações Gerais**: Stripe, OpenAI, SMTP e parâmetros
- **CRUD de Usuários**: Gestão completa de usuários
- **Gestão de Afiliados**: Aprovação e configuração
- **Controle de Saques**: Aprovação/rejeição manual
- **Relatórios Avançados**: Receitas, conversões e métricas
- **Ranking de Afiliados**: Top performers em tempo real

### 🤝 Painel do Afiliado
- **Dashboard Personalizado**: Status, ganhos e métricas
- **Links de Indicação**: Geração e compartilhamento
- **Histórico de Comissões**: Pendentes, disponíveis e pagas
- **Solicitação de Saque**: Interface simples e segura
- **Relatórios Detalhados**: Performance e conversões

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 14** com TypeScript
- **Tailwind CSS** para estilização
- **React Query** para gerenciamento de estado
- **Framer Motion** para animações
- **Recharts** para gráficos

### Backend
- **NestJS** com TypeScript
- **MySQL 8** como banco principal
- **Redis** para cache e sessões
- **OpenAI API** para IA
- **Stripe** para pagamentos
- **Nodemailer** para e-mails

### Infraestrutura
- **Docker & Docker Compose**
- **Nginx** como reverse proxy
- **SSL/TLS** com Let's Encrypt
- **Logs centralizados** com Winston

## 📋 Requisitos

- **VPS**: 2 vCPU, 8 GB RAM, 100 GB NVMe
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Domínio**: Para SSL e produção

## 🚀 Instalação Rápida

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/clara-zen.git
cd clara-zen
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
nano .env  # Edite com suas configurações
```

### 3. Execute o deploy
```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. Acesse a aplicação
- Frontend: `http://seu-dominio.com`
- API: `http://seu-dominio.com/api`
- Docs: `http://seu-dominio.com/api/docs`
- Admin: `http://seu-dominio.com/admin/dashboard`

## ⚙️ Configuração Detalhada

### Variáveis de Ambiente Essenciais

```env
# OpenAI (Obrigatório para IA)
OPENAI_API_KEY=sk-sua-chave-aqui

# Banco de Dados
DATABASE_URL=mysql://clarazen:senha@db:3306/clarazen

# JWT (Gere uma chave segura)
JWT_SECRET=sua-chave-jwt-super-secreta

# Stripe (Para pagamentos)
STRIPE_SECRET_KEY=sk_test_sua_chave
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook

# E-mail (Para notificações)
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_USER=contato@clarazen.com.br
EMAIL_PASS=sua-senha-app
```

### Configuração do Stripe

1. **Criar Produtos no Stripe**:
   - Premium Mensal: R$ 29,90/mês
   - Premium Anual: R$ 229,90/ano

2. **Configurar Webhooks**:
   - URL: `https://seu-dominio.com/api/stripe/webhook`
   - Eventos: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`

3. **Configurar no Painel Admin**:
   - Adicionar chaves no painel de configurações
   - Associar Price IDs aos planos

## 🔧 Comandos Úteis

### Docker Compose
```bash
# Iniciar serviços
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Reiniciar serviço específico
docker-compose restart api

# Parar todos os serviços
docker-compose down

# Rebuild completo
docker-compose up -d --build --force-recreate
```

### Banco de Dados
```bash
# Acessar MySQL
docker-compose exec db mysql -u root -p

# Backup
docker-compose exec db mysqldump -u root -p clarazen > backup.sql

# Restore
docker-compose exec -T db mysql -u root -p clarazen < backup.sql
```

### Liberação de Comissões
```bash
# Liberar comissões manualmente (executar diariamente)
curl -X POST http://localhost:4000/api/affiliates/release-commissions
```

## 📊 Sistema de Afiliados

### Fluxo de Comissões

1. **Usuário se cadastra** com código de afiliado
2. **Usuário assina** um plano premium
3. **Comissão é calculada** automaticamente
4. **Retenção de 7 dias** para segurança
5. **Liberação automática** após período
6. **Saque disponível** para o afiliado

### Tipos de Comissão

- **CPA**: Pagamento único (50% do valor da assinatura)
- **Recorrente**: Percentual mensal (configurável por afiliado)
- **Sub-afiliado**: 10% para o nível 2

### Hierarquia de Afiliados

```
Afiliado Principal (Nível 1)
├── Comissão: 50% (configurável)
└── Sub-afiliado (Nível 2)
    └── Comissão: 10% (fixo)
```

## 🔒 Segurança

### Implementado
- ✅ Autenticação JWT com 2FA
- ✅ Rate limiting por IP
- ✅ Headers de segurança
- ✅ Validação de entrada
- ✅ Senhas criptografadas
- ✅ CORS configurado
- ✅ SQL injection protection
- ✅ Webhook signature validation

### Recomendações
- Use HTTPS em produção
- Configure firewall (UFW)
- Monitore logs regularmente
- Mantenha containers atualizados
- Faça backups regulares

## 🚀 Deploy em Produção

### 1. Preparação do Servidor
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configurar firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Deploy da Aplicação
```bash
# Clone e configure
git clone https://github.com/seu-usuario/clara-zen.git
cd clara-zen
cp .env.example .env

# Edite .env com configurações de produção
nano .env

# Execute deploy
./deploy.sh
```

### 3. Configuração de Domínio
```bash
# Configure DNS A record apontando para seu IP
# Aguarde propagação (pode levar até 24h)

# Configure SSL
sudo certbot --nginx -d seu-dominio.com
```

## 🔄 Backup e Restore

### Backup Automático
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T db mysqldump -u root -p$DB_ROOT_PASSWORD clarazen > "backup_${DATE}.sql"
tar -czf "clara_zen_backup_${DATE}.tar.gz" backup_${DATE}.sql logs/
```

### Restore
```bash
# Restore banco
docker-compose exec -T db mysql -u root -p$DB_ROOT_PASSWORD clarazen < backup.sql

# Restart serviços
docker-compose restart
```

## 🐛 Solução de Problemas

### Problemas Comuns

**Erro de conexão com banco:**
```bash
# Verificar se MySQL está rodando
docker-compose ps db

# Ver logs do banco
docker-compose logs db

# Reiniciar banco
docker-compose restart db
```

**API não responde:**
```bash
# Ver logs da API
docker-compose logs api

# Verificar variáveis de ambiente
docker-compose exec api env | grep DATABASE_URL

# Reiniciar API
docker-compose restart api
```

**Stripe não funciona:**
```bash
# Verificar configurações
docker-compose exec api env | grep STRIPE

# Testar webhook
curl -X POST http://localhost:4000/api/stripe/webhook
```

## 📈 Monitoramento

### Métricas Importantes
- Taxa de conversão de afiliados
- Churn rate de assinaturas
- LTV (Lifetime Value) dos usuários
- Comissões pendentes vs pagas
- Performance da API (latência)

### Logs Importantes
- `logs/api/` - Logs da API
- `logs/nginx/` - Logs do Nginx
- Stripe Dashboard - Transações
- OpenAI Usage - Consumo de tokens

## 📞 Suporte

Para suporte técnico:
1. Verifique os logs: `docker-compose logs [serviço]`
2. Consulte este README
3. Verifique issues no GitHub
4. Entre em contato com a equipe

## 🎯 Roadmap

- [ ] Integração com Mercado Pago
- [ ] Webhooks para Hotmart/Kiwify
- [ ] WhatsApp Business API
- [ ] App mobile (React Native)
- [ ] Relatórios avançados com BI
- [ ] Multi-idiomas
- [ ] API pública para integrações

## 📄 Licença

Este projeto é proprietário. Uso restrito conforme acordo de licença.

---

**Clara Zen** - Sua plataforma SaaS completa com sistema de afiliados! 🤖💚🚀