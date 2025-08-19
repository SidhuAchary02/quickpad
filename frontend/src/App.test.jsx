import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Collaborative Editor text', () => {
  render(<App />);
  const linkElement = screen.getByText(/Collaborative Editor/i);
  expect(linkElement).toBeInTheDocument();
});