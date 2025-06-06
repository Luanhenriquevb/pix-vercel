const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { obterToken } = require('./token'); // Função que retorna o token válido

router.post('/', async (req, res) => {
  try {
    const { name, document, email, amount, external_id } = req.body;

    // Validação dos campos obrigatórios
    if (!name || !document || !amount) {
      return res.status(400).json({ error: { message: "Campos obrigatórios faltando." } });
    }

    const valor = parseFloat(amount);
    if (isNaN(valor) || valor <= 0) {
      return res.status(400).json({ error: { message: "Campo 'amount' inválido." } });
    }

    const token = await obterToken();

    const payload = {
      amount: valor,
      external_id: external_id || `id_${Date.now()}`,
      postbackUrl: "https://pix-vercel-5.onrender.com", // Troque pela sua URL real do webhook
      payerQuestion: "Pagamento via BSPay",
      payer: {
        name,
        document,
        email: email || undefined
      }
    };

    // Remove email se undefined
    if (!payload.payer.email) delete payload.payer.email;

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

    // Retorna o QR code (payload Pix) e a imagem base64 para o frontend
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