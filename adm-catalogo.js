/**
 * PAINEL ADMINISTRATIVO - MADAME LUXO
 * Integração com Google Sheets API v4
 * @author AG5 Agência
 */

// ============================================
// SCROLL LOCK (preserva posição ao abrir modal)
// ============================================
const ScrollLock = (function () {
    let _locks = 0;
    let _scrollY = 0;
    let _saved = null;

    return {
        lock() {
            _locks++;
            if (_locks > 1) return;
            _scrollY = window.scrollY || window.pageYOffset;
            _saved = {
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
            if (_locks > 0) return;
            if (_saved) {
                Object.assign(document.body.style, _saved);
                _saved = null;
            }
            window.scrollTo(0, _scrollY);
        }
    };
})();

// ============================================
// CONFIGURAÇÕES
// ============================================
const CONFIG = {
    SPREADSHEET_ID: '13I0DBjImUK8R1rZe1Nt0FC-WzALALbkAencGH5HdsdA',
    SHEET_NAME: '👗 Catálogo',
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzOYBLO4dhyhMPK5SSQrN3pc0gaNPBTknbm4eJ_i3EYJ6YafnSKTTUoLWFtZbnFIzKl0A/exec',
    COLS: {
        ID: 0,
        NOME: 1,
        CATEGORIA: 2,
        TIPO: 3,
        COR: 4,
        TAMANHOS: 5,
        MATERIAL: 6,
        DESCRICAO: 7,
        IMAGEM1: 8,
        IMAGEM2: 9,
        IMAGEM3: 10,
        IMAGEM4: 11,
        IMAGEM5: 12,
        IMAGEM6: 13,
        IMAGEM7: 14,
        IMAGEM8: 15,
        IMAGEM9: 16,
        IMAGEM10: 17,
        LINK: 18,
        PRECO_DE: 19,
        PRECO_POR: 20,
        DESCONTO: 21,
        FORMA_PAGAMENTO: 22,
        STATUS: 23
    }
    // Total: 24 colunas (A..X). Imagem em coluna I..R (10 slots).
    // Credenciais R2 vivem no Apps Script (Script Properties).
    // Upload passa por APPS_SCRIPT_URL com action=upload_r2.
};

// ============================================
// ESTADO GLOBAL
// ============================================
// Estado global do painel
let allProducts = [];
let filteredProducts = [];
let currentView = localStorage.getItem('ml_view') || 'grid'; // 'grid' | 'list'
// Set de _rowIndex dos produtos selecionados em lote.
const _selecionados = new Set();
let currentPage = 1;
const ITENS_POR_PAGINA = 24;

// Hash SHA-256 da senha de acesso ao painel administrativo
// IMPORTANTE: Nunca armazene a senha em texto plano neste arquivo
// Para gerar um novo hash, use a função hashSenha() no console do navegador
const SENHA_HASH = '02ba00c9acf0d3c4472d3e987ceab03767e8dea6534ebba6c39362c4dcb6dd7b';

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado. Inicializando painel...');
    
    try {
        initEventListeners();
        initCustomSelects();
        initImageUploads(); // Inicializa upload de imagens
        populateFormSelects(); // Preenche filtros e dropdowns com dados padrão

        // Verifica se já está autenticado na sessão
        const autenticado = sessionStorage.getItem('ml_admin_auth');
        console.log('Autenticado?', autenticado);
        
        if (autenticado === '1') {
            console.log('Usuário já autenticado. Mostrando painel...');
            showAdminPanel();
            loadProducts();
        } else {
            console.log('Usuário não autenticado. Mostrando login...');
            showLoginScreen();
        }
    } catch (error) {
        console.error('ERRO NA INICIALIZAÇÃO:', error);
        alert('Erro ao carregar o painel. Verifique o console (F12) para detalhes.');
    }
});

function initEventListeners() {
    // Filtros
    document.getElementById('filter-search').addEventListener('input', debounce(filterProducts, 300));
    initMultiFilter('categoria', 'Todas as Categorias');
    initMultiFilter('status', 'Todos os Status');

    // View toggle
    document.getElementById('btn-view-grid').addEventListener('click', () => setView('grid'));
    document.getElementById('btn-view-list').addEventListener('click', () => setView('list'));
    setView(currentView, false);
    
    // Barra de seleção em lote
    document.getElementById('batchClear').addEventListener('click', limparSelecao);
    document.getElementById('batchSelectAll').addEventListener('click', selecionarTodosVisiveis);
    document.getElementById('batchDelete').addEventListener('click', () => {
        const lista = filteredProducts.filter(p => _selecionados.has(p._rowIndex));
        if (lista.length) deleteProductsBatch(lista);
    });

    // Botões header
    document.getElementById('btn-refresh').addEventListener('click', loadProducts);
    document.getElementById('btn-novo-produto').addEventListener('click', () => openModal());
    document.getElementById('btn-logout').addEventListener('click', logout);
    document.getElementById('btn-historico').addEventListener('click', openHistorico);
    document.getElementById('historico-close').addEventListener('click', closeHistorico);
    document.getElementById('historico-refresh').addEventListener('click', loadHistorico);
    document.getElementById('historico-search').addEventListener('input', debounce(filterHistorico, 300));
    document.getElementById('modal-historico').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-historico')) closeHistorico();
    });
    initHistoricoFiltros();
    
    // Modal
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('btn-cancelar').addEventListener('click', closeModal);
    document.getElementById('form-produto').addEventListener('submit', handleSubmit);

    // Fechar modal ao clicar fora
    document.getElementById('modal-produto').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-produto')) closeModal();
    });
}

// ============================================
// AUTENTICAÇÃO POR SENHA LOCAL
// ============================================

/**
 * Gera hash SHA-256 de uma string
 * Usado para comparar senha sem expor a senha original no código
 */
