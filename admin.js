const SUPABASE_URL = 'https://fqmqmvmrjshbfohezjho.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxbXFtdm1yanNoYmZvaGV6amhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNTEzMzIsImV4cCI6MjA5NzcyNzMzMn0.0kcXBqqG4NOVrNVpcmlAzaQxQ2S59OUVrQh8mn4eo8M';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

const BUCKET_NAME = 'capas';

document.addEventListener('DOMContentLoaded', async () => {

    // ==========================================
    // PROTEÇÃO DE ROTA — só admin entra
    // ==========================================
    const { data: { session } } = await db.auth.getSession();

    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    // ==========================================
    // FORMULÁRIO — só corre se estiver logado
    // ==========================================
    const formLivro = document.getElementById('form-livro');
    if (!formLivro) return;

    formLivro.addEventListener('submit', async (e) => {
        e.preventDefault();

        const botaoSubmit = formLivro.querySelector('button[type="submit"]');
        const mensagemEl = document.getElementById('mensagem');

        const titulo = document.getElementById('titulo').value.trim();
        const autor = document.getElementById('autor').value.trim();
        const preco = parseFloat(document.getElementById('preco').value);
        const categoria = document.getElementById('categoria').value.trim().toLowerCase();
        const inputFile = document.getElementById('imagem-file').files[0];

        if (!inputFile) {
            mensagemEl.style.color = '#c0392b';
            mensagemEl.innerText = 'Seleciona uma imagem para a capa.';
            return;
        }

        try {
            botaoSubmit.disabled = true;
            botaoSubmit.innerText = 'A guardar...';
            mensagemEl.style.color = 'var(--primary)';
            mensagemEl.innerText = 'A carregar imagem e a guardar livro...';

            const nomeLimpo = inputFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const caminho = `${Date.now()}_${nomeLimpo}`;

            const { error: uploadError } = await db.storage
                .from(BUCKET_NAME)
                .upload(caminho, inputFile);

            if (uploadError) throw new Error('Erro no upload: ' + uploadError.message);

            const { data: urlData } = db.storage
                .from(BUCKET_NAME)
                .getPublicUrl(caminho);

            const imagemUrl = urlData.publicUrl;

            const { error: dbError } = await db.from('livros').insert([{
                titulo, autor, preco, categoria, imagem_url: imagemUrl
            }]);

            if (dbError) throw new Error('Erro ao guardar: ' + dbError.message);

            mensagemEl.style.color = '#27ae60';
            mensagemEl.innerText = 'Livro publicado com sucesso! A redirecionar...';
            formLivro.reset();

            setTimeout(() => { window.location.href = 'index.html'; }, 1400);

        } catch (error) {
            console.error(error);
            mensagemEl.style.color = '#c0392b';
            mensagemEl.innerText = error.message;
            botaoSubmit.disabled = false;
            botaoSubmit.innerText = 'Guardar Livro';
        }
    });
});
