import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationBadge } from '../NotificationBadge';
import * as useNotificationsModule from '@/hooks/useNotifications';

// Mock the useNotificationBadge hook
jest.mock('@/hooks/useNotifications', () => ({
  useNotificationBadge: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('NotificationBadge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders bell icon when there are no notifications', () => {
    (useNotificationsModule.useNotificationBadge as jest.Mock).mockReturnValue({
      unreadCount: 0,
      isLoading: false,
    });

    render(<NotificationBadge onClick={jest.fn()} />, { wrapper: createWrapper() });

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('notification-count')).not.toBeInTheDocument();
  });

  it('shows notification count when there are unread notifications', () => {
    (useNotificationsModule.useNotificationBadge as jest.Mock).mockReturnValue({
      unreadCount: 5,
      isLoading: false,
    });

    render(<NotificationBadge onClick={jest.fn()} />, { wrapper: createWrapper() });

    expect(screen.getByTestId('notification-count')).toHaveTextContent('5');
  });

  it('shows 9+ when count exceeds 9', () => {
    (useNotificationsModule.useNotificationBadge as jest.Mock).mockReturnValue({
      unreadCount: 15,
      isLoading: false,
    });

    render(<NotificationBadge onClick={jest.fn()} />, { wrapper: createWrapper() });

    expect(screen.getByTestId('notification-count')).toHaveTextContent('9+');
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = jest.fn();
    (useNotificationsModule.useNotificationBadge as jest.Mock).mockReturnValue({
      unreadCount: 3,
      isLoading: false,
    });

    render(<NotificationBadge onClick={mockOnClick} />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    (useNotificationsModule.useNotificationBadge as jest.Mock).mockReturnValue({
      unreadCount: 0,
      isLoading: true,
    });

    render(<NotificationBadge onClick={jest.fn()} />, { wrapper: createWrapper() });

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    (useNotificationsModule.useNotificationBadge as jest.Mock).mockReturnValue({
      unreadCount: 0,
      isLoading: false,
    });

    render(
      <NotificationBadge onClick={jest.fn()} className="custom-class" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