async function hashSenha(senha) {
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handleLogin() {
    const input = document.getElementById('login-senha');
    const erro = document.getElementById('login-erro');

    try {
        const hashDigitado = await hashSenha(input.value);

        if (hashDigitado === SENHA_HASH) {
            sessionStorage.setItem('ml_admin_auth', '1');
            showAdminPanel();
            loadProducts();
            populateFormSelects(); // preenche filtros e dropdowns com dados atualizados
            showToast('Bem-vinda ao painel!', 'success');
        } else {
            erro.hidden = false;
            input.value = '';
            input.focus();
        }
    } catch (e) {
        console.error('Erro ao validar senha:', e);
        erro.hidden = false;
        input.value = '';
        input.focus();
    }
}

function logout() {
    sessionStorage.removeItem('ml_admin_auth');
    showLoginScreen();
    showToast('Saiu do painel', 'info');
}

// ============================================
// UI HELPERS
// ============================================
function showLoginScreen() {
    const loginEl = document.getElementById('login-screen');
    loginEl.classList.remove('hide');
    loginEl.hidden = false;
    document.getElementById('admin-panel').hidden = true;
    document.getElementById('login-erro').hidden = true;
    const input = document.getElementById('login-senha');
    if (input) { input.value = ''; input.focus(); }
}

function showAdminPanel() {
    const loginEl = document.getElementById('login-screen');
    // Mostra o painel atrás e anima o login saindo
    document.getElementById('admin-panel').hidden = false;
    loginEl.classList.add('hide');
    setTimeout(() => { loginEl.hidden = true; }, 500);
}

// ============================================
// CARREGAMENTO DE PRODUTOS (CSV PÚBLICO)
// ============================================
async function loadProducts() {
    const loadingEl = document.getElementById('loading-state');
    const tbody = document.getElementById('products-tbody');
    const emptyEl = document.getElementById('empty-state');

    // Reseta seleção ao recarregar (rowIndex mudou).
    _selecionados.clear();
    atualizarBarraSelecao();

    loadingEl.hidden = false;
    tbody.innerHTML = '';
    emptyEl.hidden = true;
    
    try {
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/export?format=csv&sheet=${encodeURIComponent(CONFIG.SHEET_NAME)}`;
        const response = await fetch(url + '&t=' + Date.now());
        
        if (!response.ok) throw new Error('Erro ao carregar planilha');
        
        const csvText = await response.text();
        allProducts = parseCSV(csvText);
        filteredProducts = [...allProducts];

        // Extrai valores únicos da planilha para popular os seletores
        _configDados.tipos = [...new Set(allProducts.map(p => p._tipo).filter(Boolean))].sort();
        _configDados.categorias = [...new Set([
            ..._configDados.categorias,
            ...allProducts.map(p => p._categoria).filter(Boolean)
        ])].sort();
        _configDados.status = [...new Set([
            ..._configDados.status,
            ...allProducts.map(p => p._status).filter(Boolean)
        ])];
        populateFormSelects();

        updateStats();
        renderTable();
        
        showToast(`${allProducts.length} produtos carregados`, 'success');
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao carregar produtos. Verifique se a planilha está pública.', 'error');
        emptyEl.hidden = false;
    } finally {
        loadingEl.hidden = true;
    }
}

function parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    
    // Encontra a linha de headers
    let headerIndex = 0;
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
        const lower = lines[i].toLowerCase();
        if (lower.includes('categoria') || lower.includes('nome')) {
            headerIndex = i;
            break;
        }
    }
    
    const headers = parseCSVLine(lines[headerIndex]).map(h => 
        h.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    );
    
    const products = [];
    
    for (let i = headerIndex + 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < headers.length) continue;
        
        const product = {};
        headers.forEach((h, idx) => {
            product[h] = values[idx] || '';
        });
        
        // Mapeamento direto pela posição das colunas (ordem real da planilha — 24 colunas):
        // 0:ID 1:Nome 2:Categoria 3:Tipo 4:Cor 5:Tamanhos 6:Material 7:Descrição
        // 8..17:Imagem 1..10  18:Link  19:PrecoDe  20:PrecoPor  21:Desconto
        // 22:Forma de pagamento  23:Status
        product._id       = values[0] || '';
        product._nome     = values[1] || '';
        product._categoria= values[2] || '';
        product._tipo     = values[3] || '';
        product._cor      = values[4] || '';
        product._tamanhos = values[5] || '';
        product._material = values[6] || '';
        product._descricao= values[7] || '';
        product._imagem1  = values[8] || '';
        product._imagem2  = values[9] || '';
        product._imagem3  = values[10] || '';
        product._imagem4  = values[11] || '';
        product._imagem5  = values[12] || '';
        product._imagem6  = values[13] || '';
        product._imagem7  = values[14] || '';
        product._imagem8  = values[15] || '';
        product._imagem9  = values[16] || '';
        product._imagem10 = values[17] || '';
        // Array com todas as imagens não-vazias (em ordem) — útil pra carrossel/galeria.
        product._imagens  = [
            product._imagem1, product._imagem2, product._imagem3, product._imagem4, product._imagem5,
            product._imagem6, product._imagem7, product._imagem8, product._imagem9, product._imagem10
        ].filter(u => u && u.trim());
        product._link     = values[18] || '';
        // Remove "R$ " caso a planilha guarde com prefixo
        product._precoDe  = (values[19] || '').replace(/R\$\s*/g, '').trim();
        product._precoPor = (values[20] || '').replace(/R\$\s*/g, '').trim();
        product._desconto = values[21] || '';
        product._formaPagamento = values[22] || '';
        product._status   = values[23] || 'Ativo';
        // Estoque: removido do form, não é mais lido (planilha não tem mais essa coluna).
        product._estoque  = '';
        // _rowIndex em 1-based (linha real na planilha, já conta o header na linha 1)
        product._rowIndex = i + 1;
        
        products.push(product);
    }
    
    return products;
}

function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current.trim());
    return values;
}

// ============================================
// RENDERIZAÇÃO
// ============================================
function updateStats() {
    const total = allProducts.length;
    const ativos = allProducts.filter(p => ['ativo', 'oferta especial', 'últimas unidades'].includes(p._status.toLowerCase())).length;
    const inativos = allProducts.filter(p => ['inativo', 'esgotado'].includes(p._status.toLowerCase())).length;
    const categorias = new Set(allProducts.map(p => p._categoria)).size;
    
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-ativos').textContent = ativos;
    document.getElementById('stat-inativos').textContent = inativos;
    document.getElementById('stat-categorias').textContent = categorias;
}

function setView(view, rerender = true) {
    currentView = view;
    localStorage.setItem('ml_view', view);
    document.getElementById('btn-view-grid').classList.toggle('active', view === 'grid');
    document.getElementById('btn-view-list').classList.toggle('active', view === 'list');
    if (rerender) { currentPage = 1; renderTable(); }
}

const STATUS_MAP = {
    'ativo':            { cls: 'status-ativo',    txt: 'Ativo' },
    'inativo':          { cls: 'status-inativo',  txt: 'Inativo' },
    'esgotado':         { cls: 'status-esgotado', txt: 'Esgotado' },
    'últimas unidades': { cls: 'status-ultimas',  txt: 'Últimas Unidades' },
    'oferta especial':  { cls: 'status-oferta',   txt: 'Oferta Especial' }
};

function renderTable() {
    const container = document.getElementById('products-tbody');
    const emptyEl   = document.getElementById('empty-state');

    container.innerHTML = '';

    if (filteredProducts.length === 0) {
        emptyEl.hidden = false;
        renderPaginacao();
        return;
    }
    emptyEl.hidden = true;
    container.className = currentView === 'list' ? 'products-list' : 'products-grid';

    const totalPaginas = Math.ceil(filteredProducts.length / ITENS_POR_PAGINA);
    if (currentPage > totalPaginas) currentPage = totalPaginas || 1;

    const inicio = (currentPage - 1) * ITENS_POR_PAGINA;
    const fim    = inicio + ITENS_POR_PAGINA;
    const produtosPagina = filteredProducts.slice(inicio, fim);

    produtosPagina.forEach((product) => {
        const statusKey  = (product._status || '').toLowerCase();
        const statusInfo = STATUS_MAP[statusKey] || { cls: 'status-inativo', txt: product._status };
        const imgEsgotado = statusKey === 'esgotado';
        const imgClass = imgEsgotado ? 'prod-card-img prod-card-img--esgotado' : 'prod-card-img';
        const faixaHtml = statusKey === 'últimas unidades'
            ? `<span class="prod-faixa prod-faixa--ultimas">Últimas Unidades</span>`
            : statusKey === 'oferta especial'
            ? `<span class="prod-faixa prod-faixa--oferta">Oferta Especial</span>`
            : imgEsgotado
            ? `<span class="prod-faixa prod-faixa--esgotado">Esgotado</span>`
            : '';

        // Tag mini ao lado do nome no modo lista (só pros 3 status visuais).
        const tagInlineHtml =
            statusKey === 'últimas unidades' ? `<span class="prod-tag-inline prod-tag-inline--ultimas">Últimas</span>` :
            statusKey === 'oferta especial' ? `<span class="prod-tag-inline prod-tag-inline--oferta">Oferta</span>` :
            imgEsgotado ? `<span class="prod-tag-inline prod-tag-inline--esgotado">Esgotado</span>` : '';

        const acoesBtns = `
            <button class="btn-acao btn-edit" title="Editar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-acao btn-toggle" title="Inativar/Reativar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            </button>
            <button class="btn-acao btn-excluir" title="Excluir produto">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>`;

        const el = document.createElement('div');
        const checkboxHtml = `
            <label class="prod-check" title="Selecionar">
                <input type="checkbox" class="prod-check-input" data-row="${product._rowIndex}" ${_selecionados.has(product._rowIndex) ? 'checked' : ''}>
                <span class="prod-check-box"></span>
            </label>`;

        if (currentView === 'list') {
            el.className = 'prod-list-item' + (_selecionados.has(product._rowIndex) ? ' is-selected' : '');
            el.innerHTML = `
                ${checkboxHtml}
                <div class="prod-list-img-wrap">
                    <img src="${product._imagem1 || 'assets/madame-luxo-hero-colecao-verde-menta.webp'}"
                         alt="${escapeHtml(product._nome)}"
                         class="${imgEsgotado ? 'prod-list-img prod-card-img--esgotado' : 'prod-list-img'}"
                         onerror="this.src='assets/madame-luxo-hero-colecao-verde-menta.webp'">
                </div>
                <div class="prod-list-info">
                    <div class="prod-card-nome">
                        <span class="prod-card-nome-text">${escapeHtml(product._nome)}</span>
                        ${tagInlineHtml}
                    </div>
                    <div class="prod-card-tipo">${escapeHtml(product._tipo)}</div>
                </div>
                <div class="prod-list-cat">
                    <span class="prod-categoria">${escapeHtml(product._categoria)}</span>
                </div>
                <div class="prod-list-preco">
                    ${product._precoDe ? `<span class="prod-preco-de">R$ ${product._precoDe}</span>` : ''}
                    <span class="prod-preco-por">R$ ${product._precoPor || '-'}</span>
                </div>
                <div class="prod-list-status">
                    <span class="status-badge ${statusInfo.cls}">${statusInfo.txt}</span>
                </div>
                <div class="prod-list-acoes prod-card-acoes">${acoesBtns}</div>
            `;
        } else {
            el.className = 'prod-card' + (_selecionados.has(product._rowIndex) ? ' is-selected' : '');
            el.innerHTML = `
                ${checkboxHtml}
                <div class="prod-card-img-wrap">
                    <img src="${product._imagem1 || 'assets/madame-luxo-hero-colecao-verde-menta.webp'}"
                         alt="${escapeHtml(product._nome)}"
                         class="${imgClass}"
                         onerror="this.src='assets/madame-luxo-hero-colecao-verde-menta.webp'">
                    ${faixaHtml}
                </div>
                <div class="prod-card-body">
                    <div class="prod-card-nome">${escapeHtml(product._nome)}</div>
                    <div class="prod-card-tipo">${escapeHtml(product._categoria)}</div>
                    <div class="prod-card-precos">
                        ${product._precoDe ? `<span class="prod-preco-de">R$ ${product._precoDe}</span>` : ''}
                        <span class="prod-preco-por">R$ ${product._precoPor || '-'}</span>
                    </div>
                    <div class="prod-card-footer">
                        <span class="status-badge ${statusInfo.cls}">${statusInfo.txt}</span>
                        <div class="prod-card-acoes">${acoesBtns}</div>
                    </div>
                </div>
            `;
        }

        el.addEventListener('click', (e) => {
            if (e.target.closest('.btn-acao') || e.target.closest('.prod-check')) return;
            // Se há qualquer item selecionado no painel, click no card alterna a seleção
            // dele (modo seleção em lote). Senão, abre o modal de detalhes normalmente.
            if (_selecionados.size > 0) {
                // Alterna direto no estado, sem disparar cb.click() (que faria o evento
                // bubblar de volta no card → loop). Atualiza visual + barra na hora.
                const cb = el.querySelector('.prod-check-input');
                const novoEstado = !cb.checked;
                cb.checked = novoEstado;
                if (novoEstado) _selecionados.add(product._rowIndex);
                else _selecionados.delete(product._rowIndex);
                el.classList.toggle('is-selected', novoEstado);
                atualizarBarraSelecao();
                return;
            }
            openDetailModal(product);
        });
        el.querySelector('.btn-edit').addEventListener('click', (e) => {
            e.stopPropagation();
            // Abre o modal de detalhes já no modo edição (atalho do ícone de lápis).
            openDetailModal(product, { startEditing: true });
        });
        el.querySelector('.btn-toggle').addEventListener('click', (e) => {
            e.stopPropagation(); inactivateProduct(product);
        });
        el.querySelector('.btn-excluir').addEventListener('click', (e) => {
            e.stopPropagation(); deleteProduct(product);
        });

        // Checkbox de seleção em lote.
        const cb = el.querySelector('.prod-check-input');
        cb.addEventListener('click', (e) => e.stopPropagation());
        cb.addEventListener('change', () => {
            if (cb.checked) _selecionados.add(product._rowIndex);
            else _selecionados.delete(product._rowIndex);
            el.classList.toggle('is-selected', cb.checked);
            atualizarBarraSelecao();
        });

        container.appendChild(el);
    });

    renderPaginacao();
}

// Modal de detalhes do produto (estilo do site público — pmodal-*).
// `opts.startEditing = true` abre direto no modo de edição (atalho do ícone lápis).
function openDetailModal(product, opts = {}) {
    const statusKey  = (product._status || '').toLowerCase();
    const statusInfo = STATUS_MAP[statusKey] || { cls: 'status-inativo', txt: product._status };

    // Fallback de imagem (logo) se produto não tiver foto.
    const FALLBACK = 'assets/logo-madame-luxo-desktop.webp';
    const imagensReais = (product._imagens || []).filter(Boolean);
    const semImg = imagensReais.length === 0;
    const imagens = semImg ? [FALLBACK] : imagensReais;
    const tamanhos = (product._tamanhos || '').split(/[\/|·,]/).map(s => s.trim()).filter(Boolean);
    const cores = (product._cor || '').split(/[,;|·•/]|\s-\s|\s\/\s/).map(s => s.trim()).filter(Boolean);

    let existing = document.getElementById('detail-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'detail-modal';
    overlay.className = 'pmodal-overlay ml-open admin-pmodal';
    overlay.innerHTML = `
        <div class="pmodal-box">
            <button class="pmodal-close" id="detail-close" aria-label="Fechar">✕</button>
            <div class="pmodal-inner">
                <!-- Galeria -->
                <div class="pmodal-galeria">
                    <div class="pmodal-main-wrap">
                        <button type="button" class="pmodal-main-arrow pmodal-main-arrow--prev" id="dm-prev" aria-label="Imagem anterior" hidden>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        <img id="dm-main-img" src="${imagens[0]}" alt="${escapeHtml(product._nome)}"
                             class="pmodal-img-main${semImg ? ' pmodal-img-fallback' : ''}"
                             onerror="this.src='${FALLBACK}'">
                        <button type="button" class="pmodal-main-arrow pmodal-main-arrow--next" id="dm-next" aria-label="Próxima imagem" hidden>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                    </div>
                    <div class="pmodal-thumbs" id="dm-thumbs"></div>

                    <!-- Carrossel mobile -->
                    <div class="pmodal-carousel" id="dm-carousel" aria-roledescription="carousel">
                        <div class="pmodal-carousel-track" id="dm-carousel-track"></div>
                        <button type="button" class="pmodal-carousel-arrow pmodal-carousel-arrow--prev" id="dm-c-prev" aria-label="Imagem anterior">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        <button type="button" class="pmodal-carousel-arrow pmodal-carousel-arrow--next" id="dm-c-next" aria-label="Próxima imagem">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                        <div class="pmodal-carousel-dots" id="dm-carousel-dots" aria-hidden="true"></div>
                    </div>
                </div>

                <!-- Detalhes — alterna entre view-mode e edit-mode -->
                <div class="pmodal-detalhes admin-detalhes" data-mode="view">

                    <!-- ═══════════════════ MODO VISUALIZAÇÃO ═══════════════════ -->
                    <div class="dm-view-mode">
                        <span class="pmodal-cat">${escapeHtml(product._categoria || '')}</span>
                        <h2 class="pmodal-nome">${escapeHtml(product._nome)}</h2>

                        ${statusKey === 'esgotado' ? `
                        <div class="pmodal-badge-esgotado" style="display:inline-flex">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            Produto Esgotado
                        </div>` : ''}

                        <div class="pmodal-precos">
                            ${product._precoDe ? `<span class="pmodal-de">R$ ${escapeHtml(product._precoDe)}</span>` : ''}
                            <span class="pmodal-por">R$ ${escapeHtml(product._precoPor || '-')}</span>
                            ${product._desconto ? `<span class="pmodal-desc">${escapeHtml(product._desconto)}</span>` : ''}
                        </div>

                        ${product._formaPagamento ? `
                        <div class="dm-pagamento">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                            <span>${escapeHtml(product._formaPagamento)}</span>
                        </div>` : ''}

                        ${product._descricao ? `<p class="pmodal-texto">${escapeHtml(product._descricao)}</p>` : ''}

                        <div class="pmodal-specs">
                            <div class="pmodal-spec"><span class="pspec-l">Tipo</span><span class="pspec-v">${escapeHtml(product._tipo || 'Não informado')}</span></div>
                            <div class="pmodal-spec"><span class="pspec-l">Material</span><span class="pspec-v">${escapeHtml(product._material || 'Não informado')}</span></div>
                            <div class="pmodal-spec"><span class="pspec-l">Cor</span><span class="pspec-v">${cores.length <= 1
                                ? escapeHtml(cores[0] || 'Não informado')
                                : `<span class="pmodal-cor-pills">${cores.map(c => `<span class="pmodal-cor-pill">${escapeHtml(c)}</span>`).join('')}</span>`
                            }</span></div>
                            <div class="pmodal-spec"><span class="pspec-l">Tamanhos</span><span class="pspec-v">${tamanhos.length <= 1
                                ? escapeHtml(tamanhos[0] || 'Não informado')
                                : `<span class="pmodal-cor-pills">${tamanhos.map(t => `<span class="pmodal-cor-pill">${escapeHtml(t)}</span>`).join('')}</span>`
                            }</span></div>
                        </div>

                        <!-- Barra de ação rápida: status quick-change + botão editar -->
                        <div class="dm-quick-bar">
                            <div class="dm-quick-status" data-current="${escapeAttr(product._status || '')}">
                                <span class="dm-quick-status-label">Status</span>
                                <select class="dm-quick-status-select" id="dm-quick-status-select"></select>
                            </div>
                            <button type="button" class="pmodal-cta dm-edit-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>
                                Editar Produto
                            </button>
                        </div>
                    </div>

                    <!-- ═══════════════════ MODO EDIÇÃO ═══════════════════ -->
                    <div class="dm-edit-mode" hidden>
                        <div class="dm-edit-header">
                            <span class="dm-edit-badge">Editando produto</span>
                            <div class="dm-edit-status-pill">
                                <span class="dm-edit-status-pill-label">Status</span>
                                <select class="dm-input dm-select dm-edit-status-select" data-key="status"></select>
                            </div>
                        </div>

                        <div class="dm-edit-cols">
                            <!-- COLUNA ESQUERDA: dados estruturados -->
                            <div class="dm-edit-col dm-edit-col--left">
                                <label class="dm-form-field">
                                    <span class="dm-form-label">Nome do Produto *</span>
                                    <input type="text" class="dm-input dm-input--big" data-key="nome" value="${escapeAttr(product._nome)}" placeholder="Ex: Vestido Midi Floral">
                                </label>

                                <div class="dm-form-row">
                                    <label class="dm-form-field">
                                        <span class="dm-form-label">Categoria *</span>
                                        <select class="dm-input dm-select" data-key="categoria"></select>
                                    </label>
                                    <label class="dm-form-field">
                                        <span class="dm-form-label">Tipo</span>
                                        <select class="dm-input dm-select" data-key="tipo"></select>
                                    </label>
                                </div>

                                <div class="dm-form-row">
                                    <label class="dm-form-field">
                                        <span class="dm-form-label">Preço DE (R$)</span>
                                        <input type="text" class="dm-input" data-key="precoDe" value="${escapeAttr(product._precoDe)}" placeholder="219,90">
                                    </label>
                                    <label class="dm-form-field">
                                        <span class="dm-form-label">Preço POR (R$) *</span>
                                        <input type="text" class="dm-input" data-key="precoPor" value="${escapeAttr(product._precoPor)}" placeholder="179,90">
                                    </label>
                                </div>

                                <label class="dm-form-field">
                                    <span class="dm-form-label">Forma de pagamento</span>
                                    <input type="text" class="dm-input" data-key="formaPagamento" value="${escapeAttr(product._formaPagamento)}" placeholder="Ex: 3x sem juros · Pix com 10% off">
                                </label>

                                <label class="dm-form-field">
                                    <span class="dm-form-label">Material</span>
                                    <input type="text" class="dm-input" data-key="material" value="${escapeAttr(product._material)}" placeholder="Ex: Viscose">
                                </label>

                                <label class="dm-form-field">
                                    <span class="dm-form-label">Cores (separe por vírgula)</span>
                                    <input type="text" class="dm-input" data-key="cor" value="${escapeAttr(product._cor)}" placeholder="Ex: Terracota, Azul, Verde">
                                </label>

                                <label class="dm-form-field">
                                    <span class="dm-form-label">Tamanhos</span>
                                    <input type="text" class="dm-input" data-key="tamanhos" value="${escapeAttr(product._tamanhos)}" placeholder="P · M · G · GG">
                                </label>
                            </div>

                            <!-- COLUNA DIREITA: descrição + galeria de fotos + ações -->
                            <div class="dm-edit-col dm-edit-col--right">
                                <label class="dm-form-field">
                                    <span class="dm-form-label">Descrição *</span>
                                    <textarea class="dm-input dm-textarea dm-textarea--mid" data-key="descricao" placeholder="Descrição do produto...">${escapeHtml(product._descricao || '')}</textarea>
                                </label>

                                <!-- Galeria editável (dropzone premium + cards reordenáveis) -->
                                <div class="dm-form-field">
                                    <span class="dm-form-label">
                                        Galeria de Fotos
                                        <span class="dm-form-counter" id="dm-edit-counter">0/10</span>
                                    </span>
                                    <label class="img-dropzone dm-edit-dropzone" id="dm-edit-dropzone">
                                        <input type="file" id="dm-edit-input" accept="image/*" multiple hidden>
                                        <div class="img-dropzone-icon">
                                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                        </div>
                                        <div class="img-dropzone-text">
                                            <strong>Adicionar fotos</strong>
                                            <span>Arraste ou clique · até 10 fotos</span>
                                        </div>
                                    </label>
                                    <div class="img-gallery dm-edit-gallery" id="dm-edit-gallery"></div>
                                </div>

                                <div class="dm-footer">
                                    <button type="button" class="dm-cancel-btn">Cancelar</button>
                                    <button type="button" class="pmodal-cta dm-save-btn">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                        Salvar Alterações
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    ScrollLock.lock();
    const fechar = () => {
        if (overlay.dataset.editing === '1') {
            if (!confirm('Você está editando. Descartar alterações?')) return;
        }
        ScrollLock.unlock();
        overlay.remove();
    };

    overlay.querySelector('#detail-close').addEventListener('click', fechar);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) fechar(); });

    // ── Modo Edição (inline) ──
    const detalhes = overlay.querySelector('.admin-detalhes');
    const btnEdit = overlay.querySelector('.dm-edit-btn');
    const btnCancel = overlay.querySelector('.dm-cancel-btn');
    const btnSave = overlay.querySelector('.dm-save-btn');

    btnEdit.addEventListener('click', () => entrarModoEdicao(overlay, product));
    btnCancel.addEventListener('click', () => sairModoEdicao(overlay, product));
    btnSave.addEventListener('click', () => salvarEdicaoInline(overlay, product, fechar));

    // Quick status (barra de ação rápida — view mode).
    const quickStatusSel = overlay.querySelector('#dm-quick-status-select');
    if (quickStatusSel) {
        const statusList = _configDados.status || [];
        quickStatusSel.innerHTML = statusList.map(s =>
            `<option value="${escapeAttr(s)}" ${s === product._status ? 'selected' : ''}>${escapeHtml(s)}</option>`
        ).join('');
        // Aplica classe pelo status atual (cor do fundo da pill).
        const aplicarCorStatus = () => {
            const k = (quickStatusSel.value || '').toLowerCase();
            const info = STATUS_MAP[k] || { cls: 'status-inativo' };
            quickStatusSel.className = `dm-quick-status-select ${info.cls}`;
        };
        aplicarCorStatus();
        quickStatusSel.addEventListener('change', async () => {
            const novoStatus = quickStatusSel.value;
            quickStatusSel.disabled = true;
            try {
                await enviarViaIframe({
                    action: 'update',
                    row: product._rowIndex,
                    values: [
                        product._id, product._nome, product._categoria, product._tipo,
                        product._cor, product._tamanhos, product._material, product._descricao,
                        product._imagem1 || '', product._imagem2 || '', product._imagem3 || '',
                        product._imagem4 || '', product._imagem5 || '', product._imagem6 || '',
                        product._imagem7 || '', product._imagem8 || '', product._imagem9 || '', product._imagem10 || '',
                        product._link, product._precoDe, product._precoPor, product._desconto,
                        product._formaPagamento || '', novoStatus
                    ]
                });
                product._status = novoStatus;
                aplicarCorStatus();
                showToast(`Status: ${novoStatus}`, 'success');
                registrarHistorico('Status', product._nome, `Status alterado para ${novoStatus}`);
                setTimeout(() => location.reload(), 600);
            } catch (err) {
                showToast('Erro ao alterar status: ' + err.message, 'error');
            } finally {
                quickStatusSel.disabled = false;
            }
        });
    }

    // ── Thumbs (linha única) ──
    const thumbsEl = overlay.querySelector('#dm-thumbs');
    if (!semImg && imagens.length > 1) {
        thumbsEl.innerHTML = imagens.map((u, i) =>
            `<img src="${u}" class="pmodal-thumb${i === 0 ? ' active' : ''}" alt="">`
        ).join('');
    }

    // ── Setas main image (desktop) ──
    const mainImg = overlay.querySelector('#dm-main-img');
    const prevBtn = overlay.querySelector('#dm-prev');
    const nextBtn = overlay.querySelector('#dm-next');
    let idx = 0;
    function mostrarIdx(i) {
        idx = (i + imagens.length) % imagens.length;
        mainImg.src = imagens[idx];
        thumbsEl.querySelectorAll('.pmodal-thumb').forEach((t, j) => t.classList.toggle('active', j === idx));
    }
    if (!semImg && imagens.length > 1) {
        prevBtn.hidden = false;
        nextBtn.hidden = false;
        prevBtn.addEventListener('click', () => mostrarIdx(idx - 1));
        nextBtn.addEventListener('click', () => mostrarIdx(idx + 1));
        thumbsEl.querySelectorAll('.pmodal-thumb').forEach((thumb, i) => {
            thumb.addEventListener('click', () => mostrarIdx(i));
        });
    }

    // ── Carrossel mobile (drag + setas + dots) ──
    montarCarrosselDetailMobile(overlay, imagens);

    // Atalho: ícone lápis abre direto no modo edição.
    if (opts.startEditing) {
        // Próximo frame pra garantir que tudo está renderizado antes do toggle.
        requestAnimationFrame(() => entrarModoEdicao(overlay, product));
    }
}

