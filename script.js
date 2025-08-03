// ===== CONFIGURAÇÕES GLOBAIS =====
const API_URL = 'http://localhost:3000/api'; // URL da API (ajustar conforme necessário)

// ===== GERENCIAMENTO DE ESTADO =====
let currentUser = null;
let selectedTimeSlot = null;
let activeTab = 'aluno';

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('StrumSage - Sistema Iniciado');
    
    // Verificar autenticação
    checkAuthentication();
    
    // Inicializar componentes
    initializeComponents();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Carregar dados iniciais
    loadInitialData();
});

// ===== AUTENTICAÇÃO =====
function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Verificar se o token ainda é válido
        validateToken(token);
    }
}

function validateToken(token) {
    // Implementar validação do token
    currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
}

// ===== COMPONENTES =====
function initializeComponents() {
    // Menu Mobile
    const menuMobile = document.querySelector('.menu-mobile');
    if (menuMobile) {
        menuMobile.addEventListener('click', toggleMobileMenu);
    }
    
    // Calendário
    if (document.getElementById('calendario-widget')) {
        initializeCalendar();
    }
    
    // Gráficos do Admin
    if (document.getElementById('instrumentChart')) {
        initializeAdminCharts();
    }
    
    // Carrossel de vídeos
    if (document.querySelector('.videos-carousel')) {
        initializeVideoCarousel();
    }
    
    // Notificações
    initializeNotifications();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Formulários
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    const formAgendamento = document.getElementById('formAgendamento');
    if (formAgendamento) {
        formAgendamento.addEventListener('submit', handleAgendamento);
    }
    
    const formAluno = document.getElementById('formAluno');
    if (formAluno) {
        formAluno.addEventListener('submit', handleNovoAluno);
    }
    
    // Time slots
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', selectTimeSlot);
    });
    
    // Filtros
    const filtroInstrumento = document.getElementById('filtro-instrumento');
    if (filtroInstrumento) {
        filtroInstrumento.addEventListener('change', filtrarAulas);
    }
    
    const filtroData = document.getElementById('filtro-data');
    if (filtroData) {
        filtroData.addEventListener('change', filtrarAulas);
    }
}

// ===== MENU MOBILE =====
function toggleMobileMenu() {
    const nav = document.querySelector('nav');
    nav.classList.toggle('active');
    
    const menuIcon = document.querySelector('.menu-mobile i');
    menuIcon.classList.toggle('fa-bars');
    menuIcon.classList.toggle('fa-times');
}

