const express = require('express');
const path    = require('path');
const app     = express();

app.use(express.json());                     // ← indispensável!
app.use('/pix', require('./api/pix'));       // rota da API
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor online na porta ${PORT}`));