// Carrossel mobile do modal admin (similar ao do index).
// ============================================
// MODO EDIÇÃO INLINE — alterna view/edit no modal de detalhes
// ============================================
// Estado da galeria do edit-mode (cards de imagem).
let _dmEditCards = [];
let _dmEditIdSeq = 0;

function entrarModoEdicao(overlay, product) {
    const detalhes = overlay.querySelector('.admin-detalhes');
    const viewMode = overlay.querySelector('.dm-view-mode');
    const editMode = overlay.querySelector('.dm-edit-mode');

    detalhes.dataset.mode = 'edit';
    overlay.dataset.editing = '1';
    overlay.classList.add('is-editing'); // CSS esconde a galeria irmã
    viewMode.hidden = true;
    editMode.hidden = false;

    // Popula selects (categoria, tipo, status).
    const fillSelect = (key, lista, valorAtual, placeholder) => {
        const sel = editMode.querySelector(`select[data-key="${key}"]`);
        if (!sel) return;
        const opts = (lista || []).map(v =>
            `<option value="${escapeAttr(v)}" ${v === valorAtual ? 'selected' : ''}>${escapeHtml(v)}</option>`
        ).join('');
        sel.innerHTML = (placeholder ? `<option value="">${placeholder}</option>` : '') + opts;
    };
    fillSelect('categoria', _configDados.categorias, product._categoria, '— escolha —');
    fillSelect('tipo', _configDados.tipos, product._tipo, '— sem tipo —');
    fillSelect('status', _configDados.status, product._status);

    // Popula galeria editável com as imagens atuais.
    _dmEditCards = (product._imagens || []).filter(Boolean).map(url => ({
        id: ++_dmEditIdSeq, url, status: 'idle', progress: 1
    }));
    _dmEditRender(overlay);
    _dmEditLigarDropzone(overlay);
}

function sairModoEdicao(overlay, product) {
    const detalhes = overlay.querySelector('.admin-detalhes');
    detalhes.dataset.mode = 'view';
    overlay.dataset.editing = '';
    overlay.classList.remove('is-editing'); // volta a mostrar a galeria
    overlay.querySelector('.dm-view-mode').hidden = false;
    overlay.querySelector('.dm-edit-mode').hidden = true;
    _dmEditCards = [];
}

// ── Galeria editável dentro do edit-mode ──
function _dmEditAtualizarCounter(overlay) {
    const counter = overlay.querySelector('#dm-edit-counter');
    if (counter) counter.textContent = `${_dmEditCards.length}/${MAX_FOTOS}`;
    const dz = overlay.querySelector('#dm-edit-dropzone');
    if (dz) dz.classList.toggle('is-full', _dmEditCards.length >= MAX_FOTOS);
}

function _dmEditRender(overlay) {
    const grid = overlay.querySelector('#dm-edit-gallery');
    if (!grid) return;
    grid.innerHTML = _dmEditCards.map((card, i) => `
        <div class="img-card${card.status === 'uploading' ? ' is-uploading' : ''}${card.status === 'error' ? ' is-error' : ''}"
             data-id="${card.id}">
            ${i === 0 ? '<span class="img-card-badge-destaque">Destaque</span>' : ''}
            <div class="img-card-handle" title="Arraste para reordenar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/>
                    <circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/>
                </svg>
            </div>
            ${card.url
                ? `<img src="${card.url}" class="img-card-img" alt="">`
                : `<div class="img-card-placeholder">
                       <div class="img-card-spinner"></div>
                       <span class="img-card-progress">${Math.round((card.progress || 0) * 100)}%</span>
                   </div>`}
            <button type="button" class="img-card-remove" title="Remover" aria-label="Remover foto">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
            ${card.status === 'uploading' ? `<div class="img-card-bar"><div class="img-card-bar-fill" style="width:${(card.progress || 0) * 100}%"></div></div>` : ''}
        </div>
    `).join('');
    _dmEditAtualizarCounter(overlay);

    grid.querySelectorAll('.img-card').forEach(el => {
        const id = parseInt(el.dataset.id, 10);
        el.querySelector('.img-card-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            const card = _dmEditCards.find(c => c.id === id);
            if (card?.url) deleteR2File(card.url);
            _dmEditCards = _dmEditCards.filter(c => c.id !== id);
            _dmEditRender(overlay);
        });
        // Drag-to-reorder (mouse + touch via Pointer Events).
        bindReorderTouchDrag(el, id, grid, (fromId, toId) => {
            const fromIdx = _dmEditCards.findIndex(c => c.id === fromId);
            const toIdx = _dmEditCards.findIndex(c => c.id === toId);
            if (fromIdx < 0 || toIdx < 0) return;
            const [moved] = _dmEditCards.splice(fromIdx, 1);
            _dmEditCards.splice(toIdx, 0, moved);
            _dmEditRender(overlay);
        });
    });
}

