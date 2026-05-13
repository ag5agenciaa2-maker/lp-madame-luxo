# SITE DNA â€” MADAME LUXO

**Nicho:** Moda feminina varejo boutique â€” sub-nicho inclusivo (P ao Plus Size) â€” contexto de uso: landing page de conversÃ£o via WhatsApp para loja fÃ­sica com 2 unidades na Zona Oeste do Rio de Janeiro (Santa Cruz e Campo Grande), desde 2007.

**Posicionamento:** O site opera como um editorial de moda compacto: cada seÃ§Ã£o Ã© uma pÃ¡gina de revista â€” o Hero em split assimÃ©trico com clip-path diagonal projeta modernidade sem ornamento; o Bento Grid trata produto como arte; a paleta preto-amarelo-dourado transmite sofisticaÃ§Ã£o acessÃ­vel, nÃ£o luxo inacessÃ­vel. Ã‰ um site que diz "vocÃª merece isso" sem jamais intimidar.

**Stack TÃ©cnica:** HTML5 semÃ¢ntico puro + CSS Custom Properties (sem framework) | Google Fonts: Bebas Neue, DM Sans (400/500/700), Playfair Display (italic 400/500) | SVG inline para todos os Ã­cones (zero dependÃªncia de icon lib) | Vanilla ES6 classes | Schema.org: ClothingStore + FAQPage + WebSite + WebPage + BreadcrumbList | Cookie Banner: arquivo separado cookie-banner.css + cookie-banner.js

**Data de criaÃ§Ã£o:** 2026-04-14

---

## 1. IDENTIDADE VISUAL

### 1.1 Tokens de Marca â€” CSS Custom Properties

> NÃ£o hÃ¡ dark mode. O site usa Ãºnico modo. A tabela abaixo documenta todos os tokens do `:root`.

| Token CSS | Valor | Onde Ã© usado especificamente |
|---|---|---|
| `--preto-madame` | `#000000` | Background features, collection, videos, footer, navbar scrolled, about-text-box, drawer |
| `--amarelo-madame` | `#E8E000` | CTA primÃ¡rio, underline nav, divider-diamond, hero-line, ticker background, feature-title, feature-icon, bento-cta, stat-circle border, stat-number |
| `--dourado-quente` | `#C9A227` | hero-tagline color, solution-list checkmark, about-mission border-left, location meta icons, footer contact icons |
| `--off-white` | `#FAFAF7` | Background body, hero section, pain-solution section, faq section, location section; textos sobre fundo escuro |
| `--cinza-neutro` | `#8C8C8C` | Textos secundÃ¡rios, subtÃ­tulos, labels, pain/solution list items, stat-label, nav-link default |
| `--branco-puro` | `#FFFFFF` | Cards (card-pain, card-solution), whatsapp-bubble-logo bg, whatsapp-notify border |
| `--whatsapp-verde` | `#25D366` | BotÃ£o flutuante WhatsApp, online-dot, hover do btn--secondary |
| `--font-titulos` | `'Bebas Neue', sans-serif` | TÃ­tulos de seÃ§Ã£o, bento-title, feature-title, ticker, drawer-link, footer-title, section-title |
| `--font-corpo` | `'DM Sans', sans-serif` | Todo o corpo de texto, botÃµes, nav-links, labels |
| `--font-tagline` | `'Playfair Display', serif` | hero-tagline, about-mission blockquote, t-card-text (depoimentos), footer-tagline |
| `--space-xs` | `0.5rem` | Gaps e paddings mÃ­nimos |
| `--space-sm` | `1rem` | Paddings internos mÃ©dio-baixo |
| `--space-md` | `1.5rem` | Gaps de componentes |
| `--space-lg` | `2rem` | Gaps de grid |
| `--space-xl` | `3rem` | Padding de seÃ§Ãµes menores |
| `--space-2xl` | `4rem` | Padding hero, footer-grid |
| `--space-3xl` | `6rem` | Padding de seÃ§Ãµes principais (reduz para 4rem em mobile â‰¤767px) |
| `--radius-sm` | `4px` | BotÃµes CTA, nav-cta, bento-cell |
| `--radius-md` | `8px` | Cards de imagem, video-wrapper, location-hub-map |
| `--radius-lg` | `16px` | card-pain, card-solution, about-text-box, location-hub-card, drawer |
| `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.08)` | location-hub-card, location-hub-map |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.12)` | card-pain/solution, navbar--scrolled |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.16)` | card hover, about-text-box |
| `--shadow-yellow` | `0 4px 20px rgba(232,224,0,0.3)` | nav-cta:hover |
| `--transition-fast` | `200ms ease` | Links, botÃµes simples |
| `--transition-normal` | `300ms ease` | Cards, navbar, feature-item |
| `--transition-slow` | `500ms ease` | bento-image scale |
| `--transition-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | video-card entrada |
| `--transition-smooth` | `cubic-bezier(0.16, 1, 0.3, 1)` | heroTitleIn, heroImageIn, drawer |
| `--z-base` | `1` | hero-content, about-text-box |
| `--z-dropdown` | `100` | nav-toggle |
| `--z-sticky` | `200` | navbar |
| `--z-modal` | `300` | â€” |
| `--z-tooltip` | `400` | â€” |
| `--z-float` | `500` | â€” |

> Tokens adicionais do Cookie Banner (`cookie-banner.css`): `--ck-bg: #1a1a1a`, `--ck-accent: #D9B76A`, `--ck-accent-dark: #b89a5a`, `--ck-accent-rgb: 217, 183, 106`, `--ck-z-banner: 9000`, `--ck-z-overlay: 9050`, `--ck-z-modal: 9100`.

---

### 1.2 Tipografia â€” Tabela Completa

| Elemento / Classe CSS | FamÃ­lia | Peso | Tamanho Exato | Line-height | Letter-spacing | Transform | Cor |
|---|---|---|---|---|---|---|---|
| `.hero-title` | Bebas Neue | 400 | `clamp(4.5rem, 11vw, 9.5rem)` | `0.82` | `-0.02em` | â€” | `--preto-madame` (desktop) / `--off-white` (mobile) |
| `.hero-tagline` | Playfair Display | 400 | `clamp(1.6rem, 3.2vw, 2.4rem)` | â€” | â€” | italic | `--dourado-quente` (desktop) / `--amarelo-madame` (mobile) |
| `.hero-description` | DM Sans | 400 | `1.1rem` | `1.6` | â€” | â€” | `--cinza-neutro` |
| `.hero-cta` | DM Sans | 700 | `1rem` | â€” | â€” | â€” | `--off-white` |
| `.section-title` | Bebas Neue | 400 | `clamp(2.5rem, 5vw, 4rem)` | â€” | â€” | â€” | `--preto-madame` (default) |
| `.section-title--yellow` | Bebas Neue | 400 | `clamp(2.5rem, 5vw, 4rem)` | â€” | â€” | â€” | `--amarelo-madame` |
| `.section-title--light` | Bebas Neue | 400 | `clamp(2.5rem, 5vw, 4rem)` | â€” | â€” | â€” | `--off-white` |
| `.section-subtitle` | DM Sans | 400 | `1.1rem` | â€” | â€” | â€” | `--cinza-neutro` |
| `.nav-link` | DM Sans | 500 | `0.9rem` | â€” | â€” | â€” | `--preto-madame` / `--off-white` (scrolled/mobile) |
| `.nav-cta` | DM Sans | 700 | `0.85rem` | â€” | â€” | â€” | `--preto-madame` |
| `.feature-title` | Bebas Neue | 400 | `1.5rem` | â€” | `0.05em` | â€” | `--amarelo-madame` |
| `.feature-text` | DM Sans | 400 | `0.95rem` | `1.6` | â€” | â€” | `rgba(250,250,247,0.7)` |
| `.bento-title` | Bebas Neue | 400 | `1.5rem` (desktop) / `1rem` (mobile) | â€” | `0.1em` | uppercase | `--off-white` |
| `.bento-cta` | DM Sans | 700 | `0.8rem` | â€” | `0.1em` | uppercase | `--amarelo-madame` |
| `.card-pain h3, .card-solution h3` | Bebas Neue | 400 | `2rem` | â€” | `0.02em` | â€” | `--preto-madame` |
| `.card-pain p, .card-solution p` | DM Sans | 400 | `1.05rem` | `1.6` | â€” | â€” | `--cinza-neutro` |
| `.pain-list li, .solution-list li` | DM Sans | 400 | `0.95rem` | â€” | â€” | â€” | `--cinza-neutro` |
| `.video-category` | Bebas Neue | 400 | `1.5rem` (desktop) / `1.1rem` (mobile) | â€” | â€” | â€” | `--amarelo-madame` |
| `.about-subtitle` | DM Sans | 400 | `0.9rem` | â€” | `0.2em` | uppercase | `--amarelo-madame` |
| `.about-title` | Bebas Neue | 400 | `clamp(2.5rem, 5vw, 4rem)` | `1` | â€” | â€” | `--off-white` (herdado) |
| `.about-paragraph` | DM Sans | 400 | `1.05rem` | `1.8` | â€” | â€” | `rgba(250,250,247,0.8)` |
| `.about-mission p` | Playfair Display | 400 | `1.25rem` (desktop) / `1.1rem` (mobileâ‰¤479px) | â€” | â€” | italic | `--off-white` |
| `.about-mission cite` | DM Sans | 400 | `0.8rem` | â€” | `0.1em` | uppercase | `--cinza-neutro` |
| `.stat-number` | Bebas Neue | 400 | `2rem` (desktop) / `1.5rem` (mobileâ‰¤479px) | â€” | â€” | â€” | `--amarelo-madame` |
| `.stat-label` | DM Sans | 400 | `0.75rem` | `1.4` | `0.1em` | uppercase | `--cinza-neutro` |
| `.t-card-text` | Playfair Display | 400 | `1rem` | `1.65` | â€” | italic | `--off-white` |
| `.t-card-name` | DM Sans | 700 | `0.85rem` | â€” | â€” | â€” | `--off-white` |
| `.t-card-label` | DM Sans | 400 | `0.7rem` | â€” | `0.08em` | uppercase | `--cinza-neutro` |
| `.t-card-stars` | â€” | â€” | `0.75rem` | â€” | `2px` | â€” | `--amarelo-madame` |
| `.trust-title` | DM Sans | 400 | `0.8rem` | â€” | `0.05em` | uppercase | `--cinza-neutro` |
| `.trust-stars` | â€” | â€” | `0.85rem` | â€” | `1px` | â€” | `#FFD700` |
| `.ticker-item` | Bebas Neue | 400 | `1.25rem` | â€” | â€” | â€” | `--preto-madame` |
| `.ticker-separator` | Bebas Neue | 400 | `1.25rem` | â€” | â€” | â€” | `--preto-madame` (opacity 0.5) |
| `.faq-question` | DM Sans | 700 | `1.1rem` | â€” | â€” | â€” | `--preto-madame` |
| `.faq-answer` | DM Sans | 400 | herda | `1.7` | â€” | â€” | `--cinza-neutro` |
| `.location-hub-name` | Bebas Neue | 400 | `1.6rem` | `1.1` | â€” | â€” | `--preto-madame` |
| `.location-hub-tag` | DM Sans | 400 | `0.8rem` | â€” | `0.08em` | uppercase | `--cinza-neutro` |
| `.contact-bar-label` | DM Sans | 400 | `0.75rem` | â€” | `0.1em` | uppercase | `--cinza-neutro` |
| `.contact-bar-value` | DM Sans | 500 | `1rem` | â€” | â€” | â€” | `--off-white` |
| `.footer-tagline` | Playfair Display | 400 | herda | â€” | â€” | italic | `--amarelo-madame` |
| `.footer-description` | DM Sans | 400 | `0.9rem` | `1.7` | â€” | â€” | `rgba(250,250,247,0.7)` |
| `.footer-title` | Bebas Neue | 400 | `1.25rem` | â€” | â€” | â€” | `--off-white` |
| `.footer-contact-item` | DM Sans | 400 | `0.9rem` | `1.4` | â€” | â€” | `rgba(250,250,247,0.7)` |
| `.drawer-link` | Bebas Neue | 400 | `2rem` | â€” | â€” | uppercase | `--off-white` (opacity 0.7) |
| `.whatsapp-bubble-text strong` | DM Sans | 700 | `10px` | â€” | `0.02em` | uppercase | `--preto-madame` |
| `.whatsapp-bubble-text p` | DM Sans | 500 | `11px` | `1.45` | â€” | â€” | `#444` |

