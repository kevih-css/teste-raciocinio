// api/gerar-pix.js
// Serverless function (Vercel) — gera PIX via Efi (modelo).
// Em produção: NÃO coloque secrets no frontend. Configure variables na Vercel.

// NOTE: Vercel serverless functions export default handler.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Se quiser testar sem integração real, defina USE_MOCK=true nas Environment Variables da Vercel.
  if (process.env.USE_MOCK === 'true') {
    const demoPayload = '00020126360014BR.GOV.BCB.PIX0114+55119999999952040000530398654052.005802BR5925Doacao+Teste6009SAO+PAULO62290525taxa-ref1236304ABCD';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(demoPayload)}&size=400x400`;
    res.status(200).json({
      qr_code_image: qrUrl,
      pix_copiaecola: demoPayload
    });
    return;
  }

  // === Fluxo de produção (esboço) ===
  // Abaixo há um exemplo ilustrativo; adapte aos endpoints e formatos do Efi (Gerencianet) ou outro provider.
  try {
    // 1) Autenticação (exemplo ilustrativo)
    // const auth = Buffer.from(`${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`).toString('base64');
    // const tokenRes = await fetch('https://api-pix.efi.com.br/oauth/token', { method: 'POST', headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ grant_type: 'client_credentials' }) });
    // const tokenJson = await tokenRes.json();
    // const accessToken = tokenJson.access_token;

    // 2) Criar cobrança (cob) com valor fixo R$2,00
    // const createRes = await fetch('https://api-pix.efi.com.br/v2/cob', { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ calendario:{ expiracao:3600 }, valor:{ original:"2.00" }, chave: process.env.EFI_PIX_KEY, solicitacaoPagador: 'Doação Teste QI' }) });
    // const charge = await createRes.json();

    // 3) Solicitar QR (base64 / imagem) ou obter linha pix
    // const locId = charge.loc.id;
    // const qrRes = await fetch(`https://api-pix.efi.com.br/v2/loc/${locId}/qrcode`, { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } });
    // const qrJson = await qrRes.json();
    // return res.status(200).json({ qr_code_image: qrJson.imagemQrcode, pix_copiaecola: qrJson.qrcode });

    // Exemplo final (se não implementado): instruir a usar mock
    res.status(500).json({ error: 'Server not configured for production - set USE_MOCK=true for testing or implement provider calls' });
  } catch (err) {
    console.error('erro gerar-pix:', err);
    res.status(500).json({ error: 'Erro ao gerar PIX' });
  }
}