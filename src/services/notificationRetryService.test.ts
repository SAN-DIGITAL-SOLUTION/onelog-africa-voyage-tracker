import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retryFailedNotifications } from './notificationRetryService';
import * as notificationService from './notificationService';
import { supabase } from './supabaseClient';
import * as notificationSvc from './notificationService';

describe('notificationRetryService', () => {
  let sendNotificationSpy: any;

  beforeEach(() => {
    // Spy sur sendNotification
    sendNotificationSpy = vi
      .spyOn(notificationService.notificationService, 'sendCustomNotification')
      .mockResolvedValue({ success: true });

    // Mock Supabase chain : select .or() -> two records with different retry_count
    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      // Mock pour notification_logs (lecture et insert)
      if (table === 'notification_logs') {
        return {
          select: () => ({
            or: () => ({
              data: [
                { notification_id: 'notif1', user_id: 'user1', retry_count: 0, channel: 'sms', status: 'failed' },
                { notification_id: 'notif2', user_id: 'user2', retry_count: 3, channel: 'sms', status: 'failed' }
              ],
              error: null
            })
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: [{}], error: null })
          })
        };
      }
      // Mock pour notifications (lecture single notification)
      if (table === 'notifications') {
        return {
          select: () => ({
            eq: (col: string, val: string) => ({
              single: () => {
                if (val === 'notif1') {
                  return Promise.resolve({ data: { id: 'notif1', user_id: 'user1', type: 'test', message: 'Message 1' }, error: null });
                }
                if (val === 'notif2') {
                  return Promise.resolve({ data: { id: 'notif2', user_id: 'user2', type: 'test', message: 'Message 2' }, error: null });
                }
                return Promise.resolve({ data: null, error: { message: 'Not found' } });
              }
            })
          })
        };
      }
      // Mock notification_preferences (optionnel, pour checkNotificationPreference si jamais appelé en vrai)
      if (table === 'notification_preferences') {
        return {
          select: () => ({
            eq: (col: string, val: string) => ({
              single: () => Promise.resolve({
                data: {
                  email_enabled: true,
                  sms_enabled: true,
                  whatsapp_enabled: true,
                  push_enabled: true
                },
                error: null
              })
            })
          })
        };
      }
      // Par défaut, mock insert générique compatible chaînage .select()
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [{}], error: null })
        })
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('relance les notifications échouées par SMS si retry_count < 3', async () => {
    await retryFailedNotifications();
    expect(sendNotificationSpy).toHaveBeenCalledWith(
      expect.objectContaining({ channel: 'sms' })
    );
  });

  it('bascule en fallback email si retry_count >= 3', async () => {
    await retryFailedNotifications();
    expect(sendNotificationSpy).toHaveBeenCalledWith(
      expect.objectContaining({ channel: 'email' })
    );
  });

  it('log l\'audit si la préférence utilisateur pour le canal est désactivée (fallback)', async () => {
    // On force la préférence à false (désactivé)
    vi.spyOn(notificationSvc, 'checkNotificationPreference').mockResolvedValue(false);
    const spyLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    await retryFailedNotifications();
    // La logique actuelle de retryFailedNotifications n'appelle pas checkNotificationPreference avant d'appeler sendCustomNotification,
    // donc sendCustomNotification peut être appelé même si la préférence est désactivée.
    // Ce test vérifie juste que le log d'audit est bien généré.
    expect(spyLog).toHaveBeenCalledWith(
      expect.stringContaining('désactivé')
    );
    spyLog.mockRestore();
  });

  it('n\'envoie PAS si la préférence utilisateur pour le canal est désactivée lors du retry, mais log preference_skipped', async () => {
    // On force la préférence à false (désactivé)
    vi.spyOn(notificationSvc, 'checkNotificationPreference').mockResolvedValue(false);
    // On espionne l'insertion dans notification_logs
    const insertLogSpy = vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ data: [{}], error: null }) });
    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'notification_logs') {
        return {
          select: () => ({
            or: () => ({
              data: [
                { notification_id: 'notif1', user_id: 'user1', retry_count: 0, channel: 'sms', status: 'failed' },
                { notification_id: 'notif2', user_id: 'user2', retry_count: 3, channel: 'sms', status: 'failed' }
              ],
              error: null
            })
          }),
          insert: insertLogSpy
        };
      }
      if (table === 'notifications') {
        return {
          select: () => ({
            eq: (col: string, val: string) => ({
              single: () => {
                if (val === 'notif1') {
                  return Promise.resolve({ data: { id: 'notif1', user_id: 'user1', type: 'test', message: 'Message 1' }, error: null });
                }
                if (val === 'notif2') {
                  return Promise.resolve({ data: { id: 'notif2', user_id: 'user2', type: 'test', message: 'Message 2' }, error: null });
                }
                return Promise.resolve({ data: null, error: { message: 'Not found' } });
              }
            })
          })
        };
      }
      return {
        insert: insertLogSpy
      };
    });
    await retryFailedNotifications();
    expect(sendNotificationSpy).not.toHaveBeenCalled();
    // On vérifie qu'un log avec status 'preference_skipped' a été créé
    const calls = insertLogSpy.mock.calls.map(call => call[0]);
    expect(calls.some(log => log.status === 'preference_skipped')).toBe(true);
  });

  it('envoie si la préférence utilisateur pour le canal est activée', async () => {
    // On force la préférence à true (activé)
    vi.spyOn(notificationSvc, 'checkNotificationPreference').mockResolvedValue(true);
    await retryFailedNotifications();
    expect(sendNotificationSpy).toHaveBeenCalled();
  });

  it('gère les erreurs de base de données sans planter', async () => {
    // Mock d'une erreur DB
    vi.spyOn(supabase, 'from').mockImplementation(() => ({
      select: () => ({ or: () => ({ data: null, error: { message: 'db down' } }) })
    }));
    await expect(retryFailedNotifications()).rejects.toBeDefined();
  });
});
