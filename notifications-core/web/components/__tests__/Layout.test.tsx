import { render, screen } from '@testing-library/react';
import { Layout } from '../Layout';
import '@testing-library/jest-dom';

describe('Layout', () => {
  it('renders children inside the layout', () => {
    render(<Layout><div>Contenu</div></Layout>);
    expect(screen.getByText('Contenu')).toBeInTheDocument();
  });

  it('renders the header with correct text', () => {
    render(<Layout><div /></Layout>);
    expect(screen.getByRole('banner')).toHaveTextContent('SAN Digital Solutions - Notifications Core');
  });

  it('main section is present', () => {
    render(<Layout><span>Zone principale</span></Layout>);
    expect(screen.getByText('Zone principale')).toBeInTheDocument();
  });
});
