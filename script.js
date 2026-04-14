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
        this.whatsappMessage = document.getElementById('whatsapp-message');
        this.whatsappNotify = document.querySelector('.whatsapp-notify');
        this.closeBubbleBtn = document.querySelector('.close-whatsapp-bubble');
        this.messageShown = false;
        this.init();
    }

    init() {
        if (!this.whatsappMessage) return;

        // Gatilho por tempo: 10 segundos
        setTimeout(() => this.showBubble(), 10000);

        // Gatilho por scroll: ao entrar na 3ª seção visível
        const triggerSection = document.querySelector('section:nth-of-type(3)');
        if (triggerSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => this.showBubble(), 800);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            observer.observe(triggerSection);
        }

        // Fechar ao clicar no X
        if (this.closeBubbleBtn) {
            this.closeBubbleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideBubble();
            });
        }
    }

    showBubble() {
        if (this.messageShown) return;
        this.messageShown = true;

        this.whatsappMessage.classList.add('show');

        // Auto-esconder após 12 segundos
        setTimeout(() => {
            if (this.whatsappMessage.classList.contains('show')) {
                this.hideBubble();
            }
        }, 12000);
    }

    hideBubble() {
        this.whatsappMessage.classList.remove('show');
        this.showNotification();
    }

    showNotification() {
        setTimeout(() => {
            if (this.whatsappNotify) this.whatsappNotify.classList.add('show');
        }, 4000);
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
