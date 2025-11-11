"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const FhevmDecryptionSignature_1 = require("../src/FhevmDecryptionSignature");
(0, vitest_1.describe)("FhevmDecryptionSignature", () => {
    (0, vitest_1.it)("checkIs guards shape", () => {
        // @ts-expect-error invalid type
        (0, vitest_1.expect)(FhevmDecryptionSignature_1.FhevmDecryptionSignature.checkIs({})).toBe(false);
    });
});
