"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFHEEncryption = exports.buildParamsFromAbi = exports.toHex = exports.getEncryptionMethod = void 0;
const react_1 = require("react");
// Map external encrypted integer type to RelayerEncryptedInput builder method
const getEncryptionMethod = (internalType) => {
    switch (internalType) {
        case "externalEbool":
            return "addBool";
        case "externalEuint8":
            return "add8";
        case "externalEuint16":
            return "add16";
        case "externalEuint32":
            return "add32";
        case "externalEuint64":
            return "add64";
        case "externalEuint128":
            return "add128";
        case "externalEuint256":
            return "add256";
        case "externalEaddress":
            return "addAddress";
        default:
            console.warn(`Unknown internalType: ${internalType}, defaulting to add64`);
            return "add64";
    }
};
exports.getEncryptionMethod = getEncryptionMethod;
// Convert Uint8Array or hex-like string to 0x-prefixed hex string
const toHex = (value) => {
    if (typeof value === "string") {
        return (value.startsWith("0x") ? value : `0x${value}`);
    }
    // value is Uint8Array
    return ("0x" + Buffer.from(value).toString("hex"));
};
exports.toHex = toHex;
// Build contract params from EncryptResult and ABI for a given function
const buildParamsFromAbi = (enc, abi, functionName) => {
    const fn = abi.find((item) => item.type === "function" && item.name === functionName);
    if (!fn)
        throw new Error(`Function ABI not found for ${functionName}`);
    return fn.inputs.map((input, index) => {
        const raw = index === 0 ? enc.handles[0] : enc.inputProof;
        switch (input.type) {
            case "bytes32":
            case "bytes":
                return (0, exports.toHex)(raw);
            case "uint256":
                return BigInt(raw);
            case "address":
            case "string":
                return raw;
            case "bool":
                return Boolean(raw);
            default:
                console.warn(`Unknown ABI param type ${input.type}; passing as hex`);
                return (0, exports.toHex)(raw);
        }
    });
};
exports.buildParamsFromAbi = buildParamsFromAbi;
const useFHEEncryption = (params) => {
    const { instance, ethersSigner, contractAddress } = params;
    const canEncrypt = (0, react_1.useMemo)(() => Boolean(instance && ethersSigner && contractAddress), [instance, ethersSigner, contractAddress]);
    const encryptWith = (0, react_1.useCallback)(async (buildFn) => {
        if (!instance || !ethersSigner || !contractAddress)
            return undefined;
        const userAddress = await ethersSigner.getAddress();
        const input = instance.createEncryptedInput(contractAddress, userAddress);
        buildFn(input);
        const enc = await input.encrypt();
        return enc;
    }, [instance, ethersSigner, contractAddress]);
    return {
        canEncrypt,
        encryptWith,
    };
};
exports.useFHEEncryption = useFHEEncryption;
