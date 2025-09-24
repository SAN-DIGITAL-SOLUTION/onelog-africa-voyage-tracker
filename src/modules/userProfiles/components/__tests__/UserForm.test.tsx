import { render, screen, fireEvent } from '@testing-library/react';
import { UserForm } from '../UserForm';
import '@testing-library/jest-dom';

describe('UserForm', () => {
  const defaultProps = {
    name: '',
    role: '',
    onChange: vi.fn(),
    onSubmit: vi.fn(),
  };

  it('affiche les champs nom et rôle', () => {
    render(<UserForm {...defaultProps} />);
    expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rôle/i)).toBeInTheDocument();
  });

  it('envoie la fonction onChange lors de la saisie', () => {
    const onChange = vi.fn();
    render(<UserForm {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/nom/i), { target: { value: 'Test' } });
    expect(onChange).toHaveBeenCalledWith('name', 'Test');
    fireEvent.change(screen.getByLabelText(/rôle/i), { target: { value: 'Admin' } });
    expect(onChange).toHaveBeenCalledWith('role', 'Admin');
  });

  it('envoie la fonction onSubmit lors de la soumission', () => {
    const onSubmit = vi.fn();
    render(<UserForm {...defaultProps} onSubmit={onSubmit} />);
    fireEvent.submit(screen.getByRole('form'));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('le bouton submit affiche "Créer" ou "Enregistrer" selon isEditing', () => {
    render(<UserForm {...defaultProps} isEditing={false} />);
    expect(screen.getByRole('button')).toHaveTextContent('Créer');
    render(<UserForm {...defaultProps} isEditing={true} />);
    expect(screen.getByRole('button')).toHaveTextContent('Enregistrer');
  });
});
