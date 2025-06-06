const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(express.json());

// Configura CORS para permitir seu site na Hostinger (ajuste a URL conforme seu domínio)
app.use(cors({
  origin: 'https://slingmoneyglobal.online', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Usa a rota /pix para a API Pix
app.use('/pix', require('./api/pix'));

// Serve os arquivos estáticos na pasta public (se tiver)
app.use(express.static(path.join(__dirname, 'public')));

// Rota raiz para teste (opcional)
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor online na porta ${PORT}`));
