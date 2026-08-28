import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveUserAccountToFirebase } from '../firestoreService';
import { doc, setDoc } from '../firebase';
import { UserAccount } from '../../types';

// Mock the firebase module
vi.mock('../firebase', () => ({
  db: {},
  doc: vi.fn(),
  setDoc: vi.fn(),
  collection: vi.fn(),
}));

describe('firestoreService', () => {
  describe('saveUserAccountToFirebase', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Mock console methods to avoid cluttering test output
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should successfully save a user account', async () => {
      const mockUser: UserAccount = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Active'
      };

      (doc as any).mockReturnValue('mock-doc-ref');
      (setDoc as any).mockResolvedValue(undefined);

      await saveUserAccountToFirebase(mockUser);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'test-uid');
      expect(setDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          ...mockUser,
          updatedAt: expect.any(String),
        }),
        { merge: true }
      );
      expect(console.log).toHaveBeenCalledWith(
        '✓ User profile saved to Firestore:',
        'test-uid',
        'student'
      );
    });

    it('should throw an error and log it when saving fails', async () => {
      const mockUser: UserAccount = {
        uid: 'fail-uid',
        email: 'fail@example.com',
        displayName: 'Fail User',
        role: 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Active'
      };

      const mockError = new Error('Firestore write failed');

      (doc as any).mockReturnValue('mock-fail-doc-ref');
      (setDoc as any).mockRejectedValue(mockError);

      await expect(saveUserAccountToFirebase(mockUser)).rejects.toThrow('Firestore write failed');

      expect(console.error).toHaveBeenCalledWith('Error saving user to Firestore:', mockError);
    });
  });
});