---

### 1.3 Sistema de Cores Funcionais â€” rgba() e Opacidades

| Valor `rgba()` | Uso EspecÃ­fico | Contexto |
|---|---|---|
| `rgba(0,0,0,0.95)` | Background navbar scrolled | `.navbar--scrolled` |
| `rgba(0,0,0,0.9)` â†’ `rgba(0,0,0,0.2)` â†’ `transparent` | Gradiente bento-overlay (bottomâ†’top) | `.bento-overlay` |
| `rgba(0,0,0,0.3)` | Overlay bento no hover | `.bento-cell:hover .bento-overlay` |
| `rgba(0,0,0,1)` â†’ `rgba(5,5,5,0.98)` â†’ `rgba(10,10,10,0.95)` â†’ `rgba(15,15,15,0.9)` â†’ `rgba(20,20,20,0.75)` â†’ `transparent` | Overlay hero mobile/tablet (::after) | `.hero-image-wrapper::after` (â‰¤1023px) |
| `rgba(0,0,0,0.08)` | shadow-sm | `.location-hub-card` |
| `rgba(0,0,0,0.12)` | shadow-md | `.card-pain/solution` |
| `rgba(0,0,0,0.16)` | shadow-lg | `.about-text-box` |
| `rgba(0,0,0,0.4)` | shadow t-card hover | `.t-card:hover box-shadow` |
| `rgba(0,0,0,0.7)` | Overlay drawer | `.drawer-overlay` |
| `rgba(232,224,0,0.3)` | shadow-yellow (nav-cta hover) | `--shadow-yellow` |
| `rgba(232,224,0,0.05)` | Fundo about-mission | `.about-mission` background |
| `rgba(250,250,247,0.7)` | feature-text, footer-description, section-subtitle--light | textos sobre fundo escuro |
| `rgba(250,250,247,0.8)` | about-paragraph | `.about-paragraph` |
| `rgba(250,250,247,0.85)` | hero-description (tablet) | `@media max-width:1023px` |
| `rgba(250,250,247,0.9)` | hero-description (mobile) | `@media max-width:767px` |
| `rgba(250,250,247,0.1)` | Bordas divisÃ³rias sutis (about-stats, footer-bottom, t-card-footer) | linhas separadoras em fundo escuro |
| `rgba(250,250,247,0.07)` | Border t-card padrÃ£o | `.t-card border` |
| `rgba(250,250,247,0.05)` | Background t-card padrÃ£o | `.t-card background-color` |
| `rgba(250,250,247,0.09)` | Background t-card hover | `.t-card:hover` |
| `rgba(250,250,247,0.08)` | contact-bar-icon bg e footer sem js | `.contact-bar-icon` |
| `rgba(250,250,247,0.3)` | Bento border interno (::after) | `.bento-cell::after` |
| `rgba(250,250,247,0.5)` | footer-copyright | `.footer-copyright` |
| `rgba(250,250,247,0.4)` | footer-legal-links | `.footer-legal-links` |
| `rgba(201,162,39,0.5)` | Borda t-card-avatar | `.t-card-avatar border` |
| `rgba(201,162,39,0.15)` | Halo/glow t-card-avatar | `.t-card-avatar box-shadow` |
| `rgba(255,255,255,0.88)` | Fundo balÃ£o WhatsApp e seta | `#whatsapp-message` |
| `rgba(255,255,255,0.5)` | Borda balÃ£o WhatsApp | `#whatsapp-message border` |
| `rgba(37,211,102,0.35)` | Sombra botÃ£o WhatsApp | `.whatsapp-float box-shadow` |
| `rgba(37,211,102,0.45)` | Sombra botÃ£o WhatsApp hover | `.whatsapp-float:hover box-shadow` |
| `rgba(255,215,0,0)` â†’ `rgba(255,215,0,0.12)` | Glow google-trust-badge pulsando | `@keyframes badge-pulse` |
| `rgba(255,215,0,0.25)` | Border google-trust-badge no pulse | `badge-pulse 50%` |
| `rgba(255,255,255,0.03)` | Fundo google-trust-badge | `.google-trust-badge` |
| `rgba(255,255,255,0.05)` | Border google-trust-badge padrÃ£o | `.google-trust-badge border` |
| `rgba(0,0,0,0.25)` | Sombra whatsapp-notify | `.whatsapp-notify box-shadow` |
| `rgba(0,0,0,0.2)` | Fundo nav-toggle mobile | `.nav-toggle` (mobile) |
| `rgba(0,0,0,0.04)` | Border location-hub-card | `.location-hub-card` |
| `rgba(0,0,0,0.06)` | Border location-hub-header bottom | `.location-hub-header border-bottom` |
| `rgba(0,0,0,0.1)` | Border faq-item bottom | `.faq-item border-bottom` |
| `rgba(0,0,0,0.15)` | Border location-hub-btn--secondary | `.location-hub-btn--secondary` |

---

### 1.4 Estilo Geral

O site adota arquitetura de **faixas alternadas** (off-white â†’ preto â†’ off-white â†’ preto â†’ off-white â†’ preto â†’ off-white â†’ preto) sem usar CSS Grid de nÃ­vel de layout global â€” cada seÃ§Ã£o Ã© responsÃ¡vel pela sua prÃ³pria cor de fundo. O container base Ã© `.container { max-width: 1400px; margin: 0 auto; padding: 0 var(--space-md); }` que expande para `max-width: 1600px` acima de 1440px. A filosofia de espaÃ§amento Ã© escalar: `--space-3xl: 6rem` nas seÃ§Ãµes principais Ã© cortado para `4rem` em mobile via media query direto no `:root`. O site nÃ£o possui dark mode â€” a "sensaÃ§Ã£o escura" Ã© obtida por seÃ§Ãµes inteiras com `background-color: var(--preto-madame)`, criando ritmo editorial que alterna tensÃ£o e leveza. O princÃ­pio visual dominante Ã© o **contraste de peso tipogrÃ¡fico**: Bebas Neue comprimida (display) em amarelo neon convive com Playfair Display itÃ¡lica (refinamento) e DM Sans utilitÃ¡ria â€” trÃªs vozes que representam "atitude", "feminilidade" e "clareza" respectivamente. `will-change: transform, opacity` aplicado em `.hero-title`, `.hero-image-wrapper`, `.bento-cell`, `.video-card`, `.ticker-track` para otimizaÃ§Ã£o de compositing.

---

## 2. LAYOUT â€” SEÃ‡ÃƒO POR SEÃ‡ÃƒO

---

### SEÃ‡ÃƒO 1 â€” NAVBAR (FIXA)

**Estrutura:**
```
<nav class="navbar" id="navbar">
  â†’ position: fixed; top:0; left:0; right:0; z-index: 200; padding: 1rem 0
  â†’ transition: background-color 300ms ease, box-shadow 300ms ease, padding 300ms ease

  <div class="nav-container">
  â†’ display: flex; align-items: center; justify-content: space-between; max-width: 1400px; margin: 0 auto; padding: 0 1.5rem

    <a class="nav-logo">
    â†’ img height: 40px; width: auto
    â†’ filter: brightness(0) invert(1) quando .navbar--scrolled OU mobile â‰¤767px

    <button class="nav-toggle" id="navToggle">   [hidden desktop, display:flex â‰¤968px]
    â†’ 44Ã—44px; background: rgba(0,0,0,0.2); backdrop-filter: blur(4px); border-radius: 50%

    <ul class="nav-menu" id="navMenu">           [oculto â‰¤968px via display:none]
    â†’ display: flex; align-items: center; gap: 2rem

    <a class="nav-cta">                           [oculto â‰¤968px via display:none]
    â†’ padding: 0.5rem 1.5rem; background: --amarelo-madame; border-radius: 4px; font-weight: 700
```

**Fundo:**
- Layer 0 â€” base: `transparent` (sem scroll)
- Layer 1 â€” scrolled: `rgba(0,0,0,0.95)` + `backdrop-filter: blur(10px)`
- Layer 2 â€” conteÃºdo: z-index 200

**Elementos Restritos:**

| Elemento | Classe / Seletor CSS | PosiÃ§Ã£o | DimensÃµes | Valores CSS Chave |
|---|---|---|---|---|
| Linha underline nav | `.nav-link::after` | `bottom:0; left:0` | `width:0â†’100%; height:2px` | `background: --amarelo-madame; transition: width 300ms ease` |
| Logo | `.nav-logo img` | â€” | `height: 40px` | `filter: brightness(0) invert(1)` quando scrolled |
| Hamburguer lines | `.hamburger-line` | â€” | `24px Ã— 2px` | `background: --preto-madame` (default) / `--off-white` (scrolled/mobile) |

**AnimaÃ§Ã£o:** Nenhuma animaÃ§Ã£o prÃ³pria â€” transiÃ§Ã£o de estado via JS ao scroll (threshold: 80px).

**Micro-interaÃ§Ãµes:**

