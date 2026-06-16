import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TipCard from '../components/TipCard.jsx';

const FULL_TIP = {
  category: 'transport',
  action: 'Switch to public transport',
  difficulty: 'easy',
  timeToImpact: 'immediate',
  annualSavingKg: 240,
  whyItMatters: 'Buses emit 6x less CO2 per km than solo car trips.',
};

describe('TipCard', () => {
  it('renders action text', () => {
    render(<TipCard tip={FULL_TIP} index={0} />);
    expect(screen.getByText('Switch to public transport')).toBeInTheDocument();
  });

  it('renders difficulty badge', () => {
    render(<TipCard tip={FULL_TIP} index={0} />);
    expect(screen.getByText('easy')).toBeInTheDocument();
  });

  it('renders whyItMatters text', () => {
    render(<TipCard tip={FULL_TIP} index={0} />);
    expect(screen.getByText(/Buses emit/)).toBeInTheDocument();
  });

  it('shows saving amount when showSaving is true', () => {
    render(<TipCard tip={FULL_TIP} index={0} showSaving={true} />);
    expect(screen.getByText(/240/)).toBeInTheDocument();
  });

  it('does not show saving inline when showSaving is false', () => {
    render(<TipCard tip={FULL_TIP} index={0} showSaving={false} />);
    expect(screen.getByText(/-240kg/)).toBeInTheDocument();
  });

  it('renders without crashing when optional fields missing', () => {
    const minimal = { category: 'diet', action: 'Eat less meat', annualSavingKg: 0 };
    render(<TipCard tip={minimal} index={0} />);
    expect(screen.getByText('Eat less meat')).toBeInTheDocument();
  });

  it('renders correctly for all 5 categories', () => {
    ['transport','diet','energy','shopping','waste'].forEach(cat => {
      const { unmount } = render(
        <TipCard tip={{ ...FULL_TIP, category: cat }} index={0} />
      );
      expect(screen.getByText('Switch to public transport')).toBeInTheDocument();
      unmount();
    });
  });
});
