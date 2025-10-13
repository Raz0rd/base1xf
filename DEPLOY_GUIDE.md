# 🚀 Guia Completo de Deploy - Linux VPS via SSH

## 📋 **Pré-requisitos**

- Servidor Linux (Ubuntu 20.04+ recomendado)
- Node.js 18+ instalado
- PM2 para gerenciamento de processos
- Nginx como reverse proxy
- Domínio apontando para o servidor

---

## 🔧 **1. Preparação do Servidor**

### **Conectar via SSH:**
```bash
ssh root@SEU_IP_SERVIDOR
# ou
ssh usuario@SEU_IP_SERVIDOR
```

### **Atualizar o sistema:**
```bash
sudo apt update && sudo apt upgrade -y
```

### **Instalar dependências básicas:**
```bash
# Instalar curl e git
sudo apt install -y curl git nginx

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar versões
node --version  # Deve ser 18+
npm --version
```

### **Instalar PM2:**
```bash
sudo npm install -g pm2
```

---

## 📂 **2. Clone e Configuração do Projeto**

### **Clonar o repositório:**
```bash
cd /var/www/
sudo git clone https://github.com/Raz0rd/base1xf.git
sudo chown -R $USER:$USER /var/www/base1xf
cd base1xf
```

### **Instalar dependências:**
```bash
npm install
```

### **Configurar variáveis de ambiente:**
```bash
# Copiar o arquivo de exemplo
cp ENV_SETUP.md .env

# Editar com suas configurações
nano .env
```

**Configuração mínima no `.env`:**
```bash
NEXT_PUBLIC_APP_URL=https://seudominio.com
NODE_ENV=production
```

### **Build da aplicação:**
```bash
npm run build
```

---

## 🔄 **3. Configuração do PM2**

### **Criar arquivo de configuração PM2:**
```bash
nano ecosystem.config.js
```

**Conteúdo do arquivo:**
```javascript
module.exports = {
  apps: [{
    name: 'freefire-recharge',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/base1xf',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### **Iniciar aplicação com PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🌐 **4. Configuração do Nginx**

### **Criar configuração do site:**
```bash
sudo nano /etc/nginx/sites-available/freefire-recharge
```

**Configuração do Nginx:**
```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout       60s;
        proxy_send_timeout          60s;
        proxy_read_timeout          60s;
    }

    # Servir arquivos estáticos
    location /_next/static/ {
        alias /var/www/base1xf/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Servir arquivos públicos
    location /images/ {
        alias /var/www/base1xf/public/images/;
        expires 30d;
        add_header Cache-Control "public";
    }

    location /icons/ {
        alias /var/www/base1xf/public/icons/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate no_last_modified no_etag auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
```

### **Ativar site:**
```bash
# Ativar configuração
sudo ln -s /etc/nginx/sites-available/freefire-recharge /etc/nginx/sites-enabled/

# Remover site padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar nginx
sudo systemctl restart nginx
```

---

## 🔒 **5. SSL com Certbot (HTTPS)**

### **Instalar Certbot:**
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### **Gerar certificado SSL:**
```bash
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

### **Auto-renovação (opcional):**
```bash
# Testar renovação
sudo certbot renew --dry-run

# Configurar cron para renovação automática
sudo crontab -e
# Adicionar linha:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔥 **6. Firewall e Segurança**

### **Configurar UFW:**
```bash
# Ativar firewall
sudo ufw enable

# Permitir SSH, HTTP e HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Verificar status
sudo ufw status
```

---

## 📊 **7. Monitoramento**

### **Comandos úteis PM2:**
```bash
# Ver status das aplicações
pm2 status

# Ver logs
pm2 logs freefire-recharge

# Reiniciar aplicação
pm2 restart freefire-recharge

# Parar aplicação
pm2 stop freefire-recharge

# Remover aplicação
pm2 delete freefire-recharge
```

### **Comandos úteis Nginx:**
```bash
# Verificar status
sudo systemctl status nginx

# Reiniciar nginx
sudo systemctl restart nginx

# Ver logs de erro
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 **8. Script de Deploy Automático**

### **Criar script de deploy:**
```bash
nano deploy.sh
```

**Conteúdo do script:**
```bash
#!/bin/bash

echo "🚀 Iniciando deploy..."

# Backup da versão atual
sudo cp -r /var/www/base1xf /var/www/base1xf_backup_$(date +%Y%m%d_%H%M%S)

# Atualizar código
cd /var/www/base1xf
sudo git pull origin main

# Instalar dependências
npm install

# Build da aplicação
npm run build

# Reiniciar PM2
pm2 restart freefire-recharge

# Reiniciar Nginx
sudo systemctl reload nginx

echo "✅ Deploy concluído!"
echo "🌐 Site disponível em: https://seudominio.com"
```

### **Tornar executável:**
```bash
chmod +x deploy.sh
```

### **Executar deploy:**
```bash
./deploy.sh
```

---

## 🚨 **9. Troubleshooting**

### **Verificar se a aplicação está rodando:**
```bash
# Testar porta local
curl http://localhost:3000

# Ver processos Node.js
ps aux | grep node
```

### **Problemas comuns:**

1. **Erro de porta em uso:**
```bash
sudo netstat -tulpn | grep :3000
sudo kill -9 PID_DO_PROCESSO
```

2. **Erro de permissões:**
```bash
sudo chown -R www-data:www-data /var/www/base1xf
```

3. **Erro de SSL:**
```bash
sudo certbot certificates
sudo nginx -t
```

---

## 🎯 **10. Checklist Final**

- [ ] Servidor atualizado
- [ ] Node.js 18+ instalado
- [ ] Projeto clonado e configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Build executado com sucesso
- [ ] PM2 configurado e rodando
- [ ] Nginx configurado
- [ ] SSL configurado (HTTPS)
- [ ] Firewall configurado
- [ ] Site acessível pelo domínio

---

## 🆘 **Suporte**

**Em caso de problemas:**
1. Verifique logs: `pm2 logs` e `sudo tail -f /var/log/nginx/error.log`
2. Teste configuração: `sudo nginx -t`
3. Verifique status: `pm2 status` e `sudo systemctl status nginx`

**Site deve estar funcionando em:** `https://seudominio.com` 🎉
