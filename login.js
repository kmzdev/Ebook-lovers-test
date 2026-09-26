const SUPABASE_URL = 'https://fqmqmvmrjshbfohezjho.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxbXFtdm1yanNoYmZvaGV6amhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNTEzMzIsImV4cCI6MjA5NzcyNzMzMn0.0kcXBqqG4NOVrNVpcmlAzaQxQ2S59OUVrQh8mn4eo8M';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();

    const botaoSubmit = e.target.querySelector('button[type="submit"]');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const erroEl = document.getElementById('mensagem-erro');

    try {
        botaoSubmit.disabled = true;
        botaoSubmit.innerText = 'A entrar...';
        erroEl.style.color = 'var(--text-muted)';
        erroEl.innerText = 'A validar credenciais...';

        const { error } = await db.auth.signInWithPassword({ email, password });

        if (error) throw new Error('E-mail ou palavra-passe incorretos.');

        erroEl.style.color = '#27ae60';
        erroEl.innerText = 'Login efetuado! A redirecionar...';

        setTimeout(() => { window.location.href = 'cadastrar.html'; }, 900);

    } catch (error) {
        erroEl.style.color = '#c0392b';
        erroEl.innerText = error.message;
        botaoSubmit.disabled = false;
        botaoSubmit.innerText = 'Entrar no sistema';
    }
});
