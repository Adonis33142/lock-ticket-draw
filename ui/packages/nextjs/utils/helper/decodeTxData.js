"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFunctionDetails = exports.decodeTransactionData = void 0;
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const deployedContracts_1 = __importDefault(require("~~/contracts/deployedContracts"));
const deployedContracts = deployedContracts_1.default;
const chainMetaData = deployedContracts?.[chains_1.hardhat.id];
const interfaces = chainMetaData
    ? Object.entries(chainMetaData).reduce((finalInterfacesObj, [contractName, contract]) => {
        finalInterfacesObj[contractName] = contract.abi;
        return finalInterfacesObj;
    }, {})
    : {};
const decodeTransactionData = (tx) => {
    if (tx.input.length >= 10 && !tx.input.startsWith("0x60e06040")) {
        let foundInterface = false;
        for (const [, contractAbi] of Object.entries(interfaces)) {
            try {
                const { functionName, args } = (0, viem_1.decodeFunctionData)({
                    abi: contractAbi,
                    data: tx.input,
                });
                tx.functionName = functionName;
                tx.functionArgs = args;
                tx.functionArgNames = (0, viem_1.getAbiItem)({
                    abi: contractAbi,
                    name: functionName,
                })?.inputs?.map((input) => input.name);
                tx.functionArgTypes = (0, viem_1.getAbiItem)({
                    abi: contractAbi,
                    name: functionName,
                })?.inputs.map((input) => input.type);
                foundInterface = true;
                break;
            }
            catch {
                // do nothing
            }
        }
        if (!foundInterface) {
            tx.functionName = "⚠️ Unknown";
        }
    }
    return tx;
};
exports.decodeTransactionData = decodeTransactionData;
const getFunctionDetails = (transaction) => {
    if (transaction &&
        transaction.functionName &&
        transaction.functionArgNames &&
        transaction.functionArgTypes &&
        transaction.functionArgs) {
        const details = transaction.functionArgNames.map((name, i) => `${transaction.functionArgTypes?.[i] || ""} ${name} = ${transaction.functionArgs?.[i] ?? ""}`);
        return `${transaction.functionName}(${details.join(", ")})`;
    }
    return "";
};
exports.getFunctionDetails = getFunctionDetails;
