import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from '../Button';

expect.extend(toHaveNoViolations);

describe('Button a11y', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button variant="primary">Test</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
