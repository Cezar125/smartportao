import express from 'express';
import session from 'express-session';
import fs from 'fs';
import { get as httpsGet } from 'https';

const app = express();
const port = 4000;
const FILE_PATH = './usuarios.json';

// Função para normalizar textos (usuário e alias)
const normalizar = (texto) => {
  return texto
    .toLowerCase()
    .normalize("NFD")           // remove acentos
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");       // remove espaços
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'segredo-cezar',
  resave: false,
  saveUninitialized: true
}));

// Carrega usuários
let usuarios = {};
if (fs.existsSync(FILE_PATH)) {
  usuarios = JSON.parse(fs.readFileSync(FILE_PATH));
}

// Rota inicial
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Tela de login
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

        <!-- 👇 Aqui está o formulário com autocomplete desativado -->
        <form method="POST" action="/login" autocomplete="off">
          <label>Nome de usuário:</label><br>
          <input type="text" name="usuario" autocomplete="off" required><br><br>
          <label>Senha:</label><br>
          <input type="password" name="senha" autocomplete="new-password" required><br><br>
          <button type="submit">Entrar</button>
        </form>

        <p><a href="/registrar">Criar nova conta</a></p>
      </body>
    </html>
  `);
});


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
          <button type="submit">Cadastrar</button>
        </form>
        <p><a href="/login">Já tenho conta</a></p>
      </body>
    </html>
  `);
});




// Processa login
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;
  const u = normalizar(usuario);

  if (!usuarios[u]) {
    return res.send('❌ Usuário não encontrado. <a href="/login">Voltar</a>');
  }

  if (usuarios[u].senha !== senha) {
    return res.send('❌ Senha incorreta. <a href="/login">Voltar</a>');
  }

  req.session.usuario = u;
  res.redirect('/painel');
});

// Tela de cadastro
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
          <button type="submit">Cadastrar</button>
        </form>
        <p><a href="/login">Já tenho conta</a></p>
      </body>
    </html>
  `);
});

// Processa cadastro
app.post('/registrar', (req, res) => {
  const { usuario, senha } = req.body;
  const u = normalizar(usuario);

  if (usuarios[u]) {
    return res.send('❌ Usuário já existe. <a href="/registrar">Tente outro</a>');
  }

  usuarios[u] = {
    senha,
    aliases: {}
  };

  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(usuarios, null, 2));
    console.log(`✅ Novo usuário registrado: ${u}`);
  } catch (err) {
    console.error('❌ Erro ao salvar novo usuário:', err);
    return res.send('❌ Erro ao salvar. Tente novamente.');
  }

  res.send(`✅ Usuário "${u}" cadastrado com sucesso. <a href="/login">Fazer login</a>`);
});

// Painel do usuário
app.get('/painel', (req, res) => {
  const u = req.session.usuario;
  if (!u) return res.redirect('/login');

  const aliases = usuarios[u]?.aliases || {};
  const lista = Object.entries(aliases).map(([alias, url]) => `
    <li>
      <strong>${alias}</strong><br>
      <div style="position:relative; overflow-x:auto; white-space:nowrap; padding:10px; background-color:#1F1F1F; border:1px solid #8A2BE2; box-shadow:0 0 10px #8A2BE2; margin-top:5px;">
        <span style="word-break:break-all; color:#39FF14;">${url}</span>
        <button <button onclick="navigator.clipboard.writeText('${url}'); 
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

  const { alias, url } = req.body;
  const a = normalizar(alias);

  if (!usuarios[u].aliases) usuarios[u].aliases = {};
  if (usuarios[u].aliases[a]) {
    return res.send('❌ Esse alias já existe. <a href="/painel">Voltar</a>');
  }

  usuarios[u].aliases[a] = url;

  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(usuarios, null, 2));
    console.log(`✅ Alias "${a}" salvo para o usuário "${u}"`);
  } catch (err) {
    console.error('❌ Erro ao salvar alias:', err);
  }

  res.redirect('/painel');
});
app.post('/excluir-alias', (req, res) => {
  const u = req.session.usuario;
  if (!u) return res.redirect('/login');

  const { alias } = req.body;
  const a = normalizar(alias);

  if (usuarios[u]?.aliases?.[a]) {
    delete usuarios[u].aliases[a];
    try {
      fs.writeFileSync(FILE_PATH, JSON.stringify(usuarios, null, 2));
      console.log(`🗑️ Alias "${a}" excluído para o usuário "${u}"`);
    } catch (err) {
      console.error('❌ Erro ao excluir alias:', err);
      return res.send('❌ Erro ao excluir. Tente novamente.');
    }
  }

  res.redirect('/painel');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Disparo por alias com nome de usuário na query string
app.get('/:alias', (req, res) => {
  const a = normalizar(req.params.alias);
  const u = normalizar(req.query.usuario);

  if (!u || !usuarios[u]) {
    return res.status(401).send('❌ Usuário não informado ou inválido.');
  }

  const url = usuarios[u]?.aliases?.[a];
  if (!url) {
    return res.status(404).send(`❌ Alias "${a}" não encontrado para o usuário "${u}".`);
  }

  httpsGet(url, response => {
    let data = '';
    response.on('data', chunk => { data += chunk; });
    response.on('end', () => {
      res.send(`✅ Disparo enviado para "${a}". Resposta: ${data}`);
    });
  }).on('error', e => {
    console.error(e);
    res.status(500).send('❌ Erro ao acessar a URL.');
  });
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});






