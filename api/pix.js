const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
require('dotenv').config();

let token = null;
let tokenExpiraEm = null;

async function obterToken() {
  if (token && tokenExpiraEm && Date.now() < tokenExpiraEm) return token;

  const client_id = process.env.BSPAY_CLIENT_ID;
  const client_secret = process.env.BSPAY_CLIENT_SECRET;
  const credentials = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

  const resposta = await fetch('https://api.bspay.co/v2/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  const data = await resposta.json();
  if (!resposta.ok || !data.access_token) {
    throw new Error(data.message || 'Erro ao autenticar na BSPay');
  }

  token = data.access_token;
  tokenExpiraEm = Date.now() + (data.expires_in * 1000) - 60000;
  return token;
}

router.post('/', async (req, res) => {
  try {
    const { name, document, email, amount } = req.body;

    if (!name || !document || !amount) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const token = await obterToken();

    const payload = {
      amount: parseFloat(amount),
      external_id: `id_${Date.now()}`,
      payerQuestion: 'Pagamento via Pix',
      postbackUrl: process.env.POSTBACK_URL || 'https://seusite.com/postback',
      payer: {
        name,
        document,
        email: email || ''
      }
    };

    const resposta = await fetch('https://api.bspay.co/v2/pix/qrcode', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await resposta.json();

    if (!resposta.ok || data.error || !data.qrcode) {
      return res.status(400).json({ error: data.error || data });
    }

    res.json({
      pix_code: data.qrcode
    });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

module.exports = router;
