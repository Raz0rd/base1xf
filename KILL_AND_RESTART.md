# 🔥 Matar Node.js e Limpar Cache

## **1️⃣ Matar todos os processos Node.js**

```powershell
# Matar todos os node.exe
taskkill /F /IM node.exe

# Verificar se matou
tasklist | findstr node
```

---

## **2️⃣ Limpar cache do Next.js**

```powershell
# Deletar pasta .next
Remove-Item -Recurse -Force .next

# Deletar node_modules
Remove-Item -Recurse -Force node_modules

# Limpar cache do npm
npm cache clean --force
```

---

## **3️⃣ Reinstalar e rodar**

```powershell
# Instalar novamente
npm install

# Rodar dev
npm run dev
```

---

## **🚀 COMANDO COMPLETO (copie tudo):**

```powershell
# Matar Node
taskkill /F /IM node.exe

# Limpar tudo
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm cache clean --force

# Reinstalar
npm install

# Rodar
npm run dev
```

---

## **⚠️ DEPOIS de rodar, antes de testar:**

No navegador (F12 → Console):
```javascript
localStorage.clear()
location.reload()
```
