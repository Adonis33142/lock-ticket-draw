"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const GenericStringStorage_1 = require("../src/storage/GenericStringStorage");
(0, vitest_1.describe)("GenericStringInMemoryStorage", () => {
    (0, vitest_1.it)("sets/gets/removes values", async () => {
        const s = new GenericStringStorage_1.GenericStringInMemoryStorage();
        s.setItem("k", "v");
        (0, vitest_1.expect)(s.getItem("k")).toBe("v");
        s.removeItem("k");
        (0, vitest_1.expect)(s.getItem("k")).toBe(null);
    });
});
