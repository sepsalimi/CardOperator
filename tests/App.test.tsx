import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../src/App';

describe('App', () => {
  it('renders the home screen without crashing', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /card operator/i })).toBeInTheDocument();
  });

  it('pauses the game instead of losing progress when browser back is pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /play now/i }));
    expect(await screen.findByText(/build the equation/i)).toBeInTheDocument();

    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(await screen.findByRole('heading', { name: /game paused/i })).toBeInTheDocument();
    expect(screen.getByText(/your score and time are safe/i)).toBeInTheDocument();
  });
});
