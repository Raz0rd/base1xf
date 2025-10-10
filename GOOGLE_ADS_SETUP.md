# 🎯 Google Ads Conversion Tracking - Configuração

## ✅ Implementação Completa!

O Google Ads Conversion Tracking foi totalmente integrado ao projeto, rastreando automaticamente:
1. **Iniciar Checkout** - Quando o QR Code PIX é gerado
2. **Compra** - Quando o pagamento é confirmado (status PAID)

---

## 🔧 Como Ativar

### **1. Adicionar Variáveis no `.env`**

```bash
# Google Ads Conversion Tracking
NEXT_PUBLIC_GOOGLE_ADS_ENABLED=true
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-17554136774

# IDs de Conversão (Labels)
NEXT_PUBLIC_GTAG_CONVERSION_INITCHECKOUT=8pfZCPegsKobEMa9u7JB
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA=S9KKCL7Qo6obEMa9u7JB
```

### **2. Reiniciar o Servidor**

```bash
npm run dev
# ou
yarn dev
```

### **3. Pronto! 🎉**

O tracking já está funcionando automaticamente.

---

## 🔑 Como Obter os Labels de Conversão

### **No Google Ads:**

1. Acesse **Google Ads** → **Ferramentas** → **Conversões**
2. Clique na conversão que deseja rastrear
3. Clique em **Tag**
4. Procure por **"event snippet"**
5. Você verá algo como:
```javascript
gtag('event', 'conversion', {
    'send_to': 'AW-17554136774/8pfZCPegsKobEMa9u7JB'
});
```

6. O label é a parte depois da `/`:
   - `AW-17554136774` = ID da conta (GOOGLE_ADS_ID)
   - `8pfZCPegsKobEMa9u7JB` = Label de conversão (GTAG_CONVERSION_...)

### **Exemplo Prático:**

```
send_to: 'AW-17554136774/8pfZCPegsKobEMa9u7JB'
          └─────┬─────┘  └──────────┬──────────┘
           Ads ID         Conversion Label
```

Configure no `.env`:
```bash
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-17554136774
NEXT_PUBLIC_GTAG_CONVERSION_INITCHECKOUT=8pfZCPegsKobEMa9u7JB
```

---

## 📊 Conversões Rastreadas

### **1️⃣ Iniciar Finalização de Compra**
**Quando dispara:** QR Code PIX é gerado  
**Conversion ID:** `AW-17554136774/8pfZCPegsKobEMa9u7JB`  
**Parâmetros enviados:**
```javascript
{
  send_to: 'AW-17554136774/8pfZCPegsKobEMa9u7JB'
}
```

### **2️⃣ Compra (Purchase)**
**Quando dispara:** Pagamento confirmado (status PAID)  
**Conversion ID:** `AW-17554136774/S9KKCL7Qo6obEMa9u7JB`  
**Parâmetros enviados:**
```javascript
{
  send_to: 'AW-17554136774/S9KKCL7Qo6obEMa9u7JB',
  value: 14.24,              // Valor da compra em reais
  currency: 'BRL',
  transaction_id: 'uuid-123' // ID único da transação
}
```

---

## 🏗️ Arquitetura

### **1. HeadManager.tsx**
Injeta os scripts do Google Tag Manager em todas as páginas:

```html
<!-- Script carregado automaticamente -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17554136774"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-17554136774');
</script>
```

### **2. lib/google-ads.ts**
Helper functions para disparar conversões:

- ✅ `trackCheckoutInitiated()` - QR Code gerado
- ✅ `trackPurchase(transactionId, value)` - Pagamento confirmado
- ✅ `trackCustomConversion(label, params)` - Conversões customizadas

### **3. app/checkout/page.tsx**
Dispara as conversões nos momentos certos:

```typescript
// Quando QR Code é gerado
trackCheckoutInitiated()

// Quando pagamento é confirmado
trackPurchase(transactionId, totalValue)
```

---

## 🔍 Verificação

### **1. Verificar se Scripts Foram Carregados**

Abra o Console do Browser (F12) e procure por:
```
[Google Ads] 🎯 Disparando conversão: Iniciar Checkout
[Google Ads] ✅ Conversão "Iniciar Checkout" enviada com sucesso
```

### **2. Verificar no Google Tag Assistant**

1. Instale a extensão **Google Tag Assistant**
2. Acesse sua página
3. Veja os eventos sendo disparados em tempo real

### **3. Verificar no Google Ads**

1. Acesse Google Ads → Ferramentas → Conversões
2. Clique na conversão
3. Veja as conversões recentes (pode demorar até 24h)

---

## 🎯 Fluxo Completo

```
1. Usuário acessa o checkout
   ↓
2. HeadManager injeta gtag.js (Google Tag)
   ↓
3. Usuário preenche dados e clica em "Finalizar Compra"
   ↓
4. QR Code PIX é gerado
   ↓
5. 🎯 CONVERSÃO 1: trackCheckoutInitiated()
   ↓
6. Usuário paga o PIX
   ↓
7. Sistema detecta pagamento (status PAID)
   ↓
8. 🎯 CONVERSÃO 2: trackPurchase(id, valor)
   ↓
9. Google Ads recebe as conversões
```

