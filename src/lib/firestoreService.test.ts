import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subscribeToUserAccount } from './firestoreService';
import { doc, onSnapshot } from './firebase';

// Mock firebase
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

describe('subscribeToUserAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call callback with user data if document exists', () => {
    const mockUserData = { uid: '123', role: 'admin', email: 'test@example.com' };
    const mockDocRef = { id: '123' };
    vi.mocked(doc).mockReturnValue(mockDocRef as any);

    let snapshotCallback: any;
    const mockUnsubscribe = vi.fn();

    vi.mocked(onSnapshot).mockImplementation((docRef, onNext: any) => {
      snapshotCallback = onNext;
      return mockUnsubscribe;
    });

    const callback = vi.fn();
    const unsubscribe = subscribeToUserAccount('123', callback);

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', '123');
    expect(onSnapshot).toHaveBeenCalledWith(mockDocRef, expect.any(Function), expect.any(Function));

    // Simulate document existing
    snapshotCallback({
      exists: () => true,
      data: () => mockUserData
    });

    expect(callback).toHaveBeenCalledWith(mockUserData);
    expect(unsubscribe).toBe(mockUnsubscribe);
  });

  it('should call callback with null if document does not exist', () => {
    const mockDocRef = { id: '456' };
    vi.mocked(doc).mockReturnValue(mockDocRef as any);

    let snapshotCallback: any;

    vi.mocked(onSnapshot).mockImplementation((docRef, onNext: any) => {
      snapshotCallback = onNext;
      return vi.fn();
    });

    const callback = vi.fn();
    subscribeToUserAccount('456', callback);

    // Simulate document missing
    snapshotCallback({
      exists: () => false,
      data: () => undefined
    });

    expect(callback).toHaveBeenCalledWith(null);
  });

  it('should warn if listener calls error callback', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockDocRef = { id: '789' };
    vi.mocked(doc).mockReturnValue(mockDocRef as any);

    let errorCallback: any;

    vi.mocked(onSnapshot).mockImplementation((docRef, onNext, onError: any) => {
      errorCallback = onError;
      return vi.fn();
    });

    const callback = vi.fn();
    subscribeToUserAccount('789', callback);

    const testError = new Error('Permission denied');
    errorCallback(testError);

    expect(consoleWarnSpy).toHaveBeenCalledWith('User account snapshot listener warning:', testError);
    consoleWarnSpy.mockRestore();
  });

  it('should return empty function if setup throws error', () => {
    vi.mocked(doc).mockImplementation(() => {
      throw new Error('Invalid setup');
    });

    const callback = vi.fn();
    const unsubscribe = subscribeToUserAccount('error-uid', callback);

    expect(unsubscribe).toBeInstanceOf(Function);

    // Call unsubscribe to make sure it doesn't throw
    expect(() => unsubscribe!()).not.toThrow();
  });
});
