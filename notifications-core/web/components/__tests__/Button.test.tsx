import { render, screen } from '@testing-library/react';
import { Button } from '../Button';
import '@testing-library/jest-dom';

describe('Button', () => {
  it('renders the button with children', () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Test');
  });

  it('applies primary variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveStyle({ backgroundColor: 'var(--color-primary)' });
  });

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveStyle({ backgroundColor: 'var(--color-secondary)' });
  });

  it('applies accent variant styles', () => {
    render(<Button variant="accent">Accent</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveStyle({ backgroundColor: 'var(--color-accent-cta)' });
  });

  it('is accessible by role', () => {
    render(<Button>Accessible</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
