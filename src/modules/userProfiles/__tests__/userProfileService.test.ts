import { describe, it, expect, vi } from 'vitest';
import * as userProfileService from '../services/userProfileService';

vi.mock('../../../services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: '1', email: 'a@b.com', fullName: 'Alice', role: 'admin', created_at: '', updated_at: '' }, error: null }),
      update: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('userProfileService', () => {
  it('getUserProfile retourne un profil', async () => {
    const profile = await userProfileService.getUserProfile('1');
    expect(profile).toBeTruthy();
    expect(profile?.email).toBe('a@b.com');
  });
});