function _dmEditLigarDropzone(overlay) {
    const dz = overlay.querySelector('#dm-edit-dropzone');
    const input = overlay.querySelector('#dm-edit-input');
    if (!dz || !input || dz.dataset.bound) return;
    dz.dataset.bound = '1';

    dz.addEventListener('click', (e) => {
        if (_dmEditCards.length >= MAX_FOTOS) {
            e.preventDefault();
            showToast(`Limite de ${MAX_FOTOS} fotos atingido.`, 'error');
        }
    });
    input.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
        input.value = '';
        if (files.length) await _dmEditProcessar(overlay, files);
    });
    dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('is-dragover'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('is-dragover'));
    dz.addEventListener('drop', async (e) => {
        e.preventDefault();
        dz.classList.remove('is-dragover');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length) await _dmEditProcessar(overlay, files);
    });
}

async function _dmEditProcessar(overlay, files) {
    const livres = MAX_FOTOS - _dmEditCards.length;
    if (livres <= 0) {
        showToast(`Limite de ${MAX_FOTOS} fotos atingido.`, 'error');
        return;
    }
    const aceitar = files.slice(0, livres);
    if (files.length > livres) showToast(`Só foram aceitas ${livres} foto(s).`, 'error');

    const novos = aceitar.map(file => {
        const card = { id: ++_dmEditIdSeq, url: '', status: 'uploading', progress: 0.05, file };
        _dmEditCards.push(card);
        return card;
    });
    _dmEditRender(overlay);

    await Promise.all(novos.map(async (card) => {
        try {
            if (card.file.size > 30 * 1024 * 1024) throw new Error('Maior que 30MB');
            card.progress = 0.2; _dmEditRender(overlay);
            const webpFile = await convertToWebp(card.file);
            card.progress = 0.5; _dmEditRender(overlay);
            const filename = `produtos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
            card.progress = 0.7; _dmEditRender(overlay);
            const url = await uploadToR2Direct(filename, webpFile);
            card.url = url;
            card.status = 'idle';
            card.progress = 1;
            card.file = null;
        } catch (err) {
            console.error(err);
            card.status = 'error';
            showToast(`Erro: ${err.message}`, 'error');
            setTimeout(() => {
                _dmEditCards = _dmEditCards.filter(c => c.id !== card.id);
                _dmEditRender(overlay);
            }, 1200);
        } finally {
            _dmEditRender(overlay);
        }
    }));
}

async function salvarEdicaoInline(overlay, product, fecharFn) {
    const btnSave = overlay.querySelector('.dm-save-btn');
    const labelOriginal = btnSave.innerHTML;
    btnSave.disabled = true;
    btnSave.textContent = 'Salvando...';

    const get = (k) => overlay.querySelector(`[data-key="${k}"]`)?.value.trim() || '';
    const dados = {
        nome: get('nome'),
        categoria: get('categoria'),
        tipo: get('tipo'),
        precoDe: get('precoDe'),
        precoPor: get('precoPor'),
        formaPagamento: get('formaPagamento'),
        descricao: get('descricao'),
        material: get('material'),
        cor: get('cor'),
        tamanhos: get('tamanhos'),
        status: get('status')
    };

    if (!dados.nome || !dados.categoria || !dados.precoPor) {
        showToast('Preencha nome, categoria e preço.', 'error');
        btnSave.disabled = false;
        btnSave.innerHTML = labelOriginal;
        return;
    }

    // URLs das imagens em ordem da galeria editada (slot 1..10).
    const urls = _dmEditCards.map(c => c.url || '').filter(Boolean);
    const slot = (i) => urls[i] || '';

    try {
        const valuesSemDesconto = [
            product._id,
            dados.nome,
            dados.categoria,
            dados.tipo,
            dados.cor,
            dados.tamanhos,
            dados.material,
            dados.descricao,
            slot(0), slot(1), slot(2), slot(3), slot(4),
            slot(5), slot(6), slot(7), slot(8), slot(9),
            product._link || '',  // link preservado, não mais editável
            dados.precoDe,
            dados.precoPor
        ];
        const valuesAposDesconto = [
            dados.formaPagamento,
            dados.status
        ];

        await enviarViaIframe({
            action: 'update_skip_desconto',
            row: product._rowIndex,
            valuesSemDesconto,
            valuesAposDesconto
        });

        showToast(`"${dados.nome}" atualizado!`, 'success');
        registrarHistorico('Editado', dados.nome, `Status: ${dados.status} | Preço: R$ ${dados.precoPor}`);
        setTimeout(() => location.reload(), 800);
    } catch (err) {
        showToast('Erro ao salvar: ' + err.message, 'error');
        btnSave.disabled = false;
        btnSave.innerHTML = labelOriginal;
    }
}

// Helper para escapar valores em atributo HTML.
function escapeAttr(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function montarCarrosselDetailMobile(overlay, imagens) {
    const carousel = overlay.querySelector('#dm-carousel');
    const track = overlay.querySelector('#dm-carousel-track');
    const dotsEl = overlay.querySelector('#dm-carousel-dots');
    const prevBtn = overlay.querySelector('#dm-c-prev');
    const nextBtn = overlay.querySelector('#dm-c-next');
    if (!carousel || !track || !imagens.length) return;

    track.innerHTML = imagens.map(src => `
        <div class="pmodal-carousel-slide"><img src="${src}" alt="" loading="lazy"></div>
    `).join('');
    dotsEl.innerHTML = imagens.map((_, i) =>
        `<button type="button" class="pmodal-carousel-dot${i === 0 ? ' is-active' : ''}" aria-label="Imagem ${i+1}"></button>`
    ).join('');
    carousel.classList.toggle('has-one', imagens.length === 1);

    let idx = 0;
    const total = imagens.length;
    function goTo(i) {
        idx = Math.max(0, Math.min(total - 1, i));
        track.style.transform = `translateX(${-idx * 100}%)`;
        dotsEl.querySelectorAll('.pmodal-carousel-dot').forEach((d, j) => d.classList.toggle('is-active', j === idx));
        prevBtn.disabled = idx === 0;
        nextBtn.disabled = idx === total - 1;
    }
    prevBtn.onclick = () => goTo(idx - 1);
    nextBtn.onclick = () => goTo(idx + 1);
    dotsEl.querySelectorAll('.pmodal-carousel-dot').forEach((d, i) => d.addEventListener('click', () => goTo(i)));
    goTo(0);

    // Drag (touch + mouse)
    let dragStartX = null, dragCurrentX = 0, dragWidth = 0;
    function onDown(e) {
        dragStartX = (e.touches ? e.touches[0].clientX : e.clientX);
        dragWidth = carousel.getBoundingClientRect().width;
        track.classList.add('is-dragging');
    }
    function onMove(e) {
        if (dragStartX === null) return;
        const x = (e.touches ? e.touches[0].clientX : e.clientX);
        dragCurrentX = x - dragStartX;
        track.style.transform = `translateX(calc(${-idx * 100}% + ${dragCurrentX}px))`;
    }
    function onUp() {
        if (dragStartX === null) return;
        track.classList.remove('is-dragging');
        const threshold = dragWidth * 0.2;
        if (dragCurrentX > threshold && idx > 0) goTo(idx - 1);
        else if (dragCurrentX < -threshold && idx < total - 1) goTo(idx + 1);
        else goTo(idx);
        dragStartX = null;
        dragCurrentX = 0;
    }
    track.ontouchstart = onDown;
    track.ontouchmove = onMove;
    track.ontouchend = onUp;
    track.onmousedown = (e) => { e.preventDefault(); onDown(e); };
    track.onmousemove = (e) => { if (dragStartX !== null) onMove(e); };
    track.onmouseup = onUp;
    track.onmouseleave = () => { if (dragStartX !== null) onUp(); };
}

// Estado dos filtros multi-select (arrays de valores selecionados).
const _multiFilters = { categoria: [], status: [] };

function filterProducts() {
    const search = document.getElementById('filter-search').value.toLowerCase().trim();
    const categorias = _multiFilters.categoria; // array de catKeys
    const statuses = _multiFilters.status;       // array de status (lowercase)

    filteredProducts = allProducts.filter(product => {
        const matchSearch = !search ||
            product._nome.toLowerCase().includes(search) ||
            product._categoria.toLowerCase().includes(search) ||
            product._tipo.toLowerCase().includes(search);

        const matchCategoria = categorias.length === 0 ||
            categorias.includes(getCatKey(product._categoria));

        const matchStatus = statuses.length === 0 ||
            statuses.includes(product._status.toLowerCase());

        return matchSearch && matchCategoria && matchStatus;
    });
    
    currentPage = 1;
    renderTable();
}

function getCatKey(categoria) {
    const cat = categoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
    if (cat.includes('vestido')) return 'vestidos';
    if (cat.includes('macacao') || cat.includes('macacoes')) return 'macacoes';
    if (cat.includes('conjunto')) return 'conjuntos';
    if (cat.includes('saia')) return 'saias';
    if (cat.includes('body') || cat.includes('bodys')) return 'bodys';
    if (cat.includes('blusa')) return 'blusas';
    if (cat.includes('plus')) return 'plus-size';
    if (cat.includes('short')) return 'shorts';
    if (cat.includes('acessorio')) return 'acessorios';
    if (cat.includes('macaquinho')) return 'macaquinhos';
    if (cat.includes('nova') || cat.includes('colecao')) return 'nova-colecao';
    return cat;
}

// ============================================
// MODAL - FORMULÁRIO
// ============================================
function openModal(product = null) {
    const modal = document.getElementById('modal-produto');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('form-produto');
    
    form.reset();
    document.getElementById('prod-row-index').value = '';
    resetImageFields();
    
    if (product) {
        title.textContent = 'Editar Produto';
        document.getElementById('prod-row-index').value = product._rowIndex;
        document.getElementById('prod-id').value = product._id;
        document.getElementById('prod-nome').value = product._nome;
        csdSetValue('categoria', product._categoria);
        csdSetValue('tipo', product._tipo);
        document.getElementById('prod-preco-de').value = product._precoDe;
        document.getElementById('prod-preco-por').value = product._precoPor;
        document.getElementById('prod-desconto').value = product._desconto;
        document.getElementById('prod-tamanhos').value = product._tamanhos;
        document.getElementById('prod-descricao').value = product._descricao;
        document.getElementById('prod-material').value = product._material;
        document.getElementById('prod-cor').value = product._cor;
        csdSetValue('status', product._status);
        document.getElementById('prod-link').value = product._link;
        
        // Popula campos de imagem com upload
        populateImageFields(product);
    } else {
        title.textContent = 'Novo Produto';
        csdSetValue('categoria', '');
        csdSetValue('tipo', '');
        csdSetValue('status', 'Ativo');
    }
    
    modal.hidden = false;
    ScrollLock.lock();
}

function closeModal() {
    document.getElementById('modal-produto').hidden = true;
    ScrollLock.unlock();
}

// ============================================
// UPLOAD DE IMAGENS - CLOUDFLARE R2
// ============================================

// ============================================
// SELEÇÃO EM LOTE — checkboxes + barra de ações
// ============================================
function atualizarBarraSelecao() {
    const bar = document.getElementById('batchBar');
    const count = document.getElementById('batchCount');
    if (!bar || !count) return;
    const n = _selecionados.size;
    count.textContent = n;
    bar.hidden = n === 0;
    // Modo seleção: enquanto houver algum selecionado, qualquer click no card alterna
    // a marcação (em vez de abrir o modal de detalhes). Body class controla o CSS também.
    document.body.classList.toggle('has-selection', n > 0);
}

function limparSelecao() {
    _selecionados.clear();
    document.querySelectorAll('.prod-check-input').forEach(cb => { cb.checked = false; });
    document.querySelectorAll('.prod-card.is-selected, .prod-list-item.is-selected').forEach(el => el.classList.remove('is-selected'));
    atualizarBarraSelecao();
}

function selecionarTodosVisiveis() {
    filteredProducts.forEach(p => _selecionados.add(p._rowIndex));
    document.querySelectorAll('.prod-check-input').forEach(cb => { cb.checked = true; });
    document.querySelectorAll('.prod-card, .prod-list-item').forEach(el => el.classList.add('is-selected'));
    atualizarBarraSelecao();
}

/**
 * Distribui múltiplas imagens nos slots disponíveis começando por `startField`.
 * Pula slots que já têm imagem preenchida. Avisa se sobrarem.
 */
// ============================================
// GALERIA DE IMAGENS PREMIUM (até 10 fotos)
// Modelo: drop zone unificada + lista visual ordenável + drag-to-reorder.
// API pública preservada (resetImageFields, populateImageFields).
// O form coleta as URLs em ordem via _slotsAtuais (handleSubmit).
// ============================================
const MAX_FOTOS = 10;

// Estado interno: array ordenado de cards. Cada card representa uma foto.
// { id, url, status: 'idle'|'uploading'|'error', progress: 0..1, file }
let _galleryCards = [];
let _galleryIdSeq = 0;

// _slotsAtuais é mantido para compatibilidade com handleSubmit/saveToGoogleSheets
// e reflete a ordem atual dos cards em formato 'imagem1', 'imagem2'...
let _slotsAtuais = [];

function _galleryRecomputarSlots() {
    _slotsAtuais = _galleryCards.map((_, i) => `imagem${i + 1}`);
    // Sincroniza inputs hidden compatíveis para o handleSubmit ler.
    const hiddenWrap = document.getElementById('img-hidden-inputs');
    if (hiddenWrap) {
        hiddenWrap.innerHTML = _galleryCards.map((c, i) =>
            `<input type="hidden" id="prod-imagem${i + 1}" value="${c.url || ''}">`
        ).join('');
    }
}

function _galleryAtualizarHeader() {
    const count = document.getElementById('img-gallery-count');
    const fill = document.getElementById('img-gallery-bar-fill');
    if (count) count.textContent = _galleryCards.filter(c => c.url).length;
    if (fill) fill.style.width = `${(_galleryCards.length / MAX_FOTOS) * 100}%`;
    // Esgota dropzone se chegou ao limite.
    const dz = document.getElementById('img-dropzone');
    if (dz) dz.classList.toggle('is-full', _galleryCards.length >= MAX_FOTOS);
    const hint = document.getElementById('img-gallery-hint');
    if (hint) hint.style.display = _galleryCards.length > 0 ? '' : 'none';
}

/**
 * Helper: liga drag-to-reorder usando Pointer Events (funciona em mouse E touch).
 * Resolve a limitação do HTML5 Drag&Drop que não funciona em mobile.
 *
 * @param {HTMLElement} el Card que pode ser arrastado.
 * @param {number} id ID do card.
 * @param {HTMLElement} grid Container que contém os outros cards.
 * @param {Function} onReorder Callback (fromId, toId) ao soltar sobre outro card.
 */
function bindReorderTouchDrag(el, id, grid, onReorder) {
    let dragging = false;
    let startX = 0, startY = 0;
    let ghost = null;
    let lastTarget = null;
    const THRESHOLD = 8; // px de movimento até começar drag (evita conflito com scroll)

    function onPointerDown(e) {
        // Não inicia drag se clicou no botão remover.
        if (e.target.closest('.img-card-remove')) return;
        // Só botão esquerdo do mouse.
        if (e.button !== undefined && e.button !== 0) return;

        startX = e.clientX;
        startY = e.clientY;
        dragging = false;
        el.setPointerCapture(e.pointerId);

        const onMove = (ev) => {
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            // Espera movimento suficiente pra começar (não atrapalha tap/scroll).
            if (!dragging && Math.hypot(dx, dy) < THRESHOLD) return;
            if (!dragging) {
                dragging = true;
                el.classList.add('is-dragging');
                // Cria ghost flutuante seguindo o cursor.
                ghost = el.cloneNode(true);
                ghost.style.position = 'fixed';
                ghost.style.pointerEvents = 'none';
                ghost.style.opacity = '0.85';
                ghost.style.zIndex = '9999';
                ghost.style.width = el.offsetWidth + 'px';
                ghost.style.height = el.offsetHeight + 'px';
                ghost.style.transform = 'rotate(-2deg) scale(0.95)';
                ghost.style.boxShadow = '0 14px 40px rgba(0,0,0,0.6), 0 0 0 2px rgba(200,169,106,0.5)';
                document.body.appendChild(ghost);
            }
            ghost.style.left = (ev.clientX - el.offsetWidth / 2) + 'px';
            ghost.style.top = (ev.clientY - el.offsetHeight / 2) + 'px';

            // Detecta sobre qual card está.
            ghost.style.display = 'none';
            const under = document.elementFromPoint(ev.clientX, ev.clientY);
            ghost.style.display = '';
            const overCard = under?.closest('.img-card');
            if (overCard && overCard !== el && grid.contains(overCard)) {
                if (lastTarget && lastTarget !== overCard) lastTarget.classList.remove('is-drag-over');
                overCard.classList.add('is-drag-over');
                lastTarget = overCard;
            } else if (lastTarget) {
                lastTarget.classList.remove('is-drag-over');
                lastTarget = null;
            }
        };

        const onUp = () => {
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerup', onUp);
            el.removeEventListener('pointercancel', onUp);
            try { el.releasePointerCapture(e.pointerId); } catch {}

            if (dragging) {
                el.classList.remove('is-dragging');
                if (ghost) { ghost.remove(); ghost = null; }
                if (lastTarget) {
                    const targetId = parseInt(lastTarget.dataset.id, 10);
                    lastTarget.classList.remove('is-drag-over');
                    if (!isNaN(targetId) && targetId !== id) onReorder(id, targetId);
                    lastTarget = null;
                }
            }
            dragging = false;
        };

        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerup', onUp);
        el.addEventListener('pointercancel', onUp);
    }

    el.addEventListener('pointerdown', onPointerDown);
}

function _galleryRender() {
    const grid = document.getElementById('img-gallery');
    if (!grid) return;
    grid.innerHTML = _galleryCards.map((card, i) => `
        <div class="img-card${card.status === 'uploading' ? ' is-uploading' : ''}${card.status === 'error' ? ' is-error' : ''}"
             data-id="${card.id}">
            ${i === 0 ? '<span class="img-card-badge-destaque">Destaque</span>' : ''}
            <div class="img-card-handle" title="Arraste para reordenar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/>
                    <circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/>
                </svg>
            </div>
            ${card.url
                ? `<img src="${card.url}" class="img-card-img" alt="">`
                : `<div class="img-card-placeholder">
                       <div class="img-card-spinner"></div>
                       <span class="img-card-progress">${Math.round((card.progress || 0) * 100)}%</span>
                   </div>`}
            <button type="button" class="img-card-remove" title="Remover" aria-label="Remover foto">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
            ${card.status === 'uploading' ? `<div class="img-card-bar"><div class="img-card-bar-fill" style="width:${(card.progress || 0) * 100}%"></div></div>` : ''}
        </div>
    `).join('');

    // Listeners por card.
    grid.querySelectorAll('.img-card').forEach(el => {
        const id = parseInt(el.dataset.id, 10);
        el.querySelector('.img-card-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            galleryRemoverPorId(id);
        });
        // Drag-to-reorder (mouse + touch via Pointer Events).
        bindReorderTouchDrag(el, id, grid, (fromId, toId) => {
            const fromIdx = _galleryCards.findIndex(c => c.id === fromId);
            const toIdx = _galleryCards.findIndex(c => c.id === toId);
            if (fromIdx < 0 || toIdx < 0) return;
            const [moved] = _galleryCards.splice(fromIdx, 1);
            _galleryCards.splice(toIdx, 0, moved);
            _galleryRecomputarSlots();
            _galleryRender();
        });
    });
}

function _galleryRefresh() {
    _galleryRecomputarSlots();
    _galleryRender();
    _galleryAtualizarHeader();
}

function galleryRemoverPorId(id) {
    const card = _galleryCards.find(c => c.id === id);
    if (!card) return;
    // Apaga do R2 (best-effort) se já tinha URL.
    if (card.url) deleteR2File(card.url);
    _galleryCards = _galleryCards.filter(c => c.id !== id);
    _galleryRefresh();
}

function galleryAdicionarUrl(url) {
    if (_galleryCards.length >= MAX_FOTOS) return;
    _galleryCards.push({ id: ++_galleryIdSeq, url, status: 'idle', progress: 1 });
    _galleryRefresh();
}

async function galleryProcessarArquivos(files) {
    const slotsLivres = MAX_FOTOS - _galleryCards.length;
    if (slotsLivres <= 0) {
        showToast(`Limite de ${MAX_FOTOS} fotos atingido.`, 'error');
        return;
    }
    const aceitar = files.slice(0, slotsLivres);
    if (files.length > slotsLivres) {
        showToast(`Só foram aceitas ${slotsLivres} foto(s). Limite ${MAX_FOTOS}.`, 'error');
    }

    // Cria placeholders na hora (UX imediato).
    const novos = aceitar.map(file => {
        const card = { id: ++_galleryIdSeq, url: '', status: 'uploading', progress: 0.05, file };
        _galleryCards.push(card);
        return card;
    });
    _galleryRefresh();

    // Faz upload em paralelo, atualizando cada card.
    await Promise.all(novos.map(async (card) => {
        try {
            // Validação básica.
            if (!card.file.type.startsWith('image/')) throw new Error('Tipo inválido');
            if (card.file.size > 30 * 1024 * 1024) throw new Error('Maior que 30MB');

            // Conversão WEBP + upload (reusa pipeline existente de handleImageUpload).
            card.progress = 0.2; _galleryRender();
            const webpFile = await convertToWebp(card.file);
            card.progress = 0.5; _galleryRender();
            const filename = `produtos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
            card.progress = 0.7; _galleryRender();
            const publicUrl = await uploadToR2Direct(filename, webpFile);
            card.url = publicUrl;
            card.status = 'idle';
            card.progress = 1;
            card.file = null;
        } catch (err) {
            console.error('Falha no upload:', err);
            card.status = 'error';
            showToast(`Erro ao enviar foto: ${err.message}`, 'error');
            // Remove o card que falhou após 1.2s pra usuário perceber.
            setTimeout(() => galleryRemoverPorId(card.id), 1200);
        } finally {
            _galleryRefresh();
        }
    }));
}

