# 🚀 Setup para Desenvolvimento/Teste

## **📋 Passo a Passo:**

### **1️⃣ Copiar arquivo de ambiente**

```bash
# No terminal (PowerShell):
Copy-Item .env.development .env.local
```

Ou manualmente:
- Copie o arquivo `.env.development`
- Renomeie a cópia para `.env.local`

---

### **2️⃣ Instalar dependências (se ainda não instalou)**

```bash
npm install
```

---

### **3️⃣ Rodar em modo dev**

```bash
npm run dev
```

---

### **4️⃣ Acessar no navegador**

```
http://localhost:3000
```

---

### **5️⃣ Testar o Modal de Login**

#### **IMPORTANTE: Limpar localStorage ANTES de testar**

Abra o DevTools (F12) → Console e execute:

```javascript
// 1. Limpar tudo
localStorage.clear()

// 2. Verificar se limpou
console.log('Authenticated:', localStorage.getItem('user_authenticated'))
// Deve retornar: null

// 3. Recarregar página
location.reload()
```

#### **Você deve ver (GARANTIDO):**
- ✅ Fundo escuro PRETO com blur
- ✅ Modal centralizado BRANCO
- ✅ Header roxo/rosa gradient (purple → pink)
- ✅ Ícone de escudo (Shield)
- ✅ Título: "Acesso Seguro"
- ✅ 3 Campos: Nome, Email, Telefone
- ✅ Botão roxo: "Continuar"

#### **Se NÃO aparecer:**
Execute no console:
```javascript
// Verificar se o componente está sendo renderizado
document.querySelector('[style*="99999"]')
// Deve retornar: <div> (o modal)

// Se retornar null, há um problema
```

---

## **🔧 Variáveis de Ambiente (.env.local)**

### **Obrigatórias:**
```bash
PAYMENT_GATEWAY=umbrela
UMBRELA_API_KEY=84f2022f-a84b-4d63-a727-1780e6261fe8
```

### **Opcionais (já configuradas como false em dev):**
```bash
UTMIFY_ENABLED=false
NEXT_PUBLIC_GOOGLE_ADS_ENABLED=false
NEXT_PUBLIC_RATOEIRA_ENABLED=false
NEXT_PUBLIC_ADSPECT_ENABLED=false
```

---

## **✅ Checklist de Teste:**

- [ ] `.env.local` criado
- [ ] `npm install` executado
- [ ] `npm run dev` rodando
- [ ] `localhost:3000` acessível
- [ ] Modal de login aparece
- [ ] Consegue preencher formulário
- [ ] Consegue ver tela de termos
- [ ] Consegue aceitar termos
- [ ] Site desbloqueia após login

---

## **🐛 Problemas Comuns:**

### **Modal não aparece:**
```javascript
// Console (F12):
localStorage.clear()
location.reload()
```

### **Erro de módulo não encontrado:**
```bash
npm install
```

### **Porta 3000 ocupada:**
```bash
# Usar outra porta:
npm run dev -- -p 3001
```

---

## **📝 Logs Esperados no Console:**

```
[Auth] Verificando autenticação: { authenticated: false, termsAccepted: false, hasUserData: false }
[Auth] ❌ Usuário NÃO autenticado - Modal deve aparecer
[HomePage] Estado Auth: { isAuthenticated: false, authLoading: false, modalShouldShow: true }
[LoginModal] isOpen: true
[LoginModal] Renderizando modal!
```

---

## **🎯 Próximos Passos Após Testar:**

1. ✅ Confirmar que modal funciona
2. ✅ Ajustar textos/design se necessário
3. ✅ Remover logs de debug (console.log)
4. ✅ Fazer deploy para produção

---

**Boa sorte nos testes! 🚀**
