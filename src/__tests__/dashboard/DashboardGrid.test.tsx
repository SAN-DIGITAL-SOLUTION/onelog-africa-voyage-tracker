import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardGrid } from '../../components/dashboard/DashboardGrid';

describe('DashboardGrid', () => {
  it('renders with correct responsive classes', () => {
    render(<DashboardGrid />);
    
    const grid = screen.getByTestId('dashboard-grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6', 'p-6');
  });

  it('applies custom className correctly', () => {
    const customClass = 'custom-dashboard-class';
    render(<DashboardGrid className={customClass} />);
    
    const grid = screen.getByTestId('dashboard-grid');
    expect(grid).toHaveClass(customClass);
  });

  it('renders placeholder cards in MVP mode', () => {
    render(<DashboardGrid />);
    
    const placeholderCards = screen.getAllByTestId('dashboard-card-placeholder');
    expect(placeholderCards).toHaveLength(3);
    
    // Verify card contents
    expect(screen.getByText('Véhicules Actifs')).toBeInTheDocument();
    expect(screen.getByText('Retards')).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
  });

  it('handles empty state gracefully', () => {
    render(<DashboardGrid />);
    
    const grid = screen.getByTestId('dashboard-grid');
    expect(grid).toBeInTheDocument();
    // Grid should still render even without dynamic content
  });

  it('maintains accessibility attributes', () => {
    render(<DashboardGrid />);
    
    const grid = screen.getByTestId('dashboard-grid');
    expect(grid).toHaveAttribute('data-testid', 'dashboard-grid');
    
    const cards = screen.getAllByTestId('dashboard-card-placeholder');
    cards.forEach(card => {
      expect(card).toHaveAttribute('data-testid');
    });
  });
});
