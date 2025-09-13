import express from 'express';
import session from 'express-session';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import https from 'https';

const app = express();
const port = 4000;
const FILE_PATH = './usuarios.json';

// Função de normalização (apenas uma vez)
const normalizar = (texto = '') => {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'segredo-cezar',
  resave: false,
  saveUninitialized: true
}));

let usuarios = {};

// Helpers para carregar/salvar usuarios
function carregarUsuarios() {
  try {
    if (fs.existsSync(FILE_PATH)) {
      usuarios = JSON.parse(fs.readFileSync(FILE_PATH));
    } else {
      usuarios = {};
    }
  } catch (err) {
    console.error('Erro ao carregar usuarios.json:', err);
    usuarios = {};
  }
}

function salvarUsuarios() {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(usuarios, null, 2));
  } catch (err) {
    console.error('Erro ao salvar usuarios.json:', err);
  }
}

carregarUsuarios();

// Wrapper para requisição HTTPS (evita sobrescrever nomes)
function fireHttpsGet(url, callback) {
  try {
    https.get(url, callback).on('error', err => {
      console.error('Erro na requisição HTTPS:', err);
    });
  } catch (err) {
    console.error('Erro ao chamar fireHttpsGet:', err);
  }
}

// Rotas públicas
app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
  res.send(`
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');
          body {
            background-color: #0A0A0A;
            color: #00FFFF;
            font-family: 'Orbitron', sans-serif;
            text-align: center;
            padding-top: 50px;
          }
          input, button {
            background-color: #1F1F1F;
            border: 1px solid #8A2BE2;
            color: #39FF14;
            padding: 10px;
            margin: 5px;
            font-size: 16px;
            box-shadow: 0 0 10px #8A2BE2;
          }
          button {
            background-color: #000;
            color: #FF1493;
            border: 1px solid #FF1493;
            box-shadow: 0 0 10px #FF1493;
          }
          a {
            color: #00FFFF;
            text-decoration: none;
          }
          h1, h2, h3 {
            text-shadow: 0 0 10px #00FFFF;
          }
        </style>
      </head>
      <body>
        <h1 style="font-size: 48px;">TRON</h1>
        <h2>Smart Portão</h2>
        <h3>Login de Usuário</h3>
        <form method="POST" action="/login" autocomplete="off">
          <label>Nome de usuário:</label><br>
          <input type="text" name="usuario" autocomplete="off" required><br><br>
          <label>Senha:</label><br>
          <input type="password" name="senha" autocomplete="new-password" required><br><br>
          <button type="submit">Entrar</button>
        </form>
        <p><a href="/registrar">Criar nova conta</a></p>
        <p><a href="/recuperar">Esqueci minha senha</a></p>
      </body>
    </html>
  `);
});

app.post('/login', async (req, res) => {
  let { usuario, senha } = req.body;
  usuario = normalizar(usuario); // normaliza antes de buscar

  const u = usuarios[usuario];

  if (!u || !(await bcrypt.compare(senha, u.senha))) {
    return res.send(`
      <html>
        <head><style>body{background-color:#0A0A0A;color:#FF0000;font-family:'Orbitron',sans-serif;text-align:center;padding-top:100px;}h1{text-shadow:0 0 10px #FF0000;}a{color:#FF1493;text-decoration:none;font-size:18px;border:1px solid #FF1493;padding:10px 20px;box-shadow:0 0 10px #FF1493;background-color:#000;display:inline-block;margin-top:30px;}</style></head>
        <body>
          <h1>Usuário ou senha inválidos.</h1>
          <a href="/login">Voltar</a>
        </body>
      </html>
    `);
  }

  req.session.usuario = usuario;
  res.redirect('/painel');
});

