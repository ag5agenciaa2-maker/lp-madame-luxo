/**
 * MADAME LUXO - JavaScript
 * Funcionalidades Vanilla ES6
 * @author AG5 Agência
 */

// ============================================
// 1. CONFIGURAÇÕES E CONSTANTES
// ============================================
const CONFIG = {
    scrollOffset: 80,
    animationThreshold: 0.15,
    counterDuration: 2000,
    staggerDelay: 80,
    videoStaggerDelay: 120
};

const SELECTORS = {
    navbar: '#navbar',
    navToggle: '#navToggle',
    navMenu: '#navMenu',
    bentoCells: '.bento-cell',
    videoCards: '.video-card',
    statNumbers: '.stat-number',
    heroTitle: '#heroTitle',
    painSolutionCards: '.card-pain, .card-solution'
};

// ============================================
// 2. UTILITÁRIOS
// ============================================

/**
 * Debounce function para otimizar eventos
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function}
 */
const debounce = (func, wait = 100) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ============================================
// 3. NAVBAR
// ============================================
class NavbarController {
    constructor() {
        this.navbar = document.querySelector(SELECTORS.navbar);
        this.navToggle = document.querySelector(SELECTORS.navToggle);
        this.navMenu = document.querySelector(SELECTORS.navMenu);
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.init();
    }
    
    init() {
        if (!this.navbar) return;
        
        this.bindScroll();
        this.bindMobileMenu();
        this.bindSmoothScroll();
    }
    
    /**
     * Controla o background da navbar ao scrollar
     */
    bindScroll() {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            if (scrollY > CONFIG.scrollOffset) {
                this.navbar.classList.add('navbar--scrolled');
            } else {
                this.navbar.classList.remove('navbar--scrolled');
            }
        };
        
        window.addEventListener('scroll', debounce(handleScroll, 50), { passive: true });
    }
    
    /**
     * Controle do menu mobile (Drawer Premium)
     */
    bindMobileMenu() {
        if (!this.navToggle) return;
        
        const drawer = document.getElementById('drawerMenu');
        const overlay = document.getElementById('drawerOverlay');
        const closeBtn = document.getElementById('drawerClose');
        const drawerLinks = document.querySelectorAll('.drawer-link');
        
        const openMenu = () => {
            drawer.classList.add('is-open');
            overlay.classList.add('is-active');
            document.body.style.overflow = 'hidden';
            drawer.setAttribute('aria-hidden', 'false');
            overlay.setAttribute('aria-hidden', 'false');
        };
        
        const closeMenu = () => {
            drawer.classList.remove('is-open');
            overlay.classList.remove('is-active');
            document.body.style.overflow = '';
            drawer.setAttribute('aria-hidden', 'true');
            overlay.setAttribute('aria-hidden', 'true');
        };
        
        this.navToggle.addEventListener('click', openMenu);
        closeBtn.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);
        
        // Fecha menu ao clicar em link do drawer
        drawerLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }
    
    /**
     * Scroll suave para âncoras
     */
    bindSmoothScroll() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const offsetTop = target.offsetTop - 80;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
}

// ============================================
// 4. INTERSECTION OBSERVER - ANIMAÇÕES
// ============================================
class ScrollAnimations {
    constructor() {
        this.bentoCells = document.querySelectorAll(SELECTORS.bentoCells);
        this.videoCards = document.querySelectorAll(SELECTORS.videoCards);
        this.painSolutionCards = document.querySelectorAll(SELECTORS.painSolutionCards);
        
        this.init();
    }
    
    init() {
        this.observeBentoCells();
        this.observeVideoCards();
        this.observePainSolutionCards();
        this.observeRevealElements();
    }

    /**
     * Observa elementos genéricos de reveal (lateral)
     */
    observeRevealElements() {
        const elements = document.querySelectorAll('.reveal-left, .reveal-right');
        if (!elements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0,
            rootMargin: '0px 0px -20px 0px'
        });

