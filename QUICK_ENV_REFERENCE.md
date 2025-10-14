# ⚡ Referência Rápida - Configuração ENV por Site

## 🎯 **Variáveis que MUDAM por Site**

### **📊 Google Ads (sempre muda)**
```bash
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX
```

### **🎯 Conversões (muda conforme campanha)**

**LEAD:**
```bash
NEXT_PUBLIC_GTAG_CONVERSION_LEAD=LeadLabelXXXXXX
```

**VENDA:**
```bash
NEXT_PUBLIC_GTAG_CONVERSION_INITCHECKOUT=CheckoutLabelXXXXXX
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA=CompraLabelXXXXXX
```

### **🔗 UTMify (sempre muda)**
```bash
UTMIFY_API_TOKEN=chave_do_site
NEXT_PUBLIC_PIXELID_UTMFY=pixel_do_site
UTMIFY_WHITEPAGE_URL=https://dominio.com
NEXT_PUBLIC_UTMIFY_WHITEPAGE_URL=https://dominio.com
```

---

## 🔒 **Variáveis que NÃO MUDAM (API Pagamento)**

```bash
PAYMENT_GATEWAY=umbrela
UMBRELA_API_KEY=84f2022f-a84b-4d63-a727-1780e6261fe8
BLACKCAT_API_AUTH=Basic cGtfMERsc0F6eHhO...
GHOSTPAY_API_KEY=sk_live_CRH95TPfBYFG81eT...
```

---

## 📋 **Checklist Rápido**

### **Novo Site LEAD:**
1. [ ] Copiar `.env.lead.example`
2. [ ] Configurar `CAMPAIGN_TYPE=LEAD`
3. [ ] `NEXT_PUBLIC_ENABLE_USER_VERIFICATION=true`
4. [ ] Pegar Google Ads ID da conta
5. [ ] Pegar Label de LEAD do Google Ads
6. [ ] Criar conta UTMify e pegar token + pixel
7. [ ] Configurar domínio UTMify
8. [ ] Deploy

### **Novo Site VENDA:**
1. [ ] Copiar `.env.venda.example`
2. [ ] Configurar `CAMPAIGN_TYPE=VENDA`
3. [ ] `NEXT_PUBLIC_ENABLE_USER_VERIFICATION=false`
4. [ ] Pegar Google Ads ID da conta
5. [ ] Pegar Labels de CHECKOUT e COMPRA
6. [ ] Criar conta UTMify e pegar token + pixel
7. [ ] Configurar domínio UTMify
8. [ ] Deploy

---

## 🎯 **Onde Pegar Cada Valor**

### **Google Ads ID:**
1. https://ads.google.com
2. Ferramentas > Medição > Conversões
3. Copiar: `AW-XXXXXXXXX`

### **Labels de Conversão:**
1. Google Ads > Conversões
2. Clicar na conversão desejada
3. Copiar o "Label"

### **UTMify Token:**
1. https://utmify.com
2. Dashboard > API Settings
3. Copiar Token

### **UTMify Pixel ID:**
1. https://utmify.com
2. Dashboard > Pixels
3. Copiar ID do pixel

---

## 🚀 **Deploy Rápido**

### **Netlify:**
```bash
# Dashboard > Site Settings > Environment variables
# Adicionar todas as variáveis do .env
```

### **VPS/SSH:**
```bash
cd /home/ploi/seusite.com
nano .env.production.local
# Colar variáveis
pm2 restart nome-do-site
```

---

## 🔍 **Testar Configuração**

### **Console do Navegador:**
```javascript
// Ver se Google Tag carregou
console.log(window.gtag)

// Ver variáveis
console.log(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID)
console.log(process.env.NEXT_PUBLIC_ENABLE_USER_VERIFICATION)
```

### **Google Tag Assistant:**
1. Instalar extensão "Tag Assistant"
2. Acessar site
3. Verificar se tags estão disparando

---

## 📊 **Tabela de Sites**

| Site | Tipo | Google Ads ID | UTMify Token | Pixel ID |
|------|------|---------------|--------------|----------|
| recargasjogo.blog | LEAD | AW-111111 | token_site1 | pixel1 |
| gameggpro.shop | VENDA | AW-222222 | token_site2 | pixel2 |
| site3.com | LEAD | AW-333333 | token_site3 | pixel3 |

---

## ⚠️ **Erros Comuns**

### **Google Tag não dispara:**
```bash
# Verificar se está habilitado
NEXT_PUBLIC_GOOGLE_ADS_ENABLED=true
```

### **Conversão não dispara:**
```bash
# Verificar label correto
NEXT_PUBLIC_GTAG_CONVERSION_LEAD=LabelCorreto
```

### **UTMify não recebe:**
```bash
# Verificar token e pixel
UTMIFY_API_TOKEN=token_valido
NEXT_PUBLIC_PIXELID_UTMFY=pixel_valido
```

---

## 📞 **Suporte**

- Google Ads: https://support.google.com/google-ads
- UTMify: https://utmify.com/support
- Documentação completa: `ENV_CAMPAIGN_SETUP.md`
