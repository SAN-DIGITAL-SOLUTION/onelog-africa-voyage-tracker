// Exemple d'intégration notifications-core dans une Supabase Edge Function
import { sendNotification } from './notifications-core/notificationService';

export default async (req: Request) => {
  const body = await req.json();
  // Exemple : déclencher une notification "order/shipped"
  const result = await sendNotification({
    type: 'order/shipped',
    channel: 'email',
    recipient: body.email,
    variables: {
      clientName: body.clientName,
      orderId: body.orderId,
      date: body.date,
    },
    lang: body.lang || 'fr',
    // senderFn: (recipient, content, opts) => appel Twilio/SMTP ici
  });
  return new Response(JSON.stringify(result), { status: result.success ? 200 : 500 });
};