        elements.forEach(el => observer.observe(el));
    }
    
    /**
     * Observa células do Bento Grid
     */
    observeBentoCells() {
        if (!this.bentoCells.length) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, index * CONFIG.staggerDelay);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: CONFIG.animationThreshold,
            rootMargin: '0px 0px -50px 0px'
        });
        
        this.bentoCells.forEach(cell => observer.observe(cell));
    }
    
    /**
     * Observa cards de vídeo
     */
    observeVideoCards() {
        if (!this.videoCards.length) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, index * CONFIG.videoStaggerDelay);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: CONFIG.animationThreshold,
            rootMargin: '0px 0px -50px 0px'
        });
        
        this.videoCards.forEach(card => observer.observe(card));
    }

    /**
     * Observa cards de Dor e Solução
     */
    observePainSolutionCards() {
        if (!this.painSolutionCards.length) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });
        
        this.painSolutionCards.forEach(card => observer.observe(card));
    }
}

// ============================================
// 5. CONTADORES ANIMADOS
// ============================================
class AnimatedCounters {
    constructor() {
        this.counters = document.querySelectorAll(SELECTORS.statNumbers);
        
        this.init();
    }
    
    init() {
        if (!this.counters.length) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });
        
        this.counters.forEach(counter => observer.observe(counter));
    }
    
    /**
     * Anima contador de 0 até o valor final
     * @param {HTMLElement} element - Elemento do contador
     */
    animateCounter(element) {
        const target = parseInt(element.dataset.target, 10);
        if (isNaN(target)) return;
        
        const duration = CONFIG.counterDuration;
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing ease-out
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        requestAnimationFrame(updateCounter);
    }
}

// ============================================
// 6. FAQ ACCORDION
// ============================================
class FAQAccordion {
    constructor() {
        this.items = document.querySelectorAll('.faq-item');
        
        this.init();
    }
    
    init() {
        if (!this.items.length) return;
        
        this.items.forEach(item => {
            const summary = item.querySelector('.faq-question');
            
            summary.addEventListener('click', () => {
                const isOpen = item.hasAttribute('open');
                
                // Fecha todos os outros items (comportamento accordion)
                this.items.forEach(otherItem => {
                    if (otherItem !== item && otherItem.hasAttribute('open')) {
                        otherItem.removeAttribute('open');
                    }
                });
            });
        });
    }
}

// ============================================
// 8. LAZY LOADING DE IMAGENS
// ============================================
class LazyLoader {
    constructor() {
        this.images = document.querySelectorAll('img[loading="lazy"]');
        
        this.init();
    }
    
    init() {
        if (!this.images.length) return;
        
        // Verifica suporte nativo
        if ('loading' in HTMLImageElement.prototype) {
            // Navegador suporta lazy loading nativo
            return;
        }
        
        // Fallback com IntersectionObserver
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        this.images.forEach(img => observer.observe(img));
    }
}

// ============================================
// 9. VÍDEOS - CONTROLE DE AUTOPLAY
// ============================================
class VideoController {
    constructor() {
        this.videos = document.querySelectorAll('.video-element');
        
        this.init();
    }
    
    init() {
        if (!this.videos.length) return;
        
        // Pausa vídeos quando não estão visíveis
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(() => {
                        // Ignora erro se autoplay for bloqueado
                    });
                } else {
                    video.pause();
                }
            });
        }, {
            threshold: 0.25
        });
        
        this.videos.forEach(video => observer.observe(video));
    }
}

// ============================================
// 10. WHATSAPP FLOATING BUBBLE
// ============================================
class WhatsappBubble {
    constructor() {
        this.container = document.querySelector('.whatsapp-container');
        this.whatsappMessage = document.getElementById('whatsapp-message');
        this.whatsappNotify = document.querySelector('.whatsapp-notify');
        this.closeBubbleBtn = document.querySelector('.close-whatsapp-bubble');
        this.triggerSection = document.getElementById('videos'); // Segunda seção
        
        this.init();
    }

