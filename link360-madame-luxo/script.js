/**
 * Matrix Madeiras - Links 360
 * Script principal de interatividade
 */

// ============================================
// FUNÇÃO: Ocultar/mostrar botões fixos ao rolar
// ============================================
(function () {
    let lastScrollY = 0;
    const SCROLL_THRESHOLD = 80;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const btns = document.querySelectorAll('.theme-toggle');

        if (currentScrollY > lastScrollY && currentScrollY > SCROLL_THRESHOLD) {
            btns.forEach(btn => btn.classList.add('hidden-btn'));
        } else {
            btns.forEach(btn => btn.classList.remove('hidden-btn'));
        }
        lastScrollY = currentScrollY;
    }, { passive: true });
})();


// ============================================
// CONFIGURAÇÃO GLOBAL
// ============================================
const CONFIG = window.Link360Config || {
    projectName: "matrix-madeiras",
    themeKey: "matrix-theme",
    defaultDark: false,
    greetingText: "Bem-vindo à Matrix",
    accentColor: "#2B7A1F"
};

// ============================================
// FUNÇÃO: Download vCard
// ============================================
function downloadVCard() {
    const vcardData = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${CONFIG.vcard?.fn || 'Matrix Madeiras'}`,
        `N:${CONFIG.vcard?.n || 'Matrix Madeiras;;;'}`,
        `ORG:${CONFIG.vcard?.org || 'Matrix Madeiras'}`,
        `TITLE:${CONFIG.vcard?.title || 'Madeireira - 30+ anos de tradição'}`,
        `TEL;TYPE=CELL:${CONFIG.vcard?.tel || '+5521964236743'}`,
        `TEL;TYPE=WORK:${CONFIG.vcard?.telWork || '552133165287'}`,
        `URL:${CONFIG.vcard?.url || 'https://360link.bio/matrix-madeiras/'}`,
        `ADR;TYPE=WORK:;;${CONFIG.vcard?.adr || 'Estr. Santa Eugênia, 1658;Paciência;RJ;23585-430;Brasil'}`,
        'END:VCARD'
    ].join('\n');

    const blob = new Blob([vcardData], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${CONFIG.vcard?.filename || 'Matrix_Madeiras'}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// ============================================
// FUNÇÃO: Modal System
// ============================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Animação de entrada
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.style.animation = 'none';
            setTimeout(() => {
                content.style.animation = 'modalIn 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
            }, 10);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function openImageModal(src) {
    const modal = document.getElementById('modal-image');
    const img = document.getElementById('popup-img');
    if (modal && img) {
        img.src = src;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// ============================================
// FUNÇÃO: Dynamic Greeting
// ============================================
function updateGreeting() {
    const greetings = document.querySelectorAll('.dynamic-greeting');
    const hour = new Date().getHours();
    let greeting = CONFIG.greetingText || 'Seja Bem-Vindo';
    
    if (hour >= 5 && hour < 12) {
        greeting = 'Bom Dia';
    } else if (hour >= 12 && hour < 18) {
        greeting = 'Boa Tarde';
    } else {
        greeting = 'Boa Noite';
    }
    
    greetings.forEach(el => {
        el.textContent = `${greeting} | Volte Sempre`;
    });
}

// ============================================
// FUNÇÃO: Controle de Música e Vídeo Ativo
// ============================================
function initMusicToggle() {
    const music = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle');
    const musicIcon = document.getElementById('music-icon');

    if (!musicBtn) return;

    if (music) music.volume = 0.2;

    const getActiveVideo = () => {
        const activeItem = document.querySelector('.carousel-3d-item.active');
        return activeItem ? activeItem.querySelector('video') : null;
    };

    const updateIcon = () => {
        const activeVideo = getActiveVideo();
        const videoPlaying = activeVideo && !activeVideo.paused;
        const musicPlaying = music && !music.paused;

        if (videoPlaying || musicPlaying) {
            if (musicIcon) musicIcon.className = 'fa-solid fa-volume-high text-xs';
        } else {
            if (musicIcon) musicIcon.className = 'fa-solid fa-volume-xmark text-xs';
        }
    };

    musicBtn.addEventListener('click', () => {
        const activeItem = document.querySelector('.carousel-3d-item.active');
        const activeVideo = getActiveVideo();

        if (activeVideo) {
            // Se houver vídeo ativo, o botão de som controla ele
            if (activeVideo.paused) {
                // Usa a função global para garantir consistência visual (overlay, etc)
                if (typeof window.togglePlayCarousel === 'function') {
                    window.togglePlayCarousel(activeItem);
                } else {
                    activeVideo.play();
                }
            } else {
                if (typeof window.togglePlayCarousel === 'function') {
                    window.togglePlayCarousel(activeItem);
                } else {
                    activeVideo.pause();
                }
            }
        } else if (music) {
            // Fallback para música de fundo se não houver vídeo
            if (music.paused) {
                music.play().catch(e => console.log("Erro ao tocar música:", e));
            } else {
                music.pause();
            }
        }
        updateIcon();
    });

    // Monitorar mudanças nos vídeos do carrossel
    document.addEventListener('click', (e) => {
        if (e.target.closest('.carousel-3d-item')) {
            setTimeout(updateIcon, 100);
        }
    });

    // Eventos de play/pause globais para os vídeos
    document.querySelectorAll('.carousel-3d-item video').forEach(v => {
        v.addEventListener('play', updateIcon);
        v.addEventListener('pause', updateIcon);
    });

    if (music) {
        music.addEventListener('play', updateIcon);
        music.addEventListener('pause', updateIcon);
    }
}

// ============================================
// FUNÇÃO: Theme Toggle
// ============================================
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle-custom');
    const themeIcon = document.getElementById('theme-icon');
    
    if (!themeToggle) {
        console.log('Theme toggle button not found');
        return;
    }
    
    // Verificar preferência salva
    const savedTheme = localStorage.getItem(CONFIG.themeKey);
    
    // Aplicar tema inicial (padrão é light para Matrix)
    if (savedTheme === 'dark') {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        if (themeIcon) themeIcon.className = 'fa-solid fa-moon text-xs';
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun text-sm';
    }
    
    // Toggle click handler
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation(); // Evita que outros scripts (como o core.js) disparem simultaneamente
        e.stopPropagation();
        
        const isDark = document.body.classList.contains('dark-mode');
        
        if (isDark) {
            // Switch to light
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            localStorage.setItem(CONFIG.themeKey, 'light');
            if (themeIcon) themeIcon.className = 'fa-solid fa-sun text-sm';
            console.log('Switched to light mode');
        } else {
            // Switch to dark
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            localStorage.setItem(CONFIG.themeKey, 'dark');
            if (themeIcon) themeIcon.className = 'fa-solid fa-moon text-xs';
            console.log('Switched to dark mode');
        }
    });
}



// ============================================
// FUNÇÃO: Scroll Reveal Animation
// ============================================
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    reveals.forEach(el => observer.observe(el));
}

// ============================================
// FUNÇÃO: Gallery Carousel
// ============================================
function initGalleryCarousel() {
    const carousel = document.getElementById('galleryCarousel');
    const dots = document.querySelectorAll('#galleryDots button');
    
    if (!carousel) return;
    
    let isHovering = false;
    let autoPlayInterval;
    
    function startAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(() => {
            if (isHovering) return;
            
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            const itemWidth = carousel.querySelector('div')?.offsetWidth || 300;
            const currentScroll = carousel.scrollLeft;
            
            if (currentScroll >= maxScroll - 10) {
                carousel.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                carousel.scrollBy({ left: itemWidth + 16, behavior: 'smooth' });
            }
        }, 2500); // Roda a cada 2.5s
    }
    
    function stopAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
    }
    
    // Pausar auto-play em interação
    carousel.addEventListener('mouseenter', () => isHovering = true);
    carousel.addEventListener('mouseleave', () => {
        isHovering = false;
        startAutoPlay();
    });
    carousel.addEventListener('touchstart', () => {
        isHovering = true;
        stopAutoPlay();
    }, {passive:true});
    carousel.addEventListener('touchend', () => {
        isHovering = false;
        startAutoPlay();
    }, {passive:true});

    // Iniciar só quando estiver visível
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAutoPlay();
            } else {
                stopAutoPlay();
            }
        });
    }, { threshold: 0.1 });
    observer.observe(carousel);
    
    // Atualizar dots ao scroll
    carousel.addEventListener('scroll', () => {
        const scrollLeft = carousel.scrollLeft;
        const itemWidth = carousel.querySelector('div')?.offsetWidth || 300;
        const activeIndex = Math.round(scrollLeft / (itemWidth + 16));
        
        dots.forEach((dot, index) => {
            if (index === activeIndex) {
                dot.classList.add('active-dot');
                dot.classList.remove('bg-white/20');
                dot.classList.remove('bg-brand-dark/20', 'dark:bg-white/20');
                dot.classList.add('bg-brand-main');
            } else {
                dot.classList.remove('active-dot');
                dot.classList.remove('bg-brand-main');
                dot.classList.add('bg-brand-dark/20', 'dark:bg-white/20');
            }
        });
    });

    // Clicar nos dots para navegar
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const itemWidth = carousel.querySelector('div')?.offsetWidth || 300;
            carousel.scrollTo({ left: index * (itemWidth + 16), behavior: 'smooth' });
            startAutoPlay(); // Reseta intervalo
        });
    });
}

function scrollGallery(direction) {
    const carousel = document.getElementById('galleryCarousel');
    if (carousel) {
        const itemWidth = carousel.querySelector('div')?.offsetWidth || 300;
        carousel.scrollBy({
            left: direction * (itemWidth + 16),
            behavior: 'smooth'
        });
    }
}

// ============================================
// FUNÇÃO: Video Carousel
// ============================================
function initVideoCarousel() {
    const carousel = document.getElementById('videoCarousel');
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.video-slide');
    const dots = document.querySelectorAll('.video-dot');
    const btnAtivarSom = document.getElementById('btnAtivarSom');
    let currentIndex = 0;
    let isPlaying = false;
    
    function updateSlides() {
        slides.forEach((slide, index) => {
            slide.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');
            
            if (index === currentIndex) {
                slide.classList.add('is-active');
                const video = slide.querySelector('video');
                if (video && isPlaying) {
                    video.play().catch(() => {});
                }
            } else if (index === currentIndex - 1 || (currentIndex === 0 && index === slides.length - 1)) {
                slide.classList.add('is-prev');
                const video = slide.querySelector('video');
                if (video) video.pause();
            } else if (index === currentIndex + 1 || (currentIndex === slides.length - 1 && index === 0)) {
                slide.classList.add('is-next');
                const video = slide.querySelector('video');
                if (video) video.pause();
            } else {
                slide.classList.add('is-hidden');
                const video = slide.querySelector('video');
                if (video) video.pause();
            }
        });
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    // Click on dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateSlides();
        });
    });
    
    // Click on slides
    slides.forEach((slide, index) => {
        slide.addEventListener('click', () => {
            if (index !== currentIndex) {
                currentIndex = index;
                updateSlides();
            }
        });
    });
    
    // Botão ativar som
    if (btnAtivarSom) {
        btnAtivarSom.addEventListener('click', () => {
            isPlaying = true;
            btnAtivarSom.style.display = 'none';
            updateSlides();
        });
    }
    
    // Inicializar
    updateSlides();
}

// ============================================
// FUNÇÃO: Image Comparison Slider
// ============================================
function initComparisonSlider() {
    const container = document.getElementById('comparison-container');
    const slider = document.getElementById('comparison-slider');
    
    if (!container || !slider) return;
    
    slider.addEventListener('input', (e) => {
        const value = e.target.value;
        container.style.setProperty('--exposure', `${value}%`);
    });
}

// ============================================
// FUNÇÃO: Close Modals on Backdrop Click
// ============================================
function initModalBackdrops() {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    
    backdrops.forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                backdrop.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
}

// ============================================
// FUNÇÃO: Close Modals on Escape Key
// ============================================
function initEscapeKey() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal-backdrop[style*="flex"]');
            openModals.forEach(modal => {
                modal.style.display = 'none';
            });
            document.body.style.overflow = '';
        }
    });
}

// ============================================
// FUNÇÃO: WhatsApp Message Bubble (Premium Logic)
// ============================================
function initWhatsappBubble() {
    const whatsappMessage = document.getElementById('whatsapp-message');
    const whatsappNotify = document.querySelector('.whatsapp-notify');
    const closeBubbleBtn = document.querySelector('.close-whatsapp-bubble');
    let messageShown = false;
    
    // Gatilho: Seção de Diferenciais
    const triggerSection = document.getElementById('section-diferenciais'); 

    function showWhatsappBubble() {
        if (messageShown || !whatsappMessage) return;
        messageShown = true;

        whatsappMessage.classList.add('show');
        
        // Auto-esconder após 15 segundos
        setTimeout(() => {
            if (whatsappMessage.classList.contains('show')) {
                whatsappMessage.classList.remove('show');
                showNotification();
            }
        }, 15000);
    }

    function showNotification() {
        setTimeout(() => {
            if (whatsappNotify) whatsappNotify.classList.add('show');
        }, 5000);
    }

    // Gatilho por Tempo (10 segundos)
    setTimeout(showWhatsappBubble, 10000);

    if (triggerSection && whatsappMessage) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(showWhatsappBubble, 800);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(triggerSection);
    }

    if (closeBubbleBtn && whatsappMessage) {
        closeBubbleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (whatsappMessage.classList.contains('show')) {
                whatsappMessage.classList.remove('show');
                showNotification();
            }
        });
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar alternância de tema (Prioridade)
    initThemeToggle();
    
    // 2. Atualizar saudação
    updateGreeting();
    
    // 3. Inicializar animações de scroll
    initScrollReveal();
    
    // Outros componentes
    initGalleryCarousel();
    initVideoCarousel();
    initComparisonSlider();
    initModalBackdrops();
    initEscapeKey();
    initWhatsappBubble();
    initMusicToggle();
    
    // Console log
    console.log(`%c${CONFIG.projectName}`, 'color: #2B7A1F; font-size: 20px; font-weight: bold;');
    console.log('%cMatrix Madeiras - 30+ anos de tradição', 'color: #C49A3C; font-size: 14px;');
    console.log('%cDesenvolvido por AG5 Agência', 'color: #8B5E1E; font-size: 12px;');
});

// ============================================
// EXPORTS (para uso global)
// ============================================
window.openModal = openModal;
window.closeModal = closeModal;
window.openImageModal = openImageModal;
window.downloadVCard = downloadVCard;
window.scrollGallery = scrollGallery;
