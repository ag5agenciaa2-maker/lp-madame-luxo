/**
 * PAINEL ADMINISTRATIVO - MADAME LUXO
 * Integração com Google Sheets API v4
 * @author AG5 Agência
 */

// ============================================
// CONFIGURAÇÕES
// ============================================
const CONFIG = {
    SPREADSHEET_ID: '13I0DBjImUK8R1rZe1Nt0FC-WzALALbkAencGH5HdsdA',
    SHEET_NAME: '👗 Catálogo',
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxoXIGY4e8VPhagrXdl81LHgPqFBrnuWuBvP431PRhK5jEv0_WM_0cTVDTMJoKw4cCw/exec',
    COLS: {
        ID: 0,
        NOME: 1,
        STATUS: 2,
        CATEGORIA: 3,
        TIPO: 4,
        COR: 5,
        TAMANHOS: 6,
        MATERIAL: 7,
        PRECO_DE: 8,
        PRECO_POR: 9,
        DESCONTO: 10,
        IMAGEM1: 11,
        IMAGEM2: 12,
        IMAGEM3: 13,
        DESCRICAO: 14,
        ESTOQUE: 15,
        OFERTA: 16,
        LINK: 17
    }
};

// ============================================
// ESTADO GLOBAL
// ============================================
// Estado global do painel
let allProducts = [];
let filteredProducts = [];
let currentView = localStorage.getItem('ml_view') || 'grid'; // 'grid' | 'list'
let currentPage = 1;
const ITENS_POR_PAGINA = 24;

// Hash SHA-256 da senha de acesso ao painel administrativo
// IMPORTANTE: Nunca armazene a senha em texto plano neste arquivo
// Para gerar um novo hash, use a função hashSenha() no console do navegador
const SENHA_HASH = '2c26d46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae';

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initCustomSelects();
    populateFormSelects(); // Preenche filtros e dropdowns com dados padrão

    // Verifica se já está autenticado na sessão
    const autenticado = sessionStorage.getItem('ml_admin_auth');
    if (autenticado === '1') {
        showAdminPanel();
        loadProducts();
    }
});

function initEventListeners() {
    // Filtros
    document.getElementById('filter-search').addEventListener('input', debounce(filterProducts, 300));
    document.getElementById('filter-categoria').addEventListener('change', filterProducts);
    document.getElementById('filter-status').addEventListener('change', filterProducts);

    // View toggle
    document.getElementById('btn-view-grid').addEventListener('click', () => setView('grid'));
    document.getElementById('btn-view-list').addEventListener('click', () => setView('list'));
    setView(currentView, false);
    
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
    
    // Preview de imagem
    document.getElementById('prod-imagem1').addEventListener('input', updateImagePreview);
    
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
    document.getElementById('login-screen').hidden = false;
    document.getElementById('admin-panel').hidden = true;
    document.getElementById('login-erro').hidden = true;
    const input = document.getElementById('login-senha');
    if (input) { input.value = ''; input.focus(); }
}

function showAdminPanel() {
    document.getElementById('login-screen').hidden = true;
    document.getElementById('admin-panel').hidden = false;
}