| Elemento | Estado | transform | box-shadow | Outros | DuraÃ§Ã£o / Easing |
|---|---|---|---|---|---|
| `.nav-link::after` | hover/focus | â€” | â€” | `width: 100%` | `300ms ease` |
| `.nav-cta` | hover | `translateY(-2px)` | `0 4px 20px rgba(232,224,0,0.3)` | â€” | `200ms ease` |
| `.drawer-link` | hover | `translateX(10px)` | â€” | `opacity:1; color: --amarelo-madame` | `0.3s ease` |
| `.drawer-close` | hover | `rotate(90deg)` | â€” | â€” | `0.3s ease` |
| `.drawer-cta` | hover | `scale(1.02)` | â€” | â€” | `0.3s ease` |

**Diferenciador Visual:** O drawer mobile (`width: 320px; max-width: 85vw`) usa `transform: translateX(100%)` â†’ `translateX(0)` com `cubic-bezier(0.16, 1, 0.3, 1)` e overlay com `backdrop-filter: blur(4px)` â€” padrÃ£o chamado internamente de "AG5 Premium Drawer". Links do drawer tÃªm opacity:0.7 por padrÃ£o, e o hover os revela completamente enquanto empurra o texto 10px para a direita, simulando seleÃ§Ã£o fÃ­sica.

---

### SEÃ‡ÃƒO 2 â€” HERO

**Estrutura:**
```
<header class="hero" id="inicio">
â†’ height: 100vh; display: flex; align-items: center; background: --off-white; padding-top: 60px; overflow: hidden

  <div class="hero-container">
  â†’ display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 3rem; max-width: 1600px; padding: 1rem 0 0 4rem; height: 100%; align-items: center

    <div class="hero-content">         z-index: 1
      <h1 class="hero-title">         â€” animaÃ§Ã£o heroTitleIn
      <div class="hero-line">         â€” animaÃ§Ã£o lineExpand
      <p class="hero-tagline">        â€” animaÃ§Ã£o taglineIn
      <p class="hero-description">
      <a class="hero-cta">

    <div class="hero-image-wrapper">   opacity:0; animation: heroImageIn; align-self: end
      <img class="hero-image">
      â†’ clip-path: polygon(12% 0, 100% 0, 100% 100%, 0% 100%)
      â†’ object-position: center bottom; height: 115%; margin-top: -15%
```

**Fundo:**
- Layer 0 â€” base: `background-color: --off-white` (seÃ§Ã£o)
- Layer 1 â€” imagem: `clip-path: polygon(12% 0, 100% 0, 100% 100%, 0% 100%)` â€” corte diagonal esquerdo 12% cria o efeito de "fatia" assimÃ©trica
- Layer 2 â€” mobile/tablet: `::after` com gradiente preto multicamadas 6 stops (ver tabela rgba)

**Elementos Restritos:**

| Elemento | Classe | PosiÃ§Ã£o | DimensÃµes | Valores CSS Chave |
|---|---|---|---|---|
| Linha decorativa | `.hero-line` | abaixo do h1 | `100px Ã— 3px` | `background: --amarelo-madame; transform-origin: left; animation: lineExpand 600ms ease-out 500ms` |
| Imagem hero | `.hero-image` | right column | `width:100%; height:115%; margin-top:-15%` | `clip-path: polygon(12% 0, 100% 0, 100% 100%, 0% 100%); object-position: center bottom` |
| CTA arrow | `.cta-arrow` | inline no botÃ£o | `24Ã—24px SVG` | `transition: transform 200ms ease` |

**AnimaÃ§Ã£o:**

| Nome @keyframes | Estado inicial | Estado final | DuraÃ§Ã£o | Easing | Trigger | Delay |
|---|---|---|---|---|---|---|
| `heroTitleIn` | `opacity:0; transform: translateY(50px)` | `opacity:1; transform: translateY(0)` | `900ms` | `cubic-bezier(0.16,1,0.3,1)` | page load | `0ms` |
| `taglineIn` | `opacity:0; transform: translateX(-40px)` | `opacity:1; transform: translateX(0)` | `700ms` | `ease-out` | page load | `200ms` |
| `lineExpand` | `transform: scaleX(0)` | `transform: scaleX(1)` | `600ms` | `ease-out` | page load | `500ms` |
| `heroImageIn` | `opacity:0; transform: scale(0.94)` | `opacity:1; transform: scale(1)` | `1100ms` | `cubic-bezier(0.16,1,0.3,1)` | page load | `350ms` |

**Micro-interaÃ§Ãµes:**

| Elemento | Estado | transform | Outros | DuraÃ§Ã£o / Easing |
|---|---|---|---|---|
| `.hero-cta` | hover | `translateY(-2px)` | `background: --amarelo-madame; color: --preto-madame` | `200ms ease` |
| `.cta-arrow` | parent hover | `translateX(4px)` | â€” | `200ms ease` |

**Diferenciador Visual:** O `clip-path: polygon(12% 0, 100% 0, 100% 100%, 0% 100%)` na imagem cria um corte diagonal preciso de 12% que faz o conteÃºdo de texto "invadir" visualmente o espaÃ§o da foto sem bordas ou sombras â€” efeito impossÃ­vel de reproduzir com `border-radius` ou `margin`.

---

### SEÃ‡ÃƒO 3 â€” DOR E SOLUÃ‡ÃƒO

**Estrutura:**
```
<section class="pain-solution" id="proposito">
â†’ padding: 6rem 0; background: --off-white

  <div class="container">
    <div class="section-header">     text-align: center; margin-bottom: 4rem

    <div class="pain-solution-cards">
    â†’ display: grid; grid-template-columns: 1fr auto 1fr; gap: 3rem; align-items: start
    â†’ mobile â‰¤767px: display:flex; overflow-x:auto; scroll-snap-type: x mandatory; scrollbar-width: none

      <article class="card-pain">     â†’ opacity:0; transform:translateY(30px) â†’ is-visible
      <div class="pain-solution-divider">   â†’ padding-top: 15rem; [hidden mobile]
        <span class="divider-icon">  â†’ animaÃ§Ã£o pulseArrow
      <article class="card-solution"> â†’ opacity:0; transform:translateY(30px) â†’ is-visible
```

**Fundo:**
- Layer 0 â€” base: `--off-white`
- Layer 1 â€” cards: `background-color: --branco-puro; border-radius: 16px; box-shadow: var(--shadow-md)`

**Elementos Restritos:**

| Elemento | Classe | PosiÃ§Ã£o | DimensÃµes | Valores CSS Chave |
|---|---|---|---|---|
| Imagem do card | `card-pain img / card-solution img` | topo do card | `width:100%; height:280px` | `object-fit:cover; border-radius:8px; margin-bottom:2rem` |
| Marcador âœ• dor | `.pain-list li::before` | `left:0; absolute` | â€” | `content:'âœ•'; color:#e74c3c; font-weight:bold` |
| Marcador âœ“ soluÃ§Ã£o | `.solution-list li::before` | `left:0; absolute` | â€” | `content:'âœ“'; color:--dourado-quente; font-weight:bold` |
| Seta divisÃ³ria | `.divider-icon` | centro do grid | `font-size:2.5rem` | `color:--amarelo-madame; animation: pulseArrow 2s infinite` |

**AnimaÃ§Ã£o:**

| Nome @keyframes | 0% | 50% | 100% | DuraÃ§Ã£o | Easing | Trigger |
|---|---|---|---|---|---|---|
| `pulseArrow` | `translateX(0); opacity:0.5` | `translateX(10px); opacity:1` | `translateX(0); opacity:0.5` | `2s` | `infinite` | CSS auto |

**Micro-interaÃ§Ãµes:**

| Elemento | Estado | transform | box-shadow | DuraÃ§Ã£o |
|---|---|---|---|---|
| `.card-pain, .card-solution` | hover | `translateY(-5px)` | `var(--shadow-lg)` | `300ms ease` |
| `.solution-cta-btn` | hover | `translateX(5px)` | â€” | `200ms ease` |

**Diferenciador Visual:** No mobile â‰¤767px, os cards se transformam em um **scroll horizontal com snap** (`scroll-snap-type: x mandatory; scroll-snap-align: center; flex: 0 0 85%`), eliminando o grid de 3 colunas e criando uma experiÃªncia de carrossel nativo sem JS â€” o divisor visual desaparece (`display:none`).

---

### SEÃ‡ÃƒO 4 â€” DIFERENCIAIS (FEATURES)

**Estrutura:**
```
<section class="features" id="diferenciais">
â†’ padding: 6rem 0; background: --preto-madame; color: --off-white

  <div class="container">
    <div class="features-grid">
    â†’ display: grid; grid-template-columns: repeat(4, 1fr); gap: 3rem; text-align: center
    â†’ â‰¤992px: repeat(2,1fr) | â‰¤576px: 1fr

      <article class="feature-item">
      â†’ padding: 1.5rem; transition: transform 300ms ease
        <div class="feature-icon">  â†’ color:--amarelo-madame; display:flex; justify-content:center
        â†’ SVG 40Ã—40px stroke-width:1.5 (sem fill, apenas stroke)
        <h3 class="feature-title">
        <p class="feature-text">
```

**Fundo:**
- Layer 0 â€” base: `--preto-madame` sÃ³lido

**AnimaÃ§Ã£o:** Nenhuma animaÃ§Ã£o prÃ³pria â€” herda reveal global (nÃ£o aplicado nesta seÃ§Ã£o).

**Micro-interaÃ§Ãµes:**

| Elemento | Estado | transform | DuraÃ§Ã£o |
|---|---|---|---|
| `.feature-item` | hover | `translateY(-10px)` | `300ms ease` |

**Diferenciador Visual:** Os Ã­cones SVG sÃ£o todos inline (sem Font Awesome ou similar), com `stroke-width: 1.5` que dÃ¡ leveza editorial; a cor `--amarelo-madame` nos Ã­cones sobre fundo preto cria o contraste mÃ¡ximo sem recorrer a fundos coloridos ou cards.

---

### SEÃ‡ÃƒO 4.5 â€” DIVISOR LUX

**Estrutura:**
```
<div class="lux-divider" aria-hidden="true">
â†’ display:flex; align-items:center; justify-content:center; gap:1.5rem; padding:3rem 0; background:--preto-madame

  <div class="divider-line">
  â†’ height:1px; background: linear-gradient(to right, transparent, --amarelo-madame, transparent); flex:1; max-width:250px

  <div class="divider-diamond">
  â†’ width:8px; height:8px; background:--amarelo-madame; transform:rotate(45deg); box-shadow:0 0 10px --amarelo-madame
```

---

### SEÃ‡ÃƒO 5 â€” BENTO GRID COLEÃ‡ÃƒO

