import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Mock AppIcon component
jest.mock('../AppIcon', () => {
  return function MockIcon({ name, size, color }) {
    return <span data-testid={`icon-${name}`} data-size={size} data-color={color}>{name}</span>;
  };
});

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary Component', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    // Clear any previous error state
    jest.clearAllMocks();
  });

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('We encountered an unexpected error while processing your request.')).toBeInTheDocument();
  });

  test('renders back button in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeInTheDocument();
    expect(screen.getByTestId('icon-ArrowLeft')).toBeInTheDocument();
  });

  test('back button redirects to home page', () => {
    // Mock window.location
    delete window.location;
    window.location = { href: '' };

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    expect(window.location.href).toBe('/');
  });

  test('logs error to console when error occurs', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error caught by ErrorBoundary:',
      expect.any(Error),
      expect.any(Object)
    );

    consoleSpy.mockRestore();
  });

  test('calls window.__COMPONENT_ERROR__ if available', () => {
    const mockErrorHandler = jest.fn();
    window.__COMPONENT_ERROR__ = mockErrorHandler;

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(mockErrorHandler).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );

    delete window.__COMPONENT_ERROR__;
  });

  test('error has __ErrorBoundary flag set', () => {
    let caughtError;
    const mockErrorHandler = jest.fn((error) => {
      caughtError = error;
    });
    window.__COMPONENT_ERROR__ = mockErrorHandler;

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(caughtError.__ErrorBoundary).toBe(true);

    delete window.__COMPONENT_ERROR__;
  });

  test('applies correct CSS classes for error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const container = screen.getByText('Something went wrong').closest('div').parentElement.parentElement;
    expect(container).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center', 'bg-neutral-50');
  });
});