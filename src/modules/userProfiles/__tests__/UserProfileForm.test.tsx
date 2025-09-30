import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UserProfileForm } from '../components/UserProfileForm';

const fakeProfile = {
  id: '1',
  email: 'a@b.com',
  fullName: 'Alice',
  role: 'admin',
  created_at: '',
  updated_at: ''
};

describe('UserProfileForm', () => {
  it('affiche les infos du profil', () => {
    render(<UserProfileForm profile={fakeProfile} onChange={() => {}} onSave={() => {}} />);
    expect(screen.getByDisplayValue('a@b.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('admin')).toBeInTheDocument();
  });

  it('déclenche onSave au submit', () => {
    const onSave = vi.fn();
    render(<UserProfileForm profile={fakeProfile} onChange={() => {}} onSave={onSave} />);
    fireEvent.submit(screen.getByRole('button', { name: /enregistrer/i }).closest('form')!);
    expect(onSave).toHaveBeenCalled();
  });
});
