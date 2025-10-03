// CONFIGURAÇÃO - ALTERE AQUI A URL DO SEU PROJETO PRINCIPAL
const MAIN_PROJECT_URL = 'OFFERPAGE.COM'; // SUBSTITUA pela URL real

// Estado do quiz
let currentQuestion = 1;
let pendingAnswer = null;

// Mensagens de saída
const exitMessages = {
    'nao_tem_interesse': 'Tudo bem! Quando mudar de ideia sobre ter mais poder no Free Fire, volte aqui. Sua oferta especial estará esperando! 🎮',
    'nao_quer_agora': 'Entendemos! Mas lembre-se: as melhores ofertas são limitadas. Quando estiver pronto para dominar o jogo, estaremos aqui! ⚡',
    'curiosidade': 'Entendemos sua curiosidade! Mas as ofertas especiais são apenas para quem realmente quer recarregar. Volte quando estiver pronto! 🎯',
    'guardar': 'Guardar para depois pode significar perder a oferta! Os melhores descontos são para quem age agora. Pense bem! ⏰'
};

// Função para selecionar resposta
function selectAnswer(questionNum, answer) {
    console.log(`[QUIZ] Pergunta ${questionNum}: ${answer}`);
    
    if (questionNum === 1) {
        if (answer === "Não quero poder nenhum") {
            showExitMessage('nao_tem_interesse');
            return;
        }
        
        // Ir para pergunta 2
        setTimeout(() => {
            document.getElementById('question1').classList.add('hidden');
            document.getElementById('question2').classList.remove('hidden');
            document.getElementById('question2').classList.add('fade-in');
            currentQuestion = 2;
        }, 300);
        
    } else if (questionNum === 2) {
        if (answer === "Só estou respondendo por curiosidade") {
            pendingAnswer = 'curiosidade';
            showConfirmModal(answer);
            return;
        } else if (answer === "Guardar para usar outro dia") {
            pendingAnswer = 'guardar';
            showConfirmModal(answer);
            return;
        }
        
        // Ir para pergunta 3
        setTimeout(() => {
            document.getElementById('question2').classList.add('hidden');
            document.getElementById('question3').classList.remove('hidden');
            document.getElementById('question3').classList.add('fade-in');
            currentQuestion = 3;
        }, 300);
        
    } else if (questionNum === 3) {
        if (answer === "NÃO") {
            pendingAnswer = 'nao_quer_agora';
            showConfirmModal(answer);
        } else {
            // SIM - Redirecionar para projeto principal
            redirectToMainProject();
        }
    }
}

// Mostrar modal de confirmação
function showConfirmModal(answer) {
    const modal = document.getElementById('confirmModal');
    const title = document.getElementById('modalTitle');
    const message = document.getElementById('modalMessage');
    
    if (answer === "NÃO") {
        title.textContent = "Tem certeza que quer deixar para depois?";
        message.textContent = "Se você deixar para depois, pode não conseguir o mesmo desconto quando voltar. Nossa oferta é válida apenas para quem quer aproveitar hoje!";
    } else if (answer === "Só estou respondendo por curiosidade") {
        title.textContent = "Tem certeza dessa escolha?";
        message.textContent = "Se você está apenas curioso, não conseguirá acessar as ofertas especiais. Elas são apenas para quem tem interesse real em recarregar.";
    } else {
        title.textContent = "Tem certeza dessa escolha?";
        message.textContent = "Se você quer guardar para outro dia, pode não conseguir o mesmo desconto depois. As ofertas são para uso imediato!";
    }
    
    modal.classList.remove('hidden');
}

// Confirmar ação do modal
function confirmAction(confirmed) {
    const modal = document.getElementById('confirmModal');
    modal.classList.add('hidden');
    
    if (confirmed) {
        showExitMessage(pendingAnswer);
    }
    
    pendingAnswer = null;
}

