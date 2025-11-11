"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateContractWriteAndNotifyError = exports.getParsedErrorWithAllAbis = exports.ContractCodeStatus = exports.contracts = void 0;
const getParsedError_1 = require("./getParsedError");
const notification_1 = require("./notification");
const viem_1 = require("viem");
const actions_1 = require("wagmi/actions");
const deployedContracts_1 = __importDefault(require("~~/contracts/deployedContracts"));
const contractsData = deployedContracts_1.default;
exports.contracts = contractsData;
var ContractCodeStatus;
(function (ContractCodeStatus) {
    ContractCodeStatus[ContractCodeStatus["LOADING"] = 0] = "LOADING";
    ContractCodeStatus[ContractCodeStatus["DEPLOYED"] = 1] = "DEPLOYED";
    ContractCodeStatus[ContractCodeStatus["NOT_FOUND"] = 2] = "NOT_FOUND";
})(ContractCodeStatus || (exports.ContractCodeStatus = ContractCodeStatus = {}));
/**
 * Enhanced error parsing that creates a lookup table from all deployed contracts
 * to decode error signatures from any contract in the system
 */
const getParsedErrorWithAllAbis = (error, chainId) => {
    const originalParsedError = (0, getParsedError_1.getParsedError)(error);
    // Check if this is an unrecognized error signature
    if (/Encoded error signature.*not found on ABI/i.test(originalParsedError)) {
        const signatureMatch = originalParsedError.match(/0x[a-fA-F0-9]{8}/);
        const signature = signatureMatch ? signatureMatch[0] : "";
        if (!signature) {
            return originalParsedError;
        }
        try {
            // Get all deployed contracts for the current chain
            const chainContracts = deployedContracts_1.default[chainId];
            if (!chainContracts) {
                return originalParsedError;
            }
            // Build a lookup table of error signatures to error names
            const errorLookup = {};
            Object.entries(chainContracts).forEach(([contractName, contract]) => {
                if (contract.abi) {
                    contract.abi.forEach((item) => {
                        if (item.type === "error") {
                            // Create the proper error signature like Solidity does
                            const errorName = item.name;
                            const inputs = item.inputs || [];
                            const inputTypes = inputs.map((input) => input.type).join(",");
                            const errorSignature = `${errorName}(${inputTypes})`;
                            // Hash the signature and take the first 4 bytes (8 hex chars)
                            const hash = (0, viem_1.keccak256)((0, viem_1.toHex)(errorSignature));
                            const errorSelector = hash.slice(0, 10); // 0x + 8 chars = 10 total
                            errorLookup[errorSelector] = {
                                name: errorName,
                                contract: contractName,
                                signature: errorSignature,
                            };
                        }
                    });
                }
            });
            // Check if we can find the error in our lookup
            const errorInfo = errorLookup[signature];
            if (errorInfo) {
                return `Contract function execution reverted with the following reason:\n${errorInfo.signature} from ${errorInfo.contract} contract`;
            }
            // If not found in simple lookup, provide a helpful message with context
            return `${originalParsedError}\n\nThis error occurred when calling a function that internally calls another contract. Check the contract that your function calls internally for more details.`;
        }
        catch (lookupError) {
            console.log("Failed to create error lookup table:", lookupError);
        }
    }
    return originalParsedError;
};
exports.getParsedErrorWithAllAbis = getParsedErrorWithAllAbis;
const simulateContractWriteAndNotifyError = async ({ wagmiConfig, writeContractParams: params, chainId, }) => {
    try {
        await (0, actions_1.simulateContract)(wagmiConfig, params);
    }
    catch (error) {
        const parsedError = (0, exports.getParsedErrorWithAllAbis)(error, chainId);
        notification_1.notification.error(parsedError);
        throw error;
    }
};
exports.simulateContractWriteAndNotifyError = simulateContractWriteAndNotifyError;