**Estrutura:**
```
<section class="collection" id="coleÃ§Ã£o">
â†’ padding: 6rem 0; background: --preto-madame

  <div class="container">
    <div class="bento-grid" role="list">
    â†’ display:grid; grid-template-columns: repeat(4,1fr); grid-auto-rows:240px; gap:1.5rem; grid-auto-flow:dense

      <article class="bento-cell [modificador]" role="listitem">
      â†’ opacity:0; transform:translateY(70px); transition: opacity 700ms ease-out, transform 700ms ease-out
      â†’ border-radius:4px; overflow:hidden; cursor:pointer
      â†’ is-visible: opacity:1; transform:translateY(0) [stagger: index Ã— 80ms]

        <img class="bento-image [bento-image--top]">
        â†’ width:100%; height:100%; object-fit:cover; transition:transform 500ms ease
        â†’ bento-image--top: object-position: center 15%

        <div class="bento-overlay">
        â†’ position:absolute; inset:0; z-index:3
        â†’ background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 40%, transparent 80%)
        â†’ display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-end; padding:2rem; gap:0.5rem

          <h3 class="bento-title">
          <a class="bento-cta">  â†’ opacity:0; transform:translateY(10px) â†’ hover: opacity:1; translateY(0)
```

**Modificadores de cÃ©lulas (grid spans):**

| Classe | grid-column | grid-row | Altura efetiva (desktop) |
|---|---|---|---|
| `.bento-cell` (default) | span 1 | span 2 | 480px + gap |
| `.bento-cell-large` | span 2 | span 3 | 720px + gap |
| `.bento-cell-tall` | span 1 | span 4 | 960px + gap |
| `.bento-cell-wide` | span 2 | span 2 | 480px + gap |

**CÃ©lulas do grid (em ordem no HTML):**

| # | Categoria | Classe de cÃ©lula | Imagem |
|---|---|---|---|
| 1 | Vestidos | `bento-cell bento-cell-large` | `madame-luxo-vestido-longo-listrado-azul.webp` |
| 2 | Blusas | `bento-cell` | `madame-luxo-blusas-decote-u-varias-cores.webp` |
| 3 | MacacÃ£o | `bento-cell` | `madame-luxo-macacao-longo-azul-claro-plus-size.webp` |
| 4 | Saia & Conjuntos | `bento-cell bento-cell-tall` | `madame-luxo-moda-feminina-marrom-plus-size.webp` |
| 5 | Bodys | `bento-cell` | `madame-luxo-conjunto-resort-preto-tela-plus-size.webp` |
| 6 | Plus Size | `bento-cell bento-cell-large` | `madame-luxo-vestido-midi-plus-size-verde.webp` |
| 7 | Cropped | `bento-cell` | `madame-luxo-conjunto-croche-off-white-feminino.webp` |
| 8 | Shorts | `bento-cell bento-cell-wide` | `madame-luxo-shorts-estilo-casual.png` |
| 9 | AcessÃ³rios | `bento-cell bento-cell-wide` | `madame-luxo-acessorios-luxo-feminino.png` |
| 10 | Macaquinho | `bento-cell` | `madame-luxo-macaquinho-rosa-feminino.webp` |
| 11 | Looks Completos | `bento-cell bento-cell-wide` | `fachada-loja-madame-luxo-vitrine.webp` |
| 12 | Nova ColeÃ§Ã£o | `bento-cell` | `madame-luxo-vestido-trico-listrado-colorido.webp` |

**Micro-interaÃ§Ãµes:**

| Elemento | Estado | transform | Outros | DuraÃ§Ã£o / Easing |
|---|---|---|---|---|
| `.bento-image` | parent hover | `scale(1.04)` | â€” | `500ms ease` |
| `.bento-title` | parent hover | `translateY(-5px)` | â€” | `400ms cubic-bezier(0.23,1,0.32,1)` |
| `.bento-cta` | parent hover | `translateY(0)` | `opacity:1` | `400ms ease` |
| `.bento-cta::after` (â†’) | self hover | `translateX(5px)` | â€” | `300ms ease` |
| `.bento-cell::after` | hover | â€” | `opacity:1` (borda 1px off-white 30% inset 0.5rem) | `300ms ease-in-out` |

**Diferenciador Visual:** O `grid-auto-flow: dense` preenche lacunas automaticamente â€” combinado com `grid-auto-rows: 240px` base e mÃºltiplos `span`, cria uma composiÃ§Ã£o editorial que parece manual mas Ã© 100% algorÃ­tmica. Em mobile, `grid-auto-rows: 150px` e gaps menores (`--space-xs`) dÃ£o o look de moodboard de moda.

---

### SEÃ‡ÃƒO 6 â€” VÃDEOS EM DESTAQUE

**Estrutura:**
```
<section class="videos" id="videos">
â†’ padding: 6rem 0; background: --preto-madame

  <div class="container">
    <div class="videos-grid" role="list">
    â†’ display:grid; grid-template-columns: repeat(4,1fr); gap:1.5rem
    â†’ â‰¤1023px: repeat(2,1fr)
    â†’ â‰¤767px: repeat(2,1fr) com efeito escadinha (margin-top variÃ¡vel)

      <article class="video-card">
      â†’ opacity:0; transform:scale(0.9) â†’ is-visible [stagger: index Ã— 120ms]
      â†’ transition: opacity 650ms cubic-bezier(0.34,1.56,0.64,1), transform 650ms ...

        <div class="video-wrapper">
        â†’ position:relative; aspect-ratio:9/16; border-radius:8px; overflow:hidden

          <video autoplay muted loop playsinline>
          â†’ class="video-element"; width:100%; height:100%; object-fit:cover
          â†’ src: CDN filesafe.space

          <div class="video-overlay">
          â†’ position:absolute; bottom:0; left:0; right:0; padding:1.5rem
          â†’ background: linear-gradient(to top, rgba(0,0,0,0.8), transparent)
            <span class="video-category">  â†’ Bebas Neue 1.5rem --amarelo-madame
```

**VÃ­deos no HTML (CDN filesafe.space):**

| # | Poster (local) | Label | CDN Path |
|---|---|---|---|
| 1 | `madame-luxo-hero-colecao-verde-menta.webp` | ColeÃ§Ã£o | `69d95d9761984c734e07ba95.mp4` |
| 2 | `madame-luxo-conjunto-preto-plus-size-inclusiva.webp` | Estilo | `69d95d97019dc508d3163f22.mp4` |
| 3 | `madame-luxo-macacao-longo-azul-claro-plus-size.webp` | TendÃªncias | `69d95d9723917331fbd58d22.mp4` |
| 4 | `madame-luxo-moda-feminina-marrom-plus-size.webp` | Exclusivo | `69d95d9723917331fbd58d23.mp4` |

**Efeito Escadinha Mobile (â‰¤767px):**

| Filho | margin-top | z-index |
|---|---|---|
| `:nth-child(1)` | `0` | `2` |
| `:nth-child(2)` | `4rem` | â€” |
| `:nth-child(3)` | `-2rem` | â€” |
| `:nth-child(4)` | `2rem` | â€” |

**Detalhe adicional mobile:** `.video-card::after { content:''; position:absolute; top:10px; left:10px; right:10px; bottom:10px; border: 1px solid --amarelo-madame; opacity:0.3; z-index:-1; border-radius:8px; }` â€” borda deslocada interna que cria profundidade.

**Diferenciador Visual:** Os vÃ­deos com `aspect-ratio: 9/16` (formato Reels/Stories) exibidos em grid 4 colunas criam uma galeria de conteÃºdo vertical incomum para desktop â€” lembra uma vitrine de Instagram integrada ao site.

---

### SEÃ‡ÃƒO 7 â€” SOBRE / CREDENCIAIS

**Estrutura:**
```
<section class="about" id="sobre">
â†’ position:relative; min-height:65vh; display:flex; align-items:center

  <div class="about-container reveal-left">
  â†’ display:grid; grid-template-columns: 50% 50%; width:100%; min-height:65vh

    <div class="about-image-wrapper">
    â†’ position:relative; overflow:hidden
      <img class="about-image">
      â†’ width:100%; height:100%; object-fit:cover; object-position: left center

    <div class="about-content">
    â†’ display:flex; align-items:center; padding:3rem

      <div class="about-text-box reveal-right">
      â†’ background: --preto-madame; padding: 2rem 4rem; border-radius:16px
      â†’ color:--off-white; max-width:780px; margin-left:-120px  â† sobreposiÃ§Ã£o chave
      â†’ z-index:1; box-shadow: var(--shadow-lg)

        <blockquote class="about-mission">
        â†’ border-left: 2px solid --amarelo-madame; padding: 0.5rem 2rem
        â†’ background: rgba(232,224,0,0.05)

        <div class="about-stats reveal-right">
        â†’ display:grid; grid-template-columns: repeat(3,1fr); gap:1.5rem
        â†’ border-top: 1px solid rgba(250,250,247,0.1)

          <div class="stat-item">
            <div class="stat-circle">
            â†’ width:80px; height:80px; border:1px solid --amarelo-madame; border-radius:50%
              <span class="stat-number" data-target="[N]">0</span>
              <span class="stat-plus">+</span>   [apenas no 1Âº]
```

**Stats (data-target values):**

| Stat | data-target | Label |
|---|---|---|
| Anos | `19` | Anos de HistÃ³ria |
| Lojas | `2` | Lojas FÃ­sicas |
| Bairros | `12` | Bairros Atendidos |

**Micro-interaÃ§Ãµes:**

| Elemento | Estado | transform | Outros | DuraÃ§Ã£o |
|---|---|---|---|---|
| `.stat-circle` | parent hover | `scale(1.1)` | `background: --amarelo-madame` | `300ms ease` |
| `.stat-number, .stat-plus` | parent hover | â€” | `color: --preto-madame` | `300ms ease` |

**Diferenciador Visual:** `margin-left: -120px` no `.about-text-box` Ã© a propriedade que faz a caixa de texto "sair" do seu container e sobrepor a imagem â€” criando a ilusÃ£o de profundidade em um grid estÃ¡tico.

---

### SEÃ‡ÃƒO 8 â€” DEPOIMENTOS (MARQUEE)

