import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useNotifications } from '../useNotifications';
import { supabase } from '@/lib/supabase';

// Mock de Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

describe('useNotifications', () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  };

  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    channel: vi.fn().mockReturnValue(mockChannel),
    removeChannel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    supabase.from.mockImplementation(() => mockSupabase);
    // @ts-ignore
    supabase.channel.mockImplementation(() => mockChannel);
  });

  it('should initialize with empty notifications', async () => {
    // Mock de la réponse de Supabase
    mockSupabase.select.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useNotifications('user-123'));

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should load initial notifications', async () => {
    const mockNotifications = [
      { id: '1', user_id: 'user-123', message: 'Test 1', read: false, created_at: '2023-01-01T00:00:00Z' },
      { id: '2', user_id: 'user-123', message: 'Test 2', read: true, created_at: '2023-01-02T00:00:00Z' },
    ];

    // Mock de la réponse de Supabase
    mockSupabase.select.mockResolvedValueOnce({
      data: mockNotifications,
      error: null,
    });

    const { result, waitFor } = renderHook(() => useNotifications('user-123'));

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.unreadCount).toBe(1);
    });
  });

  it('should subscribe to realtime updates', async () => {
    mockSupabase.select.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    renderHook(() => useNotifications('user-123'));

    // Vérifie que la souscription est configurée
    expect(supabase.channel).toHaveBeenCalledWith('notifications-realtime');
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: 'user_id=eq.user-123',
      },
      expect.any(Function)
    );
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('should mark notification as read', async () => {
    const mockNotifications = [
      { id: '1', user_id: 'user-123', message: 'Test', read: false, created_at: '2023-01-01T00:00:00Z' },
    ];

    mockSupabase.select.mockResolvedValueOnce({
      data: mockNotifications,
      error: null,
    });

    mockSupabase.update.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useNotifications('user-123'));
    
    // Attendre que les notifications soient chargées
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.markAsRead('1');
    });

    expect(supabase.from).toHaveBeenCalledWith('notifications');
    expect(mockSupabase.update).toHaveBeenCalledWith({ read: true });
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
    
    // Vérifie que l'état local est mis à jour
    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should remove notification', async () => {
    const mockNotifications = [
      { id: '1', user_id: 'user-123', message: 'Test', read: false, created_at: '2023-01-01T00:00:00Z' },
    ];

    mockSupabase.select.mockResolvedValueOnce({
      data: mockNotifications,
      error: null,
    });

    mockSupabase.delete.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useNotifications('user-123'));
    
    // Attendre que les notifications soient chargées
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.removeNotification('1');
    });

    expect(supabase.from).toHaveBeenCalledWith('notifications');
    expect(mockSupabase.delete).toHaveBeenCalled();
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
    
    // Vérifie que l'état local est mis à jour
    expect(result.current.notifications).toHaveLength(0);
  });

  it('should handle realtime insert', async () => {
    mockSupabase.select.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useNotifications('user-123'));
    
    // Simuler un événement d'insertion en temps réel
    const insertCallback = mockChannel.on.mock.calls[0][2];
    
    await act(async () => {
      insertCallback({
        new: { id: '3', user_id: 'user-123', message: 'New realtime', read: false, created_at: new Date().toISOString() },
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe('3');
    expect(result.current.unreadCount).toBe(1);
  });

  it('should cleanup on unmount', () => {
    mockSupabase.select.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const { unmount } = renderHook(() => useNotifications('user-123'));
    
    unmount();
    
    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});
