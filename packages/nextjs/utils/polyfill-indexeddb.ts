// Global polyfill for indexedDB in server-side rendering
if (typeof window === "undefined" && typeof global !== "undefined") {
  // Mock indexedDB for SSR to prevent "Cannot read properties of undefined (reading 'open')" errors
  (global as any).indexedDB = {
    open: () => ({
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: null,
    }),
  };
}

export {};

