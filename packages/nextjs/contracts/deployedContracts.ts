import { GenericContractsDeclaration } from "~~/utils/helper/contract";

const deployedContracts = {
  31337: {
    PrivateBet: {
      address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "betId",
              type: "uint256",
            },
          ],
          name: "BetDoesNotExist",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "NotAuthorized",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "uint256", name: "betId", type: "uint256" },
            { indexed: true, internalType: "address", name: "player", type: "address" },
          ],
          name: "BetPlaced",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "uint256", name: "betId", type: "uint256" },
            { indexed: true, internalType: "address", name: "player", type: "address" },
          ],
          name: "BetSettled",
          type: "event",
        },
        {
          inputs: [
            { internalType: "uint256", name: "betId", type: "uint256" },
            { internalType: "address", name: "auditor", type: "address" },
          ],
          name: "allowAudit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "betCount",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "betId", type: "uint256" }],
          name: "betOwner",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "betId", type: "uint256" }],
          name: "getBetSummary",
          outputs: [
            { internalType: "address", name: "player", type: "address" },
            { internalType: "uint64", name: "createdAt", type: "uint64" },
            { internalType: "uint8", name: "state", type: "uint8" },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "betId", type: "uint256" }],
          name: "getEncryptedBetDetails",
          outputs: [
            { internalType: "bytes32", name: "wager", type: "bytes32" },
            { internalType: "bytes32", name: "guess", type: "bytes32" },
            { internalType: "bytes32", name: "outcome", type: "bytes32" },
            { internalType: "bytes32", name: "payout", type: "bytes32" },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "HOUSE",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "bytes32", name: "wagerHandle", type: "bytes32" },
            { internalType: "bytes", name: "wagerProof", type: "bytes" },
            { internalType: "bytes32", name: "guessHandle", type: "bytes32" },
            { internalType: "bytes", name: "guessProof", type: "bytes" },
          ],
          name: "placeBet",
          outputs: [{ internalType: "uint256", name: "betId", type: "uint256" }],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "protocolId",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "pure",
          type: "function",
        },
      ],
      inheritedFunctions: {},
      deployedOnBlock: 0,
    },
  },
  11155111: {
    PrivateBet: {
      address: "0xC6eBE0A944e0444d7Eba6e66E9C91D02ADb8Df8C",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "betId",
              type: "uint256",
            },
          ],
          name: "BetDoesNotExist",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "NotAuthorized",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "uint256", name: "betId", type: "uint256" },
            { indexed: true, internalType: "address", name: "player", type: "address" },
          ],
          name: "BetPlaced",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "uint256", name: "betId", type: "uint256" },
            { indexed: true, internalType: "address", name: "player", type: "address" },
          ],
          name: "BetSettled",
          type: "event",
        },
        {
          inputs: [],
          name: "HOUSE",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "uint256", name: "betId", type: "uint256" },
            { internalType: "address", name: "auditor", type: "address" },
          ],
          name: "allowAudit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "betCount",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "betId", type: "uint256" }],
          name: "betOwner",
          outputs: [{ internalType: "address", name: "owner", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "betId", type: "uint256" }],
          name: "getBetSummary",
          outputs: [
            { internalType: "address", name: "player", type: "address" },
            { internalType: "uint64", name: "createdAt", type: "uint64" },
            { internalType: "uint8", name: "state", type: "uint8" },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "betId", type: "uint256" }],
          name: "getEncryptedBetDetails",
          outputs: [
            { internalType: "bytes32", name: "wager", type: "bytes32" },
            { internalType: "bytes32", name: "guess", type: "bytes32" },
            { internalType: "bytes32", name: "outcome", type: "bytes32" },
            { internalType: "bytes32", name: "payout", type: "bytes32" },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "bytes32", name: "wagerHandle", type: "bytes32" },
            { internalType: "bytes", name: "wagerProof", type: "bytes" },
            { internalType: "bytes32", name: "guessHandle", type: "bytes32" },
            { internalType: "bytes", name: "guessProof", type: "bytes" },
          ],
          name: "placeBet",
          outputs: [{ internalType: "uint256", name: "betId", type: "uint256" }],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "protocolId",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "pure",
          type: "function",
        },
      ],
      inheritedFunctions: {},
      deployedOnBlock: 9584676,
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
