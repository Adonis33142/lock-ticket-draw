"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParsedError = void 0;
const viem_1 = require("viem");
/**
 * Parses an viem/wagmi error to get a displayable string
 * @param e - error object
 * @returns parsed error string
 */
const getParsedError = (error) => {
    const parsedError = error?.walk ? error.walk() : error;
    if (parsedError instanceof viem_1.BaseError) {
        if (parsedError.details) {
            return parsedError.details;
        }
        if (parsedError.shortMessage) {
            if (parsedError instanceof viem_1.ContractFunctionRevertedError &&
                parsedError.data &&
                parsedError.data.errorName !== "Error") {
                const customErrorArgs = parsedError.data.args?.toString() ?? "";
                return `${parsedError.shortMessage.replace(/reverted\.$/, "reverted with the following reason:")}\n${parsedError.data.errorName}(${customErrorArgs})`;
            }
            return parsedError.shortMessage;
        }
        return parsedError.message ?? parsedError.name ?? "An unknown error occurred";
    }
    return parsedError?.message ?? "An unknown error occurred";
};
exports.getParsedError = getParsedError;