**Estrutura:**
```
<section class="testimonials" id="depoimentos">
â†’ padding: 6rem 0; background: --preto-madame

  <div class="testimonials-header">
  â†’ text-align:center; margin-bottom:4rem; animation: testimonials-header-in 0.8s ease both

    <div class="google-trust-badge">
    â†’ inline-flex; gap:1.5rem; background:rgba(255,255,255,0.03); padding:0.5rem 2rem
    â†’ border-radius:var(--radius-full); border: 1px solid rgba(255,255,255,0.05)
    â†’ animation: badge-pulse 3s ease-in-out 1.2s infinite

  <div class="t-scroll-wrapper">
  â†’ overflow-x:hidden; width:100%; scrollbar-width:none

    <div class="t-scroll-track">
    â†’ display:flex; width:max-content; gap:2rem; padding:1rem 1rem 3rem
    â†’ animation: scrollReviewsLP 60s linear infinite
    â†’ hover: animation-play-state: paused
    â†’ mobile â‰¤767px: animation-duration: 45s

      <article class="t-card">  [3 originais + 3 duplicatas + 3 duplicatas = 9 total]
      â†’ flex-shrink:0; min-width:300px; max-width:360px
      â†’ background:rgba(250,250,247,0.05); border:1px solid rgba(250,250,247,0.07)
      â†’ border-radius:2rem; padding:2rem; gap:1.5rem
```

**Reviewers:**

| # | Nome | Iniciais Avatar | Label |
|---|---|---|---|
| 1 | Rose GonÃ§alves | RG | Google Review |
| 2 | Marcella Jayme | MJ | Google Review |
| 3 | Rayza Cruz | RC | Google Review |

> Cada set Ã© duplicado 3Ã— (total 9 cards) com `aria-hidden="true"` nos sets 2 e 3 para o scroll infinito. A animaÃ§Ã£o desloca `-33.333%` do total para retornar perfeitamente.

**Diferenciador Visual:** O badge `google-trust-badge` pulsa com `box-shadow: 0 0 12px 2px rgba(255,215,0,0.12)` e `border-color: rgba(255,215,0,0.25)` a cada 3s, atraindo atenÃ§Ã£o para a prova social sem animaÃ§Ã£o invasiva.

---

### SEÃ‡ÃƒO 9 â€” TICKER

**Estrutura:**
```
<div class="ticker" aria-hidden="true">
â†’ background: --amarelo-madame; padding: 1rem 0; overflow:hidden; width:100%

  <div class="ticker-track">
  â†’ display:flex; animation: ticker 20s linear infinite; white-space:nowrap; width:max-content

    <span class="ticker-item">MADAME LUXO</span>
    <span class="ticker-separator">â€¢</span>  [opacity:0.5]
    ... [conteÃºdo triplicado para loop contÃ­nuo]
```

**Itens do ticker:** MADAME LUXO â€¢ MODA FEMININA â€¢ PLUS SIZE â€¢ SANTA CRUZ â€¢ CAMPO GRANDE â€¢ DESDE 2007 (triplicado)

---

### SEÃ‡ÃƒO 10 â€” FAQ

**Estrutura:**
```
<section class="faq" id="faq">
â†’ padding: 6rem 0; background: --off-white

  <div class="faq-list">  max-width:800px; margin:0 auto

    <details class="faq-item">
    â†’ border-bottom: 1px solid rgba(0,0,0,0.1); margin-bottom:1rem

      <summary class="faq-question">
      â†’ display:flex; justify-content:space-between; padding:1.5rem 0; font-weight:700; cursor:pointer
      â†’ ::-webkit-details-marker { display:none }

        <svg class="faq-icon">  â†’ transition:transform 200ms ease
        â†’ [open] state: transform:rotate(180deg)

      <div class="faq-answer">
      â†’ padding-bottom:1.5rem; color:--cinza-neutro; line-height:1.7
        <p> â†’ padding-right:3rem
```

**FAQs (5 perguntas):**
1. VocÃªs atendem plus size?
2. VocÃªs fazem entrega?
3. Quais bairros vocÃªs atendem?
4. Como comprar online?
5. Qual o horÃ¡rio de funcionamento?

**Diferenciador Visual:** Usa `<details>/<summary>` nativo HTML sem JS para o toggle bÃ¡sico â€” o JS (`FAQAccordion`) apenas adiciona o comportamento de accordion (fecha outros ao abrir um), sem reinventar o componente.

---

### SEÃ‡ÃƒO 11 â€” LOCALIZAÃ‡ÃƒO E CONTATO

**Estrutura:**
```
<section class="location" id="contato">
â†’ padding: 6rem 0; background: --off-white

  <div class="container">
    <div class="location-hub">
    â†’ display:grid; grid-template-columns: repeat(2,1fr); gap:2rem; margin-bottom:4rem

      <div class="location-hub-col">   [Santa Cruz]
        <article class="location-hub-card">
        â†’ background: linear-gradient(145deg, --branco-puro 0%, #f5f5f2 100%)
        â†’ border-radius:16px; padding:3rem; box-shadow: var(--shadow-sm)
        â†’ border: 1px solid rgba(0,0,0,0.04)

          <div class="location-hub-header">
            <div class="location-hub-icon">  52Ã—52px; bg:--preto-madame; color:--amarelo-madame; border-radius:8px
            <div>
              <p class="location-hub-name">  Bebas Neue 1.6rem
              <span class="location-hub-tag">  DM Sans 0.8rem uppercase

          <address class="location-hub-address">
          <div class="location-hub-meta">  [Ã­cones + horÃ¡rio + telefone]
          <div class="location-hub-actions">   [2 botÃµes: primary + secondary]

      <div class="location-hub-col">   [Campo Grande]
        [mesma estrutura]
        <div class="location-hub-map">
        â†’ border-radius:8px; overflow:hidden; min-height:280px
          <iframe>  Google Maps embed

    <div class="contact-bar">
    â†’ display:flex; justify-content:space-between; gap:2rem
    â†’ background:--preto-madame; border-radius:16px; padding:3rem 4rem
    â†’ 3 itens separados por .contact-bar-divider (1px Ã— 50px rgba(250,250,247,0.1))
```

**Lojas:**

| Loja | EndereÃ§o | CEP |
|---|---|---|
| Santa Cruz | R. Felipe Cardoso, 329 â€“ Loja 19, Santa Cruz | 23520-790 |
| Campo Grande | Estrada do Campinho, 6006 â€“ Loja D, Galeria Oeste Field | 23072-200 |

**Itens do Contact Bar:** WhatsApp (21) 98850-1459 | Instagram @madamenoluxo | HorÃ¡rio Segâ€“Sab 10hâ€“19h

---

### SEÃ‡ÃƒO 12 â€” RODAPÃ‰

**Estrutura:**
```
<footer class="footer">
â†’ padding: 6rem 0 1rem; background: --preto-madame; color: --off-white

  <div class="footer-grid">
  â†’ display:grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap:3rem; padding:0 4rem
  â†’ â‰¤1023px: repeat(2,1fr) | â‰¤767px: 1fr

    Col 1: Logo + tagline Playfair italic amarela + descriÃ§Ã£o + lista de contatos
    Col 2: TÃ­tulo "NavegaÃ§Ã£o" + links Ã¢ncoras
    Col 3: TÃ­tulo "HorÃ¡rios" + dias/horÃ¡rios
    Col 4: TÃ­tulo "Siga-nos" + links redes sociais

  <div class="footer-bottom">
  â†’ display:flex; justify-content:space-between; padding: var(--space-lg) 4rem
  â†’ border-top: 1px solid rgba(250,250,247,0.1)
    Left: copyright + links legais (rgba 0.5 / 0.4)
    Right: crÃ©dito "Desenvolvido por AG5 AGÃŠNCIA" link --amarelo-madame font-weight:700
```

**Logo no footer:** `filter: brightness(0) invert(1)` â€” inverte a logo escura para branca.

---

### SEÃ‡ÃƒO 13 â€” WHATSAPP FLUTUANTE (FIXED)

**Estrutura:**
```
<div class="whatsapp-container">
â†’ position:fixed; bottom:24px; right:24px; z-index:999
â†’ mobile â‰¤576px: bottom:16px; right:16px

  <div id="whatsapp-message">
  â†’ width:250px; position:absolute; bottom:70px; right:0; padding:12px 28px 12px 12px
  â†’ background:rgba(255,255,255,0.88); backdrop-filter:blur(14px) saturate(180%)
  â†’ border-radius:14px; border:1px solid rgba(255,255,255,0.5)
  â†’ box-shadow:0 10px 30px -5px rgba(0,0,0,0.12)
  â†’ opacity:0; visibility:hidden; transform:translateY(12px) scale(0.96)
  â†’ transition: all 0.5s cubic-bezier(0.19,1,0.22,1)
  â†’ .show: opacity:1; visibility:visible; transform:translateY(0) scale(1)

    ::after (seta apontando para baixo)
    â†’ width:12px; height:12px; bottom:-6px; right:24px
    â†’ background:rgba(255,255,255,0.88); transform:rotate(45deg)

    <div class="whatsapp-bubble-content">  flex; gap:10px
      <div class="whatsapp-bubble-logo-wrapper">  position:relative
        <img class="whatsapp-bubble-logo">  36Ã—36px; border-radius:50%; border:2px solid #25d366
        <span class="whatsapp-online-dot">  10Ã—10px; bg:#25d366; bottom:0; right:0; border:2px solid #fff

      <div class="whatsapp-bubble-text">
        <strong>  10px uppercase 0.02em tracking
        <p>  11px color:#444

      <button class="close-whatsapp-bubble">  position:absolute; top:5px; right:6px; opacity:0.6

  <div class="whatsapp-notify">
  â†’ position:absolute; top:-4px; right:-4px; bg:#ff3b30; width:20px; height:20px
  â†’ border-radius:50%; border:2px solid --branco-puro; font-size:11px; font-weight:800
  â†’ opacity:0; transform:scale(0)
  â†’ .show: opacity:1; scale(1); animation:notify-pulse 1.5s 0.5s 3

  <a class="whatsapp-float">
  â†’ width:56px; height:56px; bg:--whatsapp-verde; border-radius:50%; z-index:1001
  â†’ box-shadow:0 6px 20px rgba(37,211,102,0.35)
  â†’ ::before: animation:whatsapp-pulse 2s infinite (anel expansivo)
```

---

### SEÃ‡ÃƒO 14 â€” COOKIE BANNER

**Estrutura:**
```
<div class="ck-banner">
â†’ position:fixed; bottom:0; left:0; right:0; z-index:9000
â†’ background:#1a1a1a; border-top:1px solid rgba(217,183,106,0.12)
â†’ box-shadow:0 -4px 24px rgba(0,0,0,0.22); backdrop-filter:blur(10px)
â†’ transform:translateY(100%) â†’ .ck-banner--visible: translateY(0)

  <div class="ck-banner__inner">  max-width:1280px; padding:10px 28px; flex; gap:16px

    <div class="ck-banner__content">  title + text + link
    <div class="ck-banner__actions">  3 botÃµes: primary(aceitar) + outline(rejeitar) + ghost(personalizar)

<div class="ck-modal">  (modal de personalizaÃ§Ã£o)
â†’ position:fixed; inset:0; z-index:9100; opacity:0 â†’ .ck-modal--visible: opacity:1
  <div class="ck-modal__box">
  â†’ border-top:2px solid #D9B76A; border-radius:12px; max-width:520px; max-height:88vh
  â†’ transform:translateY(14px) scale(0.98) â†’ visible: translateY(0) scale(1)
  â†’ toggles (34Ã—19px) para NecessÃ¡rios (sempre on), AnalÃ­ticos, Marketing

<div class="ck-toast">  feedback de confirmaÃ§Ã£o
â†’ position:fixed; bottom:20px; left:50%; transform:translateX(-50%) translateY(16px)
â†’ border:1px solid rgba(217,183,106,0.28)
â†’ .ck-toast--visible: opacity:1; translateX(-50%) translateY(0)
```