// ============================================
// CARREGAMENTO DE PRODUTOS (CSV PÚBLICO)
// ============================================
async function loadProducts() {
    const loadingEl = document.getElementById('loading-state');
    const tbody = document.getElementById('products-tbody');
    const emptyEl = document.getElementById('empty-state');
    
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
        
        // Mapeamento direto pela posição das colunas (ordem real da planilha)
        // 0:ID 1:Nome 2:Categoria 3:Tipo 4:Cor 5:Tamanhos 6:Material 7:Descrição
        // 8:Imagem1 9:Imagem2 10:Imagem3 11:Link 12:PrecoDe 13:PrecoPor 14:Desconto
        // 15:Estoque 16:Oferta 17:Status
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
        product._link     = values[11] || '';
        // Remove "R$ " caso a planilha guarde com prefixo
        product._precoDe  = (values[12] || '').replace(/R\$\s*/g, '').trim();
        product._precoPor = (values[13] || '').replace(/R\$\s*/g, '').trim();
        product._desconto = values[14] || '';
        product._estoque  = values[15] || '';
        product._oferta   = values[16] || '';
        product._status   = values[17] || 'Ativo';
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

        if (currentView === 'list') {
            el.className = 'prod-list-item';
            el.innerHTML = `
                <div class="prod-list-img-wrap">
                    <img src="${product._imagem1 || 'assets/madame-luxo-hero-colecao-verde-menta.webp'}"
                         alt="${escapeHtml(product._nome)}"
                         class="${imgEsgotado ? 'prod-list-img prod-card-img--esgotado' : 'prod-list-img'}"
                         onerror="this.src='assets/madame-luxo-hero-colecao-verde-menta.webp'">
                    ${faixaHtml}
                </div>
                <div class="prod-list-info">
                    <div class="prod-card-nome">${escapeHtml(product._nome)}</div>
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
            el.className = 'prod-card';
            el.innerHTML = `
                <div class="prod-card-img-wrap">
                    <img src="${product._imagem1 || 'assets/madame-luxo-hero-colecao-verde-menta.webp'}"
                         alt="${escapeHtml(product._nome)}"
                         class="${imgClass}"
                         onerror="this.src='assets/madame-luxo-hero-colecao-verde-menta.webp'">
                    ${faixaHtml}
                </div>
                <div class="prod-card-body">
                    <div class="prod-card-nome">${escapeHtml(product._nome)}</div>
                    <div class="prod-card-tipo">${escapeHtml(product._tipo)}</div>
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
            if (!e.target.closest('.btn-acao')) openDetailModal(product);
        });
        el.querySelector('.btn-edit').addEventListener('click', (e) => {
            e.stopPropagation(); openModal(product);
        });
        el.querySelector('.btn-toggle').addEventListener('click', (e) => {
            e.stopPropagation(); inactivateProduct(product);
        });
        el.querySelector('.btn-excluir').addEventListener('click', (e) => {
            e.stopPropagation(); deleteProduct(product);
        });

        container.appendChild(el);
    });

    renderPaginacao();
}

// Modal de detalhes do produto (visualização ao clicar no card)
function openDetailModal(product) {
    const statusKey  = (product._status || '').toLowerCase();
    const statusInfo = STATUS_MAP[statusKey] || { cls: 'status-inativo', txt: product._status };

    let existing = document.getElementById('detail-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'detail-modal';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content detail-modal-content">
            <div class="modal-header">
                <h2>${escapeHtml(product._nome)}</h2>
                <button class="modal-close" id="detail-close">&times;</button>
            </div>
            <div class="detail-body">
                <div class="detail-img-col">
                    <img src="${product._imagem1 || 'assets/madame-luxo-hero-colecao-verde-menta.webp'}"
                         alt="${escapeHtml(product._nome)}"
                         class="detail-img-main"
                         onerror="this.src='assets/madame-luxo-hero-colecao-verde-menta.webp'">
                    <div class="detail-thumbs">
                        ${[product._imagem1, product._imagem2, product._imagem3].filter(Boolean).map(url =>
                            `<img src="${url}" class="detail-thumb" onerror="this.style.display='none'">`
                        ).join('')}
                    </div>
                </div>
                <div class="detail-info-col">
                    <span class="prod-categoria">${escapeHtml(product._categoria)}</span>
                    <p class="detail-tipo">${escapeHtml(product._tipo)}</p>
                    <div class="detail-precos">
                        ${product._precoDe ? `<span class="prod-preco-de">R$ ${product._precoDe}</span>` : ''}
                        <span class="prod-preco-por detail-preco-por">R$ ${product._precoPor || '-'}</span>
                        ${product._desconto ? `<span class="detail-desconto">${product._desconto}</span>` : ''}
                    </div>
                    <div class="detail-specs">
                        ${product._material ? `<div class="detail-spec"><span>Material</span><span>${escapeHtml(product._material)}</span></div>` : ''}
                        ${product._cor      ? `<div class="detail-spec"><span>Cor</span><span>${escapeHtml(product._cor)}</span></div>` : ''}
                        ${product._tamanhos ? `<div class="detail-spec"><span>Tamanhos</span><span>${escapeHtml(product._tamanhos)}</span></div>` : ''}
                        ${product._estoque  ? `<div class="detail-spec"><span>Estoque</span><span>${escapeHtml(product._estoque)} un.</span></div>` : ''}
                    </div>
                    ${product._descricao ? `<p class="detail-desc">${escapeHtml(product._descricao)}</p>` : ''}
                    <div class="detail-status-row">
                        <span class="status-badge ${statusInfo.cls}">${statusInfo.txt}</span>
                        <button class="btn btn-primary detail-edit-btn">Editar Produto</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => { overlay.removeAttribute('hidden'); });

    overlay.querySelector('#detail-close').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.detail-edit-btn').addEventListener('click', () => { overlay.remove(); openModal(product); });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Troca imagem principal ao clicar na thumbnail
    overlay.querySelectorAll('.detail-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
            overlay.querySelector('.detail-img-main').src = thumb.src;
            overlay.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });
    const firstThumb = overlay.querySelector('.detail-thumb');
    if (firstThumb) firstThumb.classList.add('active');
}

