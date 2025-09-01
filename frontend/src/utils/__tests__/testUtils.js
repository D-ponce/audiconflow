import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Custom render function that includes providers
export const renderWithRouter = (ui, options = {}) => {
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Mock localStorage utilities
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
  
  return localStorageMock;
};

// Mock fetch utility
export const mockFetch = (mockResponse) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponse),
      ...mockResponse
    })
  );
  return global.fetch;
};

// Common test data
export const testUser = {
  email: 'test@example.com',
  role: 'auditor',
  password: 'password123'
};

export const testAudit = {
  auditId: 'AUD-123',
  name: 'Test Audit',
  type: 'Inventario',
  location: 'Almacén A',
  status: 'Pendiente',
  priority: 'Alta',
  auditor: 'Test Auditor'
};