// ===== LOGIN E AUTENTICAÇÃO =====
function switchTab(tab) {
    activeTab = tab;
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(t => t.classList.remove('active'));
    
    event.target.classList.add('active');
    
    const formTitle = document.getElementById('formTitle');
    const formSubtitle = document.getElementById('formSubtitle');
    
    switch(tab) {
        case 'aluno':
            formTitle.textContent = 'Login do Aluno';
            formSubtitle.textContent = 'Entre com suas credenciais para acessar sua conta';
            break;
        case 'professor':
            formTitle.textContent = 'Login do Professor';
            formSubtitle.textContent = 'Acesse sua área de ensino';
            break;
        case 'admin':
            formTitle.textContent = 'Login Administrativo';
            formSubtitle.textContent = 'Acesso restrito aos administradores';
            break;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.querySelector('[name="remember"]').checked;
    
    try {
        // Mostrar loading
        showLoading();
        
        // Simulação de chamada API (substituir por chamada real)
        const response = await simulateAPICall({
            email,
            password,
            userType: activeTab
        });
        
        if (response.success) {
            // Salvar token e dados do usuário
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            
            if (remember) {
                localStorage.setItem('rememberedEmail', email);
            }
            
            // Redirecionar baseado no tipo de usuário
            switch(activeTab) {
                case 'aluno':
                    window.location.href = 'mainUser.html';
                    break;
                case 'professor':
                    window.location.href = 'mainTeacher.html';
                    break;
                case 'admin':
                    window.location.href = 'mainAdm.html';
                    break;
            }
        } else {
            showError('Email ou senha incorretos');
        }
    } catch (error) {
        showError('Erro ao fazer login. Tente novamente.');
    } finally {
        hideLoading();
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Validar senhas
    if (data.password !== data.confirmPassword) {
        showError('As senhas não coincidem');
        return;
    }
    
    try {
        showLoading();
        
        const response = await simulateAPICall({
            action: 'register',
            data: data
        });
        
        if (response.success) {
            showSuccess('Cadastro realizado com sucesso!');
            setTimeout(() => {
                showLoginForm();
            }, 2000);
        } else {
            showError(response.message || 'Erro ao realizar cadastro');
        }
    } catch (error) {
        showError('Erro ao realizar cadastro. Tente novamente.');
    } finally {
        hideLoading();
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = event.target.querySelector('input[type="email"]').value;
    
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        showSuccess('Instruções enviadas para ' + email);
        closeForgotPassword();
    }, 2000);
}

function closeForgotPassword() {
    document.getElementById('forgotPasswordModal').style.display = 'none';
}

// ===== AGENDAMENTO =====
function abrirModalAgendamento() {
    document.getElementById('modalAgendamento').style.display = 'block';
    carregarHorariosDisponiveis();
}

function fecharModalAgendamento() {
    document.getElementById('modalAgendamento').style.display = 'none';
    resetarFormulario('formAgendamento');
}

function abrirModalAgendarAula() {
    document.getElementById('modalAgendarAula').style.display = 'block';
}

function fecharModalAgendarAula() {
    document.getElementById('modalAgendarAula').style.display = 'none';
}

async function handleAgendamento(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    if (!selectedTimeSlot) {
        showError('Por favor, selecione um horário');
        return;
    }
    
    data.horario = selectedTimeSlot;
    
    try {
        showLoading();
        
        const response = await simulateAPICall({
            action: 'agendar',
            data: data
        });
        
        if (response.success) {
            showSuccess('Aula agendada com sucesso!');
            fecharModalAgendamento();
            atualizarListaAulas();
        } else {
            showError('Erro ao agendar aula');
        }
    } catch (error) {
        showError('Erro ao agendar aula. Tente novamente.');
    } finally {
        hideLoading();
    }
}

function selectTimeSlot(event) {
    // Remover seleção anterior
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Adicionar seleção atual
    event.target.classList.add('selected');
    selectedTimeSlot = event.target.textContent;
}

async function carregarHorariosDisponiveis() {
    const data = document.getElementById('data').value;
    const professor = document.getElementById('aluno').value;
    
    if (data && professor) {
        // Carregar horários disponíveis via API
        // Por enquanto, apenas mostrar todos os horários
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.disabled = false;
        });
    }
}

// ===== GERENCIAMENTO DE ALUNOS =====
function abrirModalAluno() {
    document.getElementById('modalAluno').style.display = 'block';
}

function fecharModalAluno() {
    document.getElementById('modalAluno').style.display = 'none';
    resetarFormulario('formAluno');
}

async function handleNovoAluno(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    try {
        showLoading();
        
        const response = await simulateAPICall({
            action: 'novoAluno',
            data: data
        });
        
        if (response.success) {
            showSuccess('Aluno cadastrado com sucesso!');
            fecharModalAluno();
            atualizarTabelaAlunos();
        } else {
            showError('Erro ao cadastrar aluno');
        }
    } catch (error) {
        showError('Erro ao cadastrar aluno. Tente novamente.');
    } finally {
        hideLoading();
    }
}

// ===== CALENDÁRIO =====
function initializeCalendar() {
    const calendarWidget = document.getElementById('calendario-widget');
    if (!calendarWidget) return;
    
    // Implementar calendário simples
    const currentDate = new Date();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    const calendar = generateCalendarHTML(month, year);
    calendarWidget.innerHTML = calendar;
    
    // Adicionar event listeners para os dias
    calendarWidget.querySelectorAll('.calendar-day').forEach(day => {
        day.addEventListener('click', selecionarDia);
    });
}