// ── API pública usada pelo handleSubmit / openModal / etc ──

/** Reseta a galeria (chamado ao abrir modal de Novo Produto). */
function resetImageFields() {
    _galleryCards = [];
    _galleryRefresh();
}

/** Popula a galeria ao editar produto existente. */
function populateImageFields(product) {
    _galleryCards = (product._imagens || [])
        .filter(Boolean)
        .map(url => ({ id: ++_galleryIdSeq, url, status: 'idle', progress: 1 }));
    _galleryRefresh();
}

/** Atualiza o contador (mantido por compat — _galleryRefresh já cuida). */
function atualizarBotaoAddFoto() { _galleryAtualizarHeader(); }

/** Inicializa drop zone + input no carregamento. */
function initImageUploads() {
    _galleryCards = [];
    _galleryRefresh();

    const dz = document.getElementById('img-dropzone');
    const input = document.getElementById('img-dropzone-input');
    if (!dz || !input) return;

    dz.addEventListener('click', (e) => {
        if (_galleryCards.length >= MAX_FOTOS) {
            e.preventDefault();
            showToast(`Limite de ${MAX_FOTOS} fotos atingido.`, 'error');
        }
    });
    input.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
        if (files.length) galleryProcessarArquivos(files);
        input.value = '';
    });
    dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('is-dragover'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('is-dragover'));
    dz.addEventListener('drop', (e) => {
        e.preventDefault();
        dz.classList.remove('is-dragover');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (!files.length) {
            showToast('Por favor, arraste apenas imagens.', 'error');
            return;
        }
        galleryProcessarArquivos(files);
    });
}

/**
 * Processa o upload de uma imagem para o Cloudflare R2
 * Via Google Apps Script (proxy seguro)
 */
async function handleImageUpload(field, file) {
    // Validações
    if (!file.type.startsWith('image/')) {
        showToast('O arquivo deve ser uma imagem (JPG, PNG, WEBP).', 'error');
        return;
    }
    if (file.size > 30 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 30MB.', 'error');
        return;
    }

    // Captura a imagem atual do slot — se o upload novo der certo, deleta a antiga do R2.
    const previousUrl = document.getElementById(`prod-${field}`).value;

    const area = document.getElementById(`area-${field}`);
    const progressEl = document.getElementById(`progress-${field}`);
    const progressBar = progressEl?.querySelector('.img-upload-progress-bar');

    area.classList.add('is-uploading');
    if (progressEl) progressEl.hidden = false;
    if (progressBar) progressBar.style.width = '20%';

    try {
        if (progressBar) progressBar.style.width = '20%';

        // Converte para WEBP 85% qualidade, máx 1200px largura
        const webpFile = await convertToWebp(file);
        if (progressBar) progressBar.style.width = '40%';

        // Gera nome único com extensão .webp
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const filename = `produtos/${timestamp}-${random}.webp`;

        if (progressBar) progressBar.style.width = '60%';

        // Upload direto para R2 do navegador
        const publicUrl = await uploadToR2Direct(filename, webpFile);

        if (progressBar) progressBar.style.width = '100%';

        // Atualiza o campo hidden e preview
        document.getElementById(`prod-${field}`).value = publicUrl;
        setImagePreview(field, publicUrl);

        // Atualiza o input de URL
        const urlInput = document.getElementById(`url-${field}`);
        if (urlInput) urlInput.value = publicUrl;

        // Limpa a imagem antiga do R2 (se havia uma e é diferente da nova).
        if (previousUrl && previousUrl !== publicUrl) {
            deleteR2File(previousUrl);
        }

        // Atualiza contador X/10.
        atualizarBotaoAddFoto();

        showToast('Imagem enviada com sucesso!', 'success');

    } catch (error) {
        console.error('Erro no upload:', error);
        showToast('Erro ao enviar imagem: ' + error.message, 'error');
    } finally {
        area.classList.remove('is-uploading');
        setTimeout(() => {
            if (progressEl) progressEl.hidden = true;
            if (progressBar) progressBar.style.width = '0%';
        }, 500);
    }
}