// Cadastro
app.get('/registrar', (req, res) => {
  res.send(`
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');
          body {
            background-color: #0A0A0A;
            color: #00FFFF;
            font-family: 'Orbitron', sans-serif;
            text-align: center;
            padding-top: 50px;
          }
          input, button {
            background-color: #1F1F1F;
            border: 1px solid #8A2BE2;
            color: #39FF14;
            padding: 10px;
            margin: 5px;
            font-size: 16px;
            box-shadow: 0 0 10px #8A2BE2;
          }
          button {
            background-color: #000;
            color: #FF1493;
            border: 1px solid #FF1493;
            box-shadow: 0 0 10px #FF1493;
          }
          a {
            color: #00FFFF;
            text-decoration: none;
          }
          h1, h2, h3 {
            text-shadow: 0 0 10px #00FFFF;
          }
        </style>
      </head>
      <body>
        <h1 style="font-size: 48px;">TRON</h1>
        <h2>Smart Portão</h2>
        <h3>Cadastro de Usuário</h3>
        <form method="POST" action="/registrar">
          <label>Nome de usuário:</label><br>
          <input type="text" name="usuario" required><br><br>
          <label>Senha:</label><br>
          <input type="password" name="senha" required><br><br>
          <label>Confirmar senha:</label><br>
          <input type="password" name="confirmar" required><br><br>
          <label>Pergunta secreta (ex: nome do filme preferido):</label><br>
          <input type="text" name="pergunta" required><br><br>
          <label>Resposta secreta:</label><br>
          <input type="text" name="resposta" required><br><br>
          <button type="submit">Cadastrar</button>
        </form>
        <p><a href="/login">Já tenho conta</a></p>
      </body>
    </html>
  <p>
    <a href="https://link.mercadopago.com.br/smartportao" target="_blank" style="
      display: inline-block;
      background-color: #000;
      color: #FF1493;
      border: 1px solid #FF1493;
      padding: 10px 20px;
      font-size: 16px;
      box-shadow: 0 0 10px #FF1493;
      text-decoration: none;
      margin-top: 20px;
    ">
      💳 Apoiar a Skill Smart Portão
    </a>
  </p>

`);
});

app.post('/registrar', async (req, res) => {
  let { usuario, senha, confirmar, pergunta, resposta } = req.body;
  usuario = normalizar(usuario); // normaliza aqui

  if (senha !== confirmar) {
    return res.send('❌ As senhas não coincidem. <a href="/registrar">Voltar</a>');
  }

  if (usuarios[usuario]) {
    return res.send('❌ Usuário já existe. <a href="/registrar">Voltar</a>');
  }

  const hashSenha = await bcrypt.hash(senha, 10);

  usuarios[usuario] = {
    senha: hashSenha,
    pergunta,
    resposta,
    aliases: {}
  };

  salvarUsuarios();
  res.redirect('/cadastro-sucesso');
});

