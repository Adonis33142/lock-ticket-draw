"use strict";
// Polyfill for idb in server-side rendering
// This file provides empty implementations for indexedDB operations during SSR
// The idb library is only used client-side, so this prevents errors during SSR
Object.defineProperty(exports, "__esModule", { value: true });
exports.openDB = void 0;
// Mock indexedDB for SSR
if (typeof global !== 'undefined' && typeof global.indexedDB === 'undefined') {
    global.indexedDB = {
        open: () => ({
            onsuccess: null,
            onerror: null,
            onupgradeneeded: null,
            result: null,
        }),
    };
}
const openDB = async (name, version, options) => {
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
    });
};
exports.openDB = openDB;
// Export default to match idb module structure
exports.default = {
    openDB: exports.openDB,
};
