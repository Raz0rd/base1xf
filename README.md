# 🎮 Centro de Recarga Oficial

**Site oficial para recarga de jogos mobile com sistema de verificação integrado.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.3-38B2AC)](https://tailwindcss.com/)

## 🚀 **Jogos Suportados**

- **🔥 Free Fire** - Diamantes e recargas
- **⚔️ Delta Force** - Créditos e itens premium  
- **🏐 Haikyu** - Moedas e personalizações

## ✨ **Principais Funcionalidades**

- 🛡️ **Sistema de verificação opcional** (anti-bot)
- 💎 **Recargas seguras** com gateways certificados
- 📱 **Design responsivo** otimizado para mobile
- ⚡ **Carregamento rápido** com otimizações SSR
- 🎨 **Interface moderna** com animações suaves
- 📊 **SEO otimizado** para motores de busca
- 🔐 **Termos de uso** integrados ao sistema

## 🛠️ **Tecnologias Utilizadas**

### **Frontend:**
- **Next.js 14** - Framework React com SSR
- **TypeScript** - Tipagem estática 
- **Tailwind CSS** - Estilização utility-first
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones modernos

### **Funcionalidades:**
- **PWA** - Instalável como app
- **Analytics** - Google Analytics integrado
- **SEO** - Meta tags otimizadas
- **Responsive** - Mobile-first design

## 🔧 **Instalação e Configuração**

### **1. Clonar repositório:**
```bash
git clone https://github.com/Raz0rd/base1xf.git
cd base1xf
```

### **2. Instalar dependências:**
```bash
npm install
```

### **3. Configurar variáveis de ambiente:**
```bash
# Copiar template
cp .env.template .env

# Editar configurações
nano .env
```

**Configuração mínima:**
```bash
NEXT_PUBLIC_APP_URL=https://seudominio.com
NODE_ENV=development
NEXT_PUBLIC_ENABLE_USER_VERIFICATION=false
```

### **4. Executar em desenvolvimento:**
```bash
npm run dev
```

### **5. Build para produção:**
```bash
npm run build
npm start
```

## 🛡️ **Sistema de Verificação**

### **Configuração:**
```bash
# Desabilitado (padrão)
NEXT_PUBLIC_ENABLE_USER_VERIFICATION=false

# Habilitado - Tela de verificação obrigatória  
NEXT_PUBLIC_ENABLE_USER_VERIFICATION=true
```

### **Fluxo quando habilitado:**
1. **Tela inicial** - Apresentação do sistema
2. **Termos de uso** - Aceite obrigatório
3. **Verificação** - Validação do ID do jogador
4. **Acesso liberado** - Entrada no site principal

Veja documentação completa em: [VERIFICATION_SYSTEM.md](./VERIFICATION_SYSTEM.md)

## 📊 **SEO e Keywords** 

O site está otimizado para as principais palavras-chave:

- `recarga free fire`, `diamantes free fire`
- `recarga delta force`, `creditos delta force`  
- `recarga haikyu`, `moedas haikyu`
- `site de recarga de jogos`, `recarga jogo`
- `centro de recarga oficial`

## 🚀 **Deploy em Produção**

### **VPS Linux (Recomendado):**
Veja o guia completo: [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)

### **Resumo rápido:**
```bash
# No servidor
git clone https://github.com/Raz0rd/base1xf.git
cd base1xf
npm install
cp .env.template .env
# Configurar .env com dados reais
npm run build
pm2 start ecosystem.config.js
```

### **Plataformas suportadas:**
- ✅ **VPS Linux** (Ubuntu/CentOS)
- ✅ **Vercel** (Deploy automático)
- ✅ **Netlify** (JAMstack)
- ✅ **DigitalOcean App Platform**

## 📁 **Estrutura do Projeto**

```
base1xf/
├── app/                 # App Router (Next.js 14)
│ ├── layout.tsx        # Layout principal + SEO
│ ├── page.tsx          # Página inicial
│ └── globals.css       # Estilos globais
├── components/         # Componentes React
│ ├── UserVerification.tsx
│ ├── VerificationWrapper.tsx
│ └── ...
├── hooks/             # Custom hooks
├── lib/               # Utilitários
├── public/            # Arquivos estáticos
├── .env.template      # Template de configuração
├── DEPLOY_GUIDE.md    # Guia de deploy
├── ENV_SETUP.md       # Configuração de ambiente
└── VERIFICATION_SYSTEM.md # Sistema de verificação
```

## 🔐 **Variáveis de Ambiente**

### **Essenciais:**
- `NEXT_PUBLIC_APP_URL` - URL do site
- `NEXT_PUBLIC_ENABLE_USER_VERIFICATION` - Sistema de verificação

### **Opcionais:**
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics
- `NEXT_PUBLIC_GOOGLE_ADS_ID` - Google Ads
- `NEXT_PUBLIC_FB_PIXEL_ID` - Facebook Pixel

Veja configuração completa: [ENV_SETUP.md](./ENV_SETUP.md)

## 📈 **Performance**

- ⚡ **Core Web Vitals** otimizados
- 🖼️ **Imagens otimizadas** com Next.js Image
- 📦 **Bundle splitting** automático
- 🗜️ **Compressão Gzip** configurada
- 📱 **Mobile-first** approach

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob licença proprietária. Todos os direitos reservados.

## 🆘 **Suporte**

- 📧 **Email:** suporte@seudominio.com
- 💬 **Chat:** Disponível no site
- 📚 **Docs:** Veja arquivos `.md` na raiz do projeto

---

**✅ Site funcionando em produção em:** https://seudominio.com
