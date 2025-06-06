const fetch = require('node-fetch');
let token = null;
let tokenExpiraEm = null;

async function obterToken() {
  if (token && tokenExpiraEm && Date.now() < tokenExpiraEm) return token;

  const client_id = process.env.BSPAY_CLIENT_ID;
  const client_secret = process.env.BSPAY_CLIENT_SECRET;
  const credentials = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

  const response = await fetch('https://api.bspay.co/v2/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao autenticar');

  token = data.access_token;
  tokenExpiraEm = Date.now() + (data.expires_in * 1000) - 60000;
  return token;
}

module.exports = { obterToken };
