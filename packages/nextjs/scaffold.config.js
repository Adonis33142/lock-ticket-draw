"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const chains = __importStar(require("viem/chains"));
const rawAlchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
if (!rawAlchemyKey) {
    // eslint-disable-next-line no-console
    console.warn("NEXT_PUBLIC_ALCHEMY_API_KEY is not set. Falling back to public RPCs.");
    // Note: In production, it's recommended to set NEXT_PUBLIC_ALCHEMY_API_KEY for better performance and reliability.
}
const scaffoldConfig = {
    // The networks on which your DApp is live
    targetNetworks: [chains.hardhat, chains.sepolia],
    // The interval at which your front-end polls the RPC servers for new data (it has no effect if you only target the local network (default is 4000))
    pollingInterval: 30000,
    // This is ours Alchemy's default API key.
    // You can get your own at https://dashboard.alchemyapi.io
    // It's recommended to store it in an env variable:
    // .env.local for local testing, and in the Vercel/system env config for live apps.
    alchemyApiKey: rawAlchemyKey || "",
    // If you want to use a different RPC for a specific network, you can add it here.
    // The key is the chain ID, and the value is the HTTP RPC URL
    rpcOverrides: {
        // Example:
        // [chains.mainnet.id]: "https://mainnet.rpc.buidlguidl.com",
        // Local Hardhat node for development
        [chains.hardhat.id]: "http://127.0.0.1:8545",
    },
    // This is ours WalletConnect's default project ID.
    // You can get your own at https://cloud.walletconnect.com
    // It's recommended to store it in an env variable:
    // .env.local for local testing, and in the Vercel/system env config for live apps.
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",
    onlyLocalBurnerWallet: true,
};
exports.default = scaffoldConfig;
