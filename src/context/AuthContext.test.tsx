import React, { useEffect, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';

// Mock dependencies dynamically imported inside AuthContext
vi.mock('../lib/firebase', () => {
  return {
    auth: {},
    signInWithEmailAndPassword: vi.fn(),
    onAuthStateChanged: vi.fn((auth, callback) => {
      // Don't auto-login for these tests
      callback(null);
      return () => {};
    }),
  };
});

vi.mock('../lib/firestoreService', () => {
  return {
    getUserAccountFromFirebase: vi.fn(),
    saveUserAccountToFirebase: vi.fn(),
  };
});

// A dummy component to consume the AuthContext and test the specific functions
const TestComponent = () => {
  const { loginWithEmail, userProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, pass: string) => {
    try {
      await loginWithEmail(email, pass);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div data-testid="user-profile">{userProfile ? userProfile.email : 'No user'}</div>
      <div data-testid="error-message">{error}</div>
      <button onClick={() => handleLogin('test@example.com', 'password123')}>Login</button>
      <button onClick={() => handleLogin('notfound@example.com', 'wrongpass')}>Login Wrong</button>
    </div>
  );
};

describe('AuthContext - Error Handling', () => {
  let mockSignInWithEmailAndPassword: any;
  let mockSaveUserAccountToFirebase: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    const firebaseMock = await import('../lib/firebase');
    const firestoreMock = await import('../lib/firestoreService');

    mockSignInWithEmailAndPassword = firebaseMock.signInWithEmailAndPassword;
    mockSaveUserAccountToFirebase = firestoreMock.saveUserAccountToFirebase;
  });

  it('handles auth/operation-not-allowed by creating a local fallback user', async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue({
      code: 'auth/operation-not-allowed',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(mockSaveUserAccountToFirebase).toHaveBeenCalled();
      expect(screen.getByTestId('user-profile').textContent).toBe('test@example.com');

      const storedProfile = JSON.parse(localStorage.getItem('alnoor_active_user_profile') || '{}');
      expect(storedProfile.email).toBe('test@example.com');
      expect(storedProfile.role).toBe('student');
    });
  });

  it('throws correct error message for auth/user-not-found', async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue({
      code: 'auth/user-not-found',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message').textContent).toBe('Account not found with this email. Please register as a new student first.');
    });
  });

  it('throws correct error message for auth/wrong-password', async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue({
      code: 'auth/wrong-password',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message').textContent).toBe('Incorrect password. Please try again.');
    });
  });
});
