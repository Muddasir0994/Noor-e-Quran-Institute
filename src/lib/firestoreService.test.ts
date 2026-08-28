import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteTeacherAccountByAdmin } from './firestoreService';
import { db, doc, deleteDoc } from './firebase';

// Mock the firebase module
vi.mock('./firebase', () => {
  return {
    db: {},
    doc: vi.fn(),
    deleteDoc: vi.fn(),
    collection: vi.fn(),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    onSnapshot: vi.fn()
  };
});

describe('firestoreService - deleteTeacherAccountByAdmin', () => {
  const mockUid = 'test-teacher-uid';
  const USERS_COL = 'users';

  beforeEach(() => {
    vi.clearAllMocks();

    // Silence console output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should successfully delete a teacher account', async () => {
    // Arrange
    const mockDocRef = { id: mockUid };
    vi.mocked(doc).mockReturnValue(mockDocRef as any);
    vi.mocked(deleteDoc).mockResolvedValue(undefined);

    // Act
    await deleteTeacherAccountByAdmin(mockUid);

    // Assert
    expect(doc).toHaveBeenCalledWith(db, USERS_COL, mockUid);
    expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    expect(console.log).toHaveBeenCalledWith('✓ Teacher account removed from Firestore:', mockUid);
  });

  it('should log error and rethrow when deletion fails', async () => {
    // Arrange
    const mockError = new Error('Deletion failed');
    const mockDocRef = { id: mockUid };
    vi.mocked(doc).mockReturnValue(mockDocRef as any);
    vi.mocked(deleteDoc).mockRejectedValue(mockError);

    // Act & Assert
    await expect(deleteTeacherAccountByAdmin(mockUid)).rejects.toThrow(mockError);
    expect(doc).toHaveBeenCalledWith(db, USERS_COL, mockUid);
    expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    expect(console.error).toHaveBeenCalledWith('Error deleting teacher account:', mockError);
  });
});
