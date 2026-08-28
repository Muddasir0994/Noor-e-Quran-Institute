import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveUserAccountToFirebase } from './firestoreService';
import { db, doc, setDoc } from './firebase';

// Mock the firebase module
vi.mock('./firebase', () => {
  return {
    db: {},
    doc: vi.fn(),
    setDoc: vi.fn(),
    collection: vi.fn(),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
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
  describe('saveUserAccountToFirebase', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Mock console.log and console.error to avoid test output noise
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should save user account to firestore', async () => {
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        role: 'student',
        displayName: 'Test User'
      };

      const mockDocRef = { id: 'user123' };
      vi.mocked(doc).mockReturnValue(mockDocRef as any);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      await saveUserAccountToFirebase(mockUser as any);

      expect(doc).toHaveBeenCalledWith(db, 'users', 'user123');
      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          ...mockUser,
          updatedAt: expect.any(String)
        }),
        { merge: true }
      );
      expect(console.log).toHaveBeenCalledWith('✓ User profile saved to Firestore:', 'user123', 'student');
    });

    it('should throw error if setDoc fails', async () => {
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        role: 'student'
      };

      const mockError = new Error('Firestore error');
      vi.mocked(doc).mockReturnValue({ id: 'user123' } as any);
      vi.mocked(setDoc).mockRejectedValue(mockError);

      await expect(saveUserAccountToFirebase(mockUser as any)).rejects.toThrow('Firestore error');
      expect(console.error).toHaveBeenCalledWith('Error saving user to Firestore:', mockError);
    });
  });
});
