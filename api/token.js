const fetch = require('node-fetch');

let token = null;
let expiraEmMs = 0;

async function obterToken() {
  if (token && Date.now() < expiraEmMs) return token;

  const { BSPAY_CLIENT_ID: id, BSPAY_CLIENT_SECRET: secret } = process.env;
  if (!id || !secret) throw new Error('Credenciais BSPay não configuradas');

  const basic = Buffer.from(`${id}:${secret}`).toString('base64');

  const resp = await fetch('https://api.bspay.co/v2/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      Accept: 'application/json'
    }
  });

  const json = await resp.json();
  if (!resp.ok) throw new Error(json.message || 'Falha ao obter token');

  token = json.access_token;
  expiraEmMs = Date.now() + (json.expires_in * 1000) - 60000;
  return token;
}

module.exports = { obterToken };
