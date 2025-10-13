# 🔍 Debug Netlify - Guia Completo

## 🛠️ Setup Netlify Dev

### 1. Instalar Netlify CLI:
```bash
npm install netlify-cli -g
```

### 2. Linkar o projeto (uma vez):
```bash
netlify login
netlify link
```

### 3. Configurar variáveis de ambiente no Netlify:
```bash
# Via CLI
netlify env:set PAYMENT_GATEWAY umbrela
netlify env:set UMBRELA_API_KEY "sua_chave_aqui"
netlify env:set NODE_ENV production

# Ou via Netlify Dashboard:
# Site Settings > Environment Variables
```

### 4. Rodar localmente simulando Netlify:
```bash
netlify dev
```

## 🔍 Endpoints de Debug Criados

### 1. **GET /api/debug-netlify** - Diagnóstico Completo
```bash
curl https://seusite.netlify.app/api/debug-netlify
```

**Response esperado:**
```json
{
  "environment": {
    "NODE_ENV": "production",
    "NETLIFY": "true",
    "runtime": "edge"
  },
  "headers": {
    "host": "seusite.netlify.app",
    "x-forwarded-proto": "https"
  },
  "envVars": {
    "PAYMENT_GATEWAY": "umbrela",
    "UMBRELA_API_KEY": "present_32chars"
  }
}
```

### 2. **POST /api/debug-netlify** - Teste Conectividade
```bash
curl -X POST https://seusite.netlify.app/api/debug-netlify
```

## 🚨 Problemas Comuns Netlify vs Localhost

### ❌ **Problema 1: Variáveis de Ambiente**
- **Localhost:** Lê do `.env.local`
- **Netlify:** Precisa configurar no dashboard

**Solução:**
```bash
netlify env:list  # Ver variáveis configuradas
netlify env:set UMBRELA_API_KEY "sua_chave"
```

### ❌ **Problema 2: Headers HTTP**
- **Localhost:** `x-forwarded-proto: http`
- **Netlify:** `x-forwarded-proto: https`

**Solução:** Código já ajustado para forçar HTTPS em produção

### ❌ **Problema 3: Runtime Differences**
- **Localhost:** Node.js normal
- **Netlify:** Edge Functions ou Serverless

**Solução:** Configurado timeout de 30s no `netlify.toml`

### ❌ **Problema 4: CORS/Headers**
- **Localhost:** Permissivo
- **Netlify:** Mais restritivo

## 🎯 Passos de Debug

### 1. **Testar diagnóstico:**
```bash
# Localmente com netlify dev
netlify dev
# Acessar: http://localhost:8888/api/debug-netlify

# Em produção
curl https://seusite.netlify.app/api/debug-netlify
```

### 2. **Comparar outputs:**
- ✅ Variáveis de ambiente presentes?
- ✅ Headers corretos?
- ✅ Runtime compatível?

### 3. **Testar conectividade:**
```bash
curl -X POST https://seusite.netlify.app/api/debug-netlify
```

### 4. **Logs Netlify:**
```bash
netlify logs --live
```

## 📊 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] `netlify.toml` configurado com timeouts
- [ ] Endpoint debug funcionando
- [ ] Teste de conectividade com Umbrela OK
- [ ] Headers HTTPS corretos em produção

## 🔧 Comandos Úteis

```bash
# Ver logs em tempo real
netlify logs --live

# Deploy manual
netlify deploy --prod

# Testar build localmente
netlify build

# Ver variáveis de ambiente
netlify env:list
```