/**
 * Converte qualquer imagem para WEBP com qualidade 85% e máx 1200px de largura
 */
function convertToWebp(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            const MAX_WIDTH = 1200;
            let { naturalWidth: w, naturalHeight: h } = img;

            if (w > MAX_WIDTH) {
                h = Math.round(h * MAX_WIDTH / w);
                w = MAX_WIDTH;
            }

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);

            canvas.toBlob(blob => {
                if (!blob) { reject(new Error('Falha ao converter imagem')); return; }
                resolve(new File([blob], 'imagem.webp', { type: 'image/webp' }));
            }, 'image/webp', 0.92);
        };

        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Falha ao carregar imagem')); };
        img.src = url;
    });
}

/**
 * Upload de imagem via Apps Script (credenciais ficam no backend).
 * Envia o arquivo em Base64 para a action `upload_r2`; o Apps Script
 * assina a requisição AWS V4 com as Script Properties e devolve a URL pública.
 */
async function uploadToR2Direct(filename, file) {
    const base64 = await fileToBase64(file);

    const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'upload_r2',
            filename,
            mimeType: file.type,
            data: base64
        })
    });

    if (!response.ok) {
        throw new Error(`Apps Script retornou ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
        throw new Error(result.error || 'Falha no upload');
    }

    return result.url;
}

/**
 * Pede ao Apps Script para deletar uma imagem do R2 pela URL pública.
 * Best-effort: nunca lança — falhar a limpeza não pode quebrar o fluxo principal.
 * URLs vazias, externas ou inválidas são silenciosamente ignoradas.
 */
async function deleteR2File(url) {
    if (!url || typeof url !== 'string') return;
    if (!/^https?:\/\//i.test(url)) return;

    try {
        await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'delete_r2', url })
        });
    } catch (err) {
        console.warn('Falha ao deletar imagem do R2 (ignorado):', url, err);
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            const commaIdx = dataUrl.indexOf(',');
            resolve(commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl);
        };
        reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
        reader.readAsDataURL(file);
    });
}

/**
 * Define o preview da imagem no campo
 */
function setImagePreview(field, url) {
    const preview = document.getElementById(`preview-${field}`);
    const area = document.getElementById(`area-${field}`);
    const removeBtn = document.getElementById(`remove-${field}`);
    const placeholder = area?.querySelector('.img-upload-placeholder');

    if (preview) {
        preview.src = url;
        preview.hidden = false;
        preview.onload = () => {
            if (area) area.classList.add('has-image');
            if (placeholder) placeholder.style.display = 'none';
        };
        preview.onerror = () => {
            preview.hidden = true;
            if (area) area.classList.remove('has-image');
            if (placeholder) placeholder.style.display = 'flex';
        };
    }
    if (removeBtn) removeBtn.hidden = false;
}

/**
 * Remove a imagem do campo
 */
function removeImage(field, { deleteFromR2 = true } = {}) {
    const preview = document.getElementById(`preview-${field}`);
    const area = document.getElementById(`area-${field}`);
    const removeBtn = document.getElementById(`remove-${field}`);
    const placeholder = area?.querySelector('.img-upload-placeholder');
    const fileInput = document.getElementById(`file-${field}`);
    const urlInput = document.getElementById(`url-${field}`);
    const hiddenField = document.getElementById(`prod-${field}`);

    // Apaga do R2 antes de zerar o campo (a menos que o caller peça pra não apagar —
    // usado em resetImageFields/populateImageFields, que só limpam UI).
    if (deleteFromR2 && hiddenField?.value) {
        deleteR2File(hiddenField.value);
    }

    hiddenField.value = '';

    if (preview) {
        preview.src = '';
        preview.hidden = true;
    }
    if (area) area.classList.remove('has-image');
    if (placeholder) placeholder.style.display = 'flex';
    if (removeBtn) removeBtn.hidden = true;
    if (fileInput) fileInput.value = '';
    if (urlInput) urlInput.value = '';
    atualizarBotaoAddFoto();
}

/**
 * Reseta todos os campos de imagem ao abrir o modal — recria os 3 slots padrão.
 */
function resetImageFields() {
    montarSlotsImagem(3);
}

/**
 * Popula os campos de imagem ao editar um produto. Recria slots na quantidade
 * exata de imagens existentes (mínimo 3).
 */
function populateImageFields(product) {
    const urls = (product._imagens && product._imagens.length)
        ? product._imagens
        : [product._imagem1, product._imagem2, product._imagem3].filter(Boolean);
    const qtd = Math.max(3, urls.length);
    montarSlotsImagem(qtd);
    urls.forEach((url, idx) => {
        const field = fieldNameAt(idx);
        if (!document.getElementById(`prod-${field}`)) return;
        document.getElementById(`prod-${field}`).value = url;
        setImagePreview(field, url);
        const urlInput = document.getElementById(`url-${field}`);
        if (urlInput) urlInput.value = url;
    });
    atualizarBotaoAddFoto();
}

// ============================================
// SALVAR PRODUTO (GOOGLE SHEETS API)
// ============================================
async function handleSubmit(e) {
    e.preventDefault();
    
    const btnSalvar = document.getElementById('btn-salvar');
    const btnText = btnSalvar.querySelector('.btn-text');
    const btnSpinner = btnSalvar.querySelector('.btn-spinner');
    
    btnSalvar.disabled = true;
    btnText.hidden = true;
    btnSpinner.hidden = false;
    
    try {
        const rowIndex = document.getElementById('prod-row-index').value;
        const isEdit = !!rowIndex;

        // Valida campos dos custom selects
        if (!document.getElementById('prod-categoria').value) {
            showToast('Selecione uma categoria.', 'error');
            btnSalvar.disabled = false; btnText.hidden = false; btnSpinner.hidden = true;
            document.getElementById('btn-categoria').focus();
            return;
        }
        if (!document.getElementById('prod-status').value) {
            showToast('Selecione um status.', 'error');
            btnSalvar.disabled = false; btnText.hidden = false; btnSpinner.hidden = true;
            document.getElementById('btn-status').focus();
            return;
        }

        // Estoque saiu do form — preserva o valor atual em edição, vazio em novo produto.
        const currentProduct = isEdit
            ? allProducts.find(p => p._rowIndex === parseInt(rowIndex))
            : null;

        const productData = {
            id: document.getElementById('prod-id').value,
            nome: document.getElementById('prod-nome').value,
            categoria: document.getElementById('prod-categoria').value,
            tipo: document.getElementById('prod-tipo').value,
            precoDe: document.getElementById('prod-preco-de').value,
            precoPor: document.getElementById('prod-preco-por').value,
            desconto: document.getElementById('prod-desconto').value,
            tamanhos: document.getElementById('prod-tamanhos').value,
            // Coleta as URLs dos slots ativos (preserva ordem). saveToGoogleSheets distribui entre os 10 campos.
            imagens: _slotsAtuais.map(f => document.getElementById(`prod-${f}`)?.value.trim() || '').filter(Boolean),
            descricao: document.getElementById('prod-descricao').value,
            material: document.getElementById('prod-material').value,
            cor: document.getElementById('prod-cor').value,
            status: document.getElementById('prod-status').value,
            link: document.getElementById('prod-link').value,
            formaPagamento: currentProduct?._formaPagamento || ''
        };
        
        // Verifica se está autenticado
        if (!sessionStorage.getItem('ml_admin_auth')) {
            showToast('Você precisa fazer login primeiro', 'error');
            return;
        }
        
        // Tenta usar a API do Google Sheets
        const success = await saveToGoogleSheets(productData, isEdit, rowIndex);
        
        if (success) {
            showToast(isEdit ? 'Produto atualizado!' : 'Produto criado!', 'success');
            const detalheHist = isEdit
                ? `Categoria: ${productData.categoria} | Status: ${productData.status} | Preço: R$ ${productData.precoPor}`
                : `Categoria: ${productData.categoria} | Status: ${productData.status} | Preço: R$ ${productData.precoPor}`;
            registrarHistorico(isEdit ? 'Editado' : 'Criado', productData.nome, detalheHist);
            closeModal();
            loadProducts();
        } else {
            showToast('Erro ao salvar. Verifique as permissões da planilha.', 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar:', error);
        showToast('Erro ao salvar produto: ' + error.message, 'error');
    } finally {
        btnSalvar.disabled = false;
        btnText.hidden = false;
        btnSpinner.hidden = true;
    }
}

async function saveToGoogleSheets(data, isEdit, rowIndex) {
    // Ordem real da planilha (24 colunas):
    // A=0:ID  B=1:Nome  C=2:Categoria  D=3:Tipo  E=4:Cor  F=5:Tamanhos
    // G=6:Material  H=7:Descrição
    // I=8..R=17 → Imagem 1..10
    // S=18:Link  T=19:PrecoDe  U=20:PrecoPor
    // V=21:Desconto (fórmula — não enviar)
    // W=22:FormaPagamento  X=23:Status

    // Colunas A até U (antes do Desconto/V).
    const imagens = data.imagens || [];
    const slot = (i) => imagens[i] || '';
    const valuesSemDesconto = [
        isEdit ? data.id : (allProducts.length + 1).toString(),
        data.nome,
        data.categoria,
        data.tipo,
        data.cor,
        data.tamanhos,
        data.material,
        data.descricao,
        slot(0), slot(1), slot(2), slot(3), slot(4),
        slot(5), slot(6), slot(7), slot(8), slot(9),
        data.link,
        data.precoDe,
        data.precoPor
    ];

    // Colunas W e X (depois do Desconto/V)
    const valuesAposDesconto = [
        data.formaPagamento || '',
        data.status
    ];

    // Edição: dois blocos separados, pulando a coluna V (Desconto, fórmula).
    // Novo: tudo junto com Desconto vazio (Apps Script preenche a fórmula em V).
    const payload = isEdit
        ? { action: 'update_skip_desconto', row: parseInt(rowIndex), valuesSemDesconto, valuesAposDesconto }
        : { action: 'append', values: [...valuesSemDesconto, '', ...valuesAposDesconto] };

    return enviarViaIframe(payload);
}

// Envia qualquer payload ao Apps Script via iframe (contorna CORS)
// Contador para gerar IDs únicos por chamada — evita que requisições paralelas/sequenciais
// se cancelem mutuamente removendo iframe/form da chamada anterior.
let _iframeReqSeq = 0;

function enviarViaIframe(payload) {
    return new Promise((resolve, reject) => {
        const reqId = ++_iframeReqSeq;
        const iframeId = `apps-script-iframe-${reqId}`;
        const formId   = `apps-script-form-${reqId}`;

        const iframe = document.createElement('iframe');
        iframe.id = iframeId;
        iframe.name = iframeId;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const timeout = setTimeout(() => {
            reject(new Error('Tempo esgotado. Verifique sua conexão.'));
            cleanup();
        }, 15000);

        iframe.onload  = () => { clearTimeout(timeout); resolve(true); cleanup(); };
        iframe.onerror = () => { clearTimeout(timeout); reject(new Error('Erro ao comunicar com o servidor')); cleanup(); };

        function cleanup() {
            setTimeout(() => {
                document.getElementById(iframeId)?.remove();
                document.getElementById(formId)?.remove();
            }, 1000);
        }

        const form = document.createElement('form');
        form.id = formId;
        form.method = 'POST';
        form.action = CONFIG.APPS_SCRIPT_URL;
        form.target = iframeId;
        form.style.display = 'none';

        const inp = document.createElement('input');
        inp.type  = 'hidden';
        inp.name  = 'payload';
        inp.value = JSON.stringify(payload);
        form.appendChild(inp);

        document.body.appendChild(form);
        form.submit();
    });
}

// ============================================
// INATIVAR PRODUTO
// ============================================
async function inactivateProduct(product) {
    if (!confirm(`Deseja ${product._status.toLowerCase() === 'ativo' ? 'inativar' : 'reativar'} o produto "${product._nome}"?`)) {
        return;
    }
    
    try {
        const novoStatus = product._status.toLowerCase() === 'ativo' ? 'Inativo' : 'Ativo';
        // 24 colunas (A..X) — preserva todas as 10 imagens, link, preços, desconto e forma de pagamento.
        await enviarViaIframe({
            action: 'update',
            row: product._rowIndex,
            values: [
                product._id, product._nome, product._categoria, product._tipo,
                product._cor, product._tamanhos, product._material, product._descricao,
                product._imagem1 || '', product._imagem2 || '', product._imagem3 || '',
                product._imagem4 || '', product._imagem5 || '', product._imagem6 || '',
                product._imagem7 || '', product._imagem8 || '', product._imagem9 || '', product._imagem10 || '',
                product._link, product._precoDe, product._precoPor, product._desconto,
                product._formaPagamento || '', novoStatus
            ]
        });
        showToast(`Produto ${novoStatus === 'Ativo' ? 'reativado' : 'inativado'}!`, 'success');
        registrarHistorico('Status', product._nome, `Status alterado para ${novoStatus}`);
        loadProducts();
    } catch (error) {
        showToast('Erro ao alterar status: ' + error.message, 'error');
    }
}

// ============================================
// DADOS DAS LISTAS (categorias, status, tipos)
// ============================================
let _configDados = {
    categorias: ['Vestidos','Macacões','Conjuntos','Saias','Bodys','Blusas','Plus Size','Shorts','Acessórios','Macaquinhos','Nova Coleção'],
    status: ['Ativo','Inativo','Esgotado','Últimas Unidades','Oferta Especial'],
    tipos: [], cores: [], materiais: []
};

// Preenche filtros da barra principal e re-renderiza dropdowns abertos
function populateFormSelects() {
    // Re-renderiza dropdowns (atualiza lista sem fechar se estiver aberto)
    CSD_KEYS.forEach(({ key }) => csdRender(key));
    // Atualiza listas dos filtros multi quando o catálogo muda.
    renderMultiFilter('categoria');
    renderMultiFilter('status');
}

// ── Filtros multi-select (categoria + status) ──
function multiFilterOptions(key) {
    if (key === 'categoria') {
        return (_configDados.categorias || []).map(c => ({
            label: c,
            value: c.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')
        }));
    }
    return (_configDados.status || []).map(s => ({ label: s, value: s.toLowerCase() }));
}

function multiFilterPlaceholders(key) {
    return key === 'categoria' ? 'Todas as Categorias' : 'Todos os Status';
}

function renderMultiFilter(key) {
    const dd = document.getElementById(`filter-multi-${key}-dropdown`);
    if (!dd) return;
    const opts = multiFilterOptions(key);
    const sel = _multiFilters[key];
    dd.innerHTML = opts.map(o => `
        <label class="filter-multi-opt">
            <input type="checkbox" value="${o.value}" ${sel.includes(o.value) ? 'checked' : ''}>
            <span>${escapeHtml(o.label)}</span>
        </label>
    `).join('') + (sel.length > 0 ? `
        <button type="button" class="filter-multi-clear" data-key="${key}">Limpar seleção</button>
    ` : '');

    dd.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) {
                if (!_multiFilters[key].includes(cb.value)) _multiFilters[key].push(cb.value);
            } else {
                _multiFilters[key] = _multiFilters[key].filter(v => v !== cb.value);
            }
            updateMultiFilterLabel(key);
            renderMultiFilter(key); // re-renderiza pra mostrar/esconder "Limpar"
            filterProducts();
        });
    });
    dd.querySelector('.filter-multi-clear')?.addEventListener('click', () => {
        _multiFilters[key] = [];
        updateMultiFilterLabel(key);
        renderMultiFilter(key);
        filterProducts();
    });
}

function updateMultiFilterLabel(key) {
    const labelEl = document.querySelector(`#filter-multi-${key}-btn .filter-multi-label`);
    if (!labelEl) return;
    const sel = _multiFilters[key];
    if (sel.length === 0) {
        labelEl.textContent = multiFilterPlaceholders(key);
        labelEl.classList.remove('has-selection');
    } else if (sel.length === 1) {
        const opt = multiFilterOptions(key).find(o => o.value === sel[0]);
        labelEl.textContent = opt ? opt.label : sel[0];
        labelEl.classList.add('has-selection');
    } else {
        labelEl.textContent = `${sel.length} selecionado${sel.length > 1 ? 's' : ''}`;
        labelEl.classList.add('has-selection');
    }
}

function initMultiFilter(key, placeholder) {
    const wrap = document.getElementById(`filter-multi-${key}`);
    const btn = document.getElementById(`filter-multi-${key}-btn`);
    const dd = document.getElementById(`filter-multi-${key}-dropdown`);
    if (!wrap || !btn || !dd) return;

    btn.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = !dd.hasAttribute('hidden');
        // Fecha outros multi-filters abertos.
        document.querySelectorAll('.filter-multi-dropdown').forEach(d => {
            if (d !== dd) d.setAttribute('hidden', '');
        });
        if (isOpen) {
            dd.setAttribute('hidden', '');
            btn.setAttribute('aria-expanded', 'false');
            wrap.classList.remove('is-open');
        } else {
            dd.removeAttribute('hidden');
            btn.setAttribute('aria-expanded', 'true');
            wrap.classList.add('is-open');
        }
    });
    document.addEventListener('click', e => {
        if (!wrap.contains(e.target)) {
            dd.setAttribute('hidden', '');
            btn.setAttribute('aria-expanded', 'false');
            wrap.classList.remove('is-open');
        }
    });

    updateMultiFilterLabel(key);
    renderMultiFilter(key);
}

