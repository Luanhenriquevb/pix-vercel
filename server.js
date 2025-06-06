const express = require('express');
const path = require('path');
const cors = require('cors');  // Importa o cors

const app = express();

app.use(express.json()); // Para receber JSON no corpo da requisição

// Configuração CORS - permita apenas seu site ou todos (se quiser liberar geral)
app.use(cors({
  origin: 'https://slingmoneyglobal.online', // URL do seu site na Hostinger
  methods: ['GET', 'POST'],                    // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
}));

// Sua rota da API Pix
app.use('/pix', require('./api/pix'));

// Servir arquivos estáticos (se tiver)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => 
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor online na porta ${PORT}`));