function generateCalendarHTML(month, year) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    let html = `
        <div class="calendar-header">
            <button onclick="changeMonth(-1)"><i class="fas fa-chevron-left"></i></button>
            <h3>${monthNames[month]} ${year}</h3>
            <button onclick="changeMonth(1)"><i class="fas fa-chevron-right"></i></button>
        </div>
        <div class="calendar-grid">
            <div class="calendar-day-header">Dom</div>
            <div class="calendar-day-header">Seg</div>
            <div class="calendar-day-header">Ter</div>
            <div class="calendar-day-header">Qua</div>
            <div class="calendar-day-header">Qui</div>
            <div class="calendar-day-header">Sex</div>
            <div class="calendar-day-header">Sáb</div>
    `;
    
    // Adicionar dias vazios no início
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Adicionar dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const hasClass = Math.random() > 0.7; // Simulação de aulas marcadas
        html += `<div class="calendar-day ${hasClass ? 'has-class' : ''}" data-day="${day}">${day}</div>`;
    }
    
    html += '</div>';
    
    return html;
}

function changeMonth(direction) {
    // Implementar mudança de mês
    console.log('Mudar mês:', direction);
}

function selecionarDia(event) {
    const day = event.target.dataset.day;
    if (day) {
        // Carregar aulas do dia selecionado
        console.log('Dia selecionado:', day);
    }
}

// ===== FILTROS =====
function filtrarAulas() {
    const instrumento = document.getElementById('filtro-instrumento').value;
    const data = document.getElementById('filtro-data').value;
    
    // Implementar lógica de filtro
    console.log('Filtrar por:', instrumento, data);
    
    // Atualizar lista de aulas
    atualizarListaAulas();
}

