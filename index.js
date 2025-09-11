import express from 'express';
import session from 'express-session';
import fs from 'fs';
import bcrypt from 'bcrypt';

const app = express();
const port = 4000;
const FILE_PATH = './usuarios.json';

const normalizar = (texto) => {
  return texto
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
if (fs.existsSync(FILE_PATH)) {
  usuarios = JSON.parse(fs.readFileSync(FILE_PATH));
}

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
  const { usuario, senha } = req.body;
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
  const { usuario, senha, confirmar, pergunta, resposta } = req.body;

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

  fs.writeFileSync(FILE_PATH, JSON.stringify(usuarios, null, 2));

  res.send('✅ Cadastro realizado com sucesso. <a href="/login">Ir para login</a>');
});

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
  `);
});

app.post('/recuperar', async (req, res) => {
  const { usuario, resposta, nova } = req.body;
  const u = usuarios[usuario];

  if (!u) {
    return res.send('❌ Usuário não encontrado. <a href="/recuperar">Tentar novamente</a>');
  }

  if (!u.resposta || u.resposta.toLowerCase().trim() !== resposta.toLowerCase().trim()) {
    return res.send('❌ Resposta secreta incorreta. <a href="/recuperar">Tentar novamente</a>');
  }

  const novaHash = await bcrypt.hash(nova, 10);
  u.senha = novaHash;

  fs.writeFileSync(FILE_PATH, JSON.stringify(usuarios, null, 2));

  res.send('✅ Senha redefinida com sucesso. <a href="/login">Ir para login</a>');
});
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

  res.send(`
    <html>
      <head>
        <style>
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
        ${u === 'admin' ? '<p><a href="/excluir-usuario">🛠️ Administração</a></p>' : ''}
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
  fs.writeFileSync(FILE_PATH, JSON.stringify(usuarios, null, 2));
  res.redirect('/painel');
});

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
    fs.writeFileSync(FILE_PATH, JSON.stringify(usuarios, null, 2));
  }

  res.redirect('/excluir-usuario');
});

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
  fs.writeFileSync(FILE_PATH, JSON.stringify(usuarios, null, 2));
  res.redirect('/painel');
});

app.post('/excluir-alias', (req, res) => {
  const u = req.session.usuario;
  if (!u) return res.redirect('/login');

  const { alias } = req.body;
  const a = normalizar(alias);

  if (usuarios[u]?.aliases?.[a]) {
    delete usuarios[u].aliases[a];
    fs.writeFileSync(FILE_PATH, JSON.stringify(usuarios, null, 2));
  }

  res.redirect('/painel');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

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




