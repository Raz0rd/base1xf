# 🎯 Configuração ENV por Tipo de Campanha

## 📋 **Estrutura de Variáveis**

### **🔴 CAMPANHA TIPO: LEAD**

```bash
# ============================================
# 🎯 TIPO DE CAMPANHA
# ============================================
CAMPAIGN_TYPE=LEAD

# ============================================
# 🔐 MODAL DE VERIFICAÇÃO (LEAD)
# ============================================
NEXT_PUBLIC_ENABLE_USER_VERIFICATION=true

# ============================================
# 📊 GOOGLE ADS - CONVERSÃO DE LEAD
# ============================================
NEXT_PUBLIC_GOOGLE_ADS_ENABLED=true
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-1234567890

# Label de conversão LEAD (disparado após validação no modal)
NEXT_PUBLIC_GTAG_CONVERSION_LEAD=AbCdEf123456

# ============================================
# 🔗 UTMIFY - TRACKING
# ============================================
UTMIFY_API_TOKEN=sua_chave_utmify_aqui
UTMIFY_ENABLED=true
UTMIFY_TEST_MODE=false
UTMIFY_WHITEPAGE_URL=https://seudominio.com
NEXT_PUBLIC_UTMIFY_WHITEPAGE_URL=https://seudominio.com
NEXT_PUBLIC_PIXELID_UTMFY=seu_pixel_id_utmify

# ============================================
# 💳 GATEWAY DE PAGAMENTO (SEMPRE O MESMO)
# ============================================
PAYMENT_GATEWAY=umbrela
UMBRELA_API_KEY=84f2022f-a84b-4d63-a727-1780e6261fe8
BLACKCAT_API_AUTH=Basic cGtfMERsc0F6eHhO...
GHOSTPAY_API_KEY=sk_live_CRH95TPfBYFG81eT...
```

### **Fluxo LEAD:**
1. ✅ Usuário acessa landing page
2. ✅ **Modal de verificação aparece** (NEXT_PUBLIC_ENABLE_USER_VERIFICATION=true)
3. ✅ Usuário preenche dados no modal
4. ✅ **Tela de loading** (validação + **disparo conversão LEAD**)
5. ✅ **UTMify: envio async "pending"**
6. ✅ Redireciona para página de recarga
7. ✅ Usuário escolhe pacote e gera PIX
8. ✅ Pagamento aprovado
9. ✅ **UTMify: envio async "paid"**

---

### **🟢 CAMPANHA TIPO: VENDA**

```bash
# ============================================
# 🎯 TIPO DE CAMPANHA
# ============================================
CAMPAIGN_TYPE=VENDA

# ============================================
# 🔐 MODAL DE VERIFICAÇÃO (VENDA)
# ============================================
NEXT_PUBLIC_ENABLE_USER_VERIFICATION=false

# ============================================
# 📊 GOOGLE ADS - CONVERSÃO DE COMPRA
# ============================================
NEXT_PUBLIC_GOOGLE_ADS_ENABLED=true
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-9876543210

# Labels de conversão VENDA
NEXT_PUBLIC_GTAG_CONVERSION_INITCHECKOUT=XyZ789AbCdEf
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA=MnOpQr456789

# ============================================
# 🔗 UTMIFY - TRACKING
# ============================================
UTMIFY_API_TOKEN=sua_chave_utmify_diferente_aqui
UTMIFY_ENABLED=true
UTMIFY_TEST_MODE=false
UTMIFY_WHITEPAGE_URL=https://outrodominio.com
NEXT_PUBLIC_UTMIFY_WHITEPAGE_URL=https://outrodominio.com
NEXT_PUBLIC_PIXELID_UTMFY=outro_pixel_id_utmify

# ============================================
# 💳 GATEWAY DE PAGAMENTO (SEMPRE O MESMO)
# ============================================
PAYMENT_GATEWAY=umbrela
UMBRELA_API_KEY=84f2022f-a84b-4d63-a727-1780e6261fe8
BLACKCAT_API_AUTH=Basic cGtfMERsc0F6eHhO...
GHOSTPAY_API_KEY=sk_live_CRH95TPfBYFG81eT...
```

### **Fluxo VENDA:**
1. ✅ Usuário acessa landing page
2. ✅ **Acesso direto** à página de recarga (sem modal)
3. ✅ Usuário escolhe pacote
4. ✅ **Disparo conversão "Iniciar Checkout"** (GTAG_CONVERSION_INITCHECKOUT)
5. ✅ Gera PIX
6. ✅ **UTMify: envio async "pending"**
7. ✅ Pagamento aprovado
8. ✅ **Disparo conversão "Compra"** (GTAG_CONVERSION_COMPRA)
9. ✅ **UTMify: envio async "paid"**

---

## 🎯 **Configuração por Site**

### **Site 1: recargasjogo.blog (LEAD)**
```bash
CAMPAIGN_TYPE=LEAD
NEXT_PUBLIC_ENABLE_USER_VERIFICATION=true
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-1111111111
NEXT_PUBLIC_GTAG_CONVERSION_LEAD=LeadLabel123
UTMIFY_API_TOKEN=token_site1
NEXT_PUBLIC_PIXELID_UTMFY=pixel_site1
UTMIFY_WHITEPAGE_URL=https://recargasjogo.blog
```

