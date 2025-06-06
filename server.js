const express = require('express');
const path = require('path');
const pixRoute = require('./api/pix');

const app = express();

// Habilita o express para interpretar JSON no corpo da requisição
app.use(express.json());

// Rota para o pix
app.use('/pix', pixRoute);

// Serve arquivos estáticos (ex: index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Rota raiz para servir o formulário
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Postback (exemplo)
app.post('/postback', (req, res) => {
  console.log('Postback recebido:', req.body);
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
