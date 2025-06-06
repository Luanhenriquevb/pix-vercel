const express = require('express');
const router = express.Router();
const { obterToken } = require('./token');
const fetch = require('node-fetch');

router.post('/', async (req, res) => {
  try {
    const token = await obterToken();
    const { name, document, email, amount, external_id, payerQuestion } = req.body;

    const payload = {
      amount,
      external_id,
      payerQuestion,
      postbackUrl: 'https://pix-vercel-5.onrender.com/postback',
      payer: {
        name,
        document,
        email
      }
    };

    const response = await fetch('https://api.bspay.co/v2/pix/qrcode', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) return res.status(400).json(data);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
