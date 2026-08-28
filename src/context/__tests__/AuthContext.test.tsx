import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock the dynamic import of firebase
vi.mock('../../lib/firebase', () => {
  return {
    auth: {},
    sendPasswordResetEmail: vi.fn(),
  };
});

// A small test component to consume the AuthContext
const TestComponent = ({ onAction }: { onAction: (resetPassword: (email: string) => Promise<void>) => void }) => {
  const { resetPassword } = useAuth();

  useEffect(() => {
    onAction(resetPassword);
  }, [resetPassword, onAction]);

  return <div>Test Component</div>;
};

describe('AuthContext - resetPassword', () => {
  let mockSendPasswordResetEmail: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import the mock so we can set up implementations
    const firebaseMock = await import('../../lib/firebase');
    mockSendPasswordResetEmail = firebaseMock.sendPasswordResetEmail;
  });

  it('should call sendPasswordResetEmail with the cleaned email', async () => {
    mockSendPasswordResetEmail.mockResolvedValueOnce(undefined);
    let resetFn: any;

    render(
      <AuthProvider>
        <TestComponent onAction={(fn) => { resetFn = fn; }} />
      </AuthProvider>
    );

    await act(async () => {
      await resetFn('  Test@Example.com  ');
    });

    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'test@example.com');
  });

  it('should throw a specific error when auth/user-not-found is returned', async () => {
    const error = new Error('Firebase Error');
    (error as any).code = 'auth/user-not-found';
    mockSendPasswordResetEmail.mockRejectedValueOnce(error);

    let resetFn: any;

    render(
      <AuthProvider>
        <TestComponent onAction={(fn) => { resetFn = fn; }} />
      </AuthProvider>
    );

    let caughtError: Error | null = null;
    await act(async () => {
      try {
        await resetFn('test@example.com');
      } catch (err: any) {
        caughtError = err;
      }
    });

    expect(caughtError).toBeInstanceOf(Error);
    expect(caughtError?.message).toBe('No registered account found with this email address.');
  });

  it('should not throw an error for other firebase auth errors (e.g., auth/too-many-requests)', async () => {
    const error = new Error('Firebase Error');
    (error as any).code = 'auth/too-many-requests';
    mockSendPasswordResetEmail.mockRejectedValueOnce(error);

    let resetFn: any;

    render(
      <AuthProvider>
        <TestComponent onAction={(fn) => { resetFn = fn; }} />
      </AuthProvider>
    );

    let caughtError: Error | null = null;
    await act(async () => {
      try {
        await resetFn('test@example.com');
      } catch (err: any) {
        caughtError = err;
      }
    });

    // Should gracefully catch and console.warn, not throw
    expect(caughtError).toBeNull();
  });
});
