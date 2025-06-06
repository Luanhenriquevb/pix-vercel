const express = require('express');
const path = require('path');
const app = express();
const pixRoute = require('./api/pix');

app.use(express.json());
app.use('/pix', pixRoute);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/postback', express.json(), (req, res) => {
  console.log('Postback recebido:', req.body);
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
