import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input';

describe('Input Component', () => {
  test('renders input with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  test('renders input with placeholder', () => {
    render(<Input placeholder="Enter your email" />);
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
  });

  test('shows error message when error prop is provided', () => {
    render(<Input label="Email" error="Email is required" />);
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  test('shows description when description prop is provided', () => {
    render(<Input label="Email" description="We'll never share your email" />);
    expect(screen.getByText(/we'll never share your email/i)).toBeInTheDocument();
  });

  test('applies error styling when error is present', () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveClass('border-red-500');
  });

  test('handles input changes', () => {
    const handleChange = jest.fn();
    render(<Input label="Email" onChange={handleChange} />);
    
    const input = screen.getByLabelText(/email/i);
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  test('renders as required when required prop is true', () => {
    render(<Input label="Email" required />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toBeRequired();
  });

  test('is disabled when disabled prop is true', () => {
    render(<Input label="Email" disabled />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toBeDisabled();
  });

  test('renders checkbox type correctly', () => {
    render(<Input type="checkbox" label="Accept terms" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  test('renders radio type correctly', () => {
    render(<Input type="radio" label="Option 1" name="options" />);
    const radio = screen.getByRole('radio');
    expect(radio).toBeInTheDocument();
  });
});
