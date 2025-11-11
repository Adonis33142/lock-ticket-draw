"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGlobalState = void 0;
const zustand_1 = require("zustand");
const scaffold_config_1 = __importDefault(require("~~/scaffold.config"));
const helper_1 = require("~~/utils/helper");
exports.useGlobalState = (0, zustand_1.create)(set => ({
    nativeCurrency: {
        price: 0,
        isFetching: true,
    },
    setNativeCurrencyPrice: (newValue) => set(state => ({ nativeCurrency: { ...state.nativeCurrency, price: newValue } })),
    setIsNativeCurrencyFetching: (newValue) => set(state => ({ nativeCurrency: { ...state.nativeCurrency, isFetching: newValue } })),
    targetNetwork: {
        ...scaffold_config_1.default.targetNetworks[0],
        ...helper_1.NETWORKS_EXTRA_DATA[scaffold_config_1.default.targetNetworks[0].id],
    },
    setTargetNetwork: (newTargetNetwork) => set(() => ({ targetNetwork: newTargetNetwork })),
}));
