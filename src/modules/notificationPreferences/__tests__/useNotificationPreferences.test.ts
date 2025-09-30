import { describe, it, expect, vi } from 'vitest';
import { useNotificationPreferences } from '../useNotificationPreferences';
import * as service from '../notificationPreferencesService';
import { renderHook, act } from '@testing-library/react';

describe('useNotificationPreferences', () => {
  it('charge et met à jour les préférences', async () => {
    vi.spyOn(service, 'getNotificationPreferences').mockResolvedValue({
      email_enabled: true,
      sms_enabled: false,
      whatsapp_enabled: true,
      in_app_enabled: false,
      preferences: {}
    });
    vi.spyOn(service, 'updateNotificationPreferences').mockResolvedValue(true);

    const { result, waitForNextUpdate } = renderHook(() => useNotificationPreferences());
    await waitForNextUpdate();
    expect(result.current.preferences.sms_enabled).toBe(false);
    act(() => {
      result.current.updatePreference('sms_enabled', true);
    });
    expect(result.current.preferences.sms_enabled).toBe(true);
    await act(async () => {
      await result.current.savePreferences();
    });
    expect(result.current.dirty).toBe(false);
  });
});
