const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { obterToken } = require('./token'); // seu token.js

router.post('/', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: { message: "Campo 'amount' é obrigatório." } });
    }

    const token = await obterToken();

    const payload = {
      chave: process.env.BSPAY_PIX_KEY, // sua chave Pix
      valor: parseFloat(amount).toFixed(2).toString(),
      solicitacaoPagador: "Pagamento BSPay"
    };

    const response = await fetch('https://api.bspay.co/v2/pix/qrcode', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text(); // captura como texto (para debug se der erro)

    try {
      const data = JSON.parse(text);

      if (!response.ok) {
        return res.status(response.status).json({ error: data });
      }

      // Retorna o código Pix e o base64
      return res.json({
        qr_code: data.qrCode,
        qr_code_image: data.qrCodeBase64
      });
    } catch (err) {
      console.error("Erro ao converter resposta BSPay:", text);
      return res.status(500).json({ error: { message: "Resposta BSPay inválida." } });
    }

  } catch (error) {
    console.error("Erro pix.js:", error);
    res.status(500).json({ error: { message: "Erro interno no servidor." } });
  }
});

module.exports = router;
