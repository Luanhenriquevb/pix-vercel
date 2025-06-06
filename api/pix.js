// api/pix.js
const express = require('express');
const router   = express.Router();
const fetch    = require('node-fetch');
const { obterToken } = require('./token');   // token.js

router.post('/', async (req, res) => {
  try {
    const { name, document, email, amount, external_id = '', payerQuestion = '' } = req.body;

    // validação mínima
    if (!name || !document || !amount) {
      return res.status(400).json({ error: { message: 'name, document e amount são obrigatórios' } });
    }

    // token OAuth2 BSPay
    const token = await obterToken();

    // payload conforme docs /v2/pix/qrcode
    const payload = {
      amount: parseFloat(amount).toFixed(2).toString(),  // ex. "15.00"
      external_id,
      payerQuestion,
      payer: {
        name,
        document,
        email: email || ''
      },
      postbackUrl: process.env.POSTBACK_URL || 'https://pix-vercel-5.onrender.com/postback'
    };

    // chamada BSPay
    const response = await fetch('https://api.bspay.co/v2/pix/qrcode', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // se veio erro, repassa
    if (!response.ok) {
      const erro = await response.text();   // às vezes a BSPay devolve HTML
      console.error('Erro BSPay:', erro);
      return res.status(response.status).send(erro);
    }

    const data = await response.json();

    /* 
       A BSPay costuma devolver algo como:
       {
         "qrcode": "data:image/png;base64,iVBORw0KG...",
         "payload": "000201...6304ABCD"
       }
       Ajuste os nomes abaixo se forem ligeiramente diferentes.
    */
    res.json({
      qr_code_image: data.qrcode,  // base64 da imagem (vem com prefixo data:image/png;base64,)
      qr_code:       data.payload  // string “copia-e-cola”
    });

  } catch (err) {
    console.error('Erro /pix:', err);
    res.status(500).json({ error: { message: 'Erro interno no servidor' } });
  }
});

module.exports = router;
