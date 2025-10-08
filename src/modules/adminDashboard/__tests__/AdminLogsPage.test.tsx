import { render, screen } from '@testing-library/react';
import AdminLogsPage from '../pages/logs';

describe('AdminLogsPage', () => {
  it('affiche les logs et le stream live', () => {
    render(<AdminLogsPage />);
    expect(screen.getByText('Logs et indicateurs live')).toBeInTheDocument();
    expect(screen.getByText('Live logs :')).toBeInTheDocument();
    expect(screen.getByText('Logs récents')).toBeInTheDocument();
  });
});
