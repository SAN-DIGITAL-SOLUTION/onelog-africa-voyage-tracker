import { render } from '@testing-library/react';
import { UserCard } from '../UserCard';

describe('UserCard snapshot', () => {
  it('matches the snapshot', () => {
    const { container } = render(
      <UserCard user={{ id: '1', name: 'Jane Doe', role: 'admin' }} />
    );
    expect(container).toMatchSnapshot();
  });
});
