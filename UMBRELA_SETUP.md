# 🌂 CONFIGURAÇÃO DO GATEWAY UMBRELA

## ✅ Implementação Concluída!

O gateway Umbrela foi integrado ao projeto seguindo o mesmo padrão dos gateways existentes (BlackCat e GhostPay).

---

## 🔧 Como Ativar o Gateway Umbrela

### 1. Adicionar Variáveis de Ambiente no `.env`

Adicione as seguintes linhas no seu arquivo `.env`:

```bash
# Gateway de Pagamento
# Opções: 'blackcat', 'ghostpay', 'umbrela'
PAYMENT_GATEWAY=umbrela

# API Key do Umbrela
UMBRELA_API_KEY=84f2022f-a84b-4d63-a727-1780e6261fe8
```

### 2. Pronto! 🎉

Não precisa fazer mais nada. O sistema irá:
- ✅ Gerar PIX via Umbrela
- ✅ Verificar status de pagamento via Umbrela
- ✅ Receber webhooks do Umbrela
- ✅ Processar status `PAID` corretamente

---

## 📋 Arquivos Modificados

### 1. `/app/api/generate-pix/route.ts`
- ✅ Função `generatePixUmbrela()` adicionada
- ✅ Seleção de gateway atualizada
- ✅ Email fake gerado automaticamente
- ✅ Endereço padrão configurado (obrigatório)

### 2. `/app/api/check-transaction-status/route.ts`
- ✅ Função `checkStatusUmbrela()` adicionada
- ✅ Seleção de gateway atualizada
- ✅ Suporte para status `PAID` (maiúsculo)

### 3. `/app/api/webhook/route.ts`
- ✅ Suporte para status `PAID` e `WAITING_PAYMENT` (maiúsculo)

---

## 🔍 Diferenças do Umbrela

### Status em MAIÚSCULO
```javascript
// Outros gateways
status === 'paid'

// Umbrela
status === 'PAID'
```

### Endereço Obrigatório
O Umbrela exige endereço completo. Usamos um endereço padrão:
```javascript
{
  street: "Rua Digital",
  streetNumber: "123",
  zipCode: "01000000",
  neighborhood: "Centro",
  city: "São Paulo",
  state: "SP",
  country: "br"
}
```

### Headers Específicos
```javascript
headers: {
  "x-api-key": apiKey,           // Header diferente
  "User-Agent": "UMBRELLAB2B/1.0" // User-Agent obrigatório
}
```

---

## 🎯 Fluxo Completo

```
1. Cliente preenche dados no checkout
   ↓
2. Sistema verifica: PAYMENT_GATEWAY=umbrela
   ↓
3. generatePixUmbrela() é chamado
   ↓
4. POST https://api-gateway.umbrellapag.com/api/user/transactions
   ↓
5. Umbrela retorna QR Code
   ↓
6. Cliente paga
   ↓
7. checkStatusUmbrela() verifica status
   ↓
8. Status = PAID
   ↓
9. Processa recarga + Envia para UTMify/Adspect
```

---

## 🧪 Para Testar

### 1. Configurar .env
```bash
PAYMENT_GATEWAY=umbrela
UMBRELA_API_KEY=84f2022f-a84b-4d63-a727-1780e6261fe8
```

### 2. Fazer uma compra
- Preencher dados
- Gerar PIX
- Verificar logs no servidor

### 3. Verificar Logs
Você verá:
```
☂️ [Umbrela] Verificando autenticação: ✓ Token presente
📤 [Umbrela] REQUEST BODY: { ... }
📦 [Umbrela] PAYLOAD ENVIADO: { ... }
✅ [Umbrela] SUCCESS RESPONSE: { ... }
🎉 [Umbrela] RESPOSTA NORMALIZADA: { ... }
```

---

## ⚠️ Importante

### Email Fake
O email é gerado automaticamente baseado no nome:
```javascript
"João Silva" → joaosilva@gmail.com
```

### Status Aceitos
- ✅ `PAID` - Pagamento confirmado
- ⏳ `WAITING_PAYMENT` - Aguardando pagamento
- ❌ Outros - Não processados

### Webhook
O webhook está configurado em:
```
postbackUrl: "https://seusite.com/api/webhook"
```

---

## 🚀 Trocar Entre Gateways

É só mudar a variável no `.env`:

```bash
# BlackCat
PAYMENT_GATEWAY=blackcat

# GhostPay
PAYMENT_GATEWAY=ghostpay

# Umbrela
PAYMENT_GATEWAY=umbrela
```

**Reinicie o servidor após mudar!**

---

## 📞 Suporte Umbrela

- Documentação: https://docs.umbrellapag.com
- Email: suporte@umbrellapag.com
- API Base: https://api-gateway.umbrellapag.com/api

---

## ✅ Checklist de Implementação

- [x] Função de geração de PIX
- [x] Função de verificação de status
- [x] Suporte a webhook
- [x] Email fake automático
- [x] Endereço padrão configurado
- [x] Status PAID/WAITING_PAYMENT
- [x] Integração com UTMify
- [x] Integração com Adspect
- [x] Logs detalhados
- [x] Tratamento de erros

**Implementação 100% completa! 🎉**