// Sucesso cadastro
app.get('/cadastro-sucesso', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Cadastro Realizado</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');
          body {
            background-color: #0A0A0A;
            color: #00FFFF;
            font-family: 'Orbitron', sans-serif;
            text-align: center;
            padding-top: 80px;
          }
          h1 {
            font-size: 36px;
            text-shadow: 0 0 10px #39FF14;
            color: #39FF14;
          }
          .neon-button {
            display: inline-block;
            margin-top: 30px;
            background-color: #000;
            color: #00FFFF;
            border: 2px solid #00FFFF;
            padding: 12px 24px;
            font-size: 18px;
            text-decoration: none;
            box-shadow: 0 0 10px #00FFFF;
            transition: box-shadow 0.3s ease-in-out, transform 0.2s ease;
          }
          .neon-button:hover {
            box-shadow: 0 0 20px #00FFFF, 0 0 30px #00FFFF;
            transform: scale(1.05);
          }
        </style>
        <script>
          function playSound() {
            const audio = new Audio('https://www.soundjay.com/button/sounds/button-3.mp3');
            audio.play();
          }
        </script>
      </head>
      <body>
        <h1>✅ Cadastro realizado com sucesso!</h1>
        <a href="/login" class="neon-button" onclick="playSound()">🔙 Voltar ao login</a>
      </body>
    </html>
  `);
});

// Recuperar senha
app.get('/recuperar', (req, res) => {
  res.send(`
    <html>
      <head>
        <style>
          body {
            background-color: #0A0A0A;
            color: #00FFFF;
            font-family: 'Orbitron', sans-serif;
            text-align: center;
            padding-top: 80px;
          }
          input, button {
            background-color: #1F1F1F;
            border: 1px solid #8A2BE2;
            color: #39FF14;
            padding: 10px;
            margin: 5px;
            font-size: 16px;
            box-shadow: 0 0 10px #8A2BE2;
          }
          button {
            background-color: #000;
            color: #FF1493;
            border: 1px solid #FF1493;
            box-shadow: 0 0 10px #FF1493;
          }
        </style>
      </head>
      <body>
        <h1>🔐 Recuperar Senha</h1>
        <form method="POST" action="/recuperar">
          <label>Usuário:</label><br>
          <input type="text" name="usuario" required><br><br>
          <label>Resposta secreta:</label><br>
          <input type="text" name="resposta" required><br><br>
          <label>Nova senha:</label><br>
          <input type="password" name="nova" required><br><br>
          <button type="submit">Redefinir</button>
        </form>
      </body>
    </html>
    <a href="/login" style="
      display: inline-block;
      margin-top: 20px;
      background-color: #000;
      color: #00FFFF;
      border: 1px solid #00FFFF;
      padding: 10px 20px;
      font-size: 16px;
      text-decoration: none;
      box-shadow: 0 0 10px #00FFFF;
    ">
      🔙 Voltar ao login
    </a>
  `);
});

app.post('/recuperar', async (req, res) => {
  let { usuario, resposta, nova } = req.body;
  usuario = normalizar(usuario);

  const u = usuarios[usuario];

  if (!u) {
    return res.send('❌ Usuário não encontrado. <a href="/recuperar">Tentar novamente</a>');
  }

  if (!u.resposta || u.resposta.toLowerCase().trim() !== String(resposta).toLowerCase().trim()) {
    return res.send('❌ Resposta secreta incorreta. <a href="/recuperar">Tentar novamente</a>');
  }

  const novaHash = await bcrypt.hash(nova, 10);
  u.senha = novaHash;

  salvarUsuarios();

  res.send('✅ Senha redefinida com sucesso. <a href="/login">Ir para login</a>');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Painel (apenas um handler, sem duplicatas)
app.get('/painel', (req, res) => {
  const u = req.session.usuario;
  if (!u) return res.redirect('/login');

  const aliases = usuarios[u]?.aliases || {};
  const lista = Object.entries(aliases).map(([alias, url]) => `
    <li>
      <strong>${alias}</strong><br>
      <div style="position:relative; overflow-x:auto; white-space:nowrap; padding:10px; background-color:#1F1F1F; border:1px solid #8A2BE2; box-shadow:0 0 10px #8A2BE2; margin-top:5px;">
        <span style="word-break:break-all; color:#39FF14;">${url}</span>
        <button onclick="navigator.clipboard.writeText('${url}');
          const msg=document.createElement('span');
          msg.textContent='✅ Copiado!';
          msg.style='position:absolute; top:5px; left:5px; color:#00FFFF; font-size:12px; background-color:#000; padding:2px 6px; border:1px solid #00FFFF; box-shadow:0 0 5px #00FFFF;';
          this.parentElement.appendChild(msg);
          setTimeout(()=>msg.remove(),2000);"
          style="position:absolute; top:5px; right:5px; background-color:#000; color:#FF1493; border:1px solid #FF1493; padding:5px; font-size:12px; cursor:pointer;">
          📋
        </button>
      </div>
      <form method="POST" action="/excluir-alias" style="margin-top:10px;">
        <input type="hidden" name="alias" value="${alias}">
        <button type="submit">Excluir</button>
      </form>
    </li>
  `).join('');

  const adminPanel = u === 'admin' ? `
    <h3>Usuários cadastrados</h3>
    <ul>${Object.keys(usuarios).map(user => `<li>${user}</li>`).join('')}</ul>
    <p><a href="/excluir-usuario">🛠️ Administração</a></p>
  ` : '';

  res.send(`
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');
          body {
            background-color: #0A0A0A;
            color: #00FFFF;
            font-family: 'Orbitron', sans-serif;
            text-align: center;
            padding: 30px;
          }
          h1, h2, h3 {
            text-shadow: 0 0 10px #00FFFF;
          }
          ul {
            list-style: none;
            padding: 0;
          }
          li {
            background-color: #1F1F1F;
            border: 1px solid #8A2BE2;
            color: #39FF14;
            padding: 10px;
            margin: 10px auto;
            width: 80%;
            box-shadow: 0 0 10px #8A2BE2;
          }
          input, button {
            background-color: #000;
            color: #FF1493;
            border: 1px solid #FF1493;
            padding: 10px;
            margin: 5px;
            font-size: 16px;
            box-shadow: 0 0 10px #FF1493;
          }
          a {
            color: #00FFFF;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <h1 style="font-size: 48px;">TRON</h1>
        <h2>Smart Portão</h2>
        <h3>Painel de ${u}</h3>
        <p><a href="/logout">Sair</a></p>
        ${adminPanel}
        <h3>Aliases cadastrados:</h3>
        <ul>${lista || '<li>Nenhum alias cadastrado.</li>'}</ul>
        <h3>Cadastrar novo alias</h3>
        <form method="POST" action="/cadastrar-alias">
          <input type="text" name="alias" placeholder="Alias" required><br>
          <input type="text" name="url" placeholder="URL do Voice Monkey" required><br>
          <button type="submit">Cadastrar</button>
        </form>
      </body>
    </html>
  `);
});

// Cadastrar alias
app.post('/cadastrar-alias', (req, res) => {
  const u = req.session.usuario;
  if (!u) return res.redirect('/login');

  let { alias, url } = req.body;
  alias = normalizar(alias);

  if (!usuarios[u].aliases) usuarios[u].aliases = {};
  if (usuarios[u].aliases[alias]) {
    return res.send('❌ Esse alias já existe. <a href="/painel">Voltar</a>');
  }

  usuarios[u].aliases[alias] = url;
  salvarUsuarios();
  res.redirect('/painel');
});

// Excluir alias
app.post('/excluir-alias', (req, res) => {
  const u = req.session.usuario;
  if (!u) return res.redirect('/login');

  let { alias } = req.body;
  alias = normalizar(alias);

  if (usuarios[u]?.aliases?.[alias]) {
    delete usuarios[u].aliases[alias];
    salvarUsuarios();
  }

  res.redirect('/painel');
});

// Admin - listar usuários p/ exclusão
app.get('/excluir-usuario', (req, res) => {
  if (req.session.usuario !== 'admin') return res.redirect('/login');

  const lista = Object.keys(usuarios).map(u => `
    <li>
      <strong>${u}</strong>
      <form method="POST" action="/excluir-usuario" style="display:inline;">
        <input type="hidden" name="usuario" value="${u}">
        <button type="submit">🗑️ Excluir</button>
      </form>
    </li>
  `).join('');

  res.send(`
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');
          body {
            background-color: #0A0A0A;
            color: #00FFFF;
            font-family: 'Orbitron', sans-serif;
            text-align: center;
            padding: 50px;
          }
          h1 {
            text-shadow: 0 0 10px #00FFFF;
          }
          ul {
            list-style: none;
            padding: 0;
          }
          li {
            background-color: #1F1F1F;
            border: 1px solid #8A2BE2;
            color: #39FF14;
            padding: 10px;
            margin: 10px auto;
            width: 60%;
            box-shadow: 0 0 10px #8A2BE2;
          }
          button {
            background-color: #000;
            color: #FF1493;
            border: 1px solid #FF1493;
            padding: 5px 10px;
            font-size: 14px;
            box-shadow: 0 0 10px #FF1493;
            cursor: pointer;
          }
          a {
            color: #00FFFF;
            text-decoration: none;
            display: inline-block;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <h1>🛠️ Administração</h1>
        <h2>Excluir Usuários</h2>
        <ul>${lista}</ul>
        <a href="/painel">Voltar ao painel</a>
      </body>
    </html>
  `);
});

app.post('/excluir-usuario', (req, res) => {
  if (req.session.usuario !== 'admin') return res.redirect('/login');

  const { usuario } = req.body;

  if (usuarios[usuario]) {
    delete usuarios[usuario];
    salvarUsuarios();
  }

  res.redirect('/excluir-usuario');
});

// Rota fixa para garagemvip (colocada antes do catch-all)
app.get('/garagemvip', (req, res) => {
  const uRaw = req.query.usuario || '';
  const u = normalizar(uRaw);
  const a = 'abrirPortao'; // alias fixo
  const url = usuarios[u]?.aliases?.[a];

  if (!url) {
    return res.status(404).send(`❌ Alias "${a}" não encontrado para o usuário "${uRaw}".`);
  }

  fireHttpsGet(url, response => {
    let data = '';
    response.on('data', chunk => { data += chunk; });
    response.on('end', () => {
      res.send(`✅ Disparo enviado para "${a}". Resposta: ${data}`);
    });
  });
});

// Catch-all para alias amigável (deve ficar por último)
app.get('/:alias', (req, res) => {
  const alias = normalizar(req.params.alias);
  const usuario = normalizar(req.query.usuario || '');

  if (!usuario || !usuarios[usuario]) {
    return res.status(401).send('❌ Usuário não informado ou inválido.');
  }

  const url = usuarios[usuario]?.aliases?.[alias];
  if (!url) {
    return res.status(404).send(`❌ Alias "${alias}" não encontrado para o usuário "${usuario}".`);
  }

  fireHttpsGet(url, response => {
    let data = '';
    response.on('data', chunk => { data += chunk; });
    response.on('end', () => {
      res.send(`✅ Disparo enviado para "${alias}". Resposta: ${data}`);
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});

