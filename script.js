/**
 * MADAME LUXO - JavaScript
 * Funcionalidades Vanilla ES6
 * @author AG5 Agência
 */

// ============================================
// LOCK LEVE — só esconde overflow, suporta empilhamento (sem position:fixed)
// ============================================
window.BodyScroll = (function () {
    let _locks = 0;
    let _saved = '';
    return {
        lock() {
            _locks++;
            if (_locks === 1) {
                _saved = document.body.style.overflow;
                document.body.style.overflow = 'hidden';
            }
        },
        unlock() {
            if (_locks === 0) return;
            _locks--;
            if (_locks === 0) {
                document.body.style.overflow = _saved;
            }
        },
        reset() { _locks = 0; document.body.style.overflow = _saved; }
    };
})();

// ============================================
// SCROLL LOCK GLOBAL (modais, dropdowns, menus)
// ============================================
// Trava o scroll do body preservando a posição atual.
// Resolve: fundo mexendo em iOS, perda de posição ao fechar modal.
// Uso: ScrollLock.lock() / ScrollLock.unlock()
window.ScrollLock = (function () {
    let _locks = 0;       // suporta empilhar modais
    let _scrollY = 0;
    let _bodyStyles = null;

    return {
        lock() {
            _locks++;
            if (_locks > 1) return; // já travado
            _scrollY = window.scrollY || window.pageYOffset;
            _bodyStyles = {
                position: document.body.style.position,
                top: document.body.style.top,
                left: document.body.style.left,
                right: document.body.style.right,
                width: document.body.style.width,
                overflow: document.body.style.overflow
            };
            document.body.style.position = 'fixed';
            document.body.style.top = `-${_scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        },
        unlock() {
            if (_locks === 0) return;
            _locks--;
            if (_locks > 0) return; // ainda tem outro modal aberto
            if (_bodyStyles) {
                document.body.style.position = _bodyStyles.position;
                document.body.style.top = _bodyStyles.top;
                document.body.style.left = _bodyStyles.left;
                document.body.style.right = _bodyStyles.right;
                document.body.style.width = _bodyStyles.width;
                document.body.style.overflow = _bodyStyles.overflow;
                _bodyStyles = null;
            }
            window.scrollTo(0, _scrollY);
        },
        // Reseta caso algum modal fique órfão (debug).
        reset() {
            _locks = 0;
            if (_bodyStyles) {
                Object.assign(document.body.style, _bodyStyles);
                _bodyStyles = null;
            }
        }
    };
})();

// ============================================
// SACOLA — carrinho persistente em localStorage
// ============================================
window.Sacola = (function () {
    const KEY = 'ml_sacola_v1';
    const WPP = '5521988501459';
    let _itens = [];
    let _onChangeCallbacks = [];

    function load() {
        try { _itens = JSON.parse(localStorage.getItem(KEY)) || []; }
        catch { _itens = []; }
    }
    function save() {
        localStorage.setItem(KEY, JSON.stringify(_itens));
        _onChangeCallbacks.forEach(cb => { try { cb(_itens); } catch {} });
    }
    load();

    function parseValor(precoStr) {
        if (!precoStr) return 0;
        const limpo = String(precoStr).replace(/[^\d,]/g, '').replace(',', '.');
        const n = parseFloat(limpo);
        return isNaN(n) ? 0 : n;
    }

    function formatBRL(n) {
        return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return {
        itens: () => _itens.slice(),
        count: () => _itens.reduce((acc, it) => acc + (it.qtd || 1), 0),
        total: () => _itens.reduce((acc, it) => acc + parseValor(it.precoPor) * (it.qtd || 1), 0),

        add(item) {
            // item: { id, nome, precoPor, precoDe, imagem, tamanho, link }
            const id = item.id || (item.nome + '|' + (item.tamanho || ''));
            const existente = _itens.find(it => it.id === id);
            if (existente) {
                existente.qtd = (existente.qtd || 1) + 1;
            } else {
                _itens.push({ ...item, id, qtd: 1 });
            }
            save();
        },

        setQtd(id, qtd) {
            const it = _itens.find(i => i.id === id);
            if (!it) return;
            it.qtd = Math.max(1, qtd);
            save();
        },

        remove(id) {
            _itens = _itens.filter(i => i.id !== id);
            save();
        },

        clear() {
            _itens = [];
            save();
        },

        onChange(cb) { _onChangeCallbacks.push(cb); },

        // Monta mensagem WhatsApp completa com lista de itens e total.
        // Aceita opcionalmente um único item extra (para "comprar agora" sem precisar adicionar antes).
        montarMensagem(itemExtra) {
            const lista = itemExtra ? [..._itens, itemExtra] : _itens;
            if (!lista.length) return '';
            const linhas = lista.map(it => {
                const tamanho = it.tamanho ? ` (Tam: ${it.tamanho})` : '';
                const qtd = (it.qtd || 1) > 1 ? ` x${it.qtd}` : '';
                return `• ${it.nome}${tamanho}${qtd} — ${formatBRL(parseValor(it.precoPor))}`;
            });
            const total = lista.reduce((acc, it) => acc + parseValor(it.precoPor) * (it.qtd || 1), 0);
            return `Olá! Vim através do site e tenho interesse${lista.length > 1 ? ' nos produtos abaixo' : ' no produto abaixo'}:\n\n${linhas.join('\n')}\n\nTotal: ${formatBRL(total)}`;
        },

        finalizar(itemExtra) {
            const msg = this.montarMensagem(itemExtra);
            if (!msg) return;
            const url = `https://wa.me/${WPP}?text=${encodeURIComponent(msg)}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        },

        formatBRL,
        parseValor
    };
})();

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
            window.BodyScroll.lock();
            drawer.setAttribute('aria-hidden', 'false');
            overlay.setAttribute('aria-hidden', 'false');
        };

        const closeMenu = () => {
            drawer.classList.remove('is-open');
            overlay.classList.remove('is-active');
            window.BodyScroll.unlock();
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
                });
                document.getElementById('catNoResults').hidden = true;
            }

            // Listeners das abas são religados dentro de gerarAbasDinamicas() após o CSV carregar.

            // ── Lógica de Paginação ──
            // ── Lógica de Pesquisa ──
            var searchInput = document.getElementById('catSearchInput');
            var noResultsDiv = document.getElementById('catNoResults');
            var clearBtn = document.getElementById('catClearSearch');
            // Panels e tabs são gerados dinamicamente — sempre requery na hora.
            var tabsContainer = document.getElementById('catTabs');

            function realizarPesquisa() {
                // Normaliza o termo: lowercase + sem acentos. Usuário digita "terra" e bate em "Terracota".
                var termoBruto = searchInput.value.trim();
                var termo = termoBruto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
                var allPanels = document.querySelectorAll('.cat-panel');

                if (termo.length === 0) {
                    if (tabsContainer) tabsContainer.style.display = '';
                    noResultsDiv.hidden = true;
                    // Restaura paginação: cada panel volta à página 1 com 8 cards visíveis.
                    if (typeof aplicarPaginacaoEmTodosOsPanels === 'function') {
                        aplicarPaginacaoEmTodosOsPanels();
                    }
                    var abaAtiva = document.querySelector('.cat-tab.active');
                    if (abaAtiva) ativarAba(abaAtiva.dataset.cat);
                    return;
                }

                if (tabsContainer) tabsContainer.style.display = 'none';
                // Pesquisa ativa esconde a paginação (ela seria irrelevante com resultados parciais).
                document.querySelectorAll('.cat-pagination').forEach(function (p) { p.style.display = 'none'; });

                // Suporte a múltiplas palavras: todas precisam estar presentes (AND).
                var palavras = termo.split(/\s+/).filter(Boolean);

                // Pesquisa em todos os panels mas evita duplicação:
                // mostra resultado APENAS no panel "todos" (que contém clones de tudo).
                // Outros panels ficam escondidos durante a busca.
                var panelTodos = document.getElementById('panel-todos');
                var encontrouAlgum = false;

                allPanels.forEach(function (panel) {
                    if (panel !== panelTodos) {
                        panel.classList.remove('active');
                        panel.hidden = true;
                        return;
                    }
                    var encontrouNoPanel = false;
                    panel.querySelectorAll('.cat-card').forEach(function (card) {
                        // Busca no blob normalizado (nome + categoria + tipo + cor + material + descrição + tamanhos).
                        // Fallback pro innerText caso o card seja antigo (estático no HTML).
                        var blob = card.dataset.search || card.innerText.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
                        var passa = palavras.every(function (p) { return blob.indexOf(p) !== -1; });
                        card.style.display = passa ? '' : 'none';
                        if (passa) {
                            encontrouNoPanel = true;
                            encontrouAlgum = true;
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
            // Se o bento tem data-filter (ex.: plus-size, novidades), aplica o chip equivalente
            // em vez de só ativar uma aba — assim o usuário vê todas as peças daquele filtro.
            document.querySelectorAll('.bento-cta[data-cat]').forEach(function (link) {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    var cat = link.dataset.cat;
                    var filtro = link.dataset.filter;

                    if (filtro && document.querySelector('.cat-chip[data-filter="' + filtro + '"]')) {
                        aplicarFiltroChip(filtro);
                    } else {
                        // garante que estamos sem filtro ativo antes de ativar a aba
                        if (typeof __filtroAtual !== 'undefined' && __filtroAtual !== 'todos') {
                            aplicarFiltroChip('todos');
                        }
                        var panel = document.getElementById('panel-' + cat);
                        var primeira = document.querySelector('.cat-tab');
                        ativarAba(panel ? cat : (primeira ? primeira.dataset.cat : 'ofertas-destaque'));
                    }

                    var sec = document.getElementById('catalogo');
                    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            });

            // ── Lightbox ──
            var lbOverlay = document.getElementById('img-lightbox');
            var lbImg = document.getElementById('img-lightbox-img');
            var lbClose = document.getElementById('img-lightbox-close');
            var lbPrev = document.getElementById('lb-prev');
            var lbNext = document.getElementById('lb-next');
            var _lbImages = [];
            var _lbIndex = 0;

            function lbMostrar(index) {
                _lbIndex = index;
                lbImg.style.opacity = '0';
                setTimeout(function () {
                    lbImg.src = _lbImages[_lbIndex].src;
                    lbImg.alt = _lbImages[_lbIndex].alt || '';
                    lbImg.style.opacity = '1';
                }, 150);
                lbPrev.style.display = _lbImages.length > 1 ? '' : 'none';
                lbNext.style.display = _lbImages.length > 1 ? '' : 'none';
            }

            function abrirLightbox(src, alt, imagens) {
                if (!lbOverlay || !src) return;
                _lbImages = imagens || [{ src: src, alt: alt || '' }];
                _lbIndex = _lbImages.findIndex(function (i) { return i.src === src; });
                if (_lbIndex < 0) _lbIndex = 0;
                lbImg.style.opacity = '1';
                lbImg.src = _lbImages[_lbIndex].src;
                lbImg.alt = _lbImages[_lbIndex].alt || '';
                lbPrev.style.display = _lbImages.length > 1 ? '' : 'none';
                lbNext.style.display = _lbImages.length > 1 ? '' : 'none';
                lbOverlay.removeAttribute('hidden');
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        lbOverlay.classList.add('lb-open');
                    });
                });
                history.pushState({ lightbox: true }, '');
            }

            function fecharLightbox() {
                if (!lbOverlay) return;
                lbOverlay.classList.remove('lb-open');
                setTimeout(function () { lbOverlay.setAttribute('hidden', ''); }, 250);
            }

            if (lbPrev) lbPrev.addEventListener('click', function () {
                lbMostrar((_lbIndex - 1 + _lbImages.length) % _lbImages.length);
            });
            if (lbNext) lbNext.addEventListener('click', function () {
                lbMostrar((_lbIndex + 1) % _lbImages.length);
            });
            if (lbClose) lbClose.addEventListener('click', fecharLightbox);
            if (lbOverlay) lbOverlay.addEventListener('click', function (e) {
                if (e.target === lbOverlay) fecharLightbox();
            });

            // ── Abrir Modal ──
            function abrirModal(id) {
                var overlay = document.getElementById(id);
                if (!overlay) return;
                overlay.removeAttribute('hidden');
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        overlay.classList.add('ml-open');
                    });
                });
                window.BodyScroll.lock();
                history.pushState({ modal: id }, '');
            }

            // ── Eventos de Clique nos Cards Estáticos ──
            function bindStaticCards() {
                document.querySelectorAll('.cat-card').forEach(function (card) {
                    if (!card.dataset.dinamico) {
                        card.addEventListener('click', function () {
                            abrirModal(card.dataset.modal);
                        });
                    }
                });
            }
            bindStaticCards();

            // ── Fechar Modais ──
            var _fechandoModal = false;
            function mlFechar() {
                if (_fechandoModal) return;
                _fechandoModal = true;
                document.querySelectorAll('.pmodal-overlay.ml-open').forEach(function (o) {
                    o.classList.remove('ml-open');
                    setTimeout(function () { o.setAttribute('hidden', ''); }, 350);
                });
                window.BodyScroll.unlock();
                setTimeout(function () { _fechandoModal = false; }, 400);
            }
            document.querySelectorAll('.pmodal-close').forEach(function (btn) {
                btn.addEventListener('click', mlFechar);
            });
            document.querySelectorAll('.pmodal-overlay').forEach(function (o) {
                o.addEventListener('click', function (e) { if (e.target === o) mlFechar(); });
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    if (lbOverlay && lbOverlay.classList.contains('lb-open')) fecharLightbox();
                    else mlFechar();
                }
            });

            // ── Botão Voltar (popstate) fecha modal/lightbox em vez de sair do site ──
            window.addEventListener('popstate', function (e) {
                if (lbOverlay && lbOverlay.classList.contains('lb-open')) {
                    fecharLightbox();
                } else if (document.querySelector('.pmodal-overlay.ml-open')) {
                    mlFechar();
                }
            });

            // ── Imagens dos modais estáticos clicáveis (lightbox) ──
            document.querySelectorAll('.pmodal-overlay').forEach(function (modal) {
                var mainImg = modal.querySelector('.pmodal-img-main');
                if (!mainImg) return;
                mainImg.addEventListener('click', function () {
                    var thumbs = modal.querySelectorAll('.pmodal-thumb');
                    var imagens = thumbs.length
                        ? Array.from(thumbs).map(function (t) { return { src: t.src, alt: t.alt || '' }; })
                        : [{ src: mainImg.src, alt: mainImg.alt || '' }];
                    abrirLightbox(mainImg.src, mainImg.alt, imagens);
                });
            });

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

            // ── Carrossel mobile do modal de produto: drag (touch+mouse) + setas + dots ──
            function montarCarrosselMobile(imagens, alt) {
                const carousel = document.getElementById('pmodal-carousel-dinamico');
                const track = document.getElementById('pmodal-carousel-track');
                const dotsEl = document.getElementById('pmodal-carousel-dots');
                const prevBtn = document.getElementById('pmodal-carousel-prev');
                const nextBtn = document.getElementById('pmodal-carousel-next');
                if (!carousel || !track) return;

                track.innerHTML = '';
                dotsEl.innerHTML = '';

                if (!imagens.length) {
                    carousel.classList.add('has-one');
                    return;
                }

                imagens.forEach((src) => {
                    const slide = document.createElement('div');
                    slide.className = 'pmodal-carousel-slide';
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = alt || '';
                    img.loading = 'lazy';
                    slide.appendChild(img);
                    track.appendChild(slide);
                });

                imagens.forEach((_, i) => {
                    const dot = document.createElement('button');
                    dot.type = 'button';
                    dot.className = 'pmodal-carousel-dot' + (i === 0 ? ' is-active' : '');
                    dot.setAttribute('aria-label', `Ir para imagem ${i + 1}`);
                    dot.addEventListener('click', () => goTo(i));
                    dotsEl.appendChild(dot);
                });

                carousel.classList.toggle('has-one', imagens.length === 1);

                let idx = 0;
                const total = imagens.length;

                function goTo(i) {
                    idx = Math.max(0, Math.min(total - 1, i));
                    track.style.transform = `translateX(${-idx * 100}%)`;
                    dotsEl.querySelectorAll('.pmodal-carousel-dot').forEach((d, j) => {
                        d.classList.toggle('is-active', j === idx);
                    });
                    prevBtn.disabled = idx === 0;
                    nextBtn.disabled = idx === total - 1;
                }

                prevBtn.onclick = () => goTo(idx - 1);
                nextBtn.onclick = () => goTo(idx + 1);
                goTo(0);

                // Drag por arrastar (touch e mouse)
                let dragStartX = null;
                let dragCurrentX = 0;
                let dragWidth = 0;

                function onPointerDown(e) {
                    dragStartX = (e.touches ? e.touches[0].clientX : e.clientX);
                    dragWidth = carousel.getBoundingClientRect().width;
                    track.classList.add('is-dragging');
                }
                function onPointerMove(e) {
                    if (dragStartX === null) return;
                    const x = (e.touches ? e.touches[0].clientX : e.clientX);
                    dragCurrentX = x - dragStartX;
                    track.style.transform = `translateX(calc(${-idx * 100}% + ${dragCurrentX}px))`;
                }
                function onPointerUp() {
                    if (dragStartX === null) return;
                    track.classList.remove('is-dragging');
                    const threshold = dragWidth * 0.2; // 20% pra trocar
                    if (dragCurrentX > threshold && idx > 0) goTo(idx - 1);
                    else if (dragCurrentX < -threshold && idx < total - 1) goTo(idx + 1);
                    else goTo(idx); // volta pro slide atual
                    dragStartX = null;
                    dragCurrentX = 0;
                }

                // Remove listeners antigos antes de religar (modal pode reabrir várias vezes).
                track.ontouchstart = onPointerDown;
                track.ontouchmove = onPointerMove;
                track.ontouchend = onPointerUp;
                track.onmousedown = (e) => { e.preventDefault(); onPointerDown(e); };
                track.onmousemove = (e) => { if (dragStartX !== null) onPointerMove(e); };
                track.onmouseup = onPointerUp;
                track.onmouseleave = () => { if (dragStartX !== null) onPointerUp(); };
            }

            function abrirModalDinamico(produto) {
                const modal = document.getElementById('modal-dinamico');
                if (!modal) return;

                // Expõe o produto atual pra outros handlers (Adicionar à Sacola / Comprar pelo WhatsApp do modal).
                window.__produtoDinamicoAtual = produto;

                // Mapeamento das colunas da planilha do usuário
                const nome = produto['nome da peca / conjunto *'] || produto['nome'];
                const categoria = produto['categoria *'] || produto['categoria'];
                const tipo = produto['tipo de produto *'] || produto['tipo'];
                const precoDe = formatarPreco(produto['preco de (r$)'] || produto['precode']);
                const precoPor = formatarPreco(produto['preco por (r$) *'] || produto['precopor']);
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

                // ── Carrossel mobile (substitui imagem main + thumbs em telas <=768px) ──
                montarCarrosselMobile(imagens, nome);

                // Breadcrumb mostra só a categoria; tipo agora vai na grid de specs.
                document.getElementById('pmodal-cat-dinamico').innerText = categoria;
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

                const statusProd = (produto['status *'] || produto['status'] || '').toLowerCase().trim();
                const esgotadoProd = statusProd === 'esgotado';

                document.getElementById('pmodal-texto-dinamico').innerText = descricao || '';
                document.getElementById('pmodal-tipo-dinamico').innerText = tipo || 'Não informado';
                document.getElementById('pmodal-mat-dinamico').innerText = material || 'Não informado';
                document.getElementById('pmodal-cor-dinamico').innerText = cor || 'Não informado';
                document.getElementById('pmodal-tam-dinamico').innerText = tamanhos || 'Não informado';
                document.getElementById('pmodal-est-dinamico').innerText = estoque || 'Não informado';

                // Badge esgotado dentro do modal
                var badgeEsgotado = document.getElementById('pmodal-badge-esgotado');
                if (badgeEsgotado) badgeEsgotado.style.display = esgotadoProd ? '' : 'none';

                // Preço riscado quando esgotado
                const porElem = document.getElementById('pmodal-por-dinamico');
                porElem.innerText = precoPor;
                porElem.style.opacity = esgotadoProd ? '0.4' : '1';
                porElem.style.textDecoration = esgotadoProd ? 'line-through' : '';

                const cta = document.getElementById('pmodal-cta-dinamico');
                if (esgotadoProd) {
                    const msgAviso = `Olá, vim através do site e gostaria de ser avisada quando o produto "${nome}" estiver disponível novamente.`;
                    cta.href = `https://wa.me/5521988501459?text=${encodeURIComponent(msgAviso)}`;
                    cta.innerText = '🔔 Avisar quando disponível';
                    cta.className = 'pmodal-cta pmodal-cta--aviso';
                } else {
                    const msgCompra = `Olá, vim através do site e tenho interesse no produto: ${nome}${precoPor ? ' por ' + precoPor : ''}.`;
                    cta.href = `https://wa.me/5521988501459?text=${encodeURIComponent(msgCompra)}`;
                    cta.innerText = 'Comprar pelo WhatsApp';
                    cta.className = 'pmodal-cta';
                }

                const mainImg = document.getElementById('pimg-dinamico');
                if (mainImg) {
                    mainImg.onclick = function () {
                        var thumbsEl = document.querySelectorAll('#pmodal-thumbs-dinamico .pmodal-thumb');
                        var imgs = thumbsEl.length
                            ? Array.from(thumbsEl).map(function (t) { return { src: t.src, alt: t.alt || '' }; })
                            : [{ src: mainImg.src, alt: mainImg.alt || '' }];
                        abrirLightbox(mainImg.src, mainImg.alt, imgs);
                    };
                }

                modal.removeAttribute('hidden');
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        modal.classList.add('ml-open');
                    });
                });
                window.BodyScroll.lock();
                history.pushState({ modal: 'modal-dinamico' }, '');
            }

            window.fecharModalDinamico = function () {
                const modal = document.getElementById('modal-dinamico');
                if (modal) {
                    modal.classList.remove('ml-open');
                    setTimeout(() => { modal.setAttribute('hidden', ''); }, 350);
                }
                window.BodyScroll.unlock();
            };

            function formatarPreco(valor) {
                if (!valor || valor === '') return '';
                // Remove aspas e espaços
                let limpo = String(valor).replace(/^"|"$/g, '').trim();
                // Remove 'R$ ' para processar o número puro
                let numStr = limpo.replace('R$', '').trim();

                // Caso especial: Google Sheets exporta inteiros com separador de milhar americano
                // Ex: 370,000 ou 1,000 — na prática são R$ 370,00 e R$ 1,00 (preços de roupas)
                if (/^\d{1,3},000$/.test(numStr)) {
                    numStr = numStr.replace(',000', '');
                    const num = parseFloat(numStr);
                    return 'R$ ' + num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }

                // Caso: já está no formato brasileiro correto com 2 decimais: 350,00 ou 1.234,56
                if (/^[\d\.]+,\d{2}$/.test(numStr)) {
                    return 'R$ ' + numStr;
                }

                // Caso: vírgula como separador de milhar (1,234 ou 370,000 já tratado acima)
                if (/^\d{1,3}(,\d{3})+$/.test(numStr)) {
                    numStr = numStr.replace(/,/g, '');
                }
                // Caso: 1,234.56 (vírgula milhar, ponto decimal - formato americano)
                else if (/^\d{1,3}(,\d{3})+\.\d+$/.test(numStr)) {
                    numStr = numStr.replace(/,/g, '');
                }
                // Caso: 1.234,56 (ponto milhar, vírgula decimal)
                else if (/^\d{1,3}(\.\d{3})+,\d{2}$/.test(numStr)) {
                    numStr = numStr.replace(/\./g, '').replace(',', '.');
                }
                // Caso: 370.000 (ponto como separador de milhar, sem decimal)
                else if (/^\d{1,3}(\.\d{3})+$/.test(numStr)) {
                    numStr = numStr.replace(/\./g, '');
                }
                // Caso: 199,90 (vírgula decimal, sem milhar)
                else if (/^\d+,\d+$/.test(numStr)) {
                    numStr = numStr.replace(',', '.');
                }

                const num = parseFloat(numStr);
                if (isNaN(num)) return limpo;

                return 'R$ ' + num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }

            // Slug a partir do nome da categoria — usado como ID das tabs/panels.
            function categoriaParaSlug(nome) {
                return (nome || '')
                    .toLowerCase()
                    .normalize('NFD').replace(/[̀-ͯ]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            }

            // Capitaliza cada palavra, mantendo preposições comuns em minúsculas.
            function tituloCategoria(nome) {
                const lower = ['de', 'da', 'do', 'das', 'dos', 'e'];
                return (nome || '').trim().split(/\s+/).map((p, i) => {
                    const w = p.toLowerCase();
                    if (i > 0 && lower.includes(w)) return w;
                    return w.charAt(0).toUpperCase() + w.slice(1);
                }).join(' ');
            }

            // Cache do CSV pra refiltrar sem re-fetch (chips de filtro).
            let __produtosCache = [];
            let __filtroAtual = 'todos';

            // True se o produto atende ao filtro chip selecionado.
            function produtoNoFiltro(prod, filtro) {
                if (filtro === 'todos') return true;
                const status = (prod['status *'] || prod['status'] || '').toLowerCase();
                const categoria = (prod['categoria *'] || prod['categoria'] || '').toLowerCase();
                const tipo = (prod['tipo de produto *'] || prod['tipo'] || '').toLowerCase();
                const tamanhos = (prod['tamanhos disponiveis *'] || prod['tamanhos'] || '').toLowerCase();

                if (filtro === 'ofertas') {
                    return status === 'oferta especial' || status === 'últimas unidades' || status === 'ultimas unidades';
                }
                if (filtro === 'plus-size') {
                    return categoria.includes('plus') || tipo.includes('plus') || /\bgg\b|\bxg\b|\bxgg\b|\bg2\b|\bg3\b/i.test(tamanhos);
                }
                if (filtro === 'novidades') {
                    return categoria.includes('nova') || categoria.includes('colec') || status === 'novidade';
                }
                return true;
            }

            // Quantas categorias ficam visíveis como tabs (resto vai no dropdown "Mais ▾").
            // Inclui "Ofertas em Destaque" + N-1 categorias top.
            const MAX_TABS_VISIVEIS = 5;
            // Slug "promovido" do dropdown — quando o usuário escolhe algo do dropdown,
            // entra como última tab visível até o próximo render.
            let __slugPromovido = null;

            // Constrói tabs e panels a partir das categorias únicas dos produtos ativos.
            // - Ofertas em Destaque é sempre primeira tab.
            // - Categorias com mais produtos ocupam as próximas posições visíveis.
            // - Excedente vai num dropdown "Mais (N) ▾".
            function gerarAbasDinamicas(produtos) {
                const tabsEl = document.getElementById('catTabs');
                const panelsEl = document.getElementById('catPanels');
                if (!tabsEl || !panelsEl) return;

                // Coleta: slug → { titulo, count }
                const mapa = new Map();
                let countOfertas = 0;
                produtos.forEach(prod => {
                    const status = (prod['status *'] || prod['status'] || '').toLowerCase();
                    if (status === 'inativo') return;
                    const isOferta = status === 'oferta especial' || status === 'últimas unidades' || status === 'ultimas unidades';
                    if (isOferta) countOfertas++;

                    const cat = prod['categoria *'] || prod['categoria'];
                    if (!cat) return;
                    const slug = categoriaParaSlug(cat);
                    if (!slug) return;
                    if (!mapa.has(slug)) mapa.set(slug, { titulo: tituloCategoria(cat), count: 0 });
                    mapa.get(slug).count++;
                });

                // Ordena por contagem desc → mais procurados ficam visíveis nas tabs.
                const categoriasPorVolume = Array.from(mapa.entries())
                    .sort((a, b) => b[1].count - a[1].count || a[1].titulo.localeCompare(b[1].titulo, 'pt-BR'));

                // Total de produtos ativos (para a aba "Todos").
                const totalAtivos = produtos.reduce((acc, p) => {
                    const st = (p['status *'] || p['status'] || '').toLowerCase();
                    return st === 'inativo' ? acc : acc + 1;
                }, 0);
                // Silencia warning de var não usada — countOfertas e totalAtivos podem ser usados depois.
                void countOfertas; void totalAtivos;

                // Tabs = apenas categorias (sem "Todos" nem "Ofertas em Destaque", que agora são chips).
                const todas = categoriasPorVolume;

                // Em mobile (< 640px): nenhuma tab visível — só o botão "Ver Categorias".
                // Em desktop: até MAX_TABS_VISIVEIS tabs visíveis.
                const isMobile = window.matchMedia('(max-width: 640px)').matches;
                const maxVisiveis = isMobile ? 0 : MAX_TABS_VISIVEIS;
                let visiveis = todas.slice(0, maxVisiveis);
                let escondidas = todas.slice(maxVisiveis);

                // Se o usuário promoveu uma categoria do dropdown E há slots visíveis disponíveis,
                // garante que ela entra como última tab visível (substitui a menos popular).
                // Em mobile (maxVisiveis=0) não promove — fica só o chip "categoria selecionada" ao lado do botão.
                if (__slugPromovido && visiveis.length > 0) {
                    const isVisivel = visiveis.some(([s]) => s === __slugPromovido);
                    if (!isVisivel) {
                        const idxNoEscondidas = escondidas.findIndex(([s]) => s === __slugPromovido);
                        if (idxNoEscondidas !== -1) {
                            const promovida = escondidas.splice(idxNoEscondidas, 1)[0];
                            const removida = visiveis.splice(visiveis.length - 1, 1)[0];
                            escondidas.unshift(removida);
                            visiveis.push(promovida);
                        }
                    }
                }

                // Sempre cria 2 panels especiais (Todos / Ofertas em Destaque) — não têm tab,
                // são controlados pelos chips. Categorias vêm depois.
                const todasOrdemPanels = [
                    ['todos', { titulo: 'Todos', count: totalAtivos }],
                    ['ofertas-destaque', { titulo: 'Ofertas em Destaque', count: countOfertas }],
                    ...visiveis,
                    ...escondidas
                ];

                // ── Renderiza tabs visíveis ──
                let tabsHtml = visiveis.map(([slug, info]) => {
                    const countHtml = info.count > 0 ? `<span class="cat-tab-count">(${info.count})</span>` : '';
                    return `
                    <button class="cat-tab" data-cat="${slug}" role="tab" aria-selected="false">${info.titulo}${countHtml}</button>`;
                }).join('');

                // ── Botão dropdown "Mais ▾" se houver categorias escondidas ──
                if (escondidas.length > 0) {
                    const moreLabel = isMobile ? 'Ver Categorias' : 'Mais';

                    // Chip mostrando a categoria selecionada — só em mobile, onde a tab promovida
                    // não fica visível na barra. No desktop a própria tab dourada já indica.
                    let activeChipHtml = '';
                    if (__slugPromovido && isMobile) {
                        const info = mapa.get(__slugPromovido);
                        if (info) {
                            activeChipHtml = `
                            <button class="cat-active-chip" id="catActiveChip" type="button"
                                    aria-label="Remover seleção de ${info.titulo}">
                                <span class="cat-active-chip-label">${info.titulo}</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>`;
                        }
                    }

                    tabsHtml += `
                    <div class="cat-more-wrap" id="catMoreWrap">
                        <button class="cat-tab cat-more-btn" id="catMoreBtn" type="button"
                                aria-expanded="false" aria-haspopup="listbox"
                                aria-label="${moreLabel}">
                            ${moreLabel}
                            <span class="cat-tab-count">(${escondidas.length})</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </button>
                        ${activeChipHtml}
                        <div class="cat-more-dropdown" id="catMoreDropdown" role="listbox" hidden>
                            ${escondidas.map(([slug, info]) => `
                                <button class="cat-more-option" data-cat="${slug}" role="option" type="button">
                                    <span class="cat-more-option-label">${info.titulo}</span>
                                    ${info.count > 0 ? `<span class="cat-more-option-count">${info.count}</span>` : ''}
                                </button>
                            `).join('')}
                        </div>
                    </div>`;
                }

                tabsEl.innerHTML = tabsHtml;

                // Nenhuma tab vem ativa por padrão — o panel ativo é definido pelo chip
                // (ou pela categoria escolhida em ações tipo bento/dropdown "Mais").

                // ── Renderiza panels (Todos + Ofertas em Destaque + categorias) ──
                // O primeiro panel ("todos") nasce ativo, alinhado ao chip "Todos".
                panelsEl.innerHTML = todasOrdemPanels.map(([slug], i) => `
                    <div class="cat-panel${i === 0 ? ' active' : ''}" id="panel-${slug}" role="tabpanel"${i === 0 ? '' : ' hidden'}>
                        <div class="cat-grid"></div>
                    </div>
                `).join('');

                // ── Listeners das tabs visíveis (excluindo o botão "Mais") ──
                // Clicar numa categoria desativa todos os chips (volta pra visão por categoria).
                tabsEl.querySelectorAll('.cat-tab:not(.cat-more-btn)').forEach(tab => {
                    tab.addEventListener('click', () => {
                        desativarChips();
                        ativarAba(tab.dataset.cat);
                    });
                });

                // ── Dropdown "Mais ▾" ──
                bindCatMoreDropdown();
            }

            // Liga listeners do dropdown "Mais ▾". Idempotente — limpa antes de religar
            // (gerarAbasDinamicas é chamado várias vezes em filtros/promove).
            function bindCatMoreDropdown() {
                const moreBtn = document.getElementById('catMoreBtn');
                const moreDropdown = document.getElementById('catMoreDropdown');
                if (!moreBtn || !moreDropdown) return;

                // Guarda referência do parent original pra restaurar ao fechar.
                let _moreDropdownOrigParent = null;

                function fecharMore() {
                    if (moreDropdown.hasAttribute('hidden')) return;
                    moreDropdown.setAttribute('hidden', '');
                    moreBtn.setAttribute('aria-expanded', 'false');
                    moreBtn.classList.remove('is-open');
                    document.body.classList.remove('cat-more-open');
                    // Em mobile: devolve o dropdown ao parent original e destrava o scroll leve.
                    if (_moreDropdownOrigParent) {
                        _moreDropdownOrigParent.appendChild(moreDropdown);
                        _moreDropdownOrigParent = null;
                        window.BodyScroll.unlock();
                    }
                }

                function abrirMore() {
                    // Em mobile: move o dropdown pro <body> pra escapar de stacking contexts.
                    if (window.matchMedia('(max-width: 640px)').matches) {
                        _moreDropdownOrigParent = moreDropdown.parentNode;
                        document.body.appendChild(moreDropdown);
                        window.BodyScroll.lock();
                    }
                    moreDropdown.removeAttribute('hidden');
                    moreBtn.setAttribute('aria-expanded', 'true');
                    moreBtn.classList.add('is-open');
                    document.body.classList.add('cat-more-open');
                }

                moreBtn.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (moreDropdown.hasAttribute('hidden')) abrirMore(); else fecharMore();
                });

                moreDropdown.querySelectorAll('.cat-more-option').forEach(opt => {
                    opt.addEventListener('click', e => {
                        e.stopPropagation();
                        const slug = opt.dataset.cat;
                        __slugPromovido = slug;
                        fecharMore();
                        // Escolher categoria do dropdown reseta o filtro pra "todos" no estado
                        // mas mostra apenas a categoria escolhida (sem chip ativo).
                        desativarChips();
                        const base = __produtosCache;
                        renderizarCatalogo(base, { fromFilter: true });
                        ativarAba(slug);
                    });
                });

                // Chip "categoria selecionada" — X desfaz a seleção e volta pra aba "Todos".
                const activeChip = document.getElementById('catActiveChip');
                if (activeChip) {
                    activeChip.addEventListener('click', e => {
                        e.stopPropagation();
                        __slugPromovido = null;
                        // Re-renderiza sem categoria promovida e ativa o chip "Todos".
                        aplicarFiltroChip('todos');
                    });
                }

                // Expõe fecharMore pro listener global de fechar-ao-clicar-fora.
                window.__fecharCatMore = fecharMore;
            }

            // Listener global ÚNICO para fechar dropdown ao clicar fora (não acumula).
            document.addEventListener('click', e => {
                const moreBtn = document.getElementById('catMoreBtn');
                const moreDropdown = document.getElementById('catMoreDropdown');
                if (!moreBtn || !moreDropdown) return;
                if (moreDropdown.hasAttribute('hidden')) return;
                if (moreBtn.contains(e.target) || moreDropdown.contains(e.target)) return;
                if (window.__fecharCatMore) window.__fecharCatMore();
            });

            // Identifica cards "em oferta" pelo conteúdo das faixas que ele renderiza.
            function cardEmOferta(card) {
                return !!card.querySelector('.cat-faixa--oferta, .cat-faixa--ultimas');
            }

            // Adiciona toggle discreto "Ver ofertas de [Categoria] (N)" no topo dos panels de categoria.
            // Não toca em panel-todos nem panel-ofertas-destaque.
            function injetarToggleOfertasNasCategorias() {
                document.querySelectorAll('.cat-panel').forEach(panel => {
                    const slug = panel.id.replace('panel-', '');
                    if (slug === 'todos' || slug === 'ofertas-destaque') return;

                    const grid = panel.querySelector('.cat-grid');
                    if (!grid) return;

                    const cards = Array.from(grid.querySelectorAll('.cat-card'));
                    const ofertasCount = cards.filter(cardEmOferta).length;
                    if (ofertasCount === 0) return;

                    // Pega título legível a partir da tab/option correspondente.
                    let nomeCat = slug;
                    const tab = document.querySelector(`.cat-tab[data-cat="${slug}"], .cat-more-option[data-cat="${slug}"]`);
                    if (tab) {
                        const label = tab.querySelector('.cat-more-option-label');
                        nomeCat = (label ? label.textContent : tab.textContent).replace(/\(\d+\)/, '').trim();
                    }

                    const toggle = document.createElement('button');
                    toggle.type = 'button';
                    toggle.className = 'cat-ofertas-toggle';
                    toggle.setAttribute('aria-pressed', 'false');
                    toggle.innerHTML = `
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                            <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                        <span class="cat-ofertas-toggle-label">Ver ofertas de ${nomeCat}</span>
                        <span class="cat-ofertas-toggle-count">${ofertasCount}</span>
                    `;

                    panel.insertBefore(toggle, grid);

                    toggle.addEventListener('click', () => {
                        const ativo = toggle.classList.toggle('is-active');
                        toggle.setAttribute('aria-pressed', ativo ? 'true' : 'false');
                        const label = toggle.querySelector('.cat-ofertas-toggle-label');
                        label.textContent = ativo ? `Mostrando ofertas · clique para ver tudo` : `Ver ofertas de ${nomeCat}`;

                        // Esconde cards não-oferta enquanto ativo. Marca como filtrados para a paginação respeitar.
                        cards.forEach(c => {
                            const passa = !ativo || cardEmOferta(c);
                            c.dataset.filtradoOferta = passa ? '' : '1';
                        });
                        // Re-pagina o panel considerando só cards visíveis.
                        paginarPanel(panel);
                    });
                });
            }

            // ── Paginação numerada premium aplicada a TODOS os panels (8 por página) ──
            const PRODUTOS_POR_PAGINA = 8;

            function aplicarPaginacaoEmTodosOsPanels() {
                document.querySelectorAll('.cat-panel').forEach(panel => paginarPanel(panel));
            }

            function paginarPanel(panel) {
                const grid = panel.querySelector('.cat-grid');
                if (!grid) return;

                // Remove paginação anterior, se houver.
                const oldPag = panel.querySelector('.cat-pagination');
                if (oldPag) oldPag.remove();

                const todosCards = Array.from(grid.querySelectorAll('.cat-card'));
                // Esconde imediatamente cards filtrados (toggle "Ver ofertas") — não entram na paginação.
                todosCards.forEach(c => {
                    if (c.dataset.filtradoOferta === '1') c.style.display = 'none';
                });
                const cards = todosCards.filter(c => c.dataset.filtradoOferta !== '1');
                const total = cards.length;
                const totalPaginas = Math.ceil(total / PRODUTOS_POR_PAGINA);

                if (totalPaginas <= 1) {
                    cards.forEach(c => { c.style.display = ''; });
                    return;
                }

                let paginaAtual = 1;

                function mostrarPagina(p) {
                    paginaAtual = p;
                    const inicio = (p - 1) * PRODUTOS_POR_PAGINA;
                    const fim = inicio + PRODUTOS_POR_PAGINA;
                    cards.forEach((card, i) => {
                        card.style.display = (i >= inicio && i < fim) ? '' : 'none';
                    });
                    renderControles();
                    // Scroll suave pro topo do catálogo apenas em mudança de página (não no render inicial).
                    if (p !== 1) {
                        const sec = document.getElementById('catalogo');
                        if (sec) {
                            const top = sec.getBoundingClientRect().top + window.scrollY - 100;
                            window.scrollTo({ top, behavior: 'smooth' });
                        }
                    }
                }

                function renderControles() {
                    let pag = panel.querySelector('.cat-pagination');
                    if (!pag) {
                        pag = document.createElement('nav');
                        pag.className = 'cat-pagination';
                        pag.setAttribute('aria-label', 'Paginação dos produtos');
                        panel.appendChild(pag);
                    }

                    const p = paginaAtual;
                    const itens = [];
                    const addBtn = (label, page) => itens.push({ label, page });
                    const addEllipsis = () => itens.push({ ellipsis: true });

                    if (totalPaginas <= 7) {
                        for (let i = 1; i <= totalPaginas; i++) addBtn(String(i), i);
                    } else {
                        addBtn('1', 1);
                        if (p > 3) addEllipsis();
                        for (let i = Math.max(2, p - 1); i <= Math.min(totalPaginas - 1, p + 1); i++) addBtn(String(i), i);
                        if (p < totalPaginas - 2) addEllipsis();
                        addBtn(String(totalPaginas), totalPaginas);
                    }

                    pag.innerHTML = `
                        <button class="cat-pag-arrow" type="button" data-page="${p - 1}" ${p === 1 ? 'disabled' : ''} aria-label="Página anterior">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                        </button>
                        <div class="cat-pag-numbers">
                            ${itens.map(it => it.ellipsis
                                ? `<span class="cat-pag-ellipsis" aria-hidden="true">…</span>`
                                : `<button class="cat-pag-num${it.page === p ? ' active' : ''}" type="button" data-page="${it.page}" aria-current="${it.page === p ? 'page' : 'false'}" aria-label="Página ${it.page}">${it.label}</button>`
                            ).join('')}
                        </div>
                        <button class="cat-pag-arrow" type="button" data-page="${p + 1}" ${p === totalPaginas ? 'disabled' : ''} aria-label="Próxima página">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </button>
                        <span class="cat-pag-info">Página ${p} de ${totalPaginas} · ${total} peças</span>
                    `;

                    pag.querySelectorAll('button[data-page]').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const target = parseInt(btn.dataset.page, 10);
                            if (target >= 1 && target <= totalPaginas && target !== p) {
                                mostrarPagina(target);
                            }
                        });
                    });
                }

                mostrarPagina(1);
            }

            // Desativa todos os chips visualmente (estado neutro — visão por categoria).
            // __filtroAtual continua "todos" no estado interno, mas nenhum chip fica destacado.
            function desativarChips() {
                __filtroAtual = 'todos';
                document.querySelectorAll('.cat-chip').forEach(chip => {
                    chip.classList.remove('active');
                    chip.setAttribute('aria-pressed', 'false');
                });
            }

            // Aplica filtro chip → re-renderiza o catálogo só com produtos que casam.
            // Mapeia o chip pro panel certo: "todos" → panel-todos, "ofertas" → panel-ofertas-destaque, etc.
            function aplicarFiltroChip(filtro) {
                __filtroAtual = filtro;
                document.querySelectorAll('.cat-chip').forEach(chip => {
                    const ativo = chip.dataset.filter === filtro;
                    chip.classList.toggle('active', ativo);
                    chip.setAttribute('aria-pressed', ativo ? 'true' : 'false');
                });

                const filtrados = __produtosCache.filter(p => produtoNoFiltro(p, filtro));
                renderizarCatalogo(filtrados, { fromFilter: true });

                // Define qual panel mostrar pra cada chip.
                // Como TODOS os produtos filtrados foram clonados para o panel "todos" durante
                // renderizarCatalogo, sempre exibimos o panel-todos com paginação aplicada.
                ativarAba('todos');
            }

            // Liga listeners dos chips (uma única vez no carregamento).
            document.querySelectorAll('.cat-chip').forEach(chip => {
                chip.addEventListener('click', () => aplicarFiltroChip(chip.dataset.filter));
            });

            function renderizarCatalogo(produtos, opts) {
                opts = opts || {};
                // Primeira chamada (CSV cru): popula cache para os chips reutilizarem.
                if (!opts.fromFilter) __produtosCache = produtos;

                gerarAbasDinamicas(produtos);

                document.querySelectorAll('.cat-panel').forEach(panel => {
                    const grid = panel.querySelector('.cat-grid');
                    if (grid) grid.innerHTML = '';
                });

                produtos.forEach(prod => {
                    if (prod['status *'] && prod['status *'].toLowerCase() === 'inativo') return;

                    const nome = prod['nome da peca / conjunto *'] || prod['nome'];
                    const categoria = prod['categoria *'] || prod['categoria'];
                    const tipo = prod['tipo de produto *'] || prod['tipo'];
                    const precoDe = formatarPreco(prod['preco de (r$)'] || prod['precode']);
                    const precoPor = formatarPreco(prod['preco por (r$) *'] || prod['precopor']);
                    const desconto = prod['desconto %'] || prod['desconto'];
                    const tamanhos = prod['tamanhos disponiveis *'] || prod['tamanhos'];
                    const imagem1 = prod['🖼️ imagem destaque (url)'] || prod['imagem1'];
                    // parseCSV normaliza headers: lowercase + sem acentos.
                    const material = prod['material / tecido'] || prod['material'] || '';
                    const cor = prod['cor disponivel*'] || prod['cor disponivel'] || prod['cor'] || '';
                    const descricao = prod['descricao *'] || prod['descricao'] || '';

                    if (!categoria) return;

                    const catKey = categoriaParaSlug(categoria);

                    const panel = document.getElementById(`panel-${catKey}`);
                    if (!panel) return;

                    const grid = panel.querySelector('.cat-grid');
                    if (!grid) return;

                    const card = document.createElement('article');
                    // Concatena todos os campos buscáveis num blob normalizado (sem acentos, minúsculo).
                    // A pesquisa procura nesse atributo — assim "elastano", "terra", "viscose" funcionam
                    // mesmo que esses termos não apareçam no visual do card.
                    const searchBlob = [nome, categoria, tipo, cor, material, descricao, tamanhos]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase()
                        .normalize('NFD').replace(/[̀-ͯ]/g, '');
                    card.dataset.search = searchBlob;
                    const status = (prod['status *'] || prod['status'] || '').toLowerCase().trim();
                    const esgotado = status === 'esgotado';
                    const isOfertaDestaque = status === 'últimas unidades' || status === 'ultimas unidades' || status === 'oferta especial';

                    card.className = 'cat-card' + (esgotado ? ' cat-card--esgotado' : '');
                    card.dataset.dinamico = 'true';

                    let badgeHtml = '';
                    if (esgotado) {
                        badgeHtml = `<span class="cat-faixa cat-faixa--esgotado">Esgotado</span>`;
                    } else if (status === 'últimas unidades' || status === 'ultimas unidades') {
                        badgeHtml = `<span class="cat-faixa cat-faixa--ultimas">Últimas Unidades</span>`;
                    } else if (status === 'oferta especial') {
                        badgeHtml = `<span class="cat-faixa cat-faixa--oferta">Oferta Especial</span>`;
                    } else if (desconto) {
                        const descTexto = desconto.includes('%') ? desconto : desconto + '%';
                        badgeHtml = `<span class="cat-badge">${descTexto}</span>`;
                    }

                    card.innerHTML = `
                    <div class="cat-card-img-wrap">
                        <img src="${imagem1}" alt="${nome}" class="cat-card-img" loading="lazy">
                        ${badgeHtml}
                    </div>
                    <div class="cat-card-info">
                        <h3 class="cat-card-nome">${nome}</h3>
                        <div class="cat-card-precos">
                            ${precoDe ? `<span class="cat-preco-de">${precoDe}</span>` : ''}
                            <span class="cat-preco-por">${precoPor}</span>
                        </div>
                        <span class="cat-card-tamanhos">${tamanhos || ''}</span>
                    </div>
                    ${esgotado ? '' : `
                    <button class="cat-card-sacola-btn" type="button" aria-label="Adicionar ${nome} à sacola">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                    </button>`}
                `;

                    // Click no card → abre modal. Click no botão sacola → abre popover de tamanho.
                    card.addEventListener('click', (e) => {
                        if (e.target.closest('.cat-card-sacola-btn')) {
                            e.stopPropagation();
                            window.SacolaUI.abrirPopoverTamanho(prod);
                            return;
                        }
                        abrirModalDinamico(prod);
                    });
                    grid.appendChild(card);

                    // Helper para religar o click correto em cards clonados.
                    const bindCardClicks = (c) => {
                        c.addEventListener('click', (e) => {
                            if (e.target.closest('.cat-card-sacola-btn')) {
                                e.stopPropagation();
                                window.SacolaUI.abrirPopoverTamanho(prod);
                                return;
                            }
                            abrirModalDinamico(prod);
                        });
                    };

                    // ── Aba "Todos": clona todos os produtos pra essa aba ──
                    const panelTodos = document.getElementById('panel-todos');
                    if (panelTodos) {
                        const gridTodos = panelTodos.querySelector('.cat-grid');
                        if (gridTodos) {
                            const cardTodos = card.cloneNode(true);
                            bindCardClicks(cardTodos);
                            gridTodos.appendChild(cardTodos);
                        }
                    }

                    // ── Se produto é oferta especial ou últimas unidades, também adiciona na aba Ofertas em Destaque ──
                    if (isOfertaDestaque) {
                        const panelDestaque = document.getElementById('panel-ofertas-destaque');
                        if (panelDestaque) {
                            const gridDestaque = panelDestaque.querySelector('.cat-grid');
                            if (gridDestaque) {
                                const cardDestaque = card.cloneNode(true);
                                bindCardClicks(cardDestaque);
                                gridDestaque.appendChild(cardDestaque);
                            }
                        }
                    }
                });

                // Injeta toggle "Ver ofertas de X" discreto nos panels de categoria.
                injetarToggleOfertasNasCategorias();

                // Aplica paginação premium (8 por página) em todos os panels — Todos, Ofertas, e cada categoria.
                aplicarPaginacaoEmTodosOsPanels();

                // Decide qual panel mostrar após render:
                // - Se há um chip ativo (Todos/Ofertas/Novidades), o chip é a fonte da verdade.
                // - Senão (categoria escolhida via dropdown/bento), mantém a tab ativa atual.
                const chipAtivo = document.querySelector('.cat-chip.active');
                if (chipAtivo) {
                    ativarAba('todos');
                } else if (!document.querySelector('.cat-tab.active')) {
                    ativarAba('todos');
                }
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

            // ============================================
            // SacolaUI — interface da sacola
            // ============================================
            window.SacolaUI = (function () {
                let _produtoTemp = null;   // produto selecionado no popover de tamanho
                let _tamanhoTemp = null;   // tamanho escolhido
                let _aposConfirmar = null; // callback: 'add' (vai pra sacola) ou 'comprar' (envia WhatsApp direto)

                function getCount() { return window.Sacola.count(); }

                function atualizarBadges() {
                    const c = getCount();
                    const fab = document.getElementById('sacolaFab');
                    const fabBadge = document.getElementById('sacolaBadge');
                    const navBadge = document.getElementById('navSacolaBadge');
                    const modalFab = document.getElementById('pmodal-sacola-fab');
                    const modalFabBadge = document.getElementById('pmodal-sacola-fab-badge');
                    if (fabBadge) {
                        fabBadge.textContent = c;
                        fabBadge.hidden = c === 0;
                    }
                    if (navBadge) {
                        navBadge.textContent = c;
                        navBadge.hidden = c === 0;
                    }
                    if (modalFabBadge) {
                        modalFabBadge.textContent = c;
                        modalFabBadge.hidden = c === 0;
                    }
                    document.body.classList.toggle('sacola-tem-itens', c > 0);
                    // FAB sempre visível quando sacola tem item.
                    if (fab) fab.classList.toggle('is-visible', c > 0);

                    // Anima o botão sacola do modal quando algo é adicionado (visível na hora).
                    if (modalFab && c > 0) {
                        modalFab.classList.remove('is-added');
                        // Re-disparar animação no próximo frame
                        void modalFab.offsetWidth;
                        modalFab.classList.add('is-added');
                        setTimeout(() => modalFab.classList.remove('is-added'), 600);
                    }

                    // Marca botão de sacola dos cards do produto atualmente na sacola.
                    document.querySelectorAll('.cat-card-sacola-btn').forEach(b => b.classList.remove('is-added'));
                }

                function renderPainel() {
                    const body = document.getElementById('sacolaBody');
                    const empty = document.getElementById('sacolaEmpty');
                    const footer = document.getElementById('sacolaFooter');
                    const totalEl = document.getElementById('sacolaTotal');
                    const countEl = document.getElementById('sacolaTituloCount');
                    if (!body) return;

                    const itens = window.Sacola.itens();
                    countEl.textContent = `(${itens.length})`;

                    if (itens.length === 0) {
                        body.innerHTML = '';
                        empty.hidden = false;
                        footer.style.display = 'none';
                        return;
                    }
                    empty.hidden = true;
                    footer.style.display = '';

                    body.innerHTML = itens.map(it => `
                        <div class="sacola-item" data-id="${it.id}">
                            <img src="${it.imagem || ''}" alt="${it.nome}" class="sacola-item-img" onerror="this.style.opacity=0.2">
                            <div class="sacola-item-info">
                                <h4 class="sacola-item-nome">${it.nome}</h4>
                                <span class="sacola-item-meta">${it.tamanho ? 'Tam: ' + it.tamanho : ''}</span>
                                <span class="sacola-item-preco">${window.Sacola.formatBRL(window.Sacola.parseValor(it.precoPor))}</span>
                                <div class="sacola-item-actions">
                                    <button class="sacola-qtd-btn" data-act="dec" aria-label="Diminuir">−</button>
                                    <span class="sacola-qtd-valor">${it.qtd || 1}</span>
                                    <button class="sacola-qtd-btn" data-act="inc" aria-label="Aumentar">+</button>
                                    <button class="sacola-item-remove" data-act="rm" aria-label="Remover">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('');

                    body.querySelectorAll('.sacola-item').forEach(row => {
                        const id = row.dataset.id;
                        const it = itens.find(i => i.id === id);
                        if (!it) return;
                        row.querySelector('[data-act="inc"]').addEventListener('click', () => {
                            window.Sacola.setQtd(id, (it.qtd || 1) + 1);
                        });
                        row.querySelector('[data-act="dec"]').addEventListener('click', () => {
                            if ((it.qtd || 1) <= 1) window.Sacola.remove(id);
                            else window.Sacola.setQtd(id, (it.qtd || 1) - 1);
                        });
                        row.querySelector('[data-act="rm"]').addEventListener('click', () => {
                            window.Sacola.remove(id);
                        });
                    });

                    totalEl.textContent = window.Sacola.formatBRL(window.Sacola.total());
                }

                let _sacolaPushedHistory = false;
                let _sacolaFechando = false;

                function abrirPainel() {
                    const p = document.getElementById('sacolaPainel');
                    if (!p) return;
                    renderPainel();
                    p.hidden = false;
                    // Próximo frame ativa a transição (entra deslizando da direita).
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => p.classList.add('is-open'));
                    });
                    p.setAttribute('aria-hidden', 'false');
                    window.BodyScroll.lock();
                    // Empilha estado para que o botão "voltar" do celular feche a sacola
                    // em vez de sair do site.
                    if (!_sacolaPushedHistory) {
                        history.pushState({ sacola: true }, '');
                        _sacolaPushedHistory = true;
                    }
                }

                function fecharPainel(opts) {
                    const p = document.getElementById('sacolaPainel');
                    if (!p || p.hidden || _sacolaFechando) return;
                    _sacolaFechando = true;
                    // Inicia animação de saída (drawer desliza para fora + overlay fade out).
                    p.classList.remove('is-open');
                    p.setAttribute('aria-hidden', 'true');
                    setTimeout(() => {
                        p.hidden = true;
                        window.BodyScroll.unlock();
                        _sacolaFechando = false;
                    }, 300); // bate com o transition do CSS
                    // Quando o usuário fecha pelo X/overlay, desempilha o estado que adicionamos.
                    // Quando o fechamento veio do popstate (back), o estado já saiu — não desempilhar.
                    if (_sacolaPushedHistory && !(opts && opts.fromPopState)) {
                        _sacolaPushedHistory = false;
                        history.back();
                    } else {
                        _sacolaPushedHistory = false;
                    }
                }

                // Intercepta o botão voltar do celular: se a sacola está aberta, fecha-a.
                window.addEventListener('popstate', () => {
                    const p = document.getElementById('sacolaPainel');
                    if (p && !p.hidden) {
                        fecharPainel({ fromPopState: true });
                    }
                });

                // Lista de tamanhos disponíveis a partir do campo "tamanhos" do produto.
                function parseTamanhos(produto) {
                    const raw = produto['tamanhos disponiveis *'] || produto['tamanhos'] || '';
                    return raw.split(/[\/|·,]/).map(s => s.trim()).filter(Boolean);
                }

                function abrirPopoverTamanho(produto, modoComprar) {
                    _produtoTemp = produto;
                    _tamanhoTemp = null;
                    _aposConfirmar = modoComprar ? 'comprar' : 'add';

                    const pop = document.getElementById('tamPopover');
                    const titulo = document.getElementById('tamPopoverTitulo');
                    const prodEl = document.getElementById('tamPopoverProduto');
                    const optsEl = document.getElementById('tamPopoverOpts');
                    const confirm = document.getElementById('tamPopoverConfirm');

                    const nome = produto['nome da peca / conjunto *'] || produto['nome'];
                    prodEl.textContent = nome;
                    titulo.textContent = modoComprar ? 'Escolha o tamanho' : 'Adicionar à sacola';
                    confirm.textContent = modoComprar ? 'Comprar pelo WhatsApp' : 'Adicionar à Sacola';
                    confirm.disabled = true;

                    const tamanhos = parseTamanhos(produto);
                    if (!tamanhos.length) {
                        // Produto sem tamanho — pula popover, adiciona/compra direto.
                        confirmarTamanho(null);
                        return;
                    }

                    optsEl.innerHTML = tamanhos.map(t =>
                        `<button class="tam-opt" type="button" data-tam="${t}">${t}</button>`
                    ).join('');

                    optsEl.querySelectorAll('.tam-opt').forEach(btn => {
                        btn.addEventListener('click', () => {
                            optsEl.querySelectorAll('.tam-opt').forEach(b => b.classList.remove('is-selected'));
                            btn.classList.add('is-selected');
                            _tamanhoTemp = btn.dataset.tam;
                            confirm.disabled = false;
                        });
                    });

                    pop.hidden = false;
                    pop.setAttribute('aria-hidden', 'false');
                    window.BodyScroll.lock();
                }

                function fecharPopover() {
                    const pop = document.getElementById('tamPopover');
                    if (!pop || pop.hidden) return;
                    pop.hidden = true;
                    pop.setAttribute('aria-hidden', 'true');
                    window.BodyScroll.unlock();
                    _produtoTemp = null;
                    _tamanhoTemp = null;
                    _aposConfirmar = null;
                }

                function confirmarTamanho(tamForcado) {
                    if (!_produtoTemp) return;
                    const prod = _produtoTemp;
                    const tam = tamForcado !== undefined ? tamForcado : _tamanhoTemp;
                    const item = {
                        nome: prod['nome da peca / conjunto *'] || prod['nome'],
                        precoPor: prod['preco por (r$) *'] || prod['precopor'] || '',
                        precoDe: prod['preco de (r$)'] || prod['precode'] || '',
                        imagem: prod['🖼️ imagem destaque (url)'] || prod['imagem1'] || '',
                        tamanho: tam || '',
                        link: prod['link do produto (url)'] || ''
                    };

                    if (_aposConfirmar === 'comprar') {
                        // Compra direta — envia WhatsApp com este item E o que estiver na sacola.
                        window.Sacola.finalizar(item);
                    } else {
                        window.Sacola.add(item);
                    }
                    fecharPopover();
                }

                function ligar() {
                    document.getElementById('sacolaFab')?.addEventListener('click', abrirPainel);
                    document.getElementById('navSacola')?.addEventListener('click', abrirPainel);
                    document.getElementById('sacolaClose')?.addEventListener('click', fecharPainel);
                    document.getElementById('sacolaOverlay')?.addEventListener('click', fecharPainel);
                    document.getElementById('sacolaLimpar')?.addEventListener('click', () => {
                        if (confirm('Esvaziar toda a sacola?')) window.Sacola.clear();
                    });
                    document.getElementById('sacolaFinalizar')?.addEventListener('click', () => {
                        window.Sacola.finalizar();
                    });

                    document.getElementById('tamPopoverClose')?.addEventListener('click', fecharPopover);
                    document.getElementById('tamPopoverOverlay')?.addEventListener('click', fecharPopover);
                    document.getElementById('tamPopoverConfirm')?.addEventListener('click', () => confirmarTamanho());

                    // Botão "Adicionar à Sacola" dentro do modal de produto.
                    document.getElementById('pmodal-add-sacola')?.addEventListener('click', () => {
                        if (window.__produtoDinamicoAtual) {
                            abrirPopoverTamanho(window.__produtoDinamicoAtual, false);
                        }
                    });

                    // Botão sacola flutuante minimalista (top-right do modal de produto).
                    // Abre o painel da sacola por cima do modal de produto.
                    document.getElementById('pmodal-sacola-fab')?.addEventListener('click', () => {
                        abrirPainel();
                    });

                    // Botão "Comprar pelo WhatsApp" dentro do modal — também pergunta tamanho antes.
                    document.getElementById('pmodal-cta-dinamico')?.addEventListener('click', (e) => {
                        const cta = e.currentTarget;
                        if (cta.classList.contains('pmodal-cta--aviso')) return; // produto esgotado: link de aviso (mantém comportamento)
                        if (window.__produtoDinamicoAtual) {
                            e.preventDefault();
                            abrirPopoverTamanho(window.__produtoDinamicoAtual, true);
                        }
                    });

                    // Re-renderiza painel e atualiza badges quando Sacola muda.
                    window.Sacola.onChange(() => {
                        atualizarBadges();
                        renderPainel();
                    });

                    atualizarBadges();
                }

                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', ligar);
                } else {
                    ligar();
                }

                return { abrirPainel, fecharPainel, abrirPopoverTamanho };
            })();

            // Observa quando o usuário entra/sai da seção do catálogo para esconder WhatsApp.
            (function observarCatalogo() {
                const catalogo = document.getElementById('catalogo');
                if (!catalogo || !('IntersectionObserver' in window)) return;
                const obs = new IntersectionObserver(entries => {
                    entries.forEach(e => {
                        document.body.classList.toggle('no-catalogo', e.isIntersecting);
                    });
                }, { threshold: 0.05 });
                obs.observe(catalogo);
            })();

        })();