// ══════════════════════════════════════════════
// CUSTOM SELECT — dropdown com edição inline
// ══════════════════════════════════════════════
// Mapa: key do campo → chave em _configDados
const CSD_KEYS = [
    // sheetColumn = letra da coluna na planilha; quando definido, csdAdicionar
    // dispara set_validation para o Apps Script atualizar o dropdown da planilha.
    { key: 'categoria', listaKey: 'categorias', placeholder: 'Nova categoria...', sheetColumn: 'C' },
    { key: 'status',    listaKey: 'status',     placeholder: 'Novo status...'    },
    { key: 'tipo',      listaKey: 'tipos',      placeholder: 'Novo tipo...',      sheetColumn: 'D' },
];

const _csdState = {};  // valor selecionado por key

function csdListaKey(key) {
    return CSD_KEYS.find(k => k.key === key)?.listaKey || key;
}

// Renderiza as opções na lista
function csdRender(key) {
    const list = document.getElementById('list-' + key);
    if (!list) return;
    const listaKey = csdListaKey(key);
    const itens = _configDados[listaKey] || [];
    const atual = _csdState[key] || '';

    if (!itens.length) {
        list.innerHTML = '<div style="padding:10px 14px;font-size:13px;color:var(--admin-text-muted)">Nenhuma opção. Adicione abaixo.</div>';
        return;
    }

    list.innerHTML = itens.map(item => {
        const sel = item === atual ? ' is-selected' : '';
        return `<div class="csd-option${sel}" data-value="${escapeHtml(item)}">
            <span class="csd-option-label">${escapeHtml(item)}</span>
            ${sel ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
        </div>`;
    }).join('');

    list.querySelectorAll('.csd-option').forEach(opt => {
        opt.addEventListener('click', () => csdSelect(key, opt.dataset.value));
    });
}

function csdSelect(key, valor) {
    _csdState[key] = valor;
    document.getElementById('prod-' + key).value = valor;
    const label = document.getElementById('label-' + key);
    label.textContent = valor || 'Selecione...';
    label.style.opacity = valor ? '1' : '0.5';
    csdFechar(key);
    csdRender(key);
}

function csdAbrir(key) {
    CSD_KEYS.forEach(({ key: k }) => { if (k !== key) csdFechar(k); });
    const dd = document.getElementById('dropdown-' + key);
    const btn = document.getElementById('btn-' + key);
    csdRender(key); // atualiza lista antes de abrir
    dd?.removeAttribute('hidden');
    btn?.classList.add('is-open');
}

function csdFechar(key) {
    document.getElementById('dropdown-' + key)?.setAttribute('hidden', '');
    document.getElementById('btn-' + key)?.classList.remove('is-open');
}

async function csdAdicionar(key) {
    const input = document.getElementById('add-input-' + key);
    const valor = input?.value.trim();
    if (!valor) { input?.focus(); return; }
    const listaKey = csdListaKey(key);
    if (!_configDados[listaKey]) _configDados[listaKey] = [];
    if (_configDados[listaKey].map(i => i.toLowerCase()).includes(valor.toLowerCase())) {
        showToast('Já existe na lista.', 'error'); return;
    }
    _configDados[listaKey].push(valor);
    input.value = '';
    populateFormSelects(); // atualiza filtros e dropdowns
    csdSelect(key, valor); // seleciona o novo automaticamente

    // Propaga a lista para o dropdown da coluna inteira da planilha (best-effort).
    syncValidationToSheet(key);
}

/**
 * Atualiza a validação de dados (dropdown da célula) da coluna correspondente na planilha.
 * Envia a lista completa de valores únicos vindos dos produtos + adicionados localmente.
 * Best-effort: silencioso em erro, nunca bloqueia a UI.
 */
async function syncValidationToSheet(key) {
    const cfg = CSD_KEYS.find(k => k.key === key);
    if (!cfg?.sheetColumn) return;

    const listaKey = cfg.listaKey;
    const values = _configDados[listaKey] || [];
    if (!values.length) return;

    try {
        await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'set_validation',
                column: cfg.sheetColumn,
                values
            })
        });
        showToast(`"${values[values.length - 1]}" também adicionada à planilha.`, 'success');
    } catch (err) {
        console.warn('Falha ao sincronizar validação da planilha (ignorado):', err);
    }
}

function initCustomSelects() {
    CSD_KEYS.forEach(({ key }) => {
        document.getElementById('btn-' + key)?.addEventListener('click', () => {
            const dd = document.getElementById('dropdown-' + key);
            dd?.hasAttribute('hidden') ? csdAbrir(key) : csdFechar(key);
        });
        document.getElementById('add-btn-' + key)?.addEventListener('click', () => csdAdicionar(key));
        document.getElementById('add-input-' + key)?.addEventListener('keydown', e => {
            if (e.key === 'Enter')  { e.preventDefault(); e.stopPropagation(); csdAdicionar(key); }
            if (e.key === 'Escape') csdFechar(key);
        });
    });

    // Fecha ao clicar fora
    document.addEventListener('click', e => {
        CSD_KEYS.forEach(({ key }) => {
            const wrap = document.getElementById('wrap-' + key);
            if (wrap && !wrap.contains(e.target)) csdFechar(key);
        });
    });

    // Renderiza com os dados padrão já disponíveis
    populateFormSelects();
    csdSetValue('status', 'Ativo');
    csdSetValue('categoria', '');
    csdSetValue('tipo', '');
}

function csdSetValue(key, valor) {
    _csdState[key] = valor;
    document.getElementById('prod-' + key).value = valor;
    const label = document.getElementById('label-' + key);
    if (label) { label.textContent = valor || 'Selecione...'; label.style.opacity = valor ? '1' : '0.5'; }
    csdRender(key);
}

// ============================================
// HISTÓRICO DE ALTERAÇÕES
// ============================================
let _historicoCache = [];
let _histPagina     = 1;
const _HIST_POR_PAG = 10;
let _histPeriodo    = 'todos';

const HIST_ICON = {
    'Criado':  { cls: 'criar',   svg: '<path d="M12 5v14M5 12h14"/>' },
    'Editado': { cls: 'editar',  svg: '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>' },
    'Status':  { cls: 'status',  svg: '<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>' },
    'Excluído':{ cls: 'excluir', svg: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>' },
};

function openHistorico() {
    document.getElementById('modal-historico').removeAttribute('hidden');
    ScrollLock.lock();
    _histPagina  = 1;
    _histPeriodo = 'todos';
    document.querySelectorAll('.hist-data-btn').forEach(b => b.classList.toggle('active', b.dataset.periodo === 'todos'));
    document.getElementById('hist-datas-custom').setAttribute('hidden', '');
    loadHistorico();
}

function closeHistorico() {
    document.getElementById('modal-historico').setAttribute('hidden', '');
    ScrollLock.unlock();
}

async function loadHistorico() {
    const body = document.getElementById('historico-body');
    body.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Carregando histórico...</p></div>';
    document.getElementById('historico-paginacao').innerHTML = '';

    try {
        const url = CONFIG.APPS_SCRIPT_URL + '?action=get_historico&t=' + Date.now();
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && json.rows) {
            _historicoCache = json.rows; // cada row: [data, tipo, produto, detalhe]
            _histPagina = 1;
            aplicarFiltroHistorico();
        } else {
            body.innerHTML = '<div class="hist-empty"><p>Nenhum registro encontrado.</p></div>';
        }
    } catch (e) {
        body.innerHTML = '<div class="hist-empty"><p>Erro ao carregar histórico.</p></div>';
    }
}