### **Site 2: gameggpro.shop (VENDA)**
```bash
CAMPAIGN_TYPE=VENDA
NEXT_PUBLIC_ENABLE_USER_VERIFICATION=false
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-2222222222
NEXT_PUBLIC_GTAG_CONVERSION_INITCHECKOUT=CheckoutLabel456
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA=CompraLabel789
UTMIFY_API_TOKEN=token_site2
NEXT_PUBLIC_PIXELID_UTMFY=pixel_site2
UTMIFY_WHITEPAGE_URL=https://gameggpro.shop
```

### **Site 3: outrosite.com (LEAD)**
```bash
CAMPAIGN_TYPE=LEAD
NEXT_PUBLIC_ENABLE_USER_VERIFICATION=true
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-3333333333
NEXT_PUBLIC_GTAG_CONVERSION_LEAD=LeadLabel999
UTMIFY_API_TOKEN=token_site3
NEXT_PUBLIC_PIXELID_UTMFY=pixel_site3
UTMIFY_WHITEPAGE_URL=https://outrosite.com
```

---

## 📊 **Onde a Google Tag é Injetada (Client-Side)**

### **1. HeadManager.tsx** ✅
```typescript
// Injeta Google Tag em TODAS as páginas
<Script id="gtag-base" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${googleAdsId}');
  `}
</Script>
```

### **2. Modal de Verificação (LEAD)** ✅
```typescript
// components/VerificationWrapper.tsx
// Após validação bem-sucedida:
trackLeadConversion() // Dispara GTAG_CONVERSION_LEAD
```

### **3. Página de Checkout (VENDA)** ✅
```typescript
// app/checkout/page.tsx
// Ao clicar em gerar PIX:
trackCheckoutInitiated(value) // Dispara GTAG_CONVERSION_INITCHECKOUT
```

### **4. Webhook de Pagamento (VENDA)** ✅
```typescript
// app/api/webhook/route.ts
// Quando status = "paid":
trackPurchase(value, transactionId) // Dispara GTAG_CONVERSION_COMPRA
```

---

## 🔗 **UTMify - Envios Async**

### **1. Envio "pending" (ao gerar PIX):**
```typescript
// app/checkout/page.tsx
async function sendUtmifyPending() {
  try {
    await fetch('/api/utmify-track', {
      method: 'POST',
      body: JSON.stringify({
        status: 'pending',
        transactionId,
        value,
        pixelId: process.env.NEXT_PUBLIC_PIXELID_UTMFY
      })
    })
  } catch (error) {
    console.error('Erro UTMify pending:', error)
    // Não bloqueia o fluxo
  }
}
```

### **2. Envio "paid" (webhook):**
```typescript
// app/api/webhook/route.ts
async function sendUtmifyPaid(transactionId: string) {
  try {
    await fetch('https://api.utmify.com/track', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UTMIFY_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pixelId: process.env.NEXT_PUBLIC_PIXELID_UTMFY,
        event: 'paid',
        transactionId
      })
    })
  } catch (error) {
    console.error('Erro UTMify paid:', error)
    // Não bloqueia o webhook
  }
}
```

---

## ✅ **Checklist de Implementação**

### **LEAD:**
- [ ] `CAMPAIGN_TYPE=LEAD`
- [ ] `NEXT_PUBLIC_ENABLE_USER_VERIFICATION=true`
- [ ] Google Tag no `HeadManager.tsx`
- [ ] Conversão LEAD no `VerificationWrapper.tsx` (após validação)
- [ ] UTMify async "pending" ao gerar PIX
- [ ] UTMify async "paid" no webhook

### **VENDA:**
- [ ] `CAMPAIGN_TYPE=VENDA`
- [ ] `NEXT_PUBLIC_ENABLE_USER_VERIFICATION=false`
- [ ] Google Tag no `HeadManager.tsx`
- [ ] Conversão "Iniciar Checkout" ao clicar em gerar PIX
- [ ] Conversão "Compra" no webhook (status=paid)
- [ ] UTMify async "pending" ao gerar PIX
- [ ] UTMify async "paid" no webhook

### **SEMPRE:**
- [ ] Tag do Google em todas as páginas (client-side)
- [ ] Conversões no momento correto
- [ ] UTMify com async (não bloqueia fluxo)
- [ ] API de pagamento sempre a mesma
- [ ] Logs de erro sem quebrar fluxo

---

## 🎯 **Variáveis que MUDAM por Site:**

```bash
# Por campanha:
CAMPAIGN_TYPE
NEXT_PUBLIC_ENABLE_USER_VERIFICATION
NEXT_PUBLIC_GOOGLE_ADS_ID
NEXT_PUBLIC_GTAG_CONVERSION_*

# Por projeto:
UTMIFY_API_TOKEN
NEXT_PUBLIC_PIXELID_UTMFY
UTMIFY_WHITEPAGE_URL
NEXT_PUBLIC_UTMIFY_WHITEPAGE_URL
```

## 🔒 **Variáveis que NÃO MUDAM:**

```bash
# API de Pagamento (sempre a mesma):
PAYMENT_GATEWAY=umbrela
UMBRELA_API_KEY=84f2022f-a84b-4d63-a727-1780e6261fe8
BLACKCAT_API_AUTH=...
GHOSTPAY_API_KEY=...
```

---

## 📦 **Deploy Checklist:**

1. ✅ Configure ENV específicas do site/campanha
2. ✅ Valide Google Tag carregando: `console.log(window.gtag)`
3. ✅ Teste conversão LEAD/VENDA no Google Ads
4. ✅ Verifique UTMify recebendo pending/paid
5. ✅ Monitore logs de erro (não podem quebrar fluxo)
6. ✅ Teste em ambiente de alta concorrência (async!)
