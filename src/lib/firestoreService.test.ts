import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateTeacherAccountByAdmin, deleteTeacherAccountByAdmin } from './firestoreService';
import { updateDoc, deleteDoc, doc } from './firebase';

// Mock the firebase module
vi.mock('./firebase', () => ({
  db: {},
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  USERS_COL: 'users',
  // Mock other exports if necessary, but we only need these for the tests
  collection: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
}));

describe('firestoreService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('updateTeacherAccountByAdmin', () => {
    it('should successfully update a teacher account', async () => {
      const uid = 'test-uid';
      const updates = { displayName: 'Updated Name' };
      const mockDocRef = { id: uid };

      (doc as any).mockReturnValue(mockDocRef);
      (updateDoc as any).mockResolvedValue(undefined);

      await expect(updateTeacherAccountByAdmin(uid, updates)).resolves.toBeUndefined();

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', uid);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
        ...updates,
        updatedAt: expect.any(String),
      });
    });

    it('should throw an error if updateDoc fails', async () => {
      const uid = 'test-uid';
      const updates = { displayName: 'Updated Name' };
      const mockError = new Error('Firestore update failed');

      (doc as any).mockReturnValue({ id: uid });
      (updateDoc as any).mockRejectedValue(mockError);

      await expect(updateTeacherAccountByAdmin(uid, updates)).rejects.toThrow('Firestore update failed');
    });
  });

  describe('deleteTeacherAccountByAdmin', () => {
    it('should successfully delete a teacher account', async () => {
      const uid = 'test-uid';
      const mockDocRef = { id: uid };

      (doc as any).mockReturnValue(mockDocRef);
      (deleteDoc as any).mockResolvedValue(undefined);

      await expect(deleteTeacherAccountByAdmin(uid)).resolves.toBeUndefined();

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', uid);
      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it('should throw an error if deleteDoc fails', async () => {
      const uid = 'test-uid';
      const mockError = new Error('Firestore delete failed');

      (doc as any).mockReturnValue({ id: uid });
      (deleteDoc as any).mockRejectedValue(mockError);

      await expect(deleteTeacherAccountByAdmin(uid)).rejects.toThrow('Firestore delete failed');
    });
  });
});
