import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getUserAccountFromFirebase, getUserAccountByEmailFromFirebase } from './firestoreService';
import * as firebase from './firebase';

// Mock console methods to avoid cluttering test output and to allow spying on them
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  vi.clearAllMocks();
});

// Mock the firebase module
vi.mock('./firebase', () => ({
  db: {},
  doc: vi.fn(),
  getDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
}));

describe('firestoreService', () => {
  describe('getUserAccountFromFirebase', () => {
    it('should return user account when document exists', async () => {
      const mockUserAccount = { uid: '123', email: 'test@example.com', name: 'Test User' };
      const mockDocSnap = {
        exists: () => true,
        data: () => mockUserAccount,
      };

      vi.mocked(firebase.doc).mockReturnValue({} as any);
      vi.mocked(firebase.getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await getUserAccountFromFirebase('123');

      expect(firebase.doc).toHaveBeenCalledWith(firebase.db, 'users', '123');
      expect(firebase.getDoc).toHaveBeenCalled();
      expect(result).toEqual(mockUserAccount);
    });

    it('should return null when document does not exist', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      vi.mocked(firebase.doc).mockReturnValue({} as any);
      vi.mocked(firebase.getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await getUserAccountFromFirebase('123');

      expect(result).toBeNull();
    });

    it('should handle errors and return null', async () => {
      const error = new Error('Firestore error');
      vi.mocked(firebase.doc).mockReturnValue({} as any);
      vi.mocked(firebase.getDoc).mockRejectedValue(error);

      const result = await getUserAccountFromFirebase('123');

      expect(console.error).toHaveBeenCalledWith('Error fetching user account:', error);
      expect(result).toBeNull();
    });
  });

  describe('getUserAccountByEmailFromFirebase', () => {
    it('should return user account when email matches', async () => {
      const mockUserAccount = { uid: '123', email: 'test@example.com', name: 'Test User' };
      const mockSnap = {
        empty: false,
        docs: [
          {
            data: () => mockUserAccount,
          },
        ],
      };

      vi.mocked(firebase.collection).mockReturnValue({} as any);
      vi.mocked(firebase.where).mockReturnValue({} as any);
      vi.mocked(firebase.limit).mockReturnValue({} as any);
      vi.mocked(firebase.query).mockReturnValue({} as any);
      vi.mocked(firebase.getDocs).mockResolvedValue(mockSnap as any);

      const result = await getUserAccountByEmailFromFirebase(' TEST@example.com ');

      expect(firebase.collection).toHaveBeenCalledWith(firebase.db, 'users');
      expect(firebase.where).toHaveBeenCalledWith('email', '==', 'test@example.com');
      expect(firebase.limit).toHaveBeenCalledWith(1);
      expect(firebase.getDocs).toHaveBeenCalled();
      expect(result).toEqual(mockUserAccount);
    });

    it('should return null when no document matches', async () => {
      const mockSnap = {
        empty: true,
      };

      vi.mocked(firebase.collection).mockReturnValue({} as any);
      vi.mocked(firebase.where).mockReturnValue({} as any);
      vi.mocked(firebase.limit).mockReturnValue({} as any);
      vi.mocked(firebase.query).mockReturnValue({} as any);
      vi.mocked(firebase.getDocs).mockResolvedValue(mockSnap as any);

      const result = await getUserAccountByEmailFromFirebase('test@example.com');

      expect(result).toBeNull();
    });

    it('should handle errors and return null', async () => {
      const error = new Error('Firestore error');
      vi.mocked(firebase.collection).mockReturnValue({} as any);
      vi.mocked(firebase.where).mockReturnValue({} as any);
      vi.mocked(firebase.limit).mockReturnValue({} as any);
      vi.mocked(firebase.query).mockReturnValue({} as any);
      vi.mocked(firebase.getDocs).mockRejectedValue(error);

      const result = await getUserAccountByEmailFromFirebase('test@example.com');

      expect(console.warn).toHaveBeenCalledWith('Error fetching user by email from Firestore:', error);
      expect(result).toBeNull();
    });
  });
});
