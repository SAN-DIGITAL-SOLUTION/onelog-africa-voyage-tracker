import { vi, describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { sendNotification, checkNotificationPreference } from '../notificationService';
import { supabase } from '../supabaseClient';
import Twilio from 'twilio';

// Mock des dépendances externes
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
  }
}));

vi.mock('twilio', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}));

vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

// Mock pour le moteur de templates
vi.mock('../templateEngine', () => ({
  TemplateEngine: {
    render: vi.fn().mockImplementation((type: string, channel: string) => 
      `Template for ${type} via ${channel}`
    ),
  },
}));

describe('Notification Service', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
  };

  const mockTwilio = {
    messages: {
      create: vi.fn().mockResolvedValue({ sid: 'SM123' }),
    },
  };

  const mockFetch = vi.fn().mockResolvedValue({ ok: true });

  beforeAll(() => {
    // Configuration des variables d'environnement
    process.env.TWILIO_WHATSAPP_FROM = 'whatsapp:+1234567890';
    process.env.TWILIO_SMS_FROM = '+1234567890';
    process.env.MAILERSEND_API_TOKEN = 'test-token';
    process.env.MAILERSEND_SENDER_EMAIL = 'noreply@test.com';
    
    // @ts-ignore
    global.fetch = mockFetch;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configuration des mocks par défaut
    // @ts-ignore
    supabase.from.mockImplementation(() => mockSupabase);
    // @ts-ignore
    Twilio.mockImplementation(() => mockTwilio);
    
    // Configuration des réponses par défaut
    mockSupabase.single.mockResolvedValue({
      data: { email_enabled: true, sms_enabled: true, whatsapp_enabled: true },
      error: null
    });
    
    mockSupabase.insert.mockResolvedValue({
      data: [{ id: 'log-123' }],
      error: null
    });
  });

  describe('checkNotificationPreference', () => {
    it('should return true when no preferences found (default enabled)', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: new Error('Not found') });
      
      const result = await checkNotificationPreference('user-123', 'email');
      expect(result).toBe(true);
    });

    it('should respect disabled email preference', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { email_enabled: false },
        error: null,
      });
      
      const result = await checkNotificationPreference('user-123', 'email');
      expect(result).toBe(false);
    });
  });

  describe('sendNotification', () => {
    const baseNotification = {
      type: 'mission_created',
      recipient: 'test@example.com',
      userId: 'user-123',
      channel: 'email' as const,
      variables: { missionId: '123' },
    };

    it('should send email notification successfully', async () => {
      const result = await sendNotification(baseNotification);

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.mailersend.com/v1/email',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: expect.any(String)
        })
      );
    });

    it('should send SMS notification via Twilio', async () => {
      const result = await sendNotification({
        ...baseNotification,
        channel: 'sms',
        recipient: '+1234567890',
      });

      expect(result).toEqual({ success: true });
      expect(mockTwilio.messages.create).toHaveBeenCalledWith({
        from: '+1234567890',
        to: '+1234567890',
        body: expect.any(String),
      });
    });

    it('should handle notification preference disabled', async () => {
      // Mock des préférences désactivées
      mockSupabase.single.mockResolvedValueOnce({
        data: { email_enabled: false },
        error: null,
      });

      const result = await sendNotification(baseNotification);

      expect(result).toEqual({
        success: false,
        error: 'Notifications désactivées pour ce canal',
      });
    });

    it('should handle Twilio errors', async () => {
      const error = new Error('Twilio error');
      mockTwilio.messages.create.mockRejectedValueOnce(error);

      const result = await sendNotification({
        ...baseNotification,
        channel: 'sms',
        recipient: '+1234567890',
      });

      expect(result).toEqual({
        success: false,
        error: 'Twilio error',
      });
    });
  });
});
