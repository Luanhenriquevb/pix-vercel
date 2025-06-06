const express = require('express');
const fetch = require('node-fetch');
const { obterToken } = require('./token');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, document, email, amount, external_id } = req.body;

    if (!name || !document || !amount) {
      return res.status(400).json({ error: { message: 'Campos obrigatórios faltando.' } });
    }

    const valor = Number(String(amount).replace(',', '.'));
    if (!Number.isFinite(valor) || valor <= 0) {
      return res.status(400).json({ error: { message: "Campo 'amount' inválido." } });
    }

    const token = await obterToken();

    const payload = {
      amount: valor,
      external_id: external_id || `id_${Date.now()}`,
      postbackUrl: 'https://pix-vercel-5.onrender.com/postback', // troque se necessário
      payerQuestion: 'Pagamento via BSPay',
      payer: { name, document }
    };
    if (email) payload.payer.email = email;

    const rsp = await fetch('https://api.bspay.co/v2/pix/qrcode', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await rsp.json();

    if (!rsp.ok || !data.pix) {
      console.error('Erro BSPay:', rsp.status, data);
      return res.status(rsp.status || 502).json({ error: data });
    }

    res.json({
      qr_code: data.pix.qrCode,
      qr_code_image: data.pix.qrCodeBase64
    });

  } catch (err) {
    console.error('Erro interno:', err);
    res.status(500).json({ error: { message: 'Erro interno no servidor.' } });
  }
});

module.exports = router;