---

## 🛠️ Customização

### **Adicionar Nova Conversão**

1. Crie um novo label no Google Ads
2. Use a função `trackCustomConversion()`:

```typescript
import { trackCustomConversion } from '@/lib/google-ads'

// Exemplo: rastrear quando usuário visualiza produto
trackCustomConversion('SEU_LABEL_AQUI', {
  value: 10.50,
  currency: 'BRL'
})
```

### **Desabilitar Temporariamente**

```bash
# No .env
NEXT_PUBLIC_GOOGLE_ADS_ENABLED=false
```

---

## 📋 Variáveis de Ambiente

| Variável | Obrigatória | Valor Padrão | Descrição |
|----------|-------------|--------------|-----------|
| `NEXT_PUBLIC_GOOGLE_ADS_ENABLED` | Sim | - | Ativar/desativar tracking |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Não | `AW-17554136774` | ID da conta Google Ads |
| `NEXT_PUBLIC_GTAG_CONVERSION_INITCHECKOUT` | Não | `8pfZCPegsKobEMa9u7JB` | Label de conversão: Iniciar Checkout |
| `NEXT_PUBLIC_GTAG_CONVERSION_COMPRA` | Não | `S9KKCL7Qo6obEMa9u7JB` | Label de conversão: Compra |

---

## ⚠️ Pontos Importantes

### **1. Scripts Injetados Dinamicamente**
Os scripts são injetados **diretamente no DOM** (não via Next.js Head), garantindo execução correta.

### **2. Logs Detalhados**
Todos os eventos geram logs no console para facilitar debug:
```
[Google Ads] 🎯 Disparando conversão: Compra
[Google Ads] Conversion ID: AW-17554136774/S9KKCL7Qo6obEMa9u7JB
[Google Ads] Transaction ID: abc123
[Google Ads] Valor: R$ 14.24
[Google Ads] ✅ Conversão "Compra" enviada com sucesso
```

### **3. Verificação de Disponibilidade**
O código verifica se `gtag()` está disponível antes de disparar conversões.

### **4. Valor em Reais**
O valor é enviado em **reais** (ex: 14.24), não centavos.

### **5. Transaction ID Único**
Cada compra tem um `transaction_id` único para evitar duplicatas.

---

## 🧪 Teste Local

### **1. Configurar .env.local**
```bash
NEXT_PUBLIC_GOOGLE_ADS_ENABLED=true
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-17554136774
NEXT_PUBLIC_GTAG_CONVERSION_INITCHECKOUT=8pfZCPegsKobEMa9u7JB
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA=S9KKCL7Qo6obEMa9u7JB
```

### **2. Fazer uma Compra de Teste**
1. Gerar QR Code → Ver log "Iniciar Checkout"
2. Simular pagamento → Ver log "Compra"

### **3. Verificar Console**
Você verá logs detalhados de cada conversão.

---

## 🚀 Deploy

### **Produção**
Adicione as variáveis no painel da Vercel/Netlify:
```
NEXT_PUBLIC_GOOGLE_ADS_ENABLED=true
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-17554136774
NEXT_PUBLIC_GTAG_CONVERSION_INITCHECKOUT=8pfZCPegsKobEMa9u7JB
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA=S9KKCL7Qo6obEMa9u7JB
```

### **Staging**
Pode usar o mesmo ID ou criar um ID de teste.

---

## 📞 Suporte

**Documentação Google Ads:**  
https://support.google.com/google-ads/answer/1722054

**Tag Manager:**  
https://tagmanager.google.com/

---

## ✅ Checklist de Implementação

- [x] Script base gtag.js injetado no HeadManager
- [x] Helper functions criadas (lib/google-ads.ts)
- [x] Conversão "Iniciar Checkout" implementada
- [x] Conversão "Compra" implementada
- [x] Logs detalhados no console
- [x] Verificação de disponibilidade do gtag
- [x] Valor e transaction_id corretos
- [x] Variáveis de ambiente configuradas
- [x] Documentação completa

**Implementação 100% concluída! 🎉**

---

## 📝 Exemplo de Logs Esperados

```
[Google Ads] 🎯 Disparando conversão: Iniciar Checkout
[Google Ads] Conversion ID: AW-17554136774/8pfZCPegsKobEMa9u7JB
[Google Ads] ✅ Conversão "Iniciar Checkout" enviada com sucesso

... (usuário paga)

[Google Ads] 🎯 Disparando conversão: Compra
[Google Ads] Conversion ID: AW-17554136774/S9KKCL7Qo6obEMa9u7JB
[Google Ads] Transaction ID: 550e8400-e29b-41d4-a716-446655440000
[Google Ads] Valor: R$ 14.24
[Google Ads] ✅ Conversão "Compra" enviada com sucesso
```
