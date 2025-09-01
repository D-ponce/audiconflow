import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricCard from '../MetricCard';

describe('MetricCard Component', () => {
  const defaultProps = {
    title: 'Total Audits',
    value: '156',
    icon: 'FileText',
    iconColor: '#8B5CF6'
  };

  test('renders metric card with title and value', () => {
    render(<MetricCard {...defaultProps} />);
    
    expect(screen.getByText('Total Audits')).toBeInTheDocument();
    expect(screen.getByText('156')).toBeInTheDocument();
  });

  test('renders with positive change indicator', () => {
    const props = {
      ...defaultProps,
      change: {
        type: 'increase',
        value: '+12%',
        period: 'desde el mes pasado'
      }
    };

    render(<MetricCard {...props} />);
    
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('desde el mes pasado')).toBeInTheDocument();
  });

  test('renders with negative change indicator', () => {
    const props = {
      ...defaultProps,
      change: {
        type: 'decrease',
        value: '-5%',
        period: 'desde la semana pasada'
      }
    };

    render(<MetricCard {...props} />);
    
    expect(screen.getByText('-5%')).toBeInTheDocument();
    expect(screen.getByText('desde la semana pasada')).toBeInTheDocument();
  });

  test('renders without change indicator when not provided', () => {
    render(<MetricCard {...defaultProps} />);
    
    expect(screen.queryByText(/desde/)).not.toBeInTheDocument();
  });

  test('applies correct styling classes', () => {
    const { container } = render(<MetricCard {...defaultProps} />);
    
    const card = container.firstChild;
    expect(card).toHaveClass('bg-gradient-to-br', 'rounded-xl', 'shadow-lg');
  });
});
