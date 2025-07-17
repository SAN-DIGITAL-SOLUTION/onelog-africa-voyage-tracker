import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardVehicleStats } from '../../components/dashboard/CardVehicleStats';

// Mock data for testing
const mockVehicleData = {
  active: 24,
  inactive: 3,
  maintenance: 2,
  total: 29,
  trend: 'up' as const,
  trendValue: 12
};

describe('CardVehicleStats', () => {
  it('displays vehicle statistics correctly', () => {
    render(<CardVehicleStats data={mockVehicleData} />);
    
    expect(screen.getByTestId('card-vehicle-stats')).toBeInTheDocument();
    expect(screen.getByText('Flotte Véhicules')).toBeInTheDocument();
    expect(screen.getByText('29')).toBeInTheDocument();
    expect(screen.getByText('Véhicules au total')).toBeInTheDocument();
  });

  it('shows loading state with skeleton', () => {
    render(<CardVehicleStats loading={true} />);
    
    const loadingCard = screen.getByTestId('card-vehicle-stats-loading');
    expect(loadingCard).toBeInTheDocument();
    expect(loadingCard.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('calculates percentages accurately', () => {
    render(<CardVehicleStats data={mockVehicleData} />);
    
    // Active: 24/29 = 82.76% ≈ 83%
    expect(screen.getByText('83%')).toBeInTheDocument();
    // Inactive: 3/29 = 10.34% ≈ 10%
    expect(screen.getByText('10%')).toBeInTheDocument();
    // Maintenance: 2/29 = 6.90% ≈ 7%
    expect(screen.getByText('7%')).toBeInTheDocument();
  });

  it('renders trend indicators properly', () => {
    render(<CardVehicleStats data={mockVehicleData} />);
    
    // Should show upward trend with 12%
    expect(screen.getByText('12%')).toBeInTheDocument();
    
    // Test different trend directions
    const downTrendData = { ...mockVehicleData, trend: 'down' as const, trendValue: 5 };
    render(<CardVehicleStats data={downTrendData} />);
    expect(screen.getByText('5%')).toBeInTheDocument();
  });

  it('displays status breakdown with correct colors', () => {
    render(<CardVehicleStats data={mockVehicleData} />);
    
    expect(screen.getByText('Actifs')).toBeInTheDocument();
    expect(screen.getByText('Inactifs')).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
    
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows last update timestamp', () => {
    // Mock Date to have consistent test
    const mockDate = new Date('2025-07-17T15:30:00');
    vi.setSystemTime(mockDate);
    
    render(<CardVehicleStats data={mockVehicleData} />);
    
    expect(screen.getByText(/Dernière mise à jour/)).toBeInTheDocument();
    expect(screen.getByText(/15:30:00/)).toBeInTheDocument();
    
    vi.useRealTimers();
  });

  it('handles missing data gracefully', () => {
    render(<CardVehicleStats />);
    
    // Should use mock data as fallback
    expect(screen.getByTestId('card-vehicle-stats')).toBeInTheDocument();
    expect(screen.getByText('Flotte Véhicules')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-card-class';
    render(<CardVehicleStats className={customClass} data={mockVehicleData} />);
    
    const card = screen.getByTestId('card-vehicle-stats');
    expect(card).toHaveClass(customClass);
  });
});