---

## 3. COMPONENTES REUTILIZÃVEIS

```css
/* â”€â”€â”€ BOTÃƒO CTA PRIMÃRIO (fundo escuro) â”€â”€â”€ */
.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background-color: #000000;
  color: #FAFAF7;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 200ms ease, color 200ms ease, transform 200ms ease;
}
.hero-cta:hover {
  background-color: #E8E000;
  color: #000000;
  transform: translateY(-2px);
}
.hero-cta:hover .cta-arrow {
  transform: translateX(4px);
}

/* â”€â”€â”€ BOTÃƒO NAV CTA (amarelo) â”€â”€â”€ */
.nav-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  background-color: #E8E000;
  color: #000000;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  border-radius: 4px;
  text-decoration: none;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.nav-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(232, 224, 0, 0.3);
}

/* â”€â”€â”€ BOTÃƒO SOLUÃ‡ÃƒO CTA â”€â”€â”€ */
.solution-cta-btn {
  display: inline-flex;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #000000;
  color: #FAFAF7;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 200ms ease, transform 200ms ease;
}
.solution-cta-btn:hover {
  background-color: #E8E000;
  color: #000000;
  transform: translateX(5px);
}

/* â”€â”€â”€ BOTÃƒO LOCATION HUB PRIMÃRIO â”€â”€â”€ */
.location-hub-btn--primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 4px;
  flex: 1;
  background-color: #000000;
  color: #FAFAF7;
  text-decoration: none;
  transition: all 200ms ease;
}
.location-hub-btn--primary:hover {
  background-color: #E8E000;
  color: #000000;
}

/* â”€â”€â”€ BOTÃƒO LOCATION HUB SECUNDÃRIO (WhatsApp) â”€â”€â”€ */
.location-hub-btn--secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 4px;
  flex: 1;
  background-color: transparent;
  color: #000000;
  border: 1.5px solid rgba(0, 0, 0, 0.15);
  text-decoration: none;
  transition: all 200ms ease;
}
.location-hub-btn--secondary:hover {
  background-color: #25D366;
  border-color: #25D366;
  color: #FFFFFF;
}

/* â”€â”€â”€ CARD DOR / SOLUÃ‡ÃƒO â”€â”€â”€ */
.card-pain,
.card-solution {
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  opacity: 0;
  transform: translateY(30px);
  transition: transform 300ms ease, box-shadow 300ms ease,
              opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.card-pain.is-visible,
.card-solution.is-visible {
  opacity: 1;
  transform: translateY(0);
}
.card-pain:hover,
.card-solution:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
}

/* â”€â”€â”€ BENTO CELL â”€â”€â”€ */
.bento-cell {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transform: translateY(70px);
  transition: opacity 700ms ease-out, transform 700ms ease-out;
  grid-row: span 2;
  will-change: transform, opacity;
}
.bento-cell.is-visible {
  opacity: 1;
  transform: translateY(0);
}
/* Borda interna hover */
.bento-cell::after {
  content: '';
  position: absolute;
  inset: 0.5rem;
  border: 1px solid rgba(250, 250, 247, 0.3);
  opacity: 0;
  transition: opacity 300ms ease-in-out;
  pointer-events: none;
  z-index: 2;
}
.bento-cell:hover::after { opacity: 1; }
.bento-cell:hover .bento-image { transform: scale(1.04); }
.bento-cell:hover .bento-title { transform: translateY(-5px); }
.bento-cell:hover .bento-cta { opacity: 1; transform: translateY(0); }

/* â”€â”€â”€ TESTIMONIAL CARD â”€â”€â”€ */
.t-card {
  flex-shrink: 0;
  min-width: 300px;
  max-width: 360px;
  background-color: rgba(250, 250, 247, 0.05);
  border: 1px solid rgba(250, 250, 247, 0.07);
  border-radius: 2rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}
.t-card:hover {
  background-color: rgba(250, 250, 247, 0.09);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 215, 0, 0.2);
}

/* â”€â”€â”€ AVATAR INICIAL (sem imagem) â”€â”€â”€ */
.t-card-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(201, 162, 39, 0.5);
  box-shadow: 0 0 0 2px rgba(201, 162, 39, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: #E8E000;
  flex-shrink: 0;
}

/* â”€â”€â”€ STAT CIRCLE â”€â”€â”€ */
.stat-circle {
  width: 80px;
  height: 80px;
  border: 1px solid #E8E000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 300ms ease;
}
.stat-item:hover .stat-circle {
  transform: scale(1.1);
  background-color: #E8E000;
}
.stat-item:hover .stat-number,
.stat-item:hover .stat-plus {
  color: #000000;
}

/* â”€â”€â”€ DIVISOR LUX â”€â”€â”€ */
.lux-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 3rem 0;
  background-color: #000000;
}
.divider-line {
  height: 1px;
  background: linear-gradient(to right, transparent, #E8E000, transparent);
  flex: 1;
  max-width: 250px;
}
.divider-diamond {
  width: 8px;
  height: 8px;
  background-color: #E8E000;
  transform: rotate(45deg);
  box-shadow: 0 0 10px #E8E000;
}

/* â”€â”€â”€ DRAWER MOBILE (AG5 PREMIUM) â”€â”€â”€ */
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  max-width: 85vw;
  height: 100vh;
  background-color: #000000;
  z-index: 9999;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
  transform: translateX(100%);
  visibility: hidden;
}
.drawer.is-open {
  transform: translateX(0);
  visibility: visible;
}
.drawer-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9998;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
.drawer-overlay.is-active {
  opacity: 1;
  visibility: visible;
}

/* â”€â”€â”€ SISTEMA REVEAL ON SCROLL â”€â”€â”€ */
.reveal-left {
  opacity: 0;
  transform: translateX(-60px);
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.8s ease;
  will-change: transform, opacity;
}
.reveal-right {
  opacity: 0;
  transform: translateX(60px);
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.8s ease;
  will-change: transform, opacity;
}
.reveal-left.is-visible,
.reveal-right.is-visible {
  opacity: 1;
  transform: translateX(0);
}
/* Mobile: reveal desligado */
@media (max-width: 767px) {
  .reveal-left,
  .reveal-right {
    transform: translateX(0) !important;
    opacity: 1 !important;
    transition: none !important;
  }
}

/* â”€â”€â”€ WHATSAPP BOTÃƒO FLUTUANTE â”€â”€â”€ */
.whatsapp-float {
  width: 56px;
  height: 56px;
  background-color: #25D366;
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  position: relative;
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.35);
  z-index: 1001;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
}
.whatsapp-float:hover {
  transform: scale(1.1) rotate(5deg);
  background-color: #128c7e;
  box-shadow: 0 12px 30px rgba(37, 211, 102, 0.45);
}
/* Anel de pulso */
.whatsapp-float::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background-color: #25D366;
  z-index: 0;
  animation: whatsapp-pulse 2s infinite;
  pointer-events: none;
}

/* â”€â”€â”€ LOCATION HUB CARD â”€â”€â”€ */
.location-hub-card {
  background: linear-gradient(145deg, #FFFFFF 0%, #f5f5f2 100%);
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  transition: transform 300ms ease, box-shadow 300ms ease;
}
.location-hub-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
```

---

## 4. SISTEMA GLOBAL DE ANIMAÃ‡Ã•ES

| Nome | 0% | 50% | 100% | DuraÃ§Ã£o padrÃ£o | Easing | Onde Ã© usado |
|---|---|---|---|---|---|---|
| `heroTitleIn` | `opacity:0; translateY(50px)` | â€” | `opacity:1; translateY(0)` | `900ms` | `cubic-bezier(0.16,1,0.3,1)` | `.hero-title` (autoplay page load) |
| `taglineIn` | `opacity:0; translateX(-40px)` | â€” | `opacity:1; translateX(0)` | `700ms` | `ease-out` | `.hero-tagline` (delay 200ms) |
| `lineExpand` | `scaleX(0)` | â€” | `scaleX(1)` | `600ms` | `ease-out` | `.hero-line` (delay 500ms) |
| `heroImageIn` | `opacity:0; scale(0.94)` | â€” | `opacity:1; scale(1)` | `1100ms` | `cubic-bezier(0.16,1,0.3,1)` | `.hero-image-wrapper` (delay 350ms) |
| `whatsapp-pulse` | `scale(1); opacity:0.5` | â€” | `scale(1.6); opacity:0` | `2s` | linear | `.whatsapp-float::before` (infinite) |
| `notify-pulse` | `scale(1)` | `scale(1.25)` | `scale(1)` | `1.5s` | `ease-in-out` | `.whatsapp-notify.show` (delay 0.5s, 3x) |
| `pulseArrow` | `translateX(0); opacity:0.5` | `translateX(10px); opacity:1` | `translateX(0); opacity:0.5` | `2s` | â€” | `.divider-icon` (infinite) |
| `scrollReviewsLP` | `translateX(0)` | â€” | `translateX(-33.333%)` | `60s` (45s mobile) | `linear` | `.t-scroll-track` (infinite, pausa no hover) |
| `ticker` | `translateX(0)` | â€” | `translateX(-50%)` | `20s` | `linear` | `.ticker-track` (infinite) |
| `marquee` | `translateX(0)` | â€” | `translateX(-50%)` | â€” | â€” | Definido mas nÃ£o usado no HTML atual |
| `testimonials-header-in` | `opacity:0; translateY(28px)` | â€” | `opacity:1; translateY(0)` | `0.8s` | `ease` | `.testimonials-header` |
| `badge-pulse` | `box-shadow:0; border:rgba(255,255,255,0.05)` | `box-shadow:0 0 12px 2px rgba(255,215,0,0.12); border:rgba(255,215,0,0.25)` | igual 0% | `3s` | `ease-in-out` | `.google-trust-badge` (delay 1.2s, infinite) |

---

## 5. COMPORTAMENTOS JAVASCRIPT

