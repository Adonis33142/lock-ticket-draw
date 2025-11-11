// Polyfill for idb in server-side rendering
// This file provides empty implementations for indexedDB operations during SSR
// The idb library is only used client-side, so this prevents errors during SSR

// Mock indexedDB for SSR
if (typeof global !== 'undefined' && typeof global.indexedDB === 'undefined') {
  (global as any).indexedDB = {
    open: () => ({
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: null,
    }),
  };
}

export const openDB = async <T = any>(
  name?: string,
  version?: number,
  options?: any
): Promise<any> => {
  // This should never be called in SSR because PublicKeyStorage checks typeof window === "undefined"
  // But if it is called, return a promise that resolves to a mock database object
  return Promise.resolve({
    get: async () => undefined,
    put: async () => undefined,
    delete: async () => undefined,
    clear: async () => undefined,
    count: async () => 0,
    getAll: async () => [],
    getAllKeys: async () => [],
    transaction: () => ({
      objectStore: () => ({
        get: async () => undefined,
        put: async () => undefined,
        delete: async () => undefined,
        clear: async () => undefined,
        count: async () => 0,
      }),
    }),
    close: async () => undefined,
  }) as any;
};

// Type definitions to match idb exports
export type DBSchema = any;
export type IDBPDatabase<T> = any;

// Export default to match idb module structure
export default {
  openDB,
};