    init() {
        if (!this.container) return;

        // 1. Mostrar botão após o início da segunda seção
        this.initScrollTrigger();

        // 2. Balão de notificação (número 1) após 5 segundos
        setTimeout(() => {
            if (this.whatsappNotify) {
                this.whatsappNotify.classList.add('show');
            }
        }, 5000);

        // 3. Balão de mensagem após 20 segundos
        setTimeout(() => {
            this.showBubble();
            
            // 4. Sumir balão de mensagem após 15 segundos (total 35s)
            setTimeout(() => {
                this.hideBubble();
            }, 15000);
        }, 20000);

        // Fechar ao clicar no X
        if (this.closeBubbleBtn) {
            this.closeBubbleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideBubble();
            });
        }
    }

    initScrollTrigger() {
        if (!this.triggerSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
                    this.container.classList.add('is-visible');
                    // Uma vez visível, não precisamos mais observar para este propósito
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0,
            rootMargin: '0px 0px -100px 0px' // Ativa um pouco antes de entrar totalmente
        });

        observer.observe(this.triggerSection);

        // Fallback para scroll manual caso o observer demore
        const checkScroll = () => {
            if (window.scrollY > 300) {
                this.container.classList.add('is-visible');
                window.removeEventListener('scroll', checkScroll);
            }
        };
        window.addEventListener('scroll', checkScroll, { passive: true });
    }

    showBubble() {
        if (this.whatsappMessage) {
            this.whatsappMessage.classList.add('show');
        }
    }

    hideBubble() {
        if (this.whatsappMessage) {
            this.whatsappMessage.classList.remove('show');
        }
    }
}

// ============================================
// 11. INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa todos os módulos
    new NavbarController();
    new ScrollAnimations();
    new AnimatedCounters();
    new FAQAccordion();
    new LazyLoader();
    new VideoController();
    new WhatsappBubble();
    
    // Console log de inicialização
    console.log('%c Madame Luxo ', 'background: #E8E000; color: #1A1A1A; font-size: 20px; font-weight: bold; padding: 10px;');
    console.log('%c Site inicializado com sucesso! ', 'color: #C9A227; font-size: 14px;');
});

// ============================================
// 11. UTILITÁRIOS GLOBAIS
// ============================================

/**
 * Scroll para elemento específico
 * @param {string} selector - Seletor do elemento
 * @param {number} offset - Offset adicional
 */
window.scrollToElement = (selector, offset = 80) => {
    const element = document.querySelector(selector);
    if (element) {
        const top = element.offsetTop - offset;
        window.scrollTo({
            top,
            behavior: 'smooth'
        });
    }
};

/**
 * Abre WhatsApp com mensagem pré-formatada
 * @param {string} message - Mensagem a ser enviada
 */
window.openWhatsApp = (message = '') => {
    const baseUrl = 'https://wa.me/5521988501459';
    const url = message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
};

