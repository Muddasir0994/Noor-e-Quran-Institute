import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateTeacherAccountByAdmin } from '../firestoreService';
import { doc, updateDoc } from '../firebase';

// Mock the firebase module
vi.mock('../firebase', () => {
  return {
    db: {},
    doc: vi.fn(),
    updateDoc: vi.fn(),
    collection: vi.fn(),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    addDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    onSnapshot: vi.fn(),
  };
});

describe('updateTeacherAccountByAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('successfully updates teacher account', async () => {
    const mockUid = 'teacher-123';
    const mockUpdates = { displayName: 'New Name' };
    const mockDocRef = { id: mockUid };

    // Setup mocks
    (doc as ReturnType<typeof vi.fn>).mockReturnValue(mockDocRef);
    (updateDoc as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    // Call the function
    await updateTeacherAccountByAdmin(mockUid, mockUpdates);

    // Verify doc was called correctly
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', mockUid);

    // Verify updateDoc was called correctly
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
      ...mockUpdates,
      updatedAt: expect.any(String), // We expect a timestamp string
    });

    // Check if updatedAt is a valid ISO string
    const callArgs = (updateDoc as ReturnType<typeof vi.fn>).mock.calls[0];
    const updateData = callArgs[1];
    expect(new Date(updateData.updatedAt).toISOString()).toBe(updateData.updatedAt);
  });

  it('handles error when updating teacher account', async () => {
    const mockUid = 'teacher-123';
    const mockUpdates = { displayName: 'New Name' };
    const mockError = new Error('Firestore update failed');

    // Setup mocks
    (doc as ReturnType<typeof vi.fn>).mockReturnValue({ id: mockUid });
    (updateDoc as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    // Silence console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Call the function and expect it to throw
    await expect(updateTeacherAccountByAdmin(mockUid, mockUpdates)).rejects.toThrow(mockError);

    expect(consoleSpy).toHaveBeenCalledWith('Error updating teacher account:', mockError);

    consoleSpy.mockRestore();
  });
});
