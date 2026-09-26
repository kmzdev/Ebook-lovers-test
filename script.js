// =====================
// Configuração Supabase
// =====================
const SUPABASE_URL = 'https://fqmqmvmrjshbfohezjho.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxbXFtdm1yanNoYmZvaGV6amhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNTEzMzIsImV4cCI6MjA5NzcyNzMzMn0.0kcXBqqG4NOVrNVpcmlAzaQxQ2S59OUVrQh8mn4eo8M';

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let listaGlobalLivros = [];

// =====================
// Inicialização
// =====================
document.addEventListener('DOMContentLoaded', () => {
    atualizarContadorCarrinho();
    configurarMenuHamburger();
    configurarBarraPesquisa();
    carregarLivrosAutomaticamente();
});

// =====================
// Carregar livros do Supabase
// =====================
async function carregarLivrosAutomaticamente() {
    const mainContainer = document.querySelector('main');
    if (!mainContainer) return;

    const { data: livros, error } = await db.from('livros').select('*');

    if (error) {
        console.error('Erro ao conectar com o Supabase:', error.message);
        mainContainer.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">⚠️</span>
                <h3>Não foi possível carregar o catálogo</h3>
                <p>Tenta novamente mais tarde.</p>
            </div>`;
        return;
    }

    if (!livros || livros.length === 0) {
        mainContainer.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📚</span>
                <h3>Ainda sem livros na loja</h3>
                <p>Volta em breve para descobrir as novidades.</p>
            </div>`;
        return;
    }

    listaGlobalLivros = livros;
    renderizarCategorias(listaGlobalLivros);
}

// =====================
// Renderização
// =====================
function renderizarCategorias(livros) {
    const mainContainer = document.querySelector('main');
    if (!mainContainer) return;
    mainContainer.innerHTML = '';

    if (livros.length === 0) {
        mainContainer.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🔍</span>
                <h3>Nenhum livro encontrado</h3>
                <p>Tenta pesquisar por outro termo.</p>
            </div>`;
        return;
    }

    const categoriasUnicas = [...new Set(livros.map(l => l.categoria))];

    categoriasUnicas.forEach(categoria => {
        const nomeFormatado = String(categoria).charAt(0).toUpperCase() + String(categoria).slice(1);

        const tituloSecao = document.createElement('h2');
        tituloSecao.className = 'categoria-titulo';
        tituloSecao.textContent = nomeFormatado;

        const gridSecao = document.createElement('div');
        gridSecao.className = 'categoria-grid';

        mainContainer.appendChild(tituloSecao);
        mainContainer.appendChild(gridSecao);

        const livrosDaCategoria = livros.filter(l => l.categoria === categoria);
        renderizarLivrosNaGrelha(livrosDaCategoria, gridSecao);
    });
}

function renderizarLivrosNaGrelha(listaDeLivros, container) {
    container.innerHTML = '';

    listaDeLivros.forEach(livro => {
        const card = document.createElement('article');
        card.className = 'card-livro';

        const img = document.createElement('img');
        img.src = livro.imagem_url;
        img.alt = `Capa do livro ${livro.titulo}`;
        img.loading = 'lazy';

        const info = document.createElement('div');
        info.className = 'card-info';
        info.innerHTML = `
            <h3>${escaparHtml(livro.titulo)}</h3>
            <p class="autor">${escaparHtml(livro.autor)}</p>
            <p class="preco">${Number(livro.preco).toLocaleString()} MZN</p>
        `;

        const botao = document.createElement('button');
        botao.textContent = 'Adicionar ao carrinho';
        botao.addEventListener('click', () => adicionarAoCarrinho(livro.id));

        card.append(img, info, botao);
        container.appendChild(card);
    });
}

// =====================
// Pesquisa em tempo real
// =====================
function configurarBarraPesquisa() {
    const inputPesquisa = document.getElementById('input-pesquisa');
    if (!inputPesquisa) return;

    const hero = document.querySelector('.hero');

    inputPesquisa.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase().trim();
        if (hero) hero.style.display = termo ? 'none' : '';

        const livrosFiltrados = listaGlobalLivros.filter(livro =>
            String(livro.titulo).toLowerCase().includes(termo) ||
            String(livro.autor).toLowerCase().includes(termo)
        );

        renderizarCategorias(livrosFiltrados);
    });
}

// =====================
// Menu hambúrguer
// =====================
function configurarMenuHamburger() {
    const menuToggle = document.getElementById('menu-toggle');
    const menuNav = document.getElementById('Menu');
    if (!menuToggle || !menuNav) return;

    menuToggle.addEventListener('click', () => {
        menuNav.classList.toggle('active');
    });
}

// =====================
// Carrinho (localStorage)
// =====================
function adicionarAoCarrinho(id) {
    const livro = listaGlobalLivros.find(l => l.id === id);
    if (!livro) return;

    const itemExistente = carrinho.find(item => item.id === id);

    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({
            id: livro.id,
            titulo: livro.titulo,
            preco: livro.preco,
            imagem: livro.imagem_url,
            quantidade: 1
        });
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
    mostrarToast(`"${livro.titulo}" adicionado ao carrinho`);
}

function atualizarContadorCarrinho() {
    const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    const contadorEl = document.getElementById('contagem-carrinho');
    if (contadorEl) contadorEl.innerText = totalItens;
}

// =====================
// Utilitários
// =====================
function escaparHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str ?? '');
    return div.innerHTML;
}

function mostrarToast(mensagem) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = mensagem;
    requestAnimationFrame(() => toast.classList.add('show'));

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}