function filterProducts() {
    const search = document.getElementById('filter-search').value.toLowerCase().trim();
    const categoria = document.getElementById('filter-categoria').value;
    const status = document.getElementById('filter-status').value;
    
    filteredProducts = allProducts.filter(product => {
        const matchSearch = !search || 
            product._nome.toLowerCase().includes(search) ||
            product._categoria.toLowerCase().includes(search) ||
            product._tipo.toLowerCase().includes(search);
        
        const matchCategoria = !categoria || 
            getCatKey(product._categoria) === categoria;
        
        const matchStatus = !status || 
            product._status.toLowerCase() === status;
        
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
    document.getElementById('preview-imagem1').hidden = true;
    
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
        document.getElementById('prod-imagem1').value = product._imagem1;
        document.getElementById('prod-imagem2').value = product._imagem2;
        document.getElementById('prod-imagem3').value = product._imagem3;
        document.getElementById('prod-descricao').value = product._descricao;
        document.getElementById('prod-material').value = product._material;
        document.getElementById('prod-cor').value = product._cor;
        document.getElementById('prod-estoque').value = product._estoque;
        csdSetValue('status', product._status);
        document.getElementById('prod-oferta').value = product._oferta;
        document.getElementById('prod-link').value = product._link;
        
        updateImagePreview();
    } else {
        title.textContent = 'Novo Produto';
        csdSetValue('categoria', '');
        csdSetValue('tipo', '');
        csdSetValue('status', 'Ativo');
    }
    
    modal.hidden = false;
}

function closeModal() {
    document.getElementById('modal-produto').hidden = true;
}

function updateImagePreview() {
    const url = document.getElementById('prod-imagem1').value;
    const preview = document.getElementById('preview-imagem1');
    
    if (url && url.startsWith('http')) {
        preview.src = url;
        preview.hidden = false;
        preview.onerror = () => { preview.hidden = true; };
    } else {
        preview.hidden = true;
    }
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

        const productData = {
            id: document.getElementById('prod-id').value,
            nome: document.getElementById('prod-nome').value,
            categoria: document.getElementById('prod-categoria').value,
            tipo: document.getElementById('prod-tipo').value,
            precoDe: document.getElementById('prod-preco-de').value,
            precoPor: document.getElementById('prod-preco-por').value,
            desconto: document.getElementById('prod-desconto').value,
            tamanhos: document.getElementById('prod-tamanhos').value,
            imagem1: document.getElementById('prod-imagem1').value,
            imagem2: document.getElementById('prod-imagem2').value,
            imagem3: document.getElementById('prod-imagem3').value,
            descricao: document.getElementById('prod-descricao').value,
            material: document.getElementById('prod-material').value,
            cor: document.getElementById('prod-cor').value,
            estoque: document.getElementById('prod-estoque').value,
            status: document.getElementById('prod-status').value,
            oferta: document.getElementById('prod-oferta').value,
            link: document.getElementById('prod-link').value
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
    // Ordem real da planilha:
    // 0:ID 1:Nome 2:Categoria 3:Tipo 4:Cor 5:Tamanhos 6:Material 7:Descrição
    // 8:Imagem1 9:Imagem2 10:Imagem3 11:Link 12:PrecoDe 13:PrecoPor
    // 14:Desconto (NÃO ENVIADO — fórmula da planilha) 15:Estoque 16:Oferta 17:Status

    // Colunas A até N (sem Desconto na col O)
    const valuesSemDesconto = [
        isEdit ? data.id : (allProducts.length + 1).toString(),
        data.nome,
        data.categoria,
        data.tipo,
        data.cor,
        data.tamanhos,
        data.material,
        data.descricao,
        data.imagem1,
        data.imagem2,
        data.imagem3,
        data.link,
        data.precoDe,
        data.precoPor
    ];

    // Colunas P até R (Estoque, Oferta, Status — pula col O Desconto)
    const valuesAposDesconto = [
        data.estoque,
        data.oferta,
        data.status
    ];

    // Para edição: envia dois blocos separados, pulando a coluna de desconto (col 15 = O)
    // Para novo produto: envia tudo junto (desconto vazio, fórmula será criada manualmente)
    const payload = isEdit
        ? { action: 'update_skip_desconto', row: parseInt(rowIndex), valuesSemDesconto, valuesAposDesconto }
        : { action: 'append', values: [...valuesSemDesconto, '', ...valuesAposDesconto] };

    return enviarViaIframe(payload);
}

// Envia qualquer payload ao Apps Script via iframe (contorna CORS)
function enviarViaIframe(payload) {
    return new Promise((resolve, reject) => {
        const iframeId = 'apps-script-iframe';
        const formId   = 'apps-script-form';

        ['apps-script-iframe', 'apps-script-form'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });

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
        await enviarViaIframe({
            action: 'update',
            row: product._rowIndex,
            values: [
                product._id, product._nome, product._categoria, product._tipo,
                product._cor, product._tamanhos, product._material, product._descricao,
                product._imagem1, product._imagem2, product._imagem3, product._link,
                product._precoDe, product._precoPor, product._desconto,
                product._estoque, product._oferta, novoStatus
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

    const filtroCat = document.getElementById('filter-categoria');
    const filtroStatus = document.getElementById('filter-status');
    if (filtroCat) {
        filtroCat.innerHTML = '<option value="">Todas as Categorias</option>' +
            (_configDados.categorias || []).map(c => {
                const val = c.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,'-');
                return `<option value="${val}">${escapeHtml(c)}</option>`;
            }).join('');
    }
    if (filtroStatus) {
        filtroStatus.innerHTML = '<option value="">Todos os Status</option>' +
            (_configDados.status || []).map(s =>
                `<option value="${s.toLowerCase()}">${escapeHtml(s)}</option>`).join('');
    }
}

// ══════════════════════════════════════════════
// CUSTOM SELECT — dropdown com edição inline
// ══════════════════════════════════════════════
// Mapa: key do campo → chave em _configDados
const CSD_KEYS = [
    { key: 'categoria', listaKey: 'categorias', placeholder: 'Nova categoria...' },
    { key: 'status',    listaKey: 'status',      placeholder: 'Novo status...'    },
    { key: 'tipo',      listaKey: 'tipos',        placeholder: 'Novo tipo...'      },
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
    _histPagina  = 1;
    _histPeriodo = 'todos';
    document.querySelectorAll('.hist-data-btn').forEach(b => b.classList.toggle('active', b.dataset.periodo === 'todos'));
    document.getElementById('hist-datas-custom').setAttribute('hidden', '');
    loadHistorico();
}

function closeHistorico() {
    document.getElementById('modal-historico').setAttribute('hidden', '');
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
    if (!confirm(`⚠️ Tem certeza que deseja EXCLUIR o produto "${product._nome}"?\n\nEsta ação removerá a linha da planilha permanentemente.`)) return;
    if (!confirm(`Confirmação final: excluir "${product._nome}" permanentemente?`)) return;

    try {
        await enviarViaIframe({ action: 'delete_row', row: product._rowIndex });
        showToast(`Produto "${product._nome}" excluído.`, 'success');
        registrarHistorico('Excluído', product._nome, 'Produto removido da planilha');
        loadProducts();
    } catch (error) {
        showToast('Erro ao excluir: ' + error.message, 'error');
    }
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
