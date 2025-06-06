const express = require('express');
const fetch   = require('node-fetch');
const { obterToken } = require('./token');     // 👈 sua função que gera o token

const router = express.Router();

// POST /pix
router.post('/', async (req, res) => {
  console.log('### req.body recebido:', req.body);    // debug

  const { name, document, email, amount, external_id } = req.body;
  const valor = Number(amount);                       // converte p/ número

  // validação robusta
  if (!name || !document || !amount || isNaN(valor) || valor <= 0) {
    return res.status(400).json({ error: { message: 'name, document e amount válidos são obrigatórios.' } });
  }

  try {
    const token = await obterToken();

    const payload = {
      calendario: { expiracao: 3600 },
      devedor: {
        nome: name,
        cpf : document.length === 11 ? document : undefined,
        cnpj: document.length === 14 ? document : undefined,
        email: email || undefined
      },
      valor: { original: valor.toFixed(2) },
      chave: process.env.BSPAY_PIX_KEY,                // defina no Render!
      solicitacaoPagador: 'Pagamento BSPay',
      infoAdicionais: [
        { nome: 'external_id', valor: external_id || 'id_' + Date.now() }
      ]
    };

    // remove undefined
    Object.keys(payload.devedor).forEach(k => payload.devedor[k] === undefined && delete payload.devedor[k]);

    const rsp = await fetch('https://api.bspay.co/v2/pix/qrcode', {
      method : 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload)
    });

    const data = await rsp.json();

    if (!rsp.ok) return res.status(rsp.status).json({ error: data });

    // ajuste os nomes se a BSPay devolver diferente
    return res.json({
      qr_code      : data.pix.qrCode,
      qr_code_image: data.pix.qrCodeBase64
    });
  } catch (err) {
    console.error('Erro /pix:', err);
    res.status(500).json({ error: { message: 'Falha interna' } });
  }
});

module.exports = router;
