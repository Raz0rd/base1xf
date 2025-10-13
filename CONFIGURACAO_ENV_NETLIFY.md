# 🔐 Configuração de Variáveis de Ambiente no Netlify

## ✅ Variáveis Obrigatórias

Configure estas variáveis no **Netlify Dashboard**:
`Site Settings > Environment Variables > Add a variable`

### 🎮 Gateway de Pagamento
```
PAYMENT_GATEWAY=umbrela
```

### 🔑 API Keys dos Gateways
```
UMBRELA_API_KEY=sua_chave_umbrela_aqui
BLACKCAT_API_AUTH=Basic sua_chave_blackcat_em_base64_aqui
GHOSTPAY_API_KEY=sk_live_sua_chave_ghostpay_aqui
```

> ⚠️ **IMPORTANTE**: Use as chaves reais que você já configurou no Netlify Dashboard.
> As chaves acima são apenas exemplos de formato.

### 📊 Analytics & Tracking
```
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-17643643241
NEXT_PUBLIC_GOOGLE_ADS_ENABLED=true
NEXT_PUBLIC_ADS_INDIVIDUAL=true
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA=YmnVCJXTmasbEOnCkt1B
NEXT_PUBLIC_GTAG_CONVERSION_INITCHECKOUT=Af84CK6Zq6sbEOnCkt1B
```

### 🔗 UTMify
```
UTMIFY_API_TOKEN=seu_token_utmify_aqui
UTMIFY_ENABLED=true
UTMIFY_TEST_MODE=false
UTMIFY_WHITEPAGE_URL=https://www.gameggpro.shop
NEXT_PUBLIC_UTMIFY_WHITEPAGE_URL=https://www.gameggpro.shop
```

## 📋 Passo a Passo para Configurar no Netlify

### Via Dashboard:
1. Acesse: https://app.netlify.com
2. Selecione seu site: **ffbales**
3. Vá em: `Site Settings > Environment variables`
4. Clique em: `Add a variable`
5. Cole cada variável acima (uma por vez)
6. Clique em: `Save`

### Via Netlify CLI:
```bash
netlify env:set PAYMENT_GATEWAY umbrela
netlify env:set UMBRELA_API_KEY "sua_chave_aqui"
netlify env:set BLACKCAT_API_AUTH "sua_chave_aqui"
netlify env:set GHOSTPAY_API_KEY "sua_chave_aqui"
# ... continuar com as outras
```

### ✅ Verificar variáveis configuradas:
```bash
netlify env:list
```

## 🔍 Testar Configuração

Após configurar, teste se as variáveis estão sendo lidas:

```
GET https://www.gameggpro.shop/api/debug-netlify
```

Deve retornar:
```json
{
  "envVars": {
    "PAYMENT_GATEWAY": "umbrela",
    "UMBRELA_API_KEY": "present_36chars"  ✅
  }
}
```

## ⚠️ Importante

- **Nunca** comite API keys no código
- **Sempre** configure via Netlify Dashboard
- **Teste** após cada alteração de variável
- **Redeploy** pode ser necessário após mudanças

## 🚀 Deploy

Após configurar as variáveis:
```bash
git push origin main
```

O Netlify fará deploy automaticamente e lerá as env vars configuradas.