| FunÃ§Ã£o / Comportamento | Trigger | AÃ§Ã£o executada | Classes add/remove | Elementos afetados |
|---|---|---|---|---|
| `NavbarController.bindScroll()` | `scroll` event (debounce 50ms) | `scrollY > 80` â†’ add class | `.navbar--scrolled` no `#navbar` | Navbar muda fundo, padding, cor logo/links |
| `NavbarController.bindMobileMenu()` â€” openMenu | `click #navToggle` | Abre drawer | `.is-open` no `#drawerMenu`, `.is-active` no `#drawerOverlay`, `body.style.overflow='hidden'` | Drawer + overlay + scroll lock |
| `NavbarController.bindMobileMenu()` â€” closeMenu | `click #drawerClose` ou `click overlay` ou `click .drawer-link` | Fecha drawer | Remove `.is-open` e `.is-active`, `body.style.overflow=''` | Drawer + overlay |
| `NavbarController.bindSmoothScroll()` | `click .nav-link[href^="#"]` | Scroll suave + offset 80px | â€” | `window.scrollTo({ top: offsetTop-80, behavior:'smooth' })` |
| `ScrollAnimations.observeBentoCells()` | IntersectionObserver threshold:0.15 rootMargin:-50px | Adiciona com stagger (index Ã— 80ms) | `.is-visible` em cada `.bento-cell` | Bento grid cells entram de baixo |
| `ScrollAnimations.observeVideoCards()` | IntersectionObserver threshold:0.15 rootMargin:-50px | Adiciona com stagger (index Ã— 120ms) | `.is-visible` em cada `.video-card` | Cards de vÃ­deo escalam de 0.9â†’1 |
| `ScrollAnimations.observePainSolutionCards()` | IntersectionObserver threshold:0.15 rootMargin:-50px | Adiciona imediatamente | `.is-visible` em `.card-pain, .card-solution` | Cards sobem de translateY(30px) |
| `ScrollAnimations.observeRevealElements()` | IntersectionObserver threshold:0 rootMargin:-20px | Adiciona imediatamente | `.is-visible` em `.reveal-left, .reveal-right` | SeÃ§Ã£o About (container + text-box + stats) |
| `AnimatedCounters.animateCounter()` | IntersectionObserver threshold:0.5 | requestAnimationFrame, easing `1-(1-t)^3`, duration 2000ms | textContent de 0 â†’ data-target | `.stat-number[data-target]` |
| `FAQAccordion` | `click .faq-question` (summary) | Fecha outros `<details>` abertos via `removeAttribute('open')` | `open` attr no `<details>` | Comportamento accordion (um aberto por vez) |
| `VideoController` | IntersectionObserver threshold:0.25 | `video.play()` quando visÃ­vel, `video.pause()` quando nÃ£o | â€” | `.video-element` â€” evita autoplay fora da viewport |
| `WhatsappBubble.showBubble()` | `setTimeout(10000)` OU IntersectionObserver na 3Âª `<section>` (threshold:0.3, delay 800ms) | Exibe balÃ£o | `.show` no `#whatsapp-message` | BalÃ£o glassmorphism aparece |
| `WhatsappBubble.hideBubble()` | `click .close-whatsapp-bubble` OU auto-esconder apÃ³s 12s | Remove show, chama showNotification() | Remove `.show` do `#whatsapp-message` | BalÃ£o fecha |
| `WhatsappBubble.showNotification()` | ApÃ³s hideBubble(), delay 4000ms | Exibe badge vermelho | `.show` no `.whatsapp-notify` | Badge "1" aparece no botÃ£o WhatsApp |
| `window.scrollToElement(selector, offset)` | Uso programÃ¡tico externo | Scroll suave com offset padrÃ£o 80px | â€” | Global utility |
| `window.openWhatsApp(message)` | Uso programÃ¡tico externo | `window.open(wa.me/5521988501459?text=...)` | â€” | Global utility |

---

## 6. RESPONSIVIDADE

| Breakpoint | Elemento | Propriedade | Valor padrÃ£o | Valor no breakpoint |
|---|---|---|---|---|
| `max-width: 1023px` | `.hero` | layout | grid 2 cols | flex column, imagem como absolute fullscreen |
| `max-width: 1023px` | `.hero-image-wrapper::after` | overlay | sem overlay | gradiente preto 6-stop (bottomâ†’top) |
| `max-width: 1023px` | `.hero-image` | clip-path | `polygon(12% 0, 100% 0...)` | `none` |
| `max-width: 1023px` | `.hero-title` | font-size | `clamp(4.5rem,11vw,9.5rem)` | `clamp(3.5rem,15vw,6rem)` |
| `max-width: 1023px` | `.hero-cta` | width/bg | auto preto | `width:100%; justify-content:center; bg:--amarelo-madame; color:--preto-madame` |
| `max-width: 1023px` | `.bento-grid` | columns/rows | repeat(4,1fr) / 240px | repeat(2,1fr) / 300px |
| `max-width: 1023px` | `.videos-grid` | columns | repeat(4,1fr) | repeat(2,1fr) |
| `max-width: 1023px` | `.about-container` | columns | 50%/50% | 1fr |
| `max-width: 1023px` | `.about-text-box` | margin-left | -120px | 0 / margin-top:-100px |
| `max-width: 1023px` | `.location-hub` | columns | repeat(2,1fr) | 1fr |
| `max-width: 1023px` | `.contact-bar` | flex-direction | row | column |
| `max-width: 1023px` | `.footer-grid` | columns | 1.5fr 1fr 1fr 1fr | repeat(2,1fr) |
| `max-width: 968px` | `.nav-toggle` | display | none | flex !important |
| `max-width: 968px` | `.nav-menu, .nav-cta` | display | flex/inline-flex | none !important |
| `max-width: 767px` | `:root --space-3xl` | â€” | 6rem | 4rem |
| `max-width: 767px` | `:root --space-2xl` | â€” | 4rem | 3rem |
| `max-width: 767px` | `.nav-menu` | â€” | â€” | `position:fixed; inset:0; bg:preto; translateX(100%)` |
| `max-width: 767px` | `.hero-title` | font-size | â€” | `clamp(3.2rem,14vw,5.5rem)` |
| `max-width: 767px` | `.bento-grid` | rows/gap | 240px / 1.5rem | 150px / 0.5rem |
| `max-width: 767px` | `.bento-cell-large, .bento-cell-wide` | grid-row | span 3 | span 3 (450px mobile) |
| `max-width: 767px` | `.videos-grid` | layout | grid | grid repeat(2,1fr) com efeito escadinha |
| `max-width: 767px` | `.video-card` | opacity/transform | animado | `opacity:1 !important; transform:none !important` |
| `max-width: 767px` | `.pain-solution-cards` | layout | grid 3 cols | flex overflow-x:auto scroll-snap |
| `max-width: 767px` | `.pain-solution-divider` | display | flex | none |
| `max-width: 767px` | `.about-stats` | columns | repeat(3,1fr) | 1fr |
| `max-width: 767px` | `.t-card` | min-width | 300px | 260px |
| `max-width: 767px` | `.t-scroll-track` | duration | 60s | 45s |
| `max-width: 767px` | `.footer-grid` | columns | repeat(2,1fr) | 1fr |
| `max-width: 576px` | `.whatsapp-container` | bottom/right | 24px | 16px |
| `max-width: 576px` | `#whatsapp-message` | width | 250px | `calc(100vw - 40px)` max 260px |
| `max-width: 576px` | `.features-grid` | columns | repeat(2,1fr) | 1fr |
| `max-width: 479px` | `.about-image` | height | auto | 420px |
| `max-width: 479px` | `.about-text-box` | bg | preto sÃ³lido | `linear-gradient(to top, rgba(26,26,26,1) 0%, rgba(26,26,26,0.98) 45%, transparent 100%)` |
| `max-width: 479px` | `.about-stats` | columns | 1fr | repeat(3,1fr) com gap menor |
| `max-width: 479px` | `.stat-circle` | size | 80Ã—80px | 60Ã—60px |
| `min-width: 1440px` | `.container` | max-width | 1400px | 1600px |
| `prefers-reduced-motion` | tudo | animation/transition | normal | `0.01ms !important; iteration-count:1` |
| `prefers-reduced-motion` | `.t-scroll-track, .ticker-track` | animation | running | `none` |
| `prefers-reduced-motion` | `.bento-cell, .video-card, .reveal-*` | opacity/transform | animados | `opacity:1 !important; transform:none !important` |

---

## 7. PERFORMANCE & SEO TÃ‰CNICO

| TÃ©cnica | Elemento / Recurso | Detalhe |
|---|---|---|
| `rel="preload" as="image"` | `madame-luxo-hero-colecao-verde-menta.webp` | LCP image preloadada no `<head>` |
| `rel="preload" as="style"` | Google Fonts URL | Fonte preloadada antes do CSS principal |
| `fetchpriority="high"` | `.hero-image` (img tag) | Sinaliza ao browser como recurso LCP prioritÃ¡rio |
| `loading="eager"` | Logo da navbar + hero image | Sem lazy loading nos elementos above-the-fold |
| `loading="lazy"` | Todas as imagens abaixo do fold | Cards, bento grid, about, location |
| Fontes non-blocking | Google Fonts `<link media="print" onload="this.media='all'">` | Carregamento assÃ­ncrono com `<noscript>` fallback |
| `<link rel="preconnect">` | `fonts.googleapis.com`, `fonts.gstatic.com` (crossorigin), `assets.cdn.filesafe.space` (crossorigin) | 3 preconnects para origens externas |
| `will-change: transform, opacity` | `.hero-title, .hero-image-wrapper, .bento-cell, .video-card, .ticker-track` | PromoÃ§Ã£o de camada GPU para elementos animados |
| `html class="no-js"` â†’ remove via JS inline | `<script>document.documentElement.classList.remove('no-js')</script>` | Fallback CSS para `no-js` (reveals jÃ¡ visÃ­veis) |
| `scroll-behavior: smooth` | `html` | Scroll suave nativo CSS |
| `-webkit-font-smoothing: antialiased` | `html` | RenderizaÃ§Ã£o de fonte suavizada |
| `overflow-x: hidden` | `html` + `body` | Previne scroll horizontal acidental |
| Schema.org `@type: ClothingStore` | JSON-LD no `<head>` | name, telephone, address (2), openingHoursSpecification, aggregateRating, geo, areaServed (7 lugares), hasOfferCatalog (4 offers), sameAs (Instagram + Google Maps) |
| Schema.org `@type: FAQPage` | JSON-LD no `<head>` | 5 perguntas/respostas estruturadas |
| Schema.org `@type: WebSite` | JSON-LD no `<head>` | publisher referenciado por @id |
| Schema.org `@type: WebPage` | JSON-LD no `<head>` | datePublished + dateModified |
| Schema.org `@type: BreadcrumbList` | JSON-LD no `<head>` | 1 item: InÃ­cio |
| Open Graph completo | `<head>` | og:title, og:description, og:url, og:image (1200Ã—630), og:type, og:locale, og:site_name |
| Twitter Cards | `<head>` | `summary_large_image` + title + description + image |
| Geo Tags (SEO Local) | `<head>` | `geo.region: BR-RJ`, `geo.position: -22.9035;-43.2094`, `ICBM` |
| `meta name="theme-color"` | `#1A1A1A` | Cor da barra do browser no mobile |
| `robots` meta | `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` | Controle granular de crawling |
| `canonical` | `https://www.madameluxorj.com.br` | Evita conteÃºdo duplicado |
| `robots.txt` | `/robots.txt` | Arquivo presente na raiz |
| `sitemap.xml` | `/sitemap.xml` | Arquivo presente na raiz |
| VÃ­deos com `poster=` | Todos os 4 `<video>` | Imagem de poster local (sem requisiÃ§Ã£o extra) |
| `video autoplay muted loop playsinline` | Todos os 4 `<video>` | Autoplay compatÃ­vel mobile sem som |
| IntersectionObserver para vÃ­deos | `VideoController` class | Pausa vÃ­deos fora da viewport (economia de CPU) |
| `debounce(50ms)` no scroll | `NavbarController.bindScroll` | Evita excesso de handlers no scroll |
| Favicon | `/assets/favicon-madame-luxo.ico` | `type="image/x-icon"` |
| Cookie Banner separado | `cookie-banner.css` + `cookie-banner.js` | Arquivos independentes â€” nÃ£o bloqueia render do site principal |

