let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

document.addEventListener('DOMContentLoaded', () => {
    atualizarContadorCarrinho();
    configurarMenuHamburger();
    renderizarCarrinho();
});

function renderizarCarrinho() {
    const container = document.getElementById('lista-carrinho');
    const resumo = document.getElementById('resumo-carrinho');
    if (!container || !resumo) return;

    container.innerHTML = '';

    if (carrinho.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🛒</span>
                <h3>O seu carrinho está vazio</h3>
                <p>Ainda não adicionou nenhum livro.</p>
                <a href="index.html">Explorar catálogo</a>
            </div>`;
        resumo.style.display = 'none';
        return;
    }

    resumo.style.display = 'block';
    let precoTotalGeral = 0;

    carrinho.forEach((item, index) => {
        const subtotal = item.preco * item.quantidade;
        precoTotalGeral += subtotal;

        const itemCard = document.createElement('div');
        itemCard.className = 'cart-item';
        itemCard.innerHTML = `
            <img src="${item.imagem}" alt="${item.titulo}">
            <div class="cart-item-info">
                <h3>${item.titulo}</h3>
                <p class="preco-unit">Preço unitário: ${Number(item.preco).toLocaleString()} MZN</p>
            </div>
            <div class="cart-item-actions">
                <div class="qty-control">
                    <button onclick="alterarQuantidade(${index}, -1)" aria-label="Diminuir">−</button>
                    <span>${item.quantidade}</span>
                    <button onclick="alterarQuantidade(${index}, 1)" aria-label="Aumentar">+</button>
                </div>
                <span class="cart-subtotal">${Number(subtotal).toLocaleString()} MZN</span>
                <button class="cart-remove" onclick="removerItem(${index})">Remover</button>
            </div>
        `;
        container.appendChild(itemCard);
    });

    document.getElementById('total-preco').innerText =
        `${Number(precoTotalGeral).toLocaleString()} MZN`;
}

function alterarQuantidade(index, delta) {
    carrinho[index].quantidade += delta;
    if (carrinho[index].quantidade <= 0) carrinho.splice(index, 1);
    salvarEAtualizar();
}

function removerItem(index) {
    carrinho.splice(index, 1);
    salvarEAtualizar();
}

function salvarEAtualizar() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
    renderizarCarrinho();
}

function atualizarContadorCarrinho() {
    const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    const contadorEl = document.getElementById('contagem-carrinho');
    if (contadorEl) contadorEl.innerText = totalItens;
}

function configurarMenuHamburger() {
    const menuToggle = document.getElementById('menu-toggle');
    const menuNav = document.getElementById('Menu');
    if (!menuToggle || !menuNav) return;

    menuToggle.addEventListener('click', () => menuNav.classList.toggle('active'));
}

function finalizarCompra() {
    if (carrinho.length === 0) return;

    let mensagem = 'Olá! Gostaria de encomendar os seguintes livros:\n';
    let total = 0;

    carrinho.forEach(item => {
        const sub = item.preco * item.quantidade;
        total += sub;
        mensagem += `- ${item.quantidade}x ${item.titulo} (${Number(sub).toLocaleString()} MZN)\n`;
    });

    mensagem += `\nTotal: ${Number(total).toLocaleString()} MZN`;

    const numeroWhatsApp = '258840000000'; // <- o teu número
    window.open(
        `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`,
        '_blank'
    );
}