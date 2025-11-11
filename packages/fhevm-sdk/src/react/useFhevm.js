"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFhevm = useFhevm;
const react_1 = require("react");
const fhevm_js_1 = require("../internal/fhevm.js");
function _assert(condition, message) {
    if (!condition) {
        const m = message ? `Assertion failed: ${message}` : `Assertion failed.`;
        throw new Error(m);
    }
}
function useFhevm(parameters) {
    const { provider, chainId, initialMockChains, enabled = true } = parameters;
    const [instance, _setInstance] = (0, react_1.useState)(undefined);
    const [status, _setStatus] = (0, react_1.useState)("idle");
    const [error, _setError] = (0, react_1.useState)(undefined);
    const [_isRunning, _setIsRunning] = (0, react_1.useState)(enabled);
    const [_providerChanged, _setProviderChanged] = (0, react_1.useState)(0);
    const _abortControllerRef = (0, react_1.useRef)(null);
    const _providerRef = (0, react_1.useRef)(provider);
    const _chainIdRef = (0, react_1.useRef)(chainId);
    const _mockChainsRef = (0, react_1.useRef)(initialMockChains);
    const refresh = (0, react_1.useCallback)(() => {
        if (_abortControllerRef.current) {
            _providerRef.current = undefined;
            _chainIdRef.current = undefined;
            _abortControllerRef.current.abort();
            _abortControllerRef.current = null;
        }
        _providerRef.current = provider;
        _chainIdRef.current = chainId;
        _setInstance(undefined);
        _setError(undefined);
        _setStatus("idle");
        if (provider !== undefined) {
            _setProviderChanged(prev => prev + 1);
        }
    }, [provider, chainId]);
    (0, react_1.useEffect)(() => {
        refresh();
    }, [refresh]);
    (0, react_1.useEffect)(() => {
        _setIsRunning(enabled);
    }, [enabled]);
    (0, react_1.useEffect)(() => {
        if (_isRunning === false) {
            if (_abortControllerRef.current) {
                _abortControllerRef.current.abort();
                _abortControllerRef.current = null;
            }
            _setInstance(undefined);
            _setError(undefined);
            _setStatus("idle");
            return;
        }
        if (_isRunning === true) {
            if (_providerRef.current === undefined) {
                _setInstance(undefined);
                _setError(undefined);
                _setStatus("idle");
                return;
            }
            if (!_abortControllerRef.current) {
                _abortControllerRef.current = new AbortController();
            }
            _assert(!_abortControllerRef.current.signal.aborted, "!controllerRef.current.signal.aborted");
            _setStatus("loading");
            _setError(undefined);
            const thisSignal = _abortControllerRef.current.signal;
            const thisProvider = _providerRef.current;
            const thisRpcUrlsByChainId = _mockChainsRef.current;
            (0, fhevm_js_1.createFhevmInstance)({
                signal: thisSignal,
                provider: thisProvider,
                mockChains: thisRpcUrlsByChainId,
                onStatusChange: s => console.log(`[useFhevm] createFhevmInstance status changed: ${s}`),
            })
                .then(i => {
                if (thisSignal.aborted)
                    return;
                _assert(thisProvider === _providerRef.current, "thisProvider === _providerRef.current");
                _setInstance(i);
                _setError(undefined);
                _setStatus("ready");
            })
                .catch(e => {
                if (thisSignal.aborted)
                    return;
                _assert(thisProvider === _providerRef.current, "thisProvider === _providerRef.current");
                _setInstance(undefined);
                _setError(e);
                _setStatus("error");
            });
        }
    }, [_isRunning, _providerChanged]);
    return { instance, refresh, error, status };
}
