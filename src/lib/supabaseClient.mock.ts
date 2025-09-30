// Simple mock for Supabase client for Vitest/Jest
type QueryResult = { data: any, error: null };

export const supabase = {
  from: () => ({
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: {}, error: null }) }) }),
    insert: () => Promise.resolve({ error: null }),
    update: () => ({ eq: () => Promise.resolve({ error: null }) }),
  }),
  auth: {
    admin: {
      updateUserById: () => Promise.resolve({})
    }
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ error: null }),
      getPublicUrl: () => ({ data: { publicUrl: "https://fakeurl/avatar.png" } })
    })
  }
};
