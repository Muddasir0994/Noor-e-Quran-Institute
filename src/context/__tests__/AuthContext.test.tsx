
import { render, screen, act, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockSendPasswordResetEmail = vi.fn();
const mockSignOut = vi.fn();

// We can just spy on the actual imported module
import * as FirebaseModule from '../../lib/firebase';
import * as FirestoreModule from '../../lib/firestoreService';

window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

const originalConsoleWarn = console.warn;
const consoleWarnMock = vi.fn();

const TestComponent = ({ action }: { action: 'resetPassword' | 'logout' | 'resetPasswordError' }) => {
  const { resetPassword, logout } = useAuth();

  return (
    <div>
      <button
        data-testid="reset-btn"
        onClick={() => resetPassword('test@example.com')}
      >
        Reset
      </button>
      <button
        data-testid="reset-btn-error"
        onClick={async () => {
          try {
             await resetPassword('test@example.com');
          } catch(e) {
             console.warn('CAUGHT:', e.message);
          }
        }}
      >
        Reset Error
      </button>
      <button
        data-testid="logout-btn"
        onClick={async () => await logout()}
      >
        Logout
      </button>
    </div>
  );
};

describe('AuthContext Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.warn = consoleWarnMock;
    localStorage.clear();

    vi.spyOn(FirebaseModule, 'sendPasswordResetEmail').mockImplementation(mockSendPasswordResetEmail);
    vi.spyOn(FirebaseModule, 'signOut').mockImplementation(mockSignOut);
    vi.spyOn(FirestoreModule, 'getUserAccountFromFirebase').mockImplementation(vi.fn());
    vi.spyOn(FirestoreModule, 'saveUserAccountToFirebase').mockImplementation(vi.fn());

    mockSendPasswordResetEmail.mockReset();
    mockSignOut.mockReset();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
    vi.restoreAllMocks();
  });

  it('should throw specific error when auth/user-not-found occurs', async () => {
    const error = new Error('Firebase Error') as any;
    error.code = 'auth/user-not-found';
    mockSendPasswordResetEmail.mockRejectedValueOnce(error);

    render(
      <AuthProvider>
        <TestComponent action="resetPasswordError" />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('reset-btn-error'));
    });

    await new Promise(r => setTimeout(r, 50));

    expect(consoleWarnMock).toHaveBeenCalledWith('Password reset note:', 'Firebase Error');
    expect(consoleWarnMock).toHaveBeenCalledWith('CAUGHT:', 'No registered account found with this email address.');
  });

  it('should catch other errors without throwing', async () => {
    const error = new Error('Some other error') as any;
    error.code = 'auth/some-other-error';
    mockSendPasswordResetEmail.mockRejectedValueOnce(error);

    render(
      <AuthProvider>
        <TestComponent action="resetPassword" />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('reset-btn'));
    });

    await new Promise(r => setTimeout(r, 50));
    expect(consoleWarnMock).toHaveBeenCalledWith('Password reset note:', 'Some other error');
  });

  it('should catch signOut errors, log a warning, but still clear state and localStorage', async () => {
    const error = new Error('SignOut failed');
    mockSignOut.mockRejectedValueOnce(error);

    localStorage.setItem('alnoor_has_session', 'true');
    localStorage.setItem('alnoor_active_user_profile', '{}');

    render(
      <AuthProvider>
        <TestComponent action="logout" />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('logout-btn'));
    });

    await new Promise(r => setTimeout(r, 50));

    expect(mockSignOut).toHaveBeenCalled();
    expect(consoleWarnMock).toHaveBeenCalledWith('Firebase signout note:', error);

    expect(localStorage.getItem('alnoor_has_session')).toBeNull();
    expect(localStorage.getItem('alnoor_active_user_profile')).toBeNull();
  });
});
