# Clara Zen - Sistema Completo

Clara Zen é uma plataforma completa de assistente virtual com IA, sistema de afiliados e painéis administrativos modernos.

## 🚀 Funcionalidades

### 👤 Para Usuários
- **Chat com IA**: Conversas inteligentes usando OpenAI GPT
- **Diário Pessoal**: Registro de sentimentos e experiências
- **Controle Financeiro**: Gestão de gastos e receitas
- **Organização de Rotina**: Planejamento de tarefas diárias
- **Relatórios Inteligentes**: Análises e insights personalizados

### 🤝 Para Afiliados
- **Links Personalizados**: Geração automática de links de afiliado
- **Dashboard Completo**: Estatísticas de cliques e conversões
- **Sistema de Comissões**: Divisão automática de receitas
- **Solicitação de Saques**: Processo automatizado de pagamentos

### 🔧 Para Administradores
- **Painel Master**: Controle total do sistema
- **Gestão de Usuários**: CRUD completo de usuários
- **Configurações da IA**: Gerenciamento de API keys e prompts
- **Relatórios Financeiros**: Análise de receitas e comissões
- **Ranking de Afiliados**: Top performers em tempo real

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
- **Stripe/Mercado Pago** para pagamentos

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
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook

# E-mail (Para notificações)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=seu@email.com
EMAIL_PASS=sua-senha-app
```

### Configuração do Nginx

O arquivo `nginx/site.conf` já está configurado com:
- Rate limiting
- Compressão GZIP
- Headers de segurança
- Proxy para API e Frontend
- Cache de arquivos estáticos

### SSL/HTTPS

Para produção, descomente a seção HTTPS no `nginx/site.conf` e configure certificados:

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

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

### Logs e Monitoramento
```bash
# Logs da API
docker-compose logs -f api

# Logs do Nginx
docker-compose logs -f nginx

# Status dos containers
docker-compose ps

# Uso de recursos
docker stats
```

## 📊 Monitoramento

### Portainer (Incluído)
Acesse `http://seu-dominio.com:9000` para interface gráfica do Docker.

### Logs Centralizados
Todos os logs são salvos em:
- `logs/api/` - Logs da API
- `logs/nginx/` - Logs do Nginx

### Métricas Importantes
- Uso de CPU/RAM dos containers
- Latência das requisições
- Taxa de erro da API
- Uso do banco de dados
- Cache hit rate do Redis

## 🔒 Segurança

### Implementado
- ✅ Rate limiting por IP
- ✅ Headers de segurança
- ✅ Validação de entrada
- ✅ JWT com expiração
- ✅ Senhas criptografadas
- ✅ CORS configurado
- ✅ SQL injection protection

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

**Frontend não carrega:**
```bash
# Ver logs do Nginx
docker-compose logs nginx

# Verificar configuração
docker-compose exec nginx nginx -t

# Reiniciar Nginx
docker-compose restart nginx
```

## 📞 Suporte

Para suporte técnico:
1. Verifique os logs: `docker-compose logs [serviço]`
2. Consulte este README
3. Verifique issues no GitHub
4. Entre em contato com a equipe

## 📄 Licença

Este projeto é proprietário. Uso restrito conforme acordo de licença.

---

**Clara Zen** - Sua assistente virtual inteligente 🤖💚