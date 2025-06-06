const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { obterToken } = require('./token'); // seu token.js que retorna o token

router.post('/', async (req, res) => {
  try {
    const { name, document, email, amount, external_id } = req.body;

    // Validação mais rígida de campos obrigatórios e amount válido
    if (
      !name || 
      !document || 
      amount === undefined || 
      amount === null || 
      isNaN(amount) || 
      Number(amount) <= 0
    ) {
      return res.status(400).json({ error: { message: "Campos obrigatórios faltando ou inválidos." } });
    }

    const token = await obterToken();

    // Converte amount para número com 2 casas decimais
    const valorOriginal = Number(amount).toFixed(2);

    const payload = {
      calendario: { expiracao: 3600 }, // 1 hora de expiração
      devedor: {
        nome: name,
        cpf: document.length === 11 ? document : undefined,
        cnpj: document.length === 14 ? document : undefined,
        email: email || undefined,
      },
      valor: {
        original: valorOriginal
      },
      chave: process.env.BSPAY_PIX_KEY, // sua chave Pix cadastrada
      solicitacaoPagador: "Pagamento via BSPay",
      infoAdicionais: [
        { nome: "external_id", valor: external_id || "id_" + Date.now() }
      ]
    };

    // Remove campos undefined para evitar erros
    if (!payload.devedor.cpf) delete payload.devedor.cpf;
    if (!payload.devedor.cnpj) delete payload.devedor.cnpj;
    if (!payload.devedor.email) delete payload.devedor.email;

    const response = await fetch('https://api.bspay.co/v2/pix/qrcode', {
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

    // Retorna o código Pix e a imagem em base64
    res.json({
      qr_code: data.pix.qrCode,
      qr_code_image: data.pix.qrCodeBase64
    });

  } catch (error) {
    console.error("Erro pix.js:", error);
    res.status(500).json({ error: { message: "Erro interno no servidor." } });
  }
});

module.exports = router;