// Converte qualquer formato de data em Date
// Suporta: "dd/MM/yyyy HH:mm", "MM/dd/yyyy HH:mm", objetos Date, timestamps
function histParseData(str) {
    if (!str) return null;

    // Se já é um objeto Date válido (vindo do Apps Script como objeto)
    if (str instanceof Date) return isNaN(str) ? null : str;

    // Converte para string e limpa
    const s = String(str).trim();
    if (!s) return null;

    // Tenta "dd/MM/yyyy HH:mm" ou "dd/MM/yyyy"
    const m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
    if (m1) {
        const dia = +m1[1], mes = +m1[2], ano = +m1[3];
        const h = +(m1[4] || 0), min = +(m1[5] || 0);
        // Heurística: se dia > 12, certamente é dd/MM; senão assume dd/MM (padrão Brasil)
        return new Date(ano, mes - 1, dia, h, min, 0);
    }

    // Fallback: deixa o JS tentar (cobre ISO 8601 e outros)
    const d = new Date(s);
    return isNaN(d) ? null : d;
}

// Debug: mostra o formato real das datas no cache (chame no console: debugHistDatas())
window.debugHistDatas = function() {
    console.table((_historicoCache || []).slice(0, 5).map(r => ({
        raw: r[0],
        parsed: String(histParseData(r[0])),
        tipo: r[1], produto: r[2]
    })));
};

// Retorna meia-noite do dia de hoje
function _hojeInicio() {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
}

function histFiltrarPorPeriodo(rows) {
    if (_histPeriodo === 'todos') return rows;

    const hoje   = _hojeInicio();
    const ontem  = new Date(hoje); ontem.setDate(ontem.getDate() - 1);
    const semana = new Date(hoje); semana.setDate(semana.getDate() - 6);
    const amanha = new Date(hoje); amanha.setDate(amanha.getDate() + 1);

    if (_histPeriodo === 'hoje') {
        return rows.filter(r => {
            const d = histParseData(r[0]);
            return d && d >= hoje && d < amanha;
        });
    }
    if (_histPeriodo === 'ontem') {
        return rows.filter(r => {
            const d = histParseData(r[0]);
            return d && d >= ontem && d < hoje;
        });
    }
    if (_histPeriodo === 'semana') {
        return rows.filter(r => {
            const d = histParseData(r[0]);
            return d && d >= semana && d < amanha;
        });
    }
    if (_histPeriodo === 'custom') {
        const de  = document.getElementById('hist-data-de').value;
        const ate = document.getElementById('hist-data-ate').value;
        return rows.filter(r => {
            const d = histParseData(r[0]); if (!d) return false;
            if (de) {
                const inicio = new Date(de); inicio.setHours(0,0,0,0);
                if (d < inicio) return false;
            }
            if (ate) {
                const fim = new Date(ate); fim.setHours(23,59,59,999);
                if (d > fim) return false;
            }
            return true;
        });
    }
    return rows;
}

function aplicarFiltroHistorico() {
    const termo = (document.getElementById('historico-search').value || '').toLowerCase().trim();
    let rows = [..._historicoCache];

    // Filtro por texto
    if (termo) {
        rows = rows.filter(r =>
            (r[0] || '').toLowerCase().includes(termo) ||
            (r[1] || '').toLowerCase().includes(termo) ||
            (r[2] || '').toLowerCase().includes(termo) ||
            (r[3] || '').toLowerCase().includes(termo)
        );
    }

    // Filtro por período
    rows = histFiltrarPorPeriodo(rows);

    renderHistorico(rows);
}

function renderHistorico(rows) {
    const body = document.getElementById('historico-body');
    const nav  = document.getElementById('historico-paginacao');

    if (!rows.length) {
        body.innerHTML = `<div class="hist-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <p>Nenhum registro encontrado.</p>
        </div>`;
        nav.innerHTML = '';
        return;
    }

    // Paginação
    const total      = rows.length;
    const totalPags  = Math.ceil(total / _HIST_POR_PAG);
    if (_histPagina > totalPags) _histPagina = totalPags;
    const inicio = (_histPagina - 1) * _HIST_POR_PAG;
    const pagina = rows.slice(inicio, inicio + _HIST_POR_PAG);

    body.innerHTML = pagina.map(r => {
        const tipo    = r[1] || 'Editado';
        const produto = r[2] || '';
        const detalhe = r[3] || '';
        const data    = r[0] || '';
        const ic      = HIST_ICON[tipo] || HIST_ICON['Editado'];

        return `<div class="hist-item">
            <div class="hist-icon hist-icon--${ic.cls}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ic.svg}</svg>
            </div>
            <div class="hist-info">
                <span class="hist-acao">${escapeHtml(tipo)}: <strong>${escapeHtml(produto)}</strong></span>
                ${detalhe ? `<span class="hist-produto">${escapeHtml(detalhe)}</span>` : ''}
            </div>
            <span class="hist-data">${escapeHtml(data)}</span>
        </div>`;
    }).join('');

    // Renderiza paginação
    if (totalPags <= 1) { nav.innerHTML = ''; return; }

    let pgHtml = `<span class="pg-info">${inicio + 1}–${Math.min(inicio + _HIST_POR_PAG, total)} de ${total}</span>`;
    pgHtml += `<button class="pg-btn" ${_histPagina === 1 ? 'disabled' : ''} data-hp="${_histPagina - 1}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
    </button>`;

    // Páginas numéricas
    for (let p = 1; p <= totalPags; p++) {
        if (totalPags > 7 && p > 2 && p < totalPags - 1 && Math.abs(p - _histPagina) > 1) {
            if (p === 3 || p === totalPags - 2) pgHtml += `<span class="pg-ellipsis">…</span>`;
            continue;
        }
        pgHtml += `<button class="pg-btn${p === _histPagina ? ' active' : ''}" data-hp="${p}">${p}</button>`;
    }

    pgHtml += `<button class="pg-btn" ${_histPagina === totalPags ? 'disabled' : ''} data-hp="${_histPagina + 1}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>`;

    nav.innerHTML = pgHtml;
    nav.querySelectorAll('.pg-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => {
            _histPagina = +btn.dataset.hp;
            renderHistorico(rows);
            document.getElementById('historico-body').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function filterHistorico() {
    _histPagina = 1;
    aplicarFiltroHistorico();
}

function initHistoricoFiltros() {
    document.querySelectorAll('.hist-data-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            _histPeriodo = btn.dataset.periodo;
            _histPagina  = 1;
            document.querySelectorAll('.hist-data-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const custom = document.getElementById('hist-datas-custom');
            _histPeriodo === 'custom' ? custom.removeAttribute('hidden') : custom.setAttribute('hidden', '');
            aplicarFiltroHistorico();
        });
    });
    document.getElementById('hist-data-de')?.addEventListener('change', () => { _histPagina = 1; aplicarFiltroHistorico(); });
    document.getElementById('hist-data-ate')?.addEventListener('change', () => { _histPagina = 1; aplicarFiltroHistorico(); });
}

async function registrarHistorico(tipo, nomeProduto, detalhe) {
    try {
        await enviarViaIframe({ action: 'append_historico', tipo, produto: nomeProduto, detalhe: detalhe || '' });
    } catch (e) { /* histórico é não-crítico */ }
}

// ============================================
// EXCLUIR PRODUTO
// ============================================
async function deleteProduct(product) {
    const ok = confirmarExclusaoForte(`Excluir o produto "${product._nome}"?`,
        'Esta ação remove a linha da planilha E as imagens do servidor PERMANENTEMENTE. Não há como restaurar.');
    if (!ok) return;

    try {
        await enviarViaIframe({ action: 'delete_row', row: product._rowIndex });

        // Limpa as 10 imagens possíveis do produto no R2 (best-effort, não bloqueia).
        (product._imagens || []).forEach(deleteR2File);

        showToast(`Produto "${product._nome}" excluído.`, 'success');
        registrarHistorico('Excluído', product._nome, 'Produto removido da planilha');
        // Reset completo da página após exclusão (mesmo comportamento do lote).
        setTimeout(() => location.reload(), 800);
    } catch (error) {
        showToast('Erro ao excluir: ' + error.message, 'error');
    }
}

/**
 * Confirmação dupla com texto-âncora: usuário precisa digitar EXCLUIR para validar.
 * Garante que o usuário leia o aviso antes de confirmar exclusão permanente.
 */
function confirmarExclusaoForte(titulo, aviso) {
    if (!confirm(`⚠️ ${titulo}\n\n${aviso}`)) return false;
    const resposta = prompt(`Para confirmar a exclusão PERMANENTE, digite EXCLUIR no campo abaixo:`);
    if (resposta === null) return false;
    if (resposta.trim().toUpperCase() !== 'EXCLUIR') {
        showToast('Exclusão cancelada — texto não conferiu.', 'error');
        return false;
    }
    return true;
}

/**
 * Exclui múltiplos produtos em lote (planilha + imagens R2).
 * Usa confirmação reforçada e processa em ordem reversa pra preservar índices da planilha.
 */
async function deleteProductsBatch(products) {
    if (!products.length) return;
    const nomes = products.length <= 3
        ? products.map(p => `"${p._nome}"`).join(', ')
        : `${products.length} produtos selecionados`;
    const ok = confirmarExclusaoForte(
        `Excluir ${nomes}?`,
        `${products.length} produto(s) e suas imagens serão removidos PERMANENTEMENTE da planilha e do servidor. Não há como restaurar.`
    );
    if (!ok) return;

    // Ordena por _rowIndex DESC: deletar de baixo pra cima evita reindexação.
    const ordenados = products.slice().sort((a, b) => b._rowIndex - a._rowIndex);
    let sucesso = 0, erro = 0;
    showToast(`Excluindo ${products.length} produto(s)...`, 'success');

    for (const product of ordenados) {
        try {
            await enviarViaIframe({ action: 'delete_row', row: product._rowIndex });
            (product._imagens || []).forEach(deleteR2File);
            registrarHistorico('Excluído', product._nome, 'Lote — produto removido');
            sucesso++;
            // Pequeno respiro entre chamadas — Apps Script tem rate limit em rajadas.
            await new Promise(r => setTimeout(r, 350));
        } catch (e) {
            erro++;
            console.warn('Falha ao excluir', product._nome, e);
        }
    }

    if (erro === 0) {
        showToast(`${sucesso} produto(s) excluído(s) com sucesso.`, 'success');
    } else {
        showToast(`${sucesso} excluídos · ${erro} falharam.`, 'error');
    }
    _selecionados.clear();
    atualizarBarraSelecao();
    // Reset completo da página: garante que listagem, contadores, filtros e
    // qualquer índice em cache fiquem 100% sincronizados com a planilha.
    setTimeout(() => location.reload(), 800);
}

// ============================================
// UTILITÁRIOS
// ============================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function renderPaginacao() {
    let nav = document.getElementById('pagination-nav');
    if (!nav) {
        nav = document.createElement('div');
        nav.id = 'pagination-nav';
        nav.className = 'pagination-nav';
        document.querySelector('.table-container').appendChild(nav);
    }

    const total = filteredProducts.length;
    if (total === 0) { nav.innerHTML = ''; return; }

    const totalPaginas = Math.ceil(total / ITENS_POR_PAGINA);
    const inicio = (currentPage - 1) * ITENS_POR_PAGINA + 1;
    const fim    = Math.min(currentPage * ITENS_POR_PAGINA, total);

    let html = '';

    // Botão Anterior
    html += `<button class="pg-btn pg-prev" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
    </button>`;

    // Números das páginas (com elipses se muitas)
    const maxVisiveis = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiveis / 2));
    let endPage   = Math.min(totalPaginas, startPage + maxVisiveis - 1);
    if (endPage - startPage + 1 < maxVisiveis) {
        startPage = Math.max(1, endPage - maxVisiveis + 1);
    }

    if (startPage > 1) {
        html += `<button class="pg-btn" data-page="1">1</button>`;
        if (startPage > 2) html += `<span class="pg-ellipsis">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pg-btn ${i === currentPage ? 'pg-active' : ''}" data-page="${i}">${i}</button>`;
    }

    if (endPage < totalPaginas) {
        if (endPage < totalPaginas - 1) html += `<span class="pg-ellipsis">...</span>`;
        html += `<button class="pg-btn" data-page="${totalPaginas}">${totalPaginas}</button>`;
    }

    // Botão Próximo
    html += `<button class="pg-btn pg-next" ${currentPage === totalPaginas ? 'disabled' : ''} data-page="${currentPage + 1}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>`;

    // Info
    html += `<span class="pg-info">${inicio}–${fim} de ${total}</span>`;

    nav.innerHTML = html;

    // Event listeners
    nav.querySelectorAll('.pg-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            renderTable();
            document.querySelector('.table-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Expõe handleLogin para o HTML
window.handleLogin = handleLogin;
