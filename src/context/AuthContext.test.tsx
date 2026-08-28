import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import React from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Create mock functions for dynamic imports
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockUpdateProfile = vi.fn();
const mockSaveUserAccountToFirebase = vi.fn();
const mockOnAuthStateChanged = vi.fn();

vi.mock('../lib/firebase', () => ({
  auth: {},
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  updateProfile: mockUpdateProfile,
  onAuthStateChanged: mockOnAuthStateChanged,
}));

vi.mock('../lib/firestoreService', () => ({
  saveUserAccountToFirebase: mockSaveUserAccountToFirebase,
  getUserAccountFromFirebase: vi.fn().mockResolvedValue(null),
}));

describe('AuthContext - signUpStudentWithEmail Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Default setup for onAuthStateChanged to immediately call the callback with null (no user)
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return vi.fn(); // unsubscribe function
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('handles successful user creation (happy path)', async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: 'firebase-uid-123' }
    });
    mockUpdateProfile.mockResolvedValueOnce(undefined);
    mockSaveUserAccountToFirebase.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let userProfile;
    await act(async () => {
      userProfile = await result.current.signUpStudentWithEmail('test@example.com', 'password123', {
        studentName: 'Test Student'
      });
    });

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password123'
    );
    expect(mockUpdateProfile).toHaveBeenCalledWith(
      { uid: 'firebase-uid-123' },
      { displayName: 'Test Student' }
    );

    // Check if correct profile is returned and saved
    expect(userProfile).toMatchObject({
      uid: 'firebase-uid-123',
      email: 'test@example.com',
      displayName: 'Test Student',
      role: 'student'
    });

    expect(mockSaveUserAccountToFirebase).toHaveBeenCalledWith(expect.objectContaining({
      uid: 'firebase-uid-123',
      email: 'test@example.com'
    }));

    // Check localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('alnoor_has_session', 'true');
  });

  it('throws a specific error when email is already in use', async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValueOnce({
      code: 'auth/email-already-in-use',
      message: 'The email address is already in use by another account.'
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await expect(
        result.current.signUpStudentWithEmail('existing@example.com', 'password123')
      ).rejects.toThrow('This email is already registered. Please login directly.');
    });

    // ensure it doesn't try to save a user
    expect(mockSaveUserAccountToFirebase).not.toHaveBeenCalled();
  });

  it('handles auth/operation-not-allowed fallback by creating a local student profile', async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValueOnce({
      code: 'auth/operation-not-allowed',
      message: 'Operation not allowed.'
    });
    mockSaveUserAccountToFirebase.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let userProfile;
    await act(async () => {
      userProfile = await result.current.signUpStudentWithEmail('student@example.com', 'password123', {
        studentName: 'Fallback Student'
      });
    });

    // The uid should be derived from the email as per line 351: uid = 'student-' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const expectedUid = 'student-student_example_com';

    expect(userProfile).toMatchObject({
      uid: expectedUid,
      email: 'student@example.com',
      displayName: 'Fallback Student',
      role: 'student'
    });

    // Check that it still saves the fallback profile to firestore (or mocks doing so)
    expect(mockSaveUserAccountToFirebase).toHaveBeenCalledWith(expect.objectContaining({
      uid: expectedUid,
      email: 'student@example.com'
    }));
  });

  it('handles auth/admin-restricted-operation fallback identically to operation-not-allowed', async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValueOnce({
      code: 'auth/admin-restricted-operation',
      message: 'Admin restricted.'
    });
    mockSaveUserAccountToFirebase.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let userProfile;
    await act(async () => {
      userProfile = await result.current.signUpStudentWithEmail('admin-restr@example.com', 'password123');
    });

    const expectedUid = 'student-admin_restr_example_com';
    expect(userProfile).toMatchObject({
      uid: expectedUid,
      email: 'admin-restr@example.com',
    });
  });

  it('handles general firebase errors by creating a fallback with a timestamp uid', async () => {
    // If not email-already-in-use, operation-not-allowed, admin-restricted-operation
    mockCreateUserWithEmailAndPassword.mockRejectedValueOnce({
      code: 'auth/internal-error',
      message: 'Something went wrong.'
    });
    mockSaveUserAccountToFirebase.mockResolvedValueOnce(undefined);

    // mock Date.now so the uid is predictable
    const realDateNow = Date.now.bind(global.Date);
    global.Date.now = vi.fn(() => 1600000000000);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let userProfile;
    await act(async () => {
      userProfile = await result.current.signUpStudentWithEmail('general@example.com', 'password123');
    });

    expect(userProfile).toMatchObject({
      uid: 'student-1600000000000',
      email: 'general@example.com',
    });

    // restore Date.now
    global.Date.now = realDateNow;
  });
});
