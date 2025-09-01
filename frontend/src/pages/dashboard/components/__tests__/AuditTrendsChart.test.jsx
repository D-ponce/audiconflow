import React from 'react';
import { render, screen } from '@testing-library/react';
import AuditTrendsChart from '../AuditTrendsChart';

// Mock Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children, data }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, fill }) => (
    <div data-testid="bar" data-key={dataKey} data-fill={fill} />
  ),
  XAxis: ({ dataKey }) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}));

describe('AuditTrendsChart Component', () => {
  const mockData = [
    { month: 'Ene', audits: 12, completed: 10 },
    { month: 'Feb', audits: 15, completed: 12 },
    { month: 'Mar', audits: 18, completed: 16 }
  ];

  test('renders chart with data', () => {
    render(<AuditTrendsChart data={mockData} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
  });

  test('passes correct data to chart', () => {
    render(<AuditTrendsChart data={mockData} />);
    
    const chart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(chart.getAttribute('data-chart-data'));
    expect(chartData).toEqual(mockData);
  });

  test('renders chart elements', () => {
    render(<AuditTrendsChart data={mockData} />);
    
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  test('renders without data', () => {
    render(<AuditTrendsChart data={[]} />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
});