function filtrarPacotes(instrumento) {
    const pacotes = document.querySelectorAll('[data-instrumento]');
    
    pacotes.forEach(pacote => {
        if (instrumento === 'todos' || pacote.dataset.instrumento === instrumento || pacote.dataset.instrumento === 'todos') {
            pacote.style.display = 'block';
        } else {
            pacote.style.display = 'none';
        }
    });
    
    // Atualizar botões de filtro
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ===== GRÁFICOS ADMIN =====
function initializeAdminCharts() {
    // Gráfico de Instrumentos
    const instrumentCtx = document.getElementById('instrumentChart');
    if (instrumentCtx) {
        new Chart(instrumentCtx, {
            type: 'doughnut',
            data: {
                labels: ['Violão', 'Guitarra', 'Piano', 'Bateria', 'Baixo'],
                datasets: [{
                    data: [45, 25, 20, 15, 10],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Gráfico de Crescimento
    const growthCtx = document.getElementById('growthChart');
    if (growthCtx) {
        new Chart(growthCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Novos Alunos',
                    data: [12, 19, 15, 25, 22, 30],
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// ===== CARROSSEL DE VÍDEOS =====
function initializeVideoCarousel() {
    // Implementar carrossel simples
    let currentSlide = 0;
    const slides = document.querySelectorAll('.video-slide');
    
    if (slides.length === 0) return;
    
    // Criar botões de navegação
    const carousel = document.querySelector('.videos-carousel');
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-btn prev';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.onclick = () => changeSlide(-1);
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-btn next';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.onclick = () => changeSlide(1);
    
    carousel.appendChild(prevBtn);
    carousel.appendChild(nextBtn);
    
    function changeSlide(direction) {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + direction + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    
    // Mostrar primeiro slide
    slides[0].classList.add('active');
}

// ===== NOTIFICAÇÕES =====
function initializeNotifications() {
    // Verificar se há notificações pendentes
    checkPendingNotifications();
    
    // Configurar verificação periódica
    setInterval(checkPendingNotifications, 60000); // A cada minuto
}

function checkPendingNotifications() {
    // Simular verificação de notificações
    const hasUpcomingClass = Math.random() > 0.8;
    
    if (hasUpcomingClass && Notification.permission === 'granted') {
        showNotification('Lembrete de Aula', 'Sua aula de música começa em 30 minutos!');
    }
}

function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'images/logo11.png',
            badge: 'images/logo11.png'
        });
    }
}

// ===== FAQ =====
function toggleFaq(button) {
    const faqItem = button.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    const icon = button.querySelector('i');
    
    // Fechar outras FAQs abertas
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
            item.querySelector('.faq-answer').style.maxHeight = null;
            item.querySelector('i').classList.remove('fa-chevron-up');
            item.querySelector('i').classList.add('fa-chevron-down');
        }
    });
    
    // Toggle FAQ atual
    faqItem.classList.toggle('active');
    
    if (faqItem.classList.contains('active')) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        answer.style.maxHeight = null;
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

// ===== SIDEBAR ADMIN =====
function toggleSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    const mainContent = document.querySelector('.admin-main');
    
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
}

// ===== CHAT =====
function abrirChat() {
    // Implementar abertura de chat
    console.log('Abrir chat de suporte');
    
    // Por enquanto, mostrar mensagem
    showInfo('Chat em desenvolvimento. Entre em contato pelo WhatsApp: (11) 91234-5678');
}

// ===== UTILITÁRIOS =====
function showLoading() {
    // Criar overlay de loading se não existir
    let loadingOverlay = document.getElementById('loadingOverlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Carregando...</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function showError(message) {
    showToast(message, 'error');
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showInfo(message) {
    showToast(message, 'info');
}

function showToast(message, type = 'info') {
    // Criar container de toasts se não existir
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Criar toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remover após 4 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function resetarFormulario(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        selectedTimeSlot = null;
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
    }
}

function atualizarListaAulas() {
    // Implementar atualização da lista de aulas
    console.log('Atualizar lista de aulas');
}

function atualizarTabelaAlunos() {
    // Implementar atualização da tabela de alunos
    console.log('Atualizar tabela de alunos');
}

// ===== SIMULAÇÃO DE API =====
async function simulateAPICall(data) {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular respostas baseadas na ação
    if (data.action === 'register') {
        return { success: true, message: 'Cadastro realizado com sucesso' };
    }
    
    if (data.action === 'agendar') {
        return { success: true, message: 'Aula agendada com sucesso' };
    }
    
    if (data.action === 'novoAluno') {
        return { success: true, message: 'Aluno cadastrado com sucesso' };
    }
    
    // Login simulation
    if (data.email === 'admin@strumsage.com' && data.password === 'admin123') {
        return {
            success: true,
            token: 'fake-jwt-token',
            user: {
                id: 1,
                name: 'Administrador',
                email: data.email,
                type: 'admin'
            }
        };
    }
    
    if (data.email && data.password) {
        return {
            success: true,
            token: 'fake-jwt-token',
            user: {
                id: 2,
                name: 'João Silva',
                email: data.email,
                type: data.userType
            }
        };
    }
    
    return { success: false, message: 'Credenciais inválidas' };
}

// ===== DADOS INICIAIS =====
function loadInitialData() {
    // Carregar dados salvos localmente
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail && document.getElementById('email')) {
        document.getElementById('email').value = rememberedEmail;
    }
    
    // Solicitar permissão para notificações
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ===== EXPORTAR FUNÇÕES GLOBAIS =====
window.toggleMobileMenu = toggleMobileMenu;
window.switchTab = switchTab;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.togglePassword = togglePassword;
window.showRegisterForm = showRegisterForm;
window.showLoginForm = showLoginForm;
window.handleForgotPassword = handleForgotPassword;
window.closeForgotPassword = closeForgotPassword;
window.abrirModalAgendamento = abrirModalAgendamento;
window.fecharModalAgendamento = fecharModalAgendamento;
window.abrirModalAgendarAula = abrirModalAgendarAula;
window.fecharModalAgendarAula = fecharModalAgendarAula;
window.abrirModalAluno = abrirModalAluno;
window.fecharModalAluno = fecharModalAluno;
window.changeMonth = changeMonth;
window.filtrarPacotes = filtrarPacotes;
window.toggleFaq = toggleFaq;
window.toggleSidebar = toggleSidebar;
window.abrirChat = abrirChat;
