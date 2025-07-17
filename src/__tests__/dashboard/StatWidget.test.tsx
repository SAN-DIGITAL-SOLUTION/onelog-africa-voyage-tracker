import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Truck } from 'lucide-react';
import { StatWidget } from '../../components/dashboard/StatWidget';

describe('StatWidget', () => {
  const basicProps = {
    title: 'Test Metric',
    value: '42',
    subtitle: 'Test subtitle'
  };

  it('renders all variants correctly', () => {
    render(<StatWidget {...basicProps} />);
    
    expect(screen.getByTestId('stat-widget')).toBeInTheDocument();
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByTestId('stat-widget-value')).toHaveTextContent('42');
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  it('handles missing optional props', () => {
    render(<StatWidget title="Minimal" value={100} />);
    
    expect(screen.getByText('Minimal')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    // Should not crash without subtitle, icon, or trend
  });

  it('displays trend information when provided', () => {
    const trendProps = {
      ...basicProps,
      trend: {
        value: 15,
        direction: 'up' as const,
        label: 'vs last week'
      }
    };

    render(<StatWidget {...trendProps} />);
    
    const trend = screen.getByTestId('stat-widget-trend');
    expect(trend).toBeInTheDocument();
    expect(trend).toHaveTextContent('↗');
    expect(trend).toHaveTextContent('15%');
    expect(trend).toHaveTextContent('vs last week');
  });

  it('applies correct color themes', () => {
    const colors = ['primary', 'secondary', 'accent', 'success', 'warning', 'error'] as const;
    
    colors.forEach(color => {
      const { unmount } = render(
        <StatWidget {...basicProps} color={color} data-testid={`widget-${color}`} />
      );
      
      const widget = screen.getByTestId('stat-widget');
      expect(widget).toBeInTheDocument();
      
      unmount();
    });
  });

  it('renders icon when provided', () => {
    render(<StatWidget {...basicProps} icon={Truck} />);
    
    const icon = screen.getByTestId('stat-widget-icon');
    expect(icon).toBeInTheDocument();
  });

  it('shows loading state with skeleton', () => {
    render(<StatWidget {...basicProps} loading={true} />);
    
    const loadingWidget = screen.getByTestId('stat-widget-loading');
    expect(loadingWidget).toBeInTheDocument();
    expect(loadingWidget.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('handles different trend directions', () => {
    const directions = ['up', 'down', 'stable'] as const;
    const expectedArrows = ['↗', '↘', '→'];
    
    directions.forEach((direction, index) => {
      const { unmount } = render(
        <StatWidget 
          {...basicProps} 
          trend={{ value: 10, direction }}
        />
      );
      
      const trend = screen.getByTestId('stat-widget-trend');
      expect(trend).toHaveTextContent(expectedArrows[index]);
      
      unmount();
    });
  });

  it('applies custom className', () => {
    const customClass = 'custom-widget-class';
    render(<StatWidget {...basicProps} className={customClass} />);
    
    const widget = screen.getByTestId('stat-widget');
    expect(widget).toHaveClass(customClass);
  });

  it('handles numeric and string values', () => {
    // Test numeric value
    render(<StatWidget title="Numeric" value={123} />);
    expect(screen.getByText('123')).toBeInTheDocument();
    
    // Test string value
    render(<StatWidget title="String" value="45.2%" />);
    expect(screen.getByText('45.2%')).toBeInTheDocument();
  });
});
