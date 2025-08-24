import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import handler from './twilio';
import * as notificationService from '../../../services/notificationService';
import * as supabaseClient from '../../../integrations/supabase/client';

function mockRes() {
  const res: any = {
    statusCode: 0,
    headers: {},
    setHeader: vi.fn((k, v) => (res.headers[k] = v)),
    end: vi.fn((data) => { res._ended = true; res._data = data; }),
  };
  return res;
}

function mockReq({ method = 'POST', headers = {}, body = {} } = {}) {
  return {
    method,
    headers,
    body,
    socket: { remoteAddress: '1.2.3.4' },
  };
}

describe('Twilio webhook handler', () => {
  let logNotificationSpy;
  let supabaseSpy;

  beforeEach(() => {
    logNotificationSpy = vi.spyOn(notificationService, 'logNotification').mockResolvedValue({});
    supabaseSpy = vi.spyOn(supabaseClient, 'supabase').mockReturnValue({
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => ({ data: null, error: null }) }) }) })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejette une signature invalide', async () => {
    const req = mockReq({
      headers: { 'content-type': 'application/json', 'x-twilio-signature': 'bad' },
      body: { MessageSid: 'abc123', To: '+123', From: '+456', Body: 'test' },
    });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(403);
    expect(res._data).toContain('Invalid signature');
  });

  it('rejette un payload non conforme (Zod)', async () => {
    const req = mockReq({
      headers: { 'content-type': 'application/json', 'x-twilio-signature': 'validsig' },
      body: { To: '+123', From: '+456', Body: 'test' }, // Missing MessageSid
    });
    vi.spyOn(notificationService, 'logNotification').mockResolvedValue({});
    vi.spyOn(handler as any, 'validateTwilioSignature').mockReturnValue(true);
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._data).toContain('Invalid payload');
  });

  it('rejette en cas de replay (duplicate MessageSid)', async () => {
    const req = mockReq({
      headers: { 'content-type': 'application/json', 'x-twilio-signature': 'validsig' },
      body: { MessageSid: 'dupeSid', To: '+123', From: '+456', Body: 'test' },
    });
    vi.spyOn(handler as any, 'validateTwilioSignature').mockReturnValue(true);
    vi.spyOn(supabaseClient, 'supabase').mockReturnValue({
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => ({ data: { id: 1 }, error: null }) }) }) })
    });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(409);
    expect(res._data).toContain('Duplicate MessageSid');
  });

  it('rejette en cas de dépassement de rate limit', async () => {
    const req = mockReq({
      headers: { 'content-type': 'application/json', 'x-twilio-signature': 'validsig' },
      body: { MessageSid: 'abc123', To: '+123', From: '+456', Body: 'test' },
    });
    vi.spyOn(handler as any, 'validateTwilioSignature').mockReturnValue(true);
    vi.spyOn(require('./rateLimit'), 'rateLimit').mockReturnValue(true);
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(429);
    expect(res._data).toContain('Too many requests');
  });

  it('rejette en cas de mauvais Content-Type', async () => {
    const req = mockReq({
      headers: { 'content-type': 'text/plain', 'x-twilio-signature': 'validsig' },
      body: { MessageSid: 'abc123', To: '+123', From: '+456', Body: 'test' },
    });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(415);
    expect(res._data).toContain('Unsupported content type');
  });

  it('accepte un payload valide (succès)', async () => {
    const req = mockReq({
      headers: { 'content-type': 'application/json', 'x-twilio-signature': 'validsig' },
      body: { MessageSid: 'okSid', To: '+123', From: '+456', Body: 'test' },
    });
    vi.spyOn(handler as any, 'validateTwilioSignature').mockReturnValue(true);
    vi.spyOn(supabaseClient, 'supabase').mockReturnValue({
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => ({ data: null, error: null }) }) }) })
    });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.headers['Content-Type']).toBe('text/xml');
    expect(res._data).toContain('<Response>');
  });
});