/* ======== CATÁLOGO DE PEÇAS ======== */
(function () {
            // 💡 PARA ATUALIZAR PELA PLANILHA:
            // 1. No Google Sheets, vá em Arquivo > Compartilhar > Publicar na Web
            // 2. Escolha "Valores separados por vírgula (.csv)" e clique em Publicar
            // 3. Copie o link gerado e cole abaixo entre as aspas.
            //
            //    EXEMPLO DE URL CORRETA:
            //    https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv
            //
            //    NÃO use o link de edição (com /edit no final).
            const URL_PLANILHA = "https://docs.google.com/spreadsheets/d/13I0DBjImUK8R1rZe1Nt0FC-WzALALbkAencGH5HdsdA/export?format=csv"; // Exportação CSV direta

            // ── Ativa aba por nome de categoria ──
            function ativarAba(cat) {
                document.querySelectorAll('.cat-tab').forEach(function (t) {
                    var ativo = t.dataset.cat === cat;
                    t.classList.toggle('active', ativo);
                    t.setAttribute('aria-selected', ativo ? 'true' : 'false');
                });
                document.querySelectorAll('.cat-panel').forEach(function (p) {
                    var ativo = p.id === 'panel-' + cat;
                    p.classList.toggle('active', ativo);
                    p.hidden = !ativo;

                    if (!document.getElementById('catSearchInput').value.trim()) {
                        p.querySelectorAll('.cat-card').forEach(function (card) {
                            if (!card.classList.contains('hidden-card')) {
                                card.style.display = '';
                            } else {
                                card.style.display = 'none';
                            }
                        });
                    }
                });
                document.getElementById('catNoResults').hidden = true;
            }

            // ── Eventos de Clique nas Abas ──
            document.querySelectorAll('.cat-tab').forEach(function (tab) {
                tab.addEventListener('click', function () {
                    ativarAba(tab.dataset.cat);
                });
            });

            // ── Lógica de Paginação ──
            function initPagination() {
                document.querySelectorAll('.cat-panel').forEach(function (panel) {
                    var cards = Array.from(panel.querySelectorAll('.cat-card'));
                    var existingBtn = panel.querySelector('.btn-ver-mais-wrap');
                    if (existingBtn) existingBtn.remove();

                    if (cards.length > 6) {
                        cards.forEach(function (card, index) {
                            if (index >= 6) {
                                card.classList.add('hidden-card');
                                card.style.display = 'none';
                            } else {
                                card.classList.remove('hidden-card');
                                card.style.display = '';
                            }
                        });

                        var btnWrap = document.createElement('div');
                        btnWrap.className = 'btn-ver-mais-wrap';
                        btnWrap.style.textAlign = 'center';
                        btnWrap.style.marginTop = '40px';

                        var btn = document.createElement('button');
                        btn.className = 'cat-ver-mais-btn';
                        btn.innerText = 'Ver Mais';
                        btnWrap.appendChild(btn);
                        panel.appendChild(btnWrap);

                        btn.addEventListener('click', function () {
                            if (btn.innerText === 'Recolher') {
                                cards.forEach(function (card, index) {
                                    if (index >= 6) {
                                        card.classList.add('hidden-card');
                                        card.style.display = 'none';
                                    }
                                });
                                btn.innerText = 'Ver Mais';
                                var rect = panel.getBoundingClientRect();
                                var offset = rect.top + window.scrollY - 100;
                                window.scrollTo({ top: offset, behavior: 'smooth' });
                            } else {
                                var hiddenCards = cards.filter(function (c) { return c.classList.contains('hidden-card'); });
                                for (var i = 0; i < 3 && i < hiddenCards.length; i++) {
                                    hiddenCards[i].classList.remove('hidden-card');
                                    hiddenCards[i].style.display = '';
                                }
                                if (hiddenCards.length <= 3) {
                                    btn.innerText = 'Recolher';
                                }
                            }
                        });
                    }
                });
            }

            // ── Lógica de Pesquisa ──
            var searchInput = document.getElementById('catSearchInput');
            var noResultsDiv = document.getElementById('catNoResults');
            var clearBtn = document.getElementById('catClearSearch');
            var allPanels = document.querySelectorAll('.cat-panel');
            var tabsContainer = document.getElementById('catTabs');

            function realizarPesquisa() {
                var termo = searchInput.value.toLowerCase().trim();
                var encontrouAlgum = false;

                if (termo.length === 0) {
                    tabsContainer.style.display = '';
                    noResultsDiv.hidden = true;
                    document.querySelectorAll('.btn-ver-mais-wrap').forEach(function (w) { w.style.display = 'block'; });
                    var abaAtiva = document.querySelector('.cat-tab.active');
                    if (abaAtiva) ativarAba(abaAtiva.dataset.cat);
                    return;
                }

                tabsContainer.style.display = 'none';
                document.querySelectorAll('.btn-ver-mais-wrap').forEach(function (w) { w.style.display = 'none'; });

                allPanels.forEach(function (panel) {
                    var encontrouNoPanel = false;
                    var cards = panel.querySelectorAll('.cat-card');

                    cards.forEach(function (card) {
                        var textoCard = card.innerText.toLowerCase();
                        var categoriaTab = panel.id.replace('panel-', '').replace('-', ' ');

                        if (textoCard.includes(termo) || categoriaTab.includes(termo)) {
                            card.style.display = '';
                            encontrouNoPanel = true;
                            encontrouAlgum = true;
                        } else {
                            card.style.display = 'none';
                        }
                    });

                    panel.classList.add('active');
                    panel.hidden = !encontrouNoPanel;
                });

                noResultsDiv.hidden = encontrouAlgum;
            }

            searchInput.addEventListener('input', realizarPesquisa);
            clearBtn.addEventListener('click', function () {
                searchInput.value = '';
                realizarPesquisa();
                searchInput.focus();
            });

            // ── Links do bento-grid → ancoragem no catálogo ──
            document.querySelectorAll('.bento-cta[data-cat]').forEach(function (link) {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    var cat = link.dataset.cat;
                    var panel = document.getElementById('panel-' + cat);
                    ativarAba(panel ? cat : 'vestidos');
                    var sec = document.getElementById('catalogo');
                    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            });

            // ── Eventos de Clique nos Cards Estáticos ──
            function bindStaticCards() {
                document.querySelectorAll('.cat-card').forEach(function (card) {
                    if (!card.dataset.dinamico) {
                        card.addEventListener('click', function () {
                            var id = card.dataset.modal;
                            var overlay = document.getElementById(id);
                            if (!overlay) return;
                            overlay.hidden = false;
                            requestAnimationFrame(function () { overlay.classList.add('ml-open'); });
                            document.body.style.overflow = 'hidden';
                        });
                    }
                });
            }
            bindStaticCards();

            // ── Fechar Modais ──
            function mlFechar() {
                document.querySelectorAll('.pmodal-overlay.ml-open').forEach(function (o) {
                    o.classList.remove('ml-open');
                    setTimeout(function () { o.hidden = true; }, 350);
                });
                document.body.style.overflow = '';
            }
            document.querySelectorAll('.pmodal-close').forEach(function (btn) {
                btn.addEventListener('click', mlFechar);
            });
            document.querySelectorAll('.pmodal-overlay').forEach(function (o) {
                o.addEventListener('click', function (e) { if (e.target === o) mlFechar(); });
            });
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape') mlFechar(); });

            // ── Trocar imagem na galeria do modal ──
            window.mlTrocarImg = function (imgId, thumb) {
                var main = document.getElementById(imgId);
                if (!main) return;
                main.style.opacity = '0';
                setTimeout(function () { main.src = thumb.src; main.style.opacity = '1'; }, 180);
                thumb.closest('.pmodal-thumbs').querySelectorAll('.pmodal-thumb').forEach(function (t) {
                    t.classList.remove('active');
                });
                thumb.classList.add('active');
            };

            // ── LÓGICA DINÂMICA DA PLANILHA ──

            function parseCSV(text) {
                const lines = text.split('\n');
                if (lines.length < 2) return [];

                // Encontra a linha de headers (a primeira que contém "categoria" e "id" ou "nome")
                let headerIndex = 0;
                for (let i = 0; i < lines.length; i++) {
                    const lineLower = lines[i].toLowerCase();
                    if (lineLower.includes('categoria') && (lineLower.includes('id') || lineLower.includes('nome'))) {
                        headerIndex = i;
                        break;
                    }
                }

                // Limpa aspas, espaços, passa para lowercase e remove acentos dos headers
                const headers = lines[headerIndex].split(',').map(h =>
                    h.replace(/^"|"$/g, '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                );
                const data = [];

                for (let i = headerIndex + 1; i < lines.length; i++) {
                    if (!lines[i].trim()) continue;

                    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
                    const row = [];
                    let match;

                    while ((match = regex.exec(lines[i])) !== null) {
                        let val = match[1];
                        if (val && val.startsWith(',')) val = val.substring(1);
                        val = val ? val.replace(/^"|"$/g, '').replace(/""/g, '"').trim() : '';
                        row.push(val);
                    }

                    if (row.length >= headers.length) {
                        const obj = {};
                        headers.forEach((header, index) => {
                            obj[header] = row[index] || '';
                        });
                        data.push(obj);
                    }
                }
                return data;
            }

            function abrirModalDinamico(produto) {
                const modal = document.getElementById('modal-dinamico');
                if (!modal) return;

                // Mapeamento das colunas da planilha do usuário
                const nome = produto['nome da peca / conjunto *'] || produto['nome'];
                const categoria = produto['categoria *'] || produto['categoria'];
                const tipo = produto['tipo de produto *'] || produto['tipo'];
                const precoDe = produto['preco de (r$)'] || produto['precode'];
                const precoPor = produto['preco por (r$) *'] || produto['precopor'];
                const desconto = produto['desconto %'] || produto['desconto'];
                const tamanhos = produto['tamanhos disponiveis *'] || produto['tamanhos'];
                const imagem1 = produto['🖼️ imagem destaque (url)'] || produto['imagem1'];
                const imagem2 = produto['imagem 2 (url)'] || produto['imagem2'];
                const imagem3 = produto['imagem 3 (url)'] || produto['imagem3'];
                const descricao = produto['descricao *'] || produto['descricao'];
                const material = produto['material / tecido'] || produto['material'];
                const cor = produto['cor principal *'] || produto['cor'];
                const estoque = produto['qtd. estoque'] || produto['estoque'];
                const linkProduto = produto['link do produto (url)'];

                document.getElementById('pimg-dinamico').src = imagem1;
                document.getElementById('pimg-dinamico').alt = nome;

                const thumbsContainer = document.getElementById('pmodal-thumbs-dinamico');
                thumbsContainer.innerHTML = '';

                const imagens = [imagem1, imagem2, imagem3].filter(img => img && img.trim() !== '');

                imagens.forEach((img, index) => {
                    const thumb = document.createElement('img');
                    thumb.src = img;
                    thumb.className = `pmodal-thumb ${index === 0 ? 'active' : ''}`;
                    thumb.alt = nome;
                    thumb.onclick = function () { window.mlTrocarImg('pimg-dinamico', this); };
                    thumbsContainer.appendChild(thumb);
                });

                document.getElementById('pmodal-cat-dinamico').innerText = categoria + (tipo ? ' · ' + tipo : '');
                document.getElementById('pmodal-nome-dinamico').innerText = nome;

                const precoDeElem = document.getElementById('pmodal-de-dinamico');
                if (precoDe) {
                    precoDeElem.innerText = precoDe;
                    precoDeElem.style.display = '';
                } else {
                    precoDeElem.style.display = 'none';
                }

                document.getElementById('pmodal-por-dinamico').innerText = precoPor;

                const descBadge = document.getElementById('pmodal-desc-dinamico');
                if (desconto) {
                    descBadge.innerText = desconto.includes('%') ? desconto : desconto + '%';
                    descBadge.style.display = '';
                } else {
                    descBadge.style.display = 'none';
                }

                document.getElementById('pmodal-texto-dinamico').innerText = descricao || '';
                document.getElementById('pmodal-mat-dinamico').innerText = material || 'Não informado';
                document.getElementById('pmodal-cor-dinamico').innerText = cor || 'Não informado';
                document.getElementById('pmodal-tam-dinamico').innerText = tamanhos || 'Não informado';
                document.getElementById('pmodal-est-dinamico').innerText = estoque || 'Não informado';

                const cta = document.getElementById('pmodal-cta-dinamico');

                if (linkProduto && linkProduto.trim().startsWith('http')) {
                    cta.href = linkProduto;
                    cta.innerText = 'Ver Detalhes / Comprar';
                } else {
                    let whatsMsg = `Olá! Tenho interesse no produto: ${nome}`;
                    if (precoPor) whatsMsg += ` por ${precoPor}`;
                    cta.href = `https://wa.me/5521988501459?text=${encodeURIComponent(whatsMsg)}`;
                    cta.innerText = 'Comprar pelo WhatsApp';
                }

                modal.hidden = false;
                requestAnimationFrame(() => { modal.classList.add('ml-open'); });
                document.body.style.overflow = 'hidden';
            }

            window.fecharModalDinamico = function () {
                const modal = document.getElementById('modal-dinamico');
                if (modal) {
                    modal.classList.remove('ml-open');
                    setTimeout(() => { modal.hidden = true; }, 350);
                }
                document.body.style.overflow = '';
            };

            function renderizarCatalogo(produtos) {
                document.querySelectorAll('.cat-panel').forEach(panel => {
                    const grid = panel.querySelector('.cat-grid');
                    if (grid) grid.innerHTML = '';
                });

                produtos.forEach(prod => {
                    if (prod['status *'] && prod['status *'].toLowerCase() === 'inativo') return;

                    const nome = prod['nome da peca / conjunto *'] || prod['nome'];
                    const categoria = prod['categoria *'] || prod['categoria'];
                    const tipo = prod['tipo de produto *'] || prod['tipo'];
                    const precoDe = prod['preco de (r$)'] || prod['precode'];
                    const precoPor = prod['preco por (r$) *'] || prod['precopor'];
                    const desconto = prod['desconto %'] || prod['desconto'];
                    const tamanhos = prod['tamanhos disponiveis *'] || prod['tamanhos'];
                    const imagem1 = prod['🖼️ imagem destaque (url)'] || prod['imagem1'];
                    const ofertaDestaque = prod['🔥 oferta em destaque?'] || prod['novo'];

                    if (!categoria) return;

                    let catKey = categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');

                    if (catKey.includes('vestido')) catKey = 'vestidos';
                    if (catKey.includes('macacao') || catKey.includes('macacoes')) catKey = 'macacoes';
                    if (catKey.includes('conjunto')) catKey = 'conjuntos';
                    if (catKey.includes('saia')) catKey = 'saias';
                    if (catKey.includes('body') || catKey.includes('bodys')) catKey = 'bodys';
                    if (catKey.includes('blusa')) catKey = 'blusas';
                    if (catKey.includes('plus')) catKey = 'plus-size';
                    if (catKey.includes('short')) catKey = 'shorts';
                    if (catKey.includes('acessorio')) catKey = 'acessorios';
                    if (catKey.includes('macaquinho')) catKey = 'macaquinhos';
                    if (catKey.includes('nova') || catKey.includes('colecao')) catKey = 'nova-colecao';

                    const panel = document.getElementById(`panel-${catKey}`);
                    if (!panel) return;

                    const grid = panel.querySelector('.cat-grid');
                    if (!grid) return;

                    const card = document.createElement('article');
                    card.className = 'cat-card';
                    card.dataset.dinamico = 'true';

                    let badgeHtml = '';
                    if (desconto) {
                        const descTexto = desconto.includes('%') ? desconto : desconto + '%';
                        badgeHtml = `<span class="cat-badge">${descTexto}</span>`;
                    } else if (ofertaDestaque && (ofertaDestaque.toLowerCase() === 'sim' || ofertaDestaque.toLowerCase() === 's')) {
                        badgeHtml = `<span class="cat-badge-novo">Destaque</span>`;
                    }

                    card.innerHTML = `
                    <div class="cat-card-img-wrap">
                        <img src="${imagem1}" alt="${nome}" class="cat-card-img" loading="lazy">
                        ${badgeHtml}
                    </div>
                    <div class="cat-card-info">
                        <span class="cat-card-tipo">${tipo || ''}</span>
                        <h3 class="cat-card-nome">${nome}</h3>
                        <div class="cat-card-precos">
                            ${precoDe ? `<span class="cat-preco-de">${precoDe}</span>` : ''}
                            <span class="cat-preco-por">${precoPor}</span>
                        </div>
                        <span class="cat-card-tamanhos">${tamanhos || ''}</span>
                    </div>
                `;

                    card.addEventListener('click', () => { abrirModalDinamico(prod); });
                    grid.appendChild(card);
                });

                initPagination();

                const primeiraAba = document.querySelector('.cat-tab');
                if (primeiraAba) ativarAba(primeiraAba.dataset.cat);
            }

            async function carregarDados() {
                if (!URL_PLANILHA || URL_PLANILHA.trim() === '') {
                    console.log('URL da planilha não configurada. Mantendo catálogo estático.');
                    return;
                }

                try {
                    let urlFinal = URL_PLANILHA;
                    
                    // Converte link de compartilhamento comum para link de exportação CSV
                    if (urlFinal.includes('docs.google.com/spreadsheets')) {
                        const match = urlFinal.match(/\/d\/([a-zA-Z0-9-_]+)/);
                        if (match && match[1]) {
                            urlFinal = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
                        }
                    }
                    
                    // Adiciona cache buster para atualizar constantemente
                    urlFinal += (urlFinal.includes('?') ? '&' : '?') + 't=' + new Date().getTime();

                    const response = await fetch(urlFinal);
                    if (!response.ok) throw new Error('Erro ao buscar dados da planilha');
                    const text = await response.text();
                    const produtos = parseCSV(text);
                    if (produtos.length > 0) {
                        renderizarCatalogo(produtos);
                    }
                } catch (e) {
                    console.error('Erro ao carregar catálogo da planilha:', e);
                }
            }

            carregarDados();

        })();