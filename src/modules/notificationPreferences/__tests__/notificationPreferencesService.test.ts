import { describe, it, expect, vi } from 'vitest';
import * as service from '../notificationPreferencesService';

describe('notificationPreferencesService', () => {
  it('getNotificationPreferences retourne les prefs par défaut si aucune ligne', async () => {
    vi.spyOn(service, 'getUserId').mockResolvedValue('user-1');
    vi.spyOn(service, 'supabase', 'get').mockReturnValue({
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }) }) })
      })
    });
    const prefs = await service.getNotificationPreferences();
    expect(prefs.email_enabled).toBe(true);
    expect(prefs.sms_enabled).toBe(true);
    expect(prefs.whatsapp_enabled).toBe(true);
    expect(prefs.in_app_enabled).toBe(true);
  });

  it('updateNotificationPreferences fait un upsert', async () => {
    vi.spyOn(service, 'getUserId').mockResolvedValue('user-1');
    vi.spyOn(service, 'supabase', 'get').mockReturnValue({
      from: () => ({
        upsert: vi.fn().mockReturnValue({ error: null })
      })
    });
    const res = await service.updateNotificationPreferences({ email_enabled: false });
    expect(res).toBe(true);
  });
});
