// api/webhook.js
// Recebe notificações do provedor (Efi / Mercado Pago).
// Configure validação de assinatura conforme o provider.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end('Method not allowed');
    return;
  }

  // Para segurança, valide headers/assinatura aqui.
  // Exemplo: if (req.headers['x-provider-signature'] !== process.env.WEBHOOK_SECRET) return res.status(403).end();

  const body = req.body;
  console.log('Webhook recebido:', body);

  // Aqui você trataria o evento: marcar cobrança como paga em DB, etc.
  // Para demo, retornamos OK.
  res.status(200).json({ received: true });
}
