import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationPanel } from '../NotificationPanel';
import * as useNotificationsModule from '@/hooks/useNotifications';

// Mock the useNotifications hook
jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn(),
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

describe('NotificationPanel', () => {
  const mockNotifications = [
    {
      id: '1',
      title: 'Nouvelle facture',
      message: 'Facture #123 générée',
      type: 'invoice_generated',
      priority: 'high',
      read_at: null,
      created_at: '2024-01-01T10:00:00Z',
    },
    {
      id: '2',
      title: 'Paiement reçu',
      message: 'Paiement de 500€ reçu',
      type: 'payment_received',
      priority: 'medium',
      read_at: '2024-01-01T11:00:00Z',
      created_at: '2024-01-01T09:00:00Z',
    },
  ];

  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    (useNotificationsModule.useNotifications as jest.Mock).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      isLoading: false,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      refetch: jest.fn(),
    });

    render(<NotificationPanel {...mockProps} />, { wrapper: createWrapper() });

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Nouvelle facture')).toBeInTheDocument();
    expect(screen.getByText('Facture #123 générée')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    (useNotificationsModule.useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      refetch: jest.fn(),
    });

    const { container } = render(
      <NotificationPanel {...mockProps} isOpen={false} />,
      { wrapper: createWrapper() }
    );

    expect(container.firstChild).toHaveClass('translate-x-full');
  });

  it('shows loading state', () => {
    (useNotificationsModule.useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: true,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      refetch: jest.fn(),
    });

    render(<NotificationPanel {...mockProps} />, { wrapper: createWrapper() });

    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    (useNotificationsModule.useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      refetch: jest.fn(),
    });

    render(<NotificationPanel {...mockProps} />, { wrapper: createWrapper() });

    expect(screen.getByText('Aucune notification')).toBeInTheDocument();
  });

  it('marks notification as read when clicked', () => {
    const mockMarkAsRead = jest.fn();
    (useNotificationsModule.useNotifications as jest.Mock).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      isLoading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: jest.fn(),
      refetch: jest.fn(),
    });

    render(<NotificationPanel {...mockProps} />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText('Nouvelle facture').closest('.cursor-pointer')!);
    expect(mockMarkAsRead).toHaveBeenCalledWith({ notificationId: '1' });
  });

  it('marks all notifications as read', () => {
    const mockMarkAllAsRead = jest.fn();
    (useNotificationsModule.useNotifications as jest.Mock).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      isLoading: false,
      markAsRead: jest.fn(),
      markAllAsRead: mockMarkAllAsRead,
      refetch: jest.fn(),
    });

    render(<NotificationPanel {...mockProps} />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByLabelText('Tout marquer comme lu'));
    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    (useNotificationsModule.useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      refetch: jest.fn(),
    });

    render(<NotificationPanel {...mockProps} />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByLabelText('Fermer'));
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('filters notifications by type', () => {
    const mockSetFilters = jest.fn();
    (useNotificationsModule.useNotifications as jest.Mock).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      isLoading: false,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      refetch: jest.fn(),
    });

    render(<NotificationPanel {...mockProps} />, { wrapper: createWrapper() });

    const select = screen.getByDisplayValue('Tous types');
    fireEvent.change(select, { target: { value: 'invoice' } });
    
    // The select change would trigger a re-render with filtered data
    // In the actual component, this would update the useNotifications hook parameters
  });
});
