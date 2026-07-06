import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../src/App';

describe('App', () => {
  it('renders the home screen without crashing', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /card operator/i })).toBeInTheDocument();
  });
});
