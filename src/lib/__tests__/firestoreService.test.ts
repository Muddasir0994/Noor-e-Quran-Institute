import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as firestoreService from '../firestoreService';
import * as firebase from '../firebase';

vi.mock('../firebase', () => {
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

describe('firestoreService error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateTeacherAccountByAdmin', () => {
    it('should throw the error when updateDoc fails', async () => {
      const mockError = new Error('Failed to update document');
      vi.mocked(firebase.updateDoc).mockRejectedValueOnce(mockError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(firestoreService.updateTeacherAccountByAdmin('some-uid', { displayName: 'New Name' }))
        .rejects
        .toThrow('Failed to update document');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating teacher account:', mockError);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteTeacherAccountByAdmin', () => {
    it('should throw the error when deleteDoc fails', async () => {
      const mockError = new Error('Failed to delete document');
      vi.mocked(firebase.deleteDoc).mockRejectedValueOnce(mockError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(firestoreService.deleteTeacherAccountByAdmin('some-uid'))
        .rejects
        .toThrow('Failed to delete document');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting teacher account:', mockError);
      consoleErrorSpy.mockRestore();
    });
  });
});
