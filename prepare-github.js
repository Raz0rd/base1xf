const fs = require('fs');
const path = require('path');

// Diretório de destino para o GitHub
const githubDir = 'e:\\2025_ARTHUR\\recargas-jogo-github';

// Arquivos e diretórios essenciais para o projeto
const essentialFiles = [
  // Configurações do projeto
  'package.json',
  'next.config.mjs',
  'tailwind.config.js',
  'postcss.config.js',
  'postcss.config.mjs',
  'tsconfig.json',
  'components.json',
  'middleware.ts',
  
  // Configurações de deploy
  'netlify.toml',
  'vercel.json',
  
  // Documentação
  'README.md',
  'DEPLOY.md',
  'ARQUITETURA_SIMPLIFICADA.md',
  'SISTEMA_ANALYTICS_COMPLETO.md',
  'SISTEMA-TRACKING-FINAL.md',
  'CORRECOES_IMPLEMENTADAS.md',
  
  // Scripts úteis
  'toggle-antibot-status.js',
  'setup-new-domain.js',
  'fix-function-simple.sql',
  
  // Exemplo de configuração
  'env.example'
];

// Diretórios essenciais
const essentialDirs = [
  'app',
  'components',
  'hooks',
  'lib',
  'styles',
  'public',
  'data'
];

// Arquivos a serem ignorados (mesmo dentro dos diretórios essenciais)
const ignorePatterns = [
  'node_modules',
  '.next',
  '.git',
  'logs',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  'tsconfig.zip'
];

function shouldIgnore(filePath) {
  return ignorePatterns.some(pattern => filePath.includes(pattern));
}

function copyFileSync(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  
  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (shouldIgnore(srcPath)) {
      console.log(`⏭️  Ignorando: ${srcPath}`);
      continue;
    }
    
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      console.log(`📄 Copiado: ${srcPath} → ${destPath}`);
    }
  }
}

function prepareGithubRepo() {
  console.log('🚀 Preparando repositório para GitHub...\n');
  
  // Criar diretório de destino
  if (fs.existsSync(githubDir)) {
    console.log('🗑️  Removendo diretório existente...');
    fs.rmSync(githubDir, { recursive: true, force: true });
  }
  
  fs.mkdirSync(githubDir, { recursive: true });
  console.log(`📁 Criado diretório: ${githubDir}\n`);
  
  const sourceDir = 'e:\\2025_ARTHUR\\recargas-jogo-clone';
  
  // Copiar arquivos essenciais
  console.log('📄 Copiando arquivos essenciais...');
  for (const file of essentialFiles) {
    const srcPath = path.join(sourceDir, file);
    const destPath = path.join(githubDir, file);
    
    if (fs.existsSync(srcPath)) {
      copyFileSync(srcPath, destPath);
      console.log(`✅ ${file}`);
    } else {
      console.log(`⚠️  Não encontrado: ${file}`);
    }
  }
  
  console.log('\n📁 Copiando diretórios essenciais...');
  // Copiar diretórios essenciais
  for (const dir of essentialDirs) {
    const srcPath = path.join(sourceDir, dir);
    const destPath = path.join(githubDir, dir);
    
    if (fs.existsSync(srcPath)) {
      console.log(`\n📂 Copiando diretório: ${dir}`);
      copyDirRecursive(srcPath, destPath);
    } else {
      console.log(`⚠️  Diretório não encontrado: ${dir}`);
    }
  }
  
  // Criar .gitignore
  const gitignoreContent = `# Dependencies
node_modules/
.pnpm-debug.log*

# Next.js
.next/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Temporary folders
tmp/
temp/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;

  fs.writeFileSync(path.join(githubDir, '.gitignore'), gitignoreContent);
  console.log('\n✅ Criado .gitignore');
  
  // Criar README para GitHub
  const readmeContent = `# Sistema Anti-Bot com Fingerprint Pro

Sistema avançado de detecção e bloqueio de bots usando Fingerprint Pro, com painel administrativo completo.

## 🚀 Características

- **Anti-Bot Avançado**: Detecção de bots, VPNs, proxies e emuladores
- **Fingerprint Pro**: Identificação única de usuários
- **Painel Admin**: Controle completo em tempo real
- **Analytics**: Métricas detalhadas de tráfego
- **Whitelist/Blacklist**: Controle de IPs
- **Mobile First**: Otimizado para dispositivos móveis

## 📦 Instalação

\`\`\`bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Edite o arquivo .env com suas configurações

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
\`\`\`

## 🔧 Configuração

1. Configure as variáveis no arquivo \`.env\`
2. Configure o Supabase (banco de dados)
3. Configure o Fingerprint Pro
4. Execute o script SQL \`fix-function-simple.sql\` no Supabase

## 🚀 Deploy

### Netlify
\`\`\`bash
npm run build
netlify deploy --prod
\`\`\`

### Vercel
\`\`\`bash
vercel --prod
\`\`\`

## 📊 Painel Admin

Acesse \`/secrzadmin\` para o painel administrativo completo.

## 🛠️ Scripts Úteis

- \`toggle-antibot-status.js\` - Liga/desliga o antibot
- \`setup-new-domain.js\` - Configura novo domínio

## 📄 Documentação

Veja os arquivos de documentação para mais detalhes:
- \`ARQUITETURA_SIMPLIFICADA.md\`
- \`SISTEMA_ANALYTICS_COMPLETO.md\`
- \`DEPLOY.md\`
`;

  fs.writeFileSync(path.join(githubDir, 'README.md'), readmeContent);
  console.log('✅ Criado README.md para GitHub');
  
  console.log('\n🎉 Repositório preparado com sucesso!');
  console.log(`📁 Localização: ${githubDir}`);
  console.log('\n📋 Próximos passos:');
  console.log('1. cd ' + githubDir);
  console.log('2. git init');
  console.log('3. git add .');
  console.log('4. git commit -m "Initial commit"');
  console.log('5. git remote add origin <URL_DO_SEU_REPO>');
  console.log('6. git push -u origin main');
}

// Executar
prepareGithubRepo();
