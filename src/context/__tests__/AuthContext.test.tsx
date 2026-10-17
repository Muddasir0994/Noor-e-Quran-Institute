import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { ReactNode } from 'react';
import { expect, describe, it, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../lib/firebase', () => ({
  auth: {},
  googleProvider: {},
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../../lib/firestoreService', () => ({
  subscribeToUserAccount: vi.fn(),
  getUserAccountFromFirebase: vi.fn(),
  saveUserAccountToFirebase: vi.fn(),
}));

// Test component to use the context
const TestComponent = () => {
  const auth = useAuth();

  return (
    <div>
      <div data-testid="is-loading">{auth.isLoading.toString()}</div>
      <div data-testid="user-profile">{auth.userProfile ? auth.userProfile.email : 'no-user'}</div>
      <button
        data-testid="signup-btn"
        onClick={() => auth.signUpStudentWithEmail('test@example.com', 'password123').catch(() => {})}
      >
        Sign Up
      </button>
      <button
        data-testid="signup-error-btn"
        onClick={async () => {
          try {
            await auth.signUpStudentWithEmail('error@example.com', 'password123');
          } catch (e: any) {
            document.getElementById('error-msg')!.textContent = e.message;
          }
        }}
      >
        Sign Up Error
      </button>
      <div id="error-msg" data-testid="error-msg"></div>
    </div>
  );
};

describe('AuthContext Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should handle signUpStudentWithEmail success', async () => {
    const { createUserWithEmailAndPassword, updateProfile } = await import('../../lib/firebase');
    const { saveUserAccountToFirebase } = await import('../../lib/firestoreService');

    const mockUser = { uid: 'test-uid', email: 'test@example.com' };
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({ user: mockUser } as any);
    vi.mocked(updateProfile).mockResolvedValueOnce(undefined);
    vi.mocked(saveUserAccountToFirebase).mockResolvedValueOnce(undefined);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signupBtn = screen.getByTestId('signup-btn');

    await act(async () => {
      signupBtn.click();
    });

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
    expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'test' });
    expect(saveUserAccountToFirebase).toHaveBeenCalled();
    expect(screen.getByTestId('user-profile')).toHaveTextContent('test@example.com');
  });

  it('should throw an error when saveUserAccountToFirebase fails', async () => {
    const { createUserWithEmailAndPassword, updateProfile } = await import('../../lib/firebase');
    const { saveUserAccountToFirebase } = await import('../../lib/firestoreService');

    const mockUser = { uid: 'test-uid', email: 'error@example.com' };
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({ user: mockUser } as any);
    vi.mocked(updateProfile).mockResolvedValueOnce(undefined);

    const dbError = new Error('Database connection failed');
    vi.mocked(saveUserAccountToFirebase).mockRejectedValueOnce(dbError);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signupBtn = screen.getByTestId('signup-error-btn');

    await act(async () => {
      signupBtn.click();
    });

    expect(saveUserAccountToFirebase).toHaveBeenCalled();
    expect(screen.getByTestId('error-msg')).toHaveTextContent('Database connection failed');
  });

  it('should format error message properly if error has no message', async () => {
    const { createUserWithEmailAndPassword, updateProfile } = await import('../../lib/firebase');
    const { saveUserAccountToFirebase } = await import('../../lib/firestoreService');

    const mockUser = { uid: 'test-uid', email: 'error@example.com' };
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({ user: mockUser } as any);
    vi.mocked(updateProfile).mockResolvedValueOnce(undefined);

    // An error object without a message property
    vi.mocked(saveUserAccountToFirebase).mockRejectedValueOnce('Some string error');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signupBtn = screen.getByTestId('signup-error-btn');

    await act(async () => {
      signupBtn.click();
    });

    expect(saveUserAccountToFirebase).toHaveBeenCalled();
    expect(screen.getByTestId('error-msg')).toHaveTextContent('Registration failed. Please check details or use Google Sign-In.');
  });
});
