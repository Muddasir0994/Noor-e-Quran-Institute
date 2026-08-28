import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as firebaseApp from 'firebase/app';
import * as firebaseFirestore from 'firebase/firestore';
import * as firebaseAuth from 'firebase/auth';

// We need to mock firebase-applet-config.json before importing firebase.ts
// so that the imported module uses our mock configuration.
vi.mock('../../firebase-applet-config.json', () => ({
  default: {
    apiKey: "test-api-key",
    authDomain: "test-domain",
    projectId: "test-project",
    storageBucket: "test-bucket",
    messagingSenderId: "test-sender",
    appId: "test-app-id",
    // We will control firestoreDatabaseId in our tests by mutating this object
    firestoreDatabaseId: undefined
  }
}));

vi.mock('firebase/app', () => {
  return {
    initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
    getApps: vi.fn(() => []),
    getApp: vi.fn(() => ({ name: '[DEFAULT]' })),
  };
});

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    getFirestore: vi.fn(() => ({ type: 'mock-firestore' })),
  };
});

vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>();
  return {
    ...actual,
    getAuth: vi.fn(() => ({ type: 'mock-auth' })),
    GoogleAuthProvider: class MockGoogleAuthProvider {
      setCustomParameters = vi.fn();
    },
  };
});

describe('firebase.ts error handling for firestore initialization', () => {
  let firebaseConfigMock: any;
  let originalDbId: any;

  beforeEach(async () => {
    vi.resetModules(); // Ensure fresh imports for each test
    vi.clearAllMocks();

    // Get a reference to our mocked config
    const configModule = await import('../../firebase-applet-config.json');
    firebaseConfigMock = configModule.default;
    originalDbId = firebaseConfigMock.firestoreDatabaseId;
  });

  afterEach(() => {
    // Restore config
    firebaseConfigMock.firestoreDatabaseId = originalDbId;
  });

  it('initializes Firestore with default database when firestoreDatabaseId is absent', async () => {
    firebaseConfigMock.firestoreDatabaseId = undefined;

    await import('./firebase');

    expect(firebaseFirestore.getFirestore).toHaveBeenCalledTimes(1);
    expect(firebaseFirestore.getFirestore).toHaveBeenCalledWith(expect.anything());
    // In vitest/jest, to check it was called with exactly 1 arg:
    expect((firebaseFirestore.getFirestore as any).mock.calls[0].length).toBe(1);
  });

  it('initializes Firestore with custom databaseId when configured', async () => {
    firebaseConfigMock.firestoreDatabaseId = 'custom-db-id';

    await import('./firebase');

    expect(firebaseFirestore.getFirestore).toHaveBeenCalledTimes(1);
    expect(firebaseFirestore.getFirestore).toHaveBeenCalledWith(expect.anything(), 'custom-db-id');
  });

  it('falls back to default Firestore initialization if initializing with databaseId throws', async () => {
    firebaseConfigMock.firestoreDatabaseId = 'failing-db-id';

    const getFirestoreMock = vi.mocked(firebaseFirestore.getFirestore);

    // Make the first call (with dbId) throw, and the second call (without dbId) succeed
    getFirestoreMock.mockImplementationOnce(() => {
      throw new Error('Database not found');
    }).mockImplementationOnce(() => ({ type: 'mock-firestore-fallback' } as any));

    await import('./firebase');

    expect(getFirestoreMock).toHaveBeenCalledTimes(2);
    expect(getFirestoreMock).toHaveBeenNthCalledWith(1, expect.anything(), 'failing-db-id');
    expect(getFirestoreMock).toHaveBeenNthCalledWith(2, expect.anything());
  });
});
