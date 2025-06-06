const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

// Rota /pix para gerar o QR code via BSPay
app.post('/pix', async (req, res) => {
  try {
    // Pega dados do frontend
    const { name, document, email, amount } = req.body;

    // --- Passo 1: criar token de acesso ---
    const clientId = 'cavalcanti2004_8991348703';
    const clientSecret = 'e1bfb1287b3320b3fa1d85187b46719abc96022d45e403be0e18405f45323957';
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await fetch('https://api.bspay.co/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!tokenResponse.ok) {
      return res.status(500).json({ error: 'Falha ao gerar token' });
    }

    const tokenJson = await tokenResponse.json();
    const accessToken = tokenJson.access_token;

    // --- Passo 2: criar QR code Pix ---
    const payload = {
      amount: parseFloat(amount),
      external_id: `id_${Date.now()}`, // ID único
      postbackUrl: 'https://SEU_DOMINIO/postback', // pode deixar vazio se não usar webhook
      payerQuestion: "Pagamento via Pix",
      payer: {
        name: name,
        document: document,
        email: email || "",
      }
    };

    const pixResponse = await fetch('https://api.bspay.co/v2/pix/qrcode', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!pixResponse.ok) {
      const errJson = await pixResponse.json();
      return res.status(400).json({ error: errJson });
    }

    const pixJson = await pixResponse.json();

    // Retorna só o código Pix para o frontend copiar
    return res.json({ qr_code: pixJson.qrcode });

  } catch (error) {
    console.error('Erro BSPay:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Servir arquivo estático do formulário
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
