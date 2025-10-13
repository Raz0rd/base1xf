# 🔧 Configuração de Variáveis de Ambiente

## 📋 Variáveis Necessárias

### **Arquivo `.env` (criar na raiz do projeto):**

```bash
# =============================================================================
# 🎯 CONFIGURAÇÕES DA APLICAÇÃO
# =============================================================================

# URL base da aplicação (produção)
NEXT_PUBLIC_APP_URL=https://seudominio.com

# Ambiente atual
NODE_ENV=production

# Sistema de verificação de usuário (true = ativa verificação, false = acesso direto)
NEXT_PUBLIC_ENABLE_USER_VERIFICATION=false

# =============================================================================
# 🔗 CONFIGURAÇÕES DE REDIRECIONAMENTO
# =============================================================================

# URL de redirect após completar ações
NEXT_PUBLIC_REDIRECT_URL=https://seudominio.com/redirect

# URL de callback para pagamentos
NEXT_PUBLIC_CALLBACK_URL=https://seudominio.com/callback

# =============================================================================
# 📊 ANALYTICS & TRACKING
# =============================================================================

# Google Analytics (opcional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Ads (opcional)  
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX

# Facebook Pixel (opcional)
NEXT_PUBLIC_FB_PIXEL_ID=XXXXXXXXXXXXXX

# =============================================================================
# 🎮 CONFIGURAÇÕES DE JOGOS
# =============================================================================

# IDs dos jogos suportados
NEXT_PUBLIC_FREEFIRE_APP_ID=100067
NEXT_PUBLIC_DELTAFORCE_APP_ID=100068
NEXT_PUBLIC_HAIKYU_APP_ID=100069

# =============================================================================
# 🔐 SEGURANÇA (se necessário)
# =============================================================================

# Chave secreta para JWT (se usar autenticação)
JWT_SECRET=sua_chave_super_secreta_aqui_min_32_chars

# Chave de API interna (se usar APIs próprias)
API_SECRET_KEY=sua_api_key_secreta

# =============================================================================
# 💳 PAGAMENTOS (se integrar)
# =============================================================================

# PIX - Chaves de API do gateway de pagamento
PAYMENT_GATEWAY_API_KEY=sua_chave_do_gateway
PAYMENT_GATEWAY_SECRET=seu_secret_do_gateway

# Webhook secret para validar callbacks de pagamento
PAYMENT_WEBHOOK_SECRET=sua_webhook_secret

# =============================================================================
# 📧 EMAIL (se usar notificações)
# =============================================================================

# SMTP para envio de emails
SMTP_HOST=smtp.seuservidor.com
SMTP_PORT=587
SMTP_USER=noreply@seudominio.com
SMTP_PASS=sua_senha_smtp

# =============================================================================
# 🗄️ BANCO DE DADOS (se usar)
# =============================================================================

# PostgreSQL/MySQL
DATABASE_URL=postgresql://usuario:senha@localhost:5432/db_name

# Redis para cache (se usar)
REDIS_URL=redis://localhost:6379
```

## 🚨 **Variáveis Obrigatórias para Funcionamento Básico:**

```bash
# Mínimo necessário
NEXT_PUBLIC_APP_URL=https://seudominio.com
NODE_ENV=production
NEXT_PUBLIC_ENABLE_USER_VERIFICATION=false
```

## 🛡️ **Sistema de Verificação de Usuário:**

### **NEXT_PUBLIC_ENABLE_USER_VERIFICATION:**
- **`false`** (padrão): Usuários acessam o site diretamente, sem verificação
- **`true`**: Ativa tela de verificação obrigatória antes do acesso ao site

### **Como funciona quando `true`:**
1. **Tela Inicial:** Apresenta o sistema de verificação
2. **Termos de Uso:** Usuário deve aceitar os termos
3. **Verificação:** Usuário insere ID do jogador para validação
4. **Acesso Liberado:** Após verificação, acessa o site normalmente

### **Vantagens da verificação:**
- **Filtro anti-bot:** Reduz tráfego automatizado
- **Usuários reais:** Garante que apenas jogadores acessem
- **Compliance:** Atende requisitos de verificação de idade/região
- **Analytics limpos:** Dados mais precisos de usuários reais

## 🔗 **Variáveis para Funcionalidades Específicas:**

### **Analytics & Marketing:**
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Para Google Analytics
- `NEXT_PUBLIC_GOOGLE_ADS_ID` - Para conversões Google Ads
- `NEXT_PUBLIC_FB_PIXEL_ID` - Para Facebook Pixel

### **Jogos:**
- `NEXT_PUBLIC_FREEFIRE_APP_ID` - ID do Free Fire
- `NEXT_PUBLIC_DELTAFORCE_APP_ID` - ID do Delta Force  
- `NEXT_PUBLIC_HAIKYU_APP_ID` - ID do Haikyu

### **Pagamentos:**
- `PAYMENT_GATEWAY_API_KEY` - Chave da API de pagamento
- `PAYMENT_WEBHOOK_SECRET` - Secret para validar webhooks

## 📝 **Como Configurar:**

1. **Copie o arquivo de exemplo:**
```bash
cp ENV_SETUP.md .env
```

2. **Edite o arquivo `.env`:**
```bash
nano .env
```

3. **Substitua os valores:**
- Coloque sua URL real no `NEXT_PUBLIC_APP_URL`
- Configure apenas as variáveis que você vai usar
- Mantenha as chaves secretas seguras

## ⚠️ **Importante:**
- **NUNCA** commite o arquivo `.env` no Git
- Use valores diferentes para desenvolvimento e produção
- Mantenha as chaves de API seguras
- Teste todas as funcionalidades após configurar
