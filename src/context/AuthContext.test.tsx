import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock dependencies
vi.mock('../lib/firebase', () => ({
  auth: {},
  googleProvider: {},
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
}));

vi.mock('../lib/firestoreService', () => ({
  getUserAccountFromFirebase: vi.fn(),
  saveUserAccountToFirebase: vi.fn(),
  subscribeToUserAccount: vi.fn(),
}));

describe('AuthContext - Google Sign In Error Handling', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  const TestComponent = ({ onError }: { onError?: (error: any) => void }) => {
    const { signInWithGoogle } = useAuth();

    const handleLogin = async () => {
      try {
        await signInWithGoogle();
      } catch (err) {
        if (onError) onError(err);
      }
    };

    return <button onClick={handleLogin}>Login with Google</button>;
  };

  const renderWithProvider = (component: React.ReactNode) => {
    return render(<AuthProvider>{component}</AuthProvider>);
  };

  it('throws custom error when popup is closed by user', async () => {
    const { signInWithPopup } = await import('../lib/firebase');

    const mockError = new Error('auth/popup-closed-by-user');
    (mockError as any).code = 'auth/popup-closed-by-user';
    (signInWithPopup as any).mockRejectedValueOnce(mockError);

    let caughtError: any = null;
    renderWithProvider(<TestComponent onError={(err) => { caughtError = err; }} />);

    await act(async () => {
      screen.getByText('Login with Google').click();
    });

    expect(caughtError).toBeDefined();
    expect(caughtError.message).toBe('Google Sign-In popup closed. Please try again or use Email/Password.');
    expect(caughtError.code).toBe('auth/popup-closed-by-user');
  });

  it('throws custom error when popup is blocked', async () => {
    const { signInWithPopup } = await import('../lib/firebase');

    const mockError = new Error('auth/popup-blocked');
    (mockError as any).code = 'auth/popup-blocked';
    (signInWithPopup as any).mockRejectedValueOnce(mockError);

    let caughtError: any = null;
    renderWithProvider(<TestComponent onError={(err) => { caughtError = err; }} />);

    await act(async () => {
      screen.getByText('Login with Google').click();
    });

    expect(caughtError).toBeDefined();
    expect(caughtError.message).toBe('Browser blocked Google popup. Please allow popups or use Email/Password.');
    expect(caughtError.code).toBe('auth/popup-blocked');
  });

  it('sets up local guest profile for generic errors', async () => {
    const { signInWithPopup } = await import('../lib/firebase');

    const mockError = new Error('some generic error');
    (signInWithPopup as any).mockRejectedValueOnce(mockError);

    renderWithProvider(<TestComponent />);

    await act(async () => {
      screen.getByText('Login with Google').click();
    });

    expect(localStorage.getItem('alnoor_has_session')).toBe('true');
    const profile = JSON.parse(localStorage.getItem('alnoor_active_user_profile') || '{}');
    expect(profile.displayName).toBe('Guest Student');
    expect(profile.email).toBe('guest.student@noorequran.com');
    expect(profile.role).toBe('student');
    expect(profile.uid).toMatch(/^google-user-\d+$/);
  });
});
