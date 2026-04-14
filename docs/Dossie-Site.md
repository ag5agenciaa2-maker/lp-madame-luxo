Quero que você crie o Site institucional "Editorial Bento Couture" em 3 arquivos (index.html, style.css e script.js), usando APENAS HTML5 semântico, CSS3 (Flexbox, Grid, variáveis CSS) e JavaScript Vanilla ES6, sem qualquer framework ou biblioteca externa.

REGRA: Use imagens reais da pasta /assets/ disponibilizada pelo cliente (12 fotos de modelos + 4 vídeos de produtos). Para seções sem foto específica, use Unsplash com URLs diretas relacionadas à moda feminina brasileira urbana. Este site NÃO é e-commerce — toda ação de compra redireciona para WhatsApp https://wa.me/5521988501459. Imagens de produtos são clicáveis e abrem WhatsApp com mensagem pré-formatada.

IDENTIDADE VISUAL BASE:



Paleta: Preto profundo #1A1A1A, Amarelo Madame #E8E000, Dourado quente #C9A227, Off-white #FAFAF7, Cinza neutro #8C8C8C

Tipografia: Bebas Neue (títulos de impacto, condensado pesado), DM Sans (corpo e navegação), Playfair Display Italic (taglines e destaques femininos)

Estilo: Editorial fashion minimalista com acento amarelo-dourado vibrante — boutique urbana acessível com atitude premium

Sensação: Confiança, estilo, celebração do corpo feminino em todas as silhuetas, acessível sem abrir mão do charme



LAYOUT ESCOLHIDO:



