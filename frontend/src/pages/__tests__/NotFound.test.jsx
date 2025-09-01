import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../NotFound';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock components
jest.mock('../../components/ui/Button', () => {
  return function MockButton({ children, onClick, variant, icon, iconPosition }) {
    return (
      <button 
        onClick={onClick} 
        data-variant={variant}
        data-icon-position={iconPosition}
      >
        {icon && <span data-testid="button-icon">{icon}</span>}
        {children}
      </button>
    );
  };
});

jest.mock('../../components/AppIcon', () => {
  return function MockIcon({ name }) {
    return <span data-testid={`icon-${name}`}>{name}</span>;
  };
});

describe('NotFound Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    // Mock window.history.back
    Object.defineProperty(window, 'history', {
      value: { back: jest.fn() },
      writable: true
    });
  });

  const renderNotFound = () => {
    return render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
  };

  test('renders 404 error message', () => {
    renderNotFound();
    
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText("The page you're looking for doesn't exist. Let's get you back!")).toBeInTheDocument();
  });

  test('renders go back button', () => {
    renderNotFound();
    
    const goBackButton = screen.getByRole('button', { name: /go back/i });
    expect(goBackButton).toBeInTheDocument();
    expect(goBackButton).toHaveAttribute('data-variant', 'primary');
  });

  test('renders back to home button', () => {
    renderNotFound();
    
    const homeButton = screen.getByRole('button', { name: /back to home/i });
    expect(homeButton).toBeInTheDocument();
    expect(homeButton).toHaveAttribute('data-variant', 'outline');
  });

  test('renders icons in buttons', () => {
    renderNotFound();
    
    expect(screen.getByTestId('icon-ArrowLeft')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Home')).toBeInTheDocument();
  });

  test('go back button calls window.history.back', () => {
    const mockHistoryBack = jest.fn();
    window.history.back = mockHistoryBack;
    
    renderNotFound();
    
    const goBackButton = screen.getByRole('button', { name: /go back/i });
    fireEvent.click(goBackButton);
    
    expect(mockHistoryBack).toHaveBeenCalledTimes(1);
  });

  test('back to home button navigates to home', () => {
    renderNotFound();
    
    const homeButton = screen.getByRole('button', { name: /back to home/i });
    fireEvent.click(homeButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('applies correct CSS classes for layout', () => {
    renderNotFound();
    
    const container = screen.getByText('404').closest('div').parentElement.parentElement.parentElement;
    expect(container).toHaveClass(
      'min-h-screen',
      'flex',
      'flex-col',
      'items-center',
      'justify-center'
    );
  });

  test('has proper responsive design classes', () => {
    renderNotFound();
    
    const buttonsContainer = screen.getByRole('button', { name: /go back/i }).parentElement;
    expect(buttonsContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'gap-4', 'justify-center');
  });
});