// Mostrar mensagem de saída
function showExitMessage(type) {
    const exitDiv = document.getElementById('exitMessage');
    const exitText = document.getElementById('exitText');
    
    // Esconder todas as perguntas
    document.getElementById('question1').classList.add('hidden');
    document.getElementById('question2').classList.add('hidden');
    document.getElementById('question3').classList.add('hidden');
    
    // Mostrar mensagem
    exitText.textContent = exitMessages[type] || exitMessages['nao_tem_interesse'];
    exitDiv.classList.remove('hidden');
    exitDiv.classList.add('fade-in');
    
    // Salvar lead (opcional - para analytics)
    saveQuizLead(type);
}

// Redirecionar para projeto principal - VERSÃO ATUALIZADA
function redirectToMainProject() {
    console.log('[QUIZ] Redirecionando para projeto principal...');
    
    // Salvar que completou o quiz
    localStorage.setItem('quiz_completed', 'true');
    localStorage.setItem('quiz_timestamp', new Date().toISOString());
    
    // Obter TODOS os parâmetros da URL atual
    const currentUrl = new URL(window.location.href);
    const allParams = new URLSearchParams();
    
    // Preservar TODOS os parâmetros existentes
    currentUrl.searchParams.forEach((value, key) => {
        allParams.set(key, value);
        console.log(`[QUIZ] Preservando parâmetro: ${key} = ${value}`);
    });
    
    // Adicionar parâmetros específicos do quiz
    allParams.set('quiz', 'completed');
    allParams.set('quiz_timestamp', Date.now().toString());
    
    // Lista completa de parâmetros que podem existir (para debug)
    const commonParams = [
        // UTMs básicos
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        // UTMs estendidos
        'utm_id', 'utm_source_platform', 'utm_creative_format', 'utm_marketing_tactic',
        // Google Ads
        'gclid', 'gclsrc', 'gbraid', 'wbraid', 'gad_source',
        // Facebook/Meta
        'fbclid', 'fb_action_ids', 'fb_action_types', 'fb_source',
        // TikTok
        'ttclid', 'tt_medium', 'tt_content',
        // Outros tracking
        'src', 'sck', 'xcod', 'keyword', 'device', 'network', 'placement',
        // Afiliados
        'aff_id', 'aff_sub', 'aff_sub2', 'aff_sub3', 'aff_sub4', 'aff_sub5',
        // Outros
        'ref', 'referrer', 'source', 'medium', 'campaign', 'ad_id', 'adset_id'
    ];
    
    // Log dos parâmetros encontrados
    console.log('[QUIZ] Parâmetros capturados:');
    commonParams.forEach(param => {
        const value = allParams.get(param);
        if (value) {
            console.log(`  ✅ ${param}: ${value}`);
        }
    });
    
    // Construir URL final
    const finalUrl = `${MAIN_PROJECT_URL}?${allParams.toString()}`;
    console.log('[QUIZ] URL final de redirecionamento:', finalUrl);
    
    // Redirecionar
    window.location.href = finalUrl;
}

// Salvar lead do quiz (opcional)
function saveQuizLead(reason) {
    const leadData = {
        timestamp: new Date().toISOString(),
        reason: reason,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        currentUrl: window.location.href,
        allParams: Object.fromEntries(new URLSearchParams(window.location.search))
    };
    
    console.log('[QUIZ] Lead salvo:', leadData);
    
    // Salvar no localStorage
    const leads = JSON.parse(localStorage.getItem('quiz_leads') || '[]');
    leads.push(leadData);
    localStorage.setItem('quiz_leads', JSON.stringify(leads));
    
    // Aqui você pode enviar para uma API se quiser
    // fetch('/api/save-lead', { method: 'POST', body: JSON.stringify(leadData) });
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('[QUIZ] Quiz carregado');
    console.log('[QUIZ] URL do projeto principal:', MAIN_PROJECT_URL);
    console.log('[QUIZ] URL atual:', window.location.href);
    
    // Log de todos os parâmetros atuais
    const currentParams = new URLSearchParams(window.location.search);
    console.log('[QUIZ] Parâmetros da URL atual:');
    currentParams.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
    });
    
    // Verificar se já completou o quiz
    const quizCompleted = localStorage.getItem('quiz_completed');
    if (quizCompleted) {
        console.log('[QUIZ] Quiz já foi completado anteriormente');
    }
});
