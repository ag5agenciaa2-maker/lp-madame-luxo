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
let accessToken = 'local';
let allProducts = [];
let filteredProducts = [];
let currentView = localStorage.getItem('ml_view') || 'grid'; // 'grid' | 'list'

const SENHA_ADMIN = 'madame2025'; // senha local de acesso

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();

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

function handleLogin() {
    const input = document.getElementById('login-senha');
    const erro = document.getElementById('login-erro');

    if (input.value === SENHA_ADMIN) {
        sessionStorage.setItem('ml_admin_auth', '1');
        showAdminPanel();
        loadProducts();
        showToast('Bem-vinda ao painel!', 'success');
    } else {
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
    if (rerender) renderTable();
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
        return;
    }
    emptyEl.hidden = true;
    container.className = currentView === 'list' ? 'products-list' : 'products-grid';

    filteredProducts.forEach((product) => {
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
            <button class="btn-acao btn-delete" title="Inativar/Reativar">
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
        el.querySelector('.btn-delete').addEventListener('click', (e) => {
            e.stopPropagation(); inactivateProduct(product);
        });

        container.appendChild(el);
    });
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
        document.getElementById('prod-categoria').value = product._categoria;
        document.getElementById('prod-tipo').value = product._tipo;
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
        document.getElementById('prod-status').value = product._status;
        document.getElementById('prod-oferta').value = product._oferta;
        document.getElementById('prod-link').value = product._link;
        
        updateImagePreview();
    } else {
        title.textContent = 'Novo Produto';
        document.getElementById('prod-status').value = 'Ativo';
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
            closeModal();
            loadProducts(); // Recarrega a lista
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

    return new Promise((resolve, reject) => {
        // Usa iframe oculto para contornar CORS do Apps Script
        const iframeId = 'apps-script-iframe';
        const formId = 'apps-script-form';

        // Remove elementos anteriores se existirem
        ['apps-script-iframe', 'apps-script-form'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });

        // Cria iframe oculto que receberá a resposta
        const iframe = document.createElement('iframe');
        iframe.id = iframeId;
        iframe.name = iframeId;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        // Timeout de 15 segundos
        const timeout = setTimeout(() => {
            reject(new Error('Tempo esgotado. Verifique sua conexão.'));
            cleanup();
        }, 15000);

        iframe.onload = () => {
            clearTimeout(timeout);
            resolve(true);
            cleanup();
        };

        iframe.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Erro ao comunicar com o servidor'));
            cleanup();
        };

        function cleanup() {
            setTimeout(() => {
                const el = document.getElementById(iframeId);
                if (el) el.remove();
                const f = document.getElementById(formId);
                if (f) f.remove();
            }, 1000);
        }

        // Cria formulário oculto apontando para o iframe
        const form = document.createElement('form');
        form.id = formId;
        form.method = 'POST';
        form.action = CONFIG.APPS_SCRIPT_URL;
        form.target = iframeId;
        form.style.display = 'none';

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'payload';
        input.value = JSON.stringify(payload);
        form.appendChild(input);

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

        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
                action: 'update',
                row: product._rowIndex,
                values: [
                    product._id, product._nome, product._categoria, product._tipo,
                    product._cor, product._tamanhos, product._material, product._descricao,
                    product._imagem1, product._imagem2, product._imagem3, product._link,
                    product._precoDe, product._precoPor, product._desconto,
                    product._estoque, product._oferta, novoStatus
                ]
            })
        });

        const text = await response.text();
        const result = JSON.parse(text);
        if (result.success) {
            showToast(`Produto ${novoStatus === 'Ativo' ? 'reativado' : 'inativado'}!`, 'success');
            loadProducts();
        } else {
            showToast('Erro ao alterar status: ' + (result.error || ''), 'error');
        }
    } catch (error) {
        showToast('Erro ao alterar status: ' + error.message, 'error');
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
