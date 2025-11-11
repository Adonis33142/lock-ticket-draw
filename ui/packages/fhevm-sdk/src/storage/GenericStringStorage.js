"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericStringInMemoryStorage = void 0;
class GenericStringInMemoryStorage {
    #store = new Map();
    getItem(key) {
        return this.#store.has(key) ? this.#store.get(key) : null;
    }
    setItem(key, value) {
        this.#store.set(key, value);
    }
    removeItem(key) {
        this.#store.delete(key);
    }
}
exports.GenericStringInMemoryStorage = GenericStringInMemoryStorage;
