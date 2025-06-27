import crypto from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';
import { rateLimit } from './rateLimit';
import twilioSchema from './twilio.zod';
import { supabase } from '../../../lib/supabaseClient';
import { logNotification } from '../../../services/notificationService';

const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const WEBHOOK_URL = process.env.TWILIO_WEBHOOK_URL || '';

function validateTwilioSignature(req: any) {
  const signature = req.headers['x-twilio-signature'];
  const url = WEBHOOK_URL;
  const params = req.body;
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }
  const computed = crypto.createHmac('sha1', TWILIO_AUTH_TOKEN).update(data).digest('base64');
  return signature === computed;
}

export default async function handler(req: any, res: any) {
  // 1. Enforce POST
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // 2. Enforce Content-Type
  const contentType = req.headers['content-type'] || '';
  if (!['application/json', 'application/x-www-form-urlencoded'].some(t => contentType.includes(t))) {
    res.statusCode = 415;
    res.end(JSON.stringify({ error: 'Unsupported content type' }));
    return;
  }

  // 3. Rate limiting (by IP)
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || 'unknown';
  if (rateLimit(ip)) {
    res.statusCode = 429;
    res.end(JSON.stringify({ error: 'Too many requests' }));
    return;
  }

  // 4. Parse body (support urlencoded or JSON)
  let body: any = {};
  try {
    if (contentType.includes('application/json')) {
      body = req.body || {};
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      body = req.body || {};
    }
  } catch (e) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Invalid body' }));
    return;
  }

  // 5. Validate Twilio signature
  req.body = body;
  if (!validateTwilioSignature(req)) {
    await logNotification({
      type: 'twilio',
      channel: 'webhook',
      recipient: body.To || '',
      status: 'failed',
      content: JSON.stringify(body),
      metadata: { error: 'Invalid Twilio signature' },
    });
    res.statusCode = 403;
    res.end(JSON.stringify({ error: 'Invalid signature' }));
    return;
  }

  // 6. Zod schema validation
  const parseResult = twilioSchema.safeParse(body);
  if (!parseResult.success) {
    await logNotification({
      type: 'twilio',
      channel: 'webhook',
      recipient: body.To || '',
      status: 'failed',
      content: JSON.stringify(body),
      metadata: { error: 'Schema validation failed', issues: parseResult.error.issues },
    });
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Invalid payload', issues: parseResult.error.issues }));
    return;
  }

  // 7. Anti-replay: check for duplicate MessageSid
  const { MessageSid } = body;
  const { data: existing, error: dbError } = await supabase
    .from('notification_logs')
    .select('id')
    .eq('content', MessageSid)
    .maybeSingle();
  if (existing) {
    await logNotification({
      type: 'twilio',
      channel: 'webhook',
      recipient: body.To || '',
      status: 'failed',
      content: MessageSid,
      metadata: { error: 'Replay attack detected' },
    });
    res.statusCode = 409;
    res.end(JSON.stringify({ error: 'Duplicate MessageSid' }));
    return;
  }

  // 8. Log received event
  await logNotification({
    type: 'twilio',
    channel: 'webhook',
    recipient: body.To || '',
    status: 'received',
    content: MessageSid,
    metadata: { from: body.From, body: body.Body },
  });

  // 9. Respond to Twilio (empty XML)
  res.setHeader('Content-Type', 'text/xml');
  res.statusCode = 200;
  res.end('<Response></Response>');
}
