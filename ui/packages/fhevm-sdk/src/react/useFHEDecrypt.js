"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFHEDecrypt = void 0;
const react_1 = require("react");
const FhevmDecryptionSignature_js_1 = require("../FhevmDecryptionSignature.js");
const useFHEDecrypt = (params) => {
    const { instance, ethersSigner, fhevmDecryptionSignatureStorage, chainId, requests } = params;
    const [isDecrypting, setIsDecrypting] = (0, react_1.useState)(false);
    const [message, setMessage] = (0, react_1.useState)("");
    const [results, setResults] = (0, react_1.useState)({});
    const [error, setError] = (0, react_1.useState)(null);
    const isDecryptingRef = (0, react_1.useRef)(isDecrypting);
    const lastReqKeyRef = (0, react_1.useRef)("");
    const requestsKey = (0, react_1.useMemo)(() => {
        if (!requests || requests.length === 0)
            return "";
        const sorted = [...requests].sort((a, b) => (a.handle + a.contractAddress).localeCompare(b.handle + b.contractAddress));
        return JSON.stringify(sorted);
    }, [requests]);
    const canDecrypt = (0, react_1.useMemo)(() => {
        return Boolean(instance && ethersSigner && requests && requests.length > 0 && !isDecrypting);
    }, [instance, ethersSigner, requests, isDecrypting]);
    const decrypt = (0, react_1.useCallback)(() => {
        if (isDecryptingRef.current)
            return;
        if (!instance || !ethersSigner || !requests || requests.length === 0)
            return;
        const thisChainId = chainId;
        const thisSigner = ethersSigner;
        const thisRequests = requests;
        // Capture the current requests key to avoid false "stale" detection on first run
        lastReqKeyRef.current = requestsKey;
        isDecryptingRef.current = true;
        setIsDecrypting(true);
        setMessage("Start decrypt");
        setError(null);
        const run = async () => {
            const isStale = () => thisChainId !== chainId || thisSigner !== ethersSigner || requestsKey !== lastReqKeyRef.current;
            try {
                const uniqueAddresses = Array.from(new Set(thisRequests.map(r => r.contractAddress)));
                const sig = await FhevmDecryptionSignature_js_1.FhevmDecryptionSignature.loadOrSign(instance, uniqueAddresses, ethersSigner, fhevmDecryptionSignatureStorage);
                if (!sig) {
                    setMessage("Unable to build FHEVM decryption signature");
                    setError("SIGNATURE_ERROR: Failed to create decryption signature");
                    return;
                }
                if (isStale()) {
                    setMessage("Ignore FHEVM decryption");
                    return;
                }
                setMessage("Call FHEVM userDecrypt...");
                const mutableReqs = thisRequests.map(r => ({ handle: r.handle, contractAddress: r.contractAddress }));
                let res = {};
                try {
                    res = await instance.userDecrypt(mutableReqs, sig.privateKey, sig.publicKey, sig.signature, sig.contractAddresses, sig.userAddress, sig.startTimestamp, sig.durationDays);
                }
                catch (e) {
                    const err = e;
                    const code = err && typeof err === "object" && "name" in err ? err.name : "DECRYPT_ERROR";
                    const msg = err && typeof err === "object" && "message" in err ? err.message : "Decryption failed";
                    setError(`${code}: ${msg}`);
                    setMessage("FHEVM userDecrypt failed");
                    return;
                }
                setMessage("FHEVM userDecrypt completed!");
                if (isStale()) {
                    setMessage("Ignore FHEVM decryption");
                    return;
                }
                setResults(res);
            }
            catch (e) {
                const err = e;
                const code = err && typeof err === "object" && "name" in err ? err.name : "UNKNOWN_ERROR";
                const msg = err && typeof err === "object" && "message" in err ? err.message : "Unknown error";
                setError(`${code}: ${msg}`);
                setMessage("FHEVM decryption errored");
            }
            finally {
                isDecryptingRef.current = false;
                setIsDecrypting(false);
                lastReqKeyRef.current = requestsKey;
            }
        };
        run();
    }, [instance, ethersSigner, fhevmDecryptionSignatureStorage, chainId, requests, requestsKey]);
    return { canDecrypt, decrypt, isDecrypting, message, results, error, setMessage, setError };
};
exports.useFHEDecrypt = useFHEDecrypt;
