import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLeadInFirebase } from '../firestoreService';
import { setDoc, doc } from '../firebase';

// Mock dependencies
vi.mock('../firebase', () => ({
  db: {},
  doc: vi.fn((db, col, id) => ({ db, col, id })),
  setDoc: vi.fn(),
  LEADS_COL: 'leads', // might need if imported
}));

// Mock console.log and console.error
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('createLeadInFirebase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockLeadData = {
    studentName: 'John Doe',
    parentName: 'Jane Doe',
    email: 'john@example.com',
    phone: '1234567890',
    country: 'USA',
    courseId: 'course1',
    courseName: 'Course 1',
    tutorGender: 'male' as const,
    timeSlot: 'morning' as const,
    notes: [],
    status: 'new' as const,
  };

  it('should successfully create a lead', async () => {
    const result = await createLeadInFirebase(mockLeadData);

    expect(result).toMatchObject(mockLeadData);
    expect(result.id).toMatch(/^lead-\d+$/);
    expect(result.createdAt).toBeDefined();
    expect(result.updatedAt).toBeDefined();
    expect(setDoc).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('✓ Lead saved to Firebase Firestore:', result.id);
  });

  it('should handle errors when saving to Firestore', async () => {
    const mockError = new Error('Firestore error');
    vi.mocked(setDoc).mockRejectedValueOnce(mockError);

    const result = await createLeadInFirebase(mockLeadData);

    expect(result).toMatchObject(mockLeadData);
    expect(setDoc).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error saving lead to Firestore:', mockError);
  });
});
