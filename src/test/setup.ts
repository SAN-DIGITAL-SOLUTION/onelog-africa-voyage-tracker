import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      next: vi.fn(() => ({ headers: new Headers() })),
      rewrite: vi.fn(url => ({ url, headers: new Headers() })),
      redirect: vi.fn(url => ({ url, status: 307, headers: new Headers() })),
    },
  };
});