Hero: \[C] Editorial — tipografia Bebas Neue 9vw dominando 60% da tela à esquerda (#1A1A1A sobre fundo #FAFAF7), tagline em Playfair Display Italic dourado, imagem vertical de modelo (foto real da pasta assets) flutuando à direita com clip-path diagonal polygon(8% 0, 100% 0, 100% 100%, 0% 100%), linha decorativa amarela #E8E000 de 3px bordejando o texto, botão "Ver Coleção → WhatsApp" sólido preto com hover invertendo para amarelo

Produtos/Categorias: \[A] Bento Grid irregular — grade CSS de 4 colunas com células de alturas variadas (algumas com grid-row: span 2, outras com grid-column: span 2), 12 fotos reais do Instagram, overlay preto semi-transparente rgba(0,0,0,0.55) com nome da categoria e botão WhatsApp surgindo no hover, acento amarelo na borda inferior das células em destaque

Depoimentos: \[A] Marquee infinito horizontal — strip de fundo #1A1A1A com cards de avaliações futuras animados em loop contínuo; seção preparada para receber avaliações Google quando disponíveis; por ora exibe frases-destaques da missão da marca

Sobre/Credenciais: \[C] Foto grande (fachada real da loja) ocupando 60% da largura com texto da história da marca sobreposto em camadas — bloco de texto com fundo rgba(26,26,26,0.82) flutuando sobre a foto, linha amarela como separador, contadores animados de anos de mercado e bairros atendidos



ANIMAÇÕES DO PROJETO:



Headline hero (MADAME LUXO) → opacity: 0, translateY: 50px → opacity: 1, translateY: 0 em 900ms, easing: cubic-bezier(0.16, 1, 0.3, 1), trigger: load, delay: 0ms

Tagline hero → opacity: 0, translateX: -40px → opacity: 1, translateX: 0 em 700ms, easing: ease-out, trigger: load, delay: 200ms

Imagem modelo hero → opacity: 0, scale(0.94) → opacity: 1, scale(1) em 1100ms, easing: cubic-bezier(0.16, 1, 0.3, 1), trigger: load, delay: 350ms

Linha decorativa amarela → scaleX: 0 → scaleX: 1 em 600ms, easing: ease-out, trigger: load, delay: 500ms, transform-origin: left

Células Bento Grid → opacity: 0, translateY: 70px → opacity: 1, translateY: 0 em 700ms, easing: ease-out, trigger: IntersectionObserver (threshold 0.15), stagger: 80ms por célula

Overlay hover nas células → opacity: 0 → opacity: 1 em 250ms, easing: ease-in-out, trigger: hover

Texto overlay (categoria + botão WA) → translateY: 20px → translateY: 0 em 250ms, easing: ease-out, trigger: hover, stagger: 60ms

Cards vídeo → opacity: 0, scale(0.90) → opacity: 1, scale(1) em 650ms, easing: cubic-bezier(0.34, 1.56, 0.64, 1), trigger: IntersectionObserver, stagger: 120ms

Marquee strip depoimentos → translateX: 0% → translateX: -50% em loop contínuo 35s, easing: linear, pausa no hover via animation-play-state: paused

Counters (anos de mercado, bairros) → contagem de 0 ao valor final em 2000ms, easing: ease-out, trigger: IntersectionObserver

Barra animada ticker (nome / serviços / áreas) → loop translateX: 0 → -50% em 20s, linear, fundo amarelo #E8E000, texto preto

CTA WhatsApp (botão fixo flutuante) → scale(1) → scale(1.08) em 200ms + box-shadow verde expandido, trigger: hover

Navbar → background: transparent → background: rgba(26,26,26,0.95) ao scroll > 80px em 300ms, easing: ease

Imagens produto (clicáveis → WA) → scale(1) → scale(1.04) em 300ms no hover + cursor pointer



SEÇÕES OBRIGATÓRIAS:



Navbar — logo SVG Madame Luxo (versão preta), links Início | Coleção | Sobre | Contato, botão "Comprar no WhatsApp" amarelo à direita, comportamento sticky com mudança de fundo ao scroll

Hero \[Editorial — modelo descrito acima]

Seção Dor e Solução — "Você merece roupas que celebram quem você é" — texto editorial em 2 colunas, fundo off-white, linha amarela vertical como divisor

Bento Grid Coleção — 12 fotos reais com hover WhatsApp, categorias: Vestidos | Blusas | Macacão | Saias | Bodies | Plus Size

Seção Vídeos Destaque — 4 vídeos da pasta assets em cards com proporção 9:16, fundo preto, títulos de categoria em Bebas Neue amarelo

Sobre / Credenciais \[Foto com texto sobreposto + contadores animados]

Depoimentos \[Marquee infinito — preparado para avaliações Google]

Barra Animada Ticker — "MADAME LUXO • MODA FEMININA • PLUS SIZE • SANTA CRUZ • CAMPO GRANDE • DESDE 2007 •" em loop, fundo #E8E000, texto #1A1A1A

FAQ — acordeão com perguntas: Atendem plus size? / Fazem entrega? / Quais bairros? / Como comprar online? / Horário de funcionamento?

Localização — endereços das 2 lojas + mapa Google embed + botão "Como Chegar" para cada unidade + contatos com ícones clicáveis

CTA + Formulário — formulário (Nome, Telefone, Mensagem) ao lado de foto de modelo + botão WhatsApp em destaque amarelo

Rodapé + Créditos



RODAPÉ — coluna de contato:



Nome: Madame Luxo → link Google Business https://share.google/dA93yu21cyDQxfwiU

Endereço Loja 1: R. Felipe Cardoso, 329 – Loja 19, Santa Cruz, RJ → link Google Maps

Endereço Loja 2: Estrada do Campinho, 6006 – Loja D, Campo Grande, RJ → link Google Maps

WhatsApp: (21) 98850-1459 → https://wa.me/5521988501459

Instagram: @madamenoluxo → https://www.instagram.com/madamenoluxo/



CRÉDITOS:



Esquerda: © Madame Luxo 2026

Direita: Desenvolvido por AG5 Agência — AG5 em destaque na cor #E8E000, link https://www.ag5agencia.com.br



DIRETRIZES ANTI-GENÉRICO:



Sem cards retangulares padrão com bordas curvas iguais

Sem hero centralizado com fundo escuro e texto branco genérico

Sem fade-up igual em todas as seções

Sem paleta azul + branco + cinza

Sem 3 colunas de ícone + título + texto



QUALIDADE DE CÓDIGO:



HTML semântico + IDs de ancoragem em todas as seções

Variáveis CSS no :root para cores, fontes e espaçamentos

Mobile-first com media queries (breakpoints: 480px, 768px, 1024px, 1440px)

IntersectionObserver para animações de scroll (nunca scroll event direto)

will-change: transform, @media (prefers-reduced-motion), lazy loading em todas as imagens

Formulário com validação real (campos obrigatórios, feedback visual)

Imagens com nomes SEO: madame-luxo-vestido-feminino-campo-grande-rj.webp, alt text descritivo distinto do filename

Vídeos com <video autoplay muted loop playsinline> otimizados





1 — MÍDIAS PRINCIPAIS

MídiaStatusArquivoLogo (versão amarela/preta sobre branco)✅ Disponívelmadame\_luxo-loja\_de\_roupas-...\_\_36\_.pngLogo ML (versão dourada metálica sobre fundo dourado/preto)✅ Disponível441058807\_...jpgFachada loja (exterior com vitrine + banner)✅ Disponívelmadame\_luxo-...\_\_13\_.jpegInterior da loja (prateleiras + balcão)✅ Disponívelmadame\_luxo-...\_\_7\_.jpegFoto modelo 1 (look verde menta — duas modelos)✅ Disponívelmadamenoluxo\_1761830401\_...jpgFoto modelo 2 (look rosa — modelo individual)✅ Disponívelmadamenoluxo\_1770727641\_...jpgInstagram feed (screenshot com 80+ posts)✅ Disponível986a5b47-...-loja\_de\_roupas-...\_\_3\_.jpeg12 fotos do Instagram (na pasta assets)✅ Confirmado pelo clientePasta /assets/4 vídeos de modelos (na pasta assets)✅ Confirmado pelo clientePasta /assets/Foto da proprietária / equipe❌ Ausente—Fotos de produto isolado (flat lay)❌ Ausente—



2 — INFORMAÇÕES DA EMPRESA

Nome: MADAME LUXO

Nome alternativo: Madame Luxo Roupas Femininas | Moda Casual | Roupas Atacado e Varejo em Santa Cruz

Nicho: Loja de roupas femininas — moda casual, plus size, boutique

CNPJ: 09.213.665/0001-58

Place ID Google: ChIJIQXoygj7mwARrGE3NeVWD54

Descrição institucional: "Nossa moda casual, para mulheres que gostam de conforto e elegância."

Missão (Instagram): "Somos a Madame Luxo e nossa missão é resgatar o melhor que há em você."

Slogan (banner físico): "O Prazer de Você se Vestir Bem!"

Proposta de valor: Moda feminina com curadoria para mulheres de todas as silhuetas — do tamanho P ao plus size — que buscam estilo, conforto e elegância no dia a dia, com atendimento personalizado em boutique física.

Público-alvo: Mulheres de 20 a 50 anos da Zona Oeste do Rio de Janeiro que buscam looks completos para o cotidiano, do casual ao social, incluindo o segmento plus size.

Principais produtos:



Moda feminina casual (blusas, saias, shorts, camisas)

Vestidos (day, midi, longos)

Macacão e macaquinho

Bodies e cropped

Moda plus size (linha específica)

Acessórios de moda



Produtos completos: Blusa · Saia · Vestido · Macacão · Macaquinho · Cropped · Shorts · Body · Acessórios · Plus Size

Categorias Google: Loja de moda feminina · Loja de roupas de praia · Butique · Atacadista de roupas · Loja de acessórios de moda · Loja de roupas para ocasiões formais · Loja de roupas com tamanhos especiais · Loja de roupas de trabalho

Diferencial: Atendimento em 2 lojas físicas, inclusão do segmento plus size com mesma curadoria de estilo, 18 anos no mercado de moda feminina na Zona Oeste.

História: Fundada em julho de 2007 com foco em fabricação e atacado de roupas femininas. Com a chegada do fast fashion importado em 2012, a empresa mudou de estratégia e migrou para o varejo, passando a funcionar como boutique curada com 2 unidades físicas.



CONTATO:



Telefone/WhatsApp: (21) 98850-1459

Email: ❌ Não informado

Loja 1: R. Felipe Cardoso, 329 – Loja 19, Santa Cruz, Rio de Janeiro – RJ, CEP 23520-790

Loja 2: Estrada do Campinho, 6006 – Loja D, CEP 23072-200 – Galeria Oeste Field, Campo Grande, RJ

Horário: Segunda a Sábado das 10h às 19h | Domingo: Fechado



LINKS:



Instagram: https://www.instagram.com/madamenoluxo/

Google Business: https://share.google/dA93yu21cyDQxfwiU

Site: ❌ Não possui (este será o primeiro)

Facebook: ❌ Não informado

LinkedIn: ❌ Não aplicável



Bairros de atendimento: Santa Cruz · Paciência · Urucânia · Campo Grande · Inhoaíba · Cosmos · Três Pontes · Antares · 7 de Abril · Vila Nova Salim · Conj. Campinho · Palmares



3 — AVALIAÇÕES

Plataforma: Google Business

Status: ⚠️ Avaliações ainda não presentes no perfil Google (perfil recente / sem reviews cadastrados no momento do levantamento)

Seção a ser populada quando as primeiras avaliações forem registradas. A seção de depoimentos no site será construída com marquee infinito preparado para receber o conteúdo assim que disponível.



4 — ANÁLISE DE BRANDING

Nicho: Moda feminina casual e plus size — boutique urbana de bairro

Posicionamento: Médio-premium aspiracional — acessível no preço, premium na experiência e nome

Estilo visual predominante: Editorial fashion minimalista com acento vibrante — o nome "MADAME LUXO" carrega uma promessa aspiracional de luxo democratizado; o logo geométrico com M+L em linhas retas comunica modernidade e estrutura; a presença do amarelo vivo quebra o minimalismo austero e adiciona energia e identidade única.

Análise das peças gráficas existentes:



Logo principal (fundo branco): Tipografia sem-serifa condensada MADAME LUXO em preto #1A1A1A ao lado do monograma M+L em amarelo vivo #E8E000 — leitura: moderna, acessível, limpa

Banner físico: Fundo preto #1A1A1A, logo em dourado/âmbar #F5A623, slogan em cursiva — leitura: premium noturno, sofisticado

Ícone ML dourado: Fundo dourado #C9A227 com iniciais em relevo metálico + pequena estrela — leitura: luxury, celebração, exclusividade

Loja física: Vidro temperado transparente, revestimento em madeira clara, estantes em cinza/antracite, iluminação embutida — interior neutro e clean, paleta natural



Paleta de cores recomendada:

NomeHexUsoPreto Madame#1A1A1AFundos de impacto, navbar, texto principalAmarelo Madame#E8E000Acento primário, CTAs, destaques de títuloDourado Quente#C9A227Detalhes premium, ícones, linha separadoraOff-White#FAFAF7Fundo geral do site, espaços respiroCinza Neutro#8C8C8CTextos secundários, captions

Tipografia recomendada:



Títulos de impacto: Bebas Neue (all-caps condensado, peso 400 — ideal para moda editorial)

Corpo e navegação: DM Sans (weights 400/500/700 — clean e legível)

Taglines e destaques femininos: Playfair Display Italic (touch de sofisticação)



Direção estética: Fashion editorial urbano — fundo off-white com grandes blocos tipográficos em preto, rasgados por acentos de amarelo vivo; fotografia de moda em destaque absoluto sem decoração excessiva; o grid de fotos é a estrela do site.

Sensação de marca: "Você já é linda — eu só trouxe a roupa certa."

Referências de marcas premium do mesmo nicho: Renner Studio (curadoria editorial), Amaro (digital-first fashion), C\&A Exclusive (plus size com estilo), Farm Rio (vibração cromática + feminilidade brasileira)

Diferenciação anti-repetição AG5:



Advocacia Áurea (ouro escuro + preto + creme + Cormorant Garamond) → diferenciado: Madame Luxo usa AMARELO VIVO #E8E000 como acento, não ouro escuro; Bebas Neue em vez de serif elegante; setor completamente diferente; layout Bento Grid vs Split 55/45

Monique Freitas (navy + rose gold) → diferenciado: nenhuma sobreposição de paleta





5 — CHECKLIST DE PENDÊNCIAS

Mídias:



&#x20;Foto da proprietária(s) para seção Sobre

&#x20;Foto de equipe (atendentes na loja)

&#x20;Fotos flat lay de produtos isolados (para detalhe de peças)

&#x20;Confirmação de entrega/download das 12 fotos e 4 vídeos da pasta assets



Contato e redes:



&#x20;Email de contato da loja

&#x20;Perfil no Facebook (se existir)

&#x20;Link do WhatsApp Business confirmado



Conteúdo:



&#x20;Texto definitivo da história da marca (versão completa para seção Sobre)

&#x20;Avaliações Google (perfil sem reviews — orientar cliente a solicitar avaliações a clientes recentes)

&#x20;Política de troca/devolução para FAQ

&#x20;Informação sobre entrega (faz entrega? motoboy? Retirada apenas?)

&#x20;Confirmação das categorias exatas para nomear as células do Bento Grid



Técnico:



&#x20;Resolução e formato dos 4 vídeos (verificar se são .mp4 e se têm versão sem áudio para loop)

&#x20;Verificar se as 12 fotos do Instagram têm resolução adequada para web (mín. 1200px)





6 — ANÁLISE DE REFERÊNCIAS WEBFLOW



TEMPLATE 1 — Mira Store

URL: https://mira-template.webflow.io/ | Webflow: https://webflow.com/templates/html/mirastore-fashion-website-template

HERO: Fullscreen com imagem de fundo ocupando 100vh, texto à esquerda centralizado verticalmente — subtítulo pequeno em caps acima do headline principal em \~4rem, CTA com ícone de seta. Animação: headline entra de baixo (translateY: 30px → 0) com fade, seguido pelo subtítulo e botão em stagger de \~150ms. Elemento diferenciador: segunda e terceira imagem visíveis em strip lateral direita (preview dos slides).

NAV: Logo SVG à esquerda, links no centro, ícones (busca + cart) à direita. Fundo transparente sobre hero, com linha inferior sutil. Hover nos links: underline animado que cresce da esquerda.

TIPOGRAFIA: Sans-serif limpa tipo Inter/Manrope — títulos \~3.5rem weight 700, corpo 1rem weight 400. Uso de uppercase com letter-spacing para legendas de categoria.

CORES APLICÁVEIS À MADAME LUXO: Fundos claros (#FAFAF7), texto principal em preto (#1A1A1A). Os acentos de cor no Mira são neutros/bege — substituir pelo amarelo #E8E000.

PRODUTOS/CARDS: Grid 4 colunas, imagens quadradas com título abaixo, preço em destaque. Hover: leve zoom na imagem (scale 1.03). Para Madame Luxo: adaptar para Bento Grid com tamanhos irregulares.

ANIMAÇÕES (técnico):



Hero image: opacity: 0 → 1 em 800ms, easing: ease, trigger: load

Grid cards: opacity: 0, translateY: 40px → opacity: 1, translateY: 0 em 600ms, easing: ease-out, trigger: IntersectionObserver, stagger: 80ms

Category tiles: scale(1.0) → scale(1.03) em 400ms no hover



MICRO-INTERAÇÕES: Hover em cards escurece levemente a imagem (brightness(0.92)). Botão CTA: borda expande, fundo inverte cor.

ELEMENTOS DECORATIVOS: Linhas horizontais muito sutis separando seções. Nenhum elemento decorativo orgânico — puramente grid e tipografia.

RESUMO CONSTRUTIVO: Para recriar o espírito Mira com identidade Madame Luxo, mantenha o ritmo de grid limpo mas substitua a paleta neutra pelo contraste preto/amarelo. Use o modelo de hero com imagem de modelo fotográfica em destaque mas abandone o layout centralizado por um editorial split — texto pesado à esquerda, foto vertical à direita com clip-path diagonal. A estrutura de grid 4-colunas do Mira serve de base para o Bento Grid mas quebre a uniformidade alternando células de tamanho duplo.

