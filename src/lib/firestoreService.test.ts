import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserAccountByEmailFromFirebase } from './firestoreService';
import { db, collection, query, where, limit, getDocs } from './firebase';

// Mock the firebase module
vi.mock('./firebase', () => {
  return {
    db: {},
    collection: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    onSnapshot: vi.fn(),
  };
});

describe('firestoreService', () => {
  describe('getUserAccountByEmailFromFirebase', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return user account when document is found', async () => {
      const mockEmail = '  Test@Example.com  ';
      const cleanEmail = 'test@example.com';
      const mockUserData = { uid: '123', email: cleanEmail, role: 'student' };

      // Setup mocks
      const mockQuery = {};
      const mockCollection = {};

      (collection as any).mockReturnValue(mockCollection);
      (where as any).mockReturnValue('where-clause');
      (limit as any).mockReturnValue('limit-clause');
      (query as any).mockReturnValue(mockQuery);

      (getDocs as any).mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => mockUserData,
          },
        ],
      });

      const result = await getUserAccountByEmailFromFirebase(mockEmail);

      // Verify the returned data
      expect(result).toEqual(mockUserData);

      // Verify firebase functions were called with correct arguments
      expect(collection).toHaveBeenCalledWith(db, 'users');
      expect(where).toHaveBeenCalledWith('email', '==', cleanEmail);
      expect(limit).toHaveBeenCalledWith(1);
      expect(query).toHaveBeenCalledWith(mockCollection, 'where-clause', 'limit-clause');
      expect(getDocs).toHaveBeenCalledWith(mockQuery);
    });

    it('should return null when document is not found', async () => {
      const mockEmail = 'notfound@example.com';

      (getDocs as any).mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await getUserAccountByEmailFromFirebase(mockEmail);

      expect(result).toBeNull();
      expect(getDocs).toHaveBeenCalled();
    });

    it('should return null and log warning when firebase throws an error', async () => {
      const mockEmail = 'error@example.com';

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mockError = new Error('Firebase error');
      (getDocs as any).mockRejectedValue(mockError);

      const result = await getUserAccountByEmailFromFirebase(mockEmail);

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Error fetching user by email from Firestore:', mockError);

      consoleWarnSpy.mockRestore();
    });
  });
});
