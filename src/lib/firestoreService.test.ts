import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserAccountFromFirebase } from './firestoreService';
import { getDoc, doc } from './firebase';

// Mock the firebase module
vi.mock('./firebase', () => {
  return {
    db: {},
    getDoc: vi.fn(),
    doc: vi.fn(),
    collection: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    onSnapshot: vi.fn()
  };
});

describe('firestoreService', () => {
  describe('getUserAccountFromFirebase', () => {
    const mockUid = 'test-uid-123';

    beforeEach(() => {
      vi.clearAllMocks();
      // Suppress console.error for tests that expect errors
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should return the user account when the document exists', async () => {
      const mockUserAccount = {
        uid: mockUid,
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'student'
      };

      // Set up the mock to simulate a successful doc fetch
      const mockDocRef = { id: mockUid };
      vi.mocked(doc).mockReturnValue(mockDocRef as any);

      const mockDocSnap = {
        exists: () => true,
        data: () => mockUserAccount
      };
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await getUserAccountFromFirebase(mockUid);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', mockUid);
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(result).toEqual(mockUserAccount);
    });

    it('should return null when the document does not exist', async () => {
      // Set up the mock to simulate a document that doesn't exist
      const mockDocRef = { id: mockUid };
      vi.mocked(doc).mockReturnValue(mockDocRef as any);

      const mockDocSnap = {
        exists: () => false,
        data: () => undefined
      };
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await getUserAccountFromFirebase(mockUid);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', mockUid);
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(result).toBeNull();
    });

    it('should catch errors, log them, and return null', async () => {
      // Set up the mock to simulate an error
      const mockDocRef = { id: mockUid };
      vi.mocked(doc).mockReturnValue(mockDocRef as any);

      const mockError = new Error('Firestore connection failed');
      vi.mocked(getDoc).mockRejectedValue(mockError);

      const result = await getUserAccountFromFirebase(mockUid);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', mockUid);
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(console.error).toHaveBeenCalledWith('Error fetching user account:', mockError);
      expect(result).toBeNull();
    });
  });
});
