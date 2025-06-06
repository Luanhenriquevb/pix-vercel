const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { obterToken } = require('./token'); // importa o token

router.post('/', async (req, res) => {
  try {
    const { name, document, email, amount, external_id } = req.body;

    if (!name || !document || !amount) {
      return res.status(400).json({ error: { message: "Campos obrigatórios faltando." } });
    }

    const token = await obterToken();

    const payload = {
      calendario: { expiracao: 3600 },
      devedor: {
        cpf: document.length === 11 ? document : undefined,
        cnpj: document.length === 14 ? document : undefined,
        nome: name,
        email: email || undefined,
      },
      valor: {
        original: parseFloat(amount).toFixed(2).toString()
      },
      chave: process.env.BSPAY_PIX_KEY,
      solicitacaoPagador: "Pagamento via BSPay",
      infoAdicionais: [
        { nome: "external_id", valor: external_id || "id_" + Date.now() }
      ]
    };

    // Remove campos undefined
    if (!payload.devedor.cpf) delete payload.devedor.cpf;
    if (!payload.devedor.cnpj) delete payload.devedor.cnpj;
    if (!payload.devedor.email) delete payload.devedor.email;

    const response = await fetch('https://api.bspay.co/v2/pix/qrcode
', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    // 🔧 Ajuste temporário: responde com todo o JSON retornado pela BSPay
    res.json(data);

  } catch (error) {
    console.error("Erro pix.js:", error);
    res.status(500).json({ error: { message: "Erro interno no servidor." } });
  }
});

module.exports = router;
