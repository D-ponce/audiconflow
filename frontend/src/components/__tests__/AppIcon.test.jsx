import React from 'react';
import { render } from '@testing-library/react';
import AppIcon from '../AppIcon';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  FileText: ({ size, className, ...props }) => (
    <svg data-testid="file-text-icon" className={className} width={size} height={size} {...props}>
      <title>FileText</title>
    </svg>
  ),
  User: ({ size, className, ...props }) => (
    <svg data-testid="user-icon" className={className} width={size} height={size} {...props}>
      <title>User</title>
    </svg>
  ),
  AlertCircle: ({ size, className, ...props }) => (
    <svg data-testid="alert-circle-icon" className={className} width={size} height={size} {...props}>
      <title>AlertCircle</title>
    </svg>
  )
}));

describe('AppIcon Component', () => {
  test('renders icon with correct name', () => {
    const { getByTestId } = render(<AppIcon name="FileText" />);
    expect(getByTestId('file-text-icon')).toBeInTheDocument();
  });

  test('applies custom size', () => {
    const { getByTestId } = render(<AppIcon name="User" size={24} />);
    const icon = getByTestId('user-icon');
    expect(icon).toHaveAttribute('width', '24');
    expect(icon).toHaveAttribute('height', '24');
  });

  test('applies custom className', () => {
    const { getByTestId } = render(<AppIcon name="AlertCircle" className="text-red-500" />);
    const icon = getByTestId('alert-circle-icon');
    expect(icon).toHaveClass('text-red-500');
  });

  test('renders fallback for unknown icon', () => {
    const { container } = render(<AppIcon name="NonExistentIcon" />);
    expect(container.firstChild).toBeNull();
  });

  test('passes through additional props', () => {
    const { getByTestId } = render(
      <AppIcon name="FileText" data-custom="test-value" />
    );
    const icon = getByTestId('file-text-icon');
    expect(icon).toHaveAttribute('data-custom', 'test-value');
  });
});