---

## 8. ANTI-PADRÃ•ES REGISTRADOS

âŒ **HERO COM IMAGEM CENTRALIZADA SIMPLES**
â†’ GenÃ©rico seria: imagem centralizada com `object-fit:cover` e texto sobreposto com sombra
â†’ Aqui foi feito: Split assimÃ©trico 1.1fr/0.9fr com `clip-path: polygon(12% 0, 100% 0, 100% 100%, 0% 100%)` criando corte diagonal â€” a imagem literalmente "escapa" do container para a direita
â†’ Prova tÃ©cnica: `.hero-image { clip-path: polygon(12% 0, 100% 0, 100% 100%, 0% 100%); height: 115%; margin-top: -15%; }`

âŒ **GALERIA DE PRODUTOS EM GRID UNIFORME**
â†’ GenÃ©rico seria: grid 3 ou 4 colunas iguais com imagens quadradas
â†’ Aqui foi feito: Bento Grid com `grid-auto-flow: dense` e 4 modificadores de span diferentes (large, tall, wide, default) criando composiÃ§Ã£o editorial variada com 12 categorias em proporÃ§Ãµes heterogÃªneas
â†’ Prova tÃ©cnica: `.bento-cell-tall { grid-row: span 4; }` â€” cÃ©lulas que ocupam 960px de altura sobre base de 240px

âŒ **MENU MOBILE QUE EMPURRA O CONTEÃšDO**
â†’ GenÃ©rico seria: menu accordion que abre abaixo da navbar empurrando o conteÃºdo para baixo
â†’ Aqui foi feito: Drawer lateral de 320px com `translateX(100%)` â†’ `translateX(0)` + overlay `backdrop-filter: blur(4px)` + body overflow:hidden, sem tocada no layout da pÃ¡gina
â†’ Prova tÃ©cnica: `.drawer { transform: translateX(100%); visibility: hidden; } .drawer.is-open { transform: translateX(0); visibility: visible; }`

âŒ **DEPOIMENTOS EM CARROSSEL COM BOTÃ•ES DE NAVEGAÃ‡ÃƒO**
â†’ GenÃ©rico seria: slider com prev/next e dots indicadores
â†’ Aqui foi feito: Scroll infinito CSS puro com 9 cards (3 Ã— triplicados, sets 2 e 3 com `aria-hidden="true"`) animados por `translateX(-33.333%)` em 60s, pausa no hover, sem JS
â†’ Prova tÃ©cnica: `.t-scroll-track { animation: scrollReviewsLP 60s linear infinite; } .t-scroll-track:hover { animation-play-state: paused; }`

âŒ **ESTATÃSTICAS ESTÃTICAS**
â†’ GenÃ©rico seria: nÃºmeros fixos no HTML sem interaÃ§Ã£o
â†’ Aqui foi feito: Contadores animados via `requestAnimationFrame` com easing cÃºbico `1-(1-t)^3` de 2 segundos, disparados por IntersectionObserver (threshold: 0.5) apenas ao entrar na viewport
â†’ Prova tÃ©cnica: `element.dataset.target` + `const easeOut = 1 - Math.pow(1 - progress, 3)` em `AnimatedCounters.animateCounter()`

âŒ **SEÃ‡ÃƒO SOBRE COM TEXTO EM COLUNA SIMPLES**
â†’ GenÃ©rico seria: imagem Ã  esquerda, texto Ã  direita, sem sobreposiÃ§Ã£o
â†’ Aqui foi feito: `.about-text-box { margin-left: -120px; }` â€” a caixa de texto invade 120px sobre a imagem, criando profundidade sem position:absolute, mantendo o fluxo do documento
â†’ Prova tÃ©cnica: `margin-left: -120px` em grid 50%/50% produz sobreposiÃ§Ã£o real (nÃ£o ilusÃ³ria)

âŒ **ÃCONES DE REDE SOCIAL (Font Awesome)**
â†’ GenÃ©rico seria: `<i class="fa fa-whatsapp">` ou similar com carregamento de iconlib
â†’ Aqui foi feito: SVGs inline para todos os Ã­cones â€” WhatsApp, Google G logo, navegaÃ§Ã£o, location pins, horÃ¡rio, phone â€” zero dependÃªncia externa de icon library
â†’ Prova tÃ©cnica: Busca por "fa-" ou "fas " no HTML retorna zero ocorrÃªncias

âŒ **NAVBAR QUE MUDA ABRUPTAMENTE AO SCROLL**
â†’ GenÃ©rico seria: `if scroll > 0 â†’ addClass('scrolled')` sem transiÃ§Ã£o
â†’ Aqui foi feito: `transition: background-color 300ms ease, box-shadow 300ms ease, padding 300ms ease` â€” 3 propriedades transicionam simultaneamente + debounce de 50ms para nÃ£o sobrecarregar o event loop
â†’ Prova tÃ©cnica: `.navbar { transition: background-color var(--transition-normal), box-shadow var(--transition-normal), padding var(--transition-normal); }` + `debounce(handleScroll, 50)`

âŒ **LAZY LOADING SOMENTE VIA JS**
â†’ GenÃ©rico seria: data-src em todas as imagens, JS substitui src ao entrar na viewport
â†’ Aqui foi feito: `loading="lazy"` nativo HTML5 nas imagens below-the-fold + fallback com IntersectionObserver apenas quando `!('loading' in HTMLImageElement.prototype)`, e `loading="eager"` + `fetchpriority="high"` apenas no LCP
â†’ Prova tÃ©cnica: `if ('loading' in HTMLImageElement.prototype) { return; }` em `LazyLoader.init()`

âŒ **VÃDEOS QUE RODAM MESMO FORA DA TELA**
â†’ GenÃ©rico seria: `autoplay` sem controle, consumindo CPU e banda mesmo com o vÃ­deo invisÃ­vel
â†’ Aqui foi feito: `VideoController` usa IntersectionObserver (threshold:0.25) â€” `video.play()` apenas quando 25% visÃ­vel, `video.pause()` quando sai da viewport
â†’ Prova tÃ©cnica: `if (entry.isIntersecting) { video.play().catch(() => {}); } else { video.pause(); }`

---

## INVENTÃRIO DE ASSETS

| Arquivo | Formato | Uso |
|---|---|---|
| `madame-luxo-hero-colecao-verde-menta.webp` | WebP | Hero image (LCP) + poster vÃ­deo 1 |
| `logo-madame-luxo-desktop.webp` | WebP | Navbar logo + footer logo |
| `logo-madame-luxo-mobile.webp` | WebP | DisponÃ­vel mas nÃ£o referenciado no HTML atual |
| `favicon-madame-luxo.ico` | ICO | Favicon |
| `madame-luxo-dor-escolha-limitada.png` | PNG | Card Dor |
| `madame-luxo-blusas-decote-u-varias-cores.webp` | WebP | Card SoluÃ§Ã£o + Bento "Blusas" |
| `madame-luxo-vestido-longo-listrado-azul.webp` | WebP | Bento "Vestidos" |
| `madame-luxo-macacao-longo-azul-claro-plus-size.webp` | WebP | Bento "MacacÃ£o" + poster vÃ­deo 3 |
| `madame-luxo-moda-feminina-marrom-plus-size.webp` | WebP | Bento "Saia & Conjuntos" + poster vÃ­deo 4 |
| `madame-luxo-conjunto-resort-preto-tela-plus-size.webp` | WebP | Bento "Bodys" |
| `madame-luxo-vestido-midi-plus-size-verde.webp` | WebP | Bento "Plus Size" |
| `madame-luxo-conjunto-croche-off-white-feminino.webp` | WebP | Bento "Cropped" |
| `madame-luxo-shorts-estilo-casual.png` | PNG | Bento "Shorts" |
| `madame-luxo-acessorios-luxo-feminino.png` | PNG | Bento "AcessÃ³rios" |
| `madame-luxo-macaquinho-rosa-feminino.webp` | WebP | Bento "Macaquinho" |
| `fachada-loja-madame-luxo-vitrine.webp` | WebP | Bento "Looks Completos" |
| `madame-luxo-vestido-trico-listrado-colorido.webp` | WebP | Bento "Nova ColeÃ§Ã£o" |
| `madame-luxo-conjunto-alfaiataria-bege-plus-size.webp` | WebP | Asset disponÃ­vel, nÃ£o referenciado no HTML |
| `madame-luxo-conjunto-preto-plus-size-inclusiva.webp` | WebP | Poster vÃ­deo 2 |
| `madame-luxo-moda-praia-preta-plus-size-2.webp` | WebP | Asset disponÃ­vel, nÃ£o referenciado no HTML |
| `interior-loja-boutique-madame-luxo.webp` | WebP | Referenciado no Schema.org, nÃ£o no HTML visÃ­vel |
| `wind-banner-loja-madame-luxo-entrada.webp` | WebP | SeÃ§Ã£o About (imagem de fundo) |
| `madame-luxo-solucao-curadoria-premium.png` | PNG | Asset disponÃ­vel, nÃ£o referenciado no HTML |
| VÃ­deos (4x) | MP4 | CDN: `assets.cdn.filesafe.space/7hzaWcGgawCV1WudlwA7/media/` |

---

*DNA gerado em 2026-05-08 | Projeto: Madame Luxo | AgÃªncia: AG5 | Categoria: Moda*
