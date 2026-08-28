import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getUserAccountByEmailFromFirebase, saveUserAccountToFirebase } from '../firestoreService';
import { getDocs, setDoc, query, collection, where, limit, doc } from '../firebase';
import type { UserAccount } from '../../types';

// Mock the firebase module
vi.mock('../firebase', () => ({
  db: {},
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
}));

describe('firestoreService', () => {
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    vi.clearAllMocks();
    console.warn = vi.fn();
    console.error = vi.fn();
    console.log = vi.fn();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  describe('getUserAccountByEmailFromFirebase', () => {
    it('returns the user account when a match is found', async () => {
      const mockEmail = 'test@example.com';
      const mockUser: UserAccount = {
        uid: 'user123',
        email: mockEmail,
        role: 'student',
        createdAt: '2023-01-01T00:00:00Z',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockSnap = {
        empty: false,
        docs: [
          {
            data: () => mockUser
          }
        ]
      };

      vi.mocked(getDocs).mockResolvedValueOnce(mockSnap as any);
      vi.mocked(collection).mockReturnValue('mocked-collection' as any);
      vi.mocked(where).mockReturnValue('mocked-where' as any);
      vi.mocked(limit).mockReturnValue('mocked-limit' as any);
      vi.mocked(query).mockReturnValue('mocked-query' as any);

      const result = await getUserAccountByEmailFromFirebase(mockEmail);

      expect(result).toEqual(mockUser);
      expect(collection).toHaveBeenCalledWith(expect.anything(), 'users');
      expect(where).toHaveBeenCalledWith('email', '==', mockEmail);
      expect(limit).toHaveBeenCalledWith(1);
      expect(query).toHaveBeenCalledWith('mocked-collection', 'mocked-where', 'mocked-limit');
      expect(getDocs).toHaveBeenCalledWith('mocked-query');
    });

    it('returns null when no match is found', async () => {
      const mockSnap = {
        empty: true,
      };

      vi.mocked(getDocs).mockResolvedValueOnce(mockSnap as any);

      const result = await getUserAccountByEmailFromFirebase('notfound@example.com');

      expect(result).toBeNull();
    });

    it('handles errors gracefully, logs a warning, and returns null', async () => {
      const mockError = new Error('Firestore error');
      vi.mocked(getDocs).mockRejectedValueOnce(mockError);

      const result = await getUserAccountByEmailFromFirebase('error@example.com');

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith('Error fetching user by email from Firestore:', mockError);
    });
  });

  describe('saveUserAccountToFirebase', () => {
    it('saves user account and updates updatedAt timestamp', async () => {
      const mockUser: UserAccount = {
        uid: 'user123',
        email: 'test@example.com',
        role: 'student',
        createdAt: '2023-01-01T00:00:00Z',
        firstName: 'John',
        lastName: 'Doe',
      };

      vi.mocked(doc).mockReturnValue('mocked-doc-ref' as any);
      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      await saveUserAccountToFirebase(mockUser);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', mockUser.uid);
      expect(setDoc).toHaveBeenCalledWith('mocked-doc-ref', expect.objectContaining({
        ...mockUser,
        updatedAt: expect.any(String),
      }), { merge: true });
      expect(console.log).toHaveBeenCalledWith('✓ User profile saved to Firestore:', mockUser.uid, mockUser.role);
    });

    it('throws error when saving fails and logs the error', async () => {
      const mockUser: UserAccount = {
        uid: 'user123',
        email: 'test@example.com',
        role: 'student',
        createdAt: '2023-01-01T00:00:00Z',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockError = new Error('Save failed');
      vi.mocked(setDoc).mockRejectedValueOnce(mockError);

      await expect(saveUserAccountToFirebase(mockUser)).rejects.toThrow('Save failed');
      expect(console.error).toHaveBeenCalledWith('Error saving user to Firestore:', mockError);
    });
  });
});
