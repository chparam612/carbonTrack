import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TipCard from '../components/TipCard.jsx';

const mockTip = {
  category: 'transport',
  action: 'Switch to public transport',
  difficulty: 'easy',
  timeToImpact: 'immediate',
  annualSavingKg: 240,
  whyItMatters: 'Buses emit 6x less CO2 per km than solo car trips.',
};

describe('TipCard', () => {
  it('renders the tip action text', () => {
    render(<TipCard tip={mockTip} index={0} />);
    expect(screen.getByText('Switch to public transport')).toBeInTheDocument();
  });

  it('renders difficulty badge', () => {
    render(<TipCard tip={mockTip} index={0} />);
    expect(screen.getByText('easy')).toBeInTheDocument();
  });

  it('shows annual saving when showSaving is true', () => {
    render(<TipCard tip={mockTip} index={0} showSaving={true} />);
    expect(screen.getByText(/240/)).toBeInTheDocument();
  });

  it('renders without crashing when optional fields are missing', () => {
    const minimalTip = { category: 'diet', action: 'Eat less meat', annualSavingKg: 0 };
    render(<TipCard tip={minimalTip} index={0} />);
    expect(screen.getByText('Eat less meat')).toBeInTheDocument();
  });
});
