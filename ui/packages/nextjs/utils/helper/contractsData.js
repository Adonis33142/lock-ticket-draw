"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAllContracts = useAllContracts;
const helper_1 = require("~~/hooks/helper");
const contract_1 = require("~~/utils/helper/contract");
const DEFAULT_ALL_CONTRACTS = {};
function useAllContracts() {
    const { targetNetwork } = (0, helper_1.useTargetNetwork)();
    const contractsData = contract_1.contracts?.[targetNetwork.id];
    // using constant to avoid creating a new object on every call
    return contractsData || DEFAULT_ALL_CONTRACTS;
}
