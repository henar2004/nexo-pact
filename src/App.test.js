import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Nexo Research workspace', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { name: /una pregunta/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /crear resumen/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /ver código/i })
  ).toHaveAttribute(
    'href',
    'https://github.com/henar2004/create-react-app'
  );
});
