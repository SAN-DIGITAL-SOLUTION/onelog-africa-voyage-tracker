import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from '../UserCard';
import '@testing-library/jest-dom';

describe('UserCard', () => {
  it('affiche le nom et le rôle', () => {
    render(<UserCard id="1" name="Aïcha Diabaté" role="Admin" />);
    expect(screen.getByText('Aïcha Diabaté')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('affiche le bouton Modifier si onEdit est fourni', () => {
    const onEdit = vi.fn();
    render(<UserCard id="1" name="Aïcha Diabaté" role="Admin" onEdit={onEdit} />);
    const btn = screen.getByRole('button', { name: /modifier/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onEdit).toHaveBeenCalled();
  });

  it('n’affiche pas le bouton Modifier si onEdit n’est pas fourni', () => {
    render(<UserCard id="1" name="Aïcha Diabaté" role="Admin" />);
    expect(screen.queryByRole('button', { name: /modifier/i })).toBeNull();
  });
});
