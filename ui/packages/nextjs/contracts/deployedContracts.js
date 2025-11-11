"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deployedContracts = {
    31337: {
        FHECounter: {
            address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
            abi: [
                {
                    inputs: [
                        {
                            internalType: "externalEuint32",
                            name: "inputEuint32",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes",
                            name: "inputProof",
                            type: "bytes",
                        },
                    ],
                    name: "decrement",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "getCount",
                    outputs: [
                        {
                            internalType: "euint32",
                            name: "",
                            type: "bytes32",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "externalEuint32",
                            name: "inputEuint32",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes",
                            name: "inputProof",
                            type: "bytes",
                        },
                    ],
                    name: "increment",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "protocolId",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "pure",
                    type: "function",
                },
            ],
            inheritedFunctions: {},
            deployedOnBlock: 6,
        },
        SalaryAggregator: {
            address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
            abi: [
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "hr",
                            type: "address",
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "constructor",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "address",
                            name: "account",
                            type: "address",
                        },
                    ],
                    name: "SalarySubmitted",
                    type: "event",
                },
                {
                    inputs: [],
                    name: "allowHrToDecryptSum",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "count",
                    outputs: [
                        {
                            internalType: "uint32",
                            name: "",
                            type: "uint32",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "getEncryptedSum",
                    outputs: [
                        {
                            internalType: "euint32",
                            name: "",
                            type: "bytes32",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "",
                            type: "address",
                        },
                    ],
                    name: "hasSubmitted",
                    outputs: [
                        {
                            internalType: "bool",
                            name: "",
                            type: "bool",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "hrAdmin",
                    outputs: [
                        {
                            internalType: "address",
                            name: "",
                            type: "address",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "protocolId",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "pure",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "externalEuint32",
                            name: "inputEuint32",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes",
                            name: "inputProof",
                            type: "bytes",
                        },
                    ],
                    name: "submitSalary",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
            ],
            inheritedFunctions: {},
            deployedOnBlock: 7,
        },
        PrivateBet: {
            address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
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
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "betId",
                            type: "uint256",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "player",
                            type: "address",
                        },
                    ],
                    name: "BetPlaced",
                    type: "event",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "betId",
                            type: "uint256",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "player",
                            type: "address",
                        },
                    ],
                    name: "BetSettled",
                    type: "event",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "betId",
                            type: "uint256",
                        },
                        {
                            internalType: "address",
                            name: "auditor",
                            type: "address",
                        },
                    ],
                    name: "allowAudit",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "betCount",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "betId",
                            type: "uint256",
                        },
                    ],
                    name: "betOwner",
                    outputs: [
                        {
                            internalType: "address",
                            name: "owner",
                            type: "address",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "betId",
                            type: "uint256",
                        },
                    ],
                    name: "getBetSummary",
                    outputs: [
                        {
                            internalType: "address",
                            name: "player",
                            type: "address",
                        },
                        {
                            internalType: "uint64",
                            name: "createdAt",
                            type: "uint64",
                        },
                        {
                            internalType: "uint8",
                            name: "state",
                            type: "uint8",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "betId",
                            type: "uint256",
                        },
                    ],
                    name: "getEncryptedBetDetails",
                    outputs: [
                        {
                            internalType: "bytes32",
                            name: "wager",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes32",
                            name: "guess",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes32",
                            name: "outcome",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes32",
                            name: "payout",
                            type: "bytes32",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "HOUSE",
                    outputs: [
                        {
                            internalType: "address",
                            name: "",
                            type: "address",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "bytes32",
                            name: "wagerHandle",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes",
                            name: "wagerProof",
                            type: "bytes",
                        },
                        {
                            internalType: "bytes32",
                            name: "guessHandle",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes",
                            name: "guessProof",
                            type: "bytes",
                        },
                    ],
                    name: "placeBet",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "betId",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "protocolId",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "pure",
                    type: "function",
                },
            ],
            inheritedFunctions: {},
            deployedOnBlock: 5,
        },
        Voting: {
            address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
            abi: [
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "_admin",
                            type: "address",
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "constructor",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                        {
                            indexed: false,
                            internalType: "string",
                            name: "title",
                            type: "string",
                        },
                        {
                            indexed: false,
                            internalType: "address",
                            name: "creator",
                            type: "address",
                        },
                    ],
                    name: "PollCreated",
                    type: "event",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                    ],
                    name: "PollDecrypted",
                    type: "event",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "voter",
                            type: "address",
                        },
                    ],
                    name: "VoteCast",
                    type: "event",
                },
                {
                    inputs: [],
                    name: "admin",
                    outputs: [
                        {
                            internalType: "address",
                            name: "",
                            type: "address",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                        {
                            internalType: "uint32",
                            name: "optionIndex",
                            type: "uint32",
                        },
                    ],
                    name: "allowAdminToDecrypt",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                        {
                            internalType: "uint32",
                            name: "optionIndex",
                            type: "uint32",
                        },
                        {
                            internalType: "externalEuint32",
                            name: "inputEuint32",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes",
                            name: "inputProof",
                            type: "bytes",
                        },
                    ],
                    name: "castVote",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "string",
                            name: "title",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "description",
                            type: "string",
                        },
                        {
                            internalType: "string[]",
                            name: "options",
                            type: "string[]",
                        },
                    ],
                    name: "createPoll",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                    ],
                    name: "deactivatePoll",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                        {
                            internalType: "uint32",
                            name: "optionIndex",
                            type: "uint32",
                        },
                    ],
                    name: "getEncryptedVoteCount",
                    outputs: [
                        {
                            internalType: "euint32",
                            name: "",
                            type: "bytes32",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                        {
                            internalType: "uint32",
                            name: "optionIndex",
                            type: "uint32",
                        },
                    ],
                    name: "getOptionDescription",
                    outputs: [
                        {
                            internalType: "string",
                            name: "",
                            type: "string",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                    ],
                    name: "getPollInfo",
                    outputs: [
                        {
                            internalType: "string",
                            name: "title",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "description",
                            type: "string",
                        },
                        {
                            internalType: "bool",
                            name: "active",
                            type: "bool",
                        },
                        {
                            internalType: "uint32",
                            name: "optionCount",
                            type: "uint32",
                        },
                        {
                            internalType: "uint32",
                            name: "totalVotes",
                            type: "uint32",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                        {
                            internalType: "address",
                            name: "voter",
                            type: "address",
                        },
                    ],
                    name: "hasVoted",
                    outputs: [
                        {
                            internalType: "bool",
                            name: "",
                            type: "bool",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "pollCount",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    name: "polls",
                    outputs: [
                        {
                            internalType: "string",
                            name: "title",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "description",
                            type: "string",
                        },
                        {
                            internalType: "bool",
                            name: "active",
                            type: "bool",
                        },
                        {
                            internalType: "uint32",
                            name: "optionCount",
                            type: "uint32",
                        },
                        {
                            internalType: "uint32",
                            name: "totalVotes",
                            type: "uint32",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "protocolId",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "pure",
                    type: "function",
                },
            ],
            inheritedFunctions: {},
            deployedOnBlock: 5,
        },
    },
    11155111: {
        FHECounter: {
            address: "0x23d7EA3bB2a8576fAF5A0de9D54875CD28781244",
            abi: [
                {
                    inputs: [
                        {
                            internalType: "externalEuint32",
                            name: "inputEuint32",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes",
                            name: "inputProof",
                            type: "bytes",
                        },
                    ],
                    name: "decrement",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "getCount",
                    outputs: [
                        {
                            internalType: "euint32",
                            name: "",
                            type: "bytes32",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "externalEuint32",
                            name: "inputEuint32",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes",
                            name: "inputProof",
                            type: "bytes",
                        },
                    ],
                    name: "increment",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "protocolId",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "pure",
                    type: "function",
                },
            ],
            inheritedFunctions: {},
            deployedOnBlock: 9566189,
        },
        SalaryAggregator: {
            address: "0xf545B66a9C8b4aCb087F4D5b7118fC2b15220201",
            abi: [
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "hr",
                            type: "address",
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "constructor",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "address",
                            name: "account",
                            type: "address",
                        },
                    ],
                    name: "SalarySubmitted",
                    type: "event",
                },
                {
                    inputs: [],
                    name: "allowHrToDecryptSum",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "count",
                    outputs: [
                        {
                            internalType: "uint32",
                            name: "",
                            type: "uint32",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "getEncryptedSum",
                    outputs: [
                        {
                            internalType: "euint32",
                            name: "",
                            type: "bytes32",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "hrAdmin",
                    outputs: [
                        {
                            internalType: "address",
                            name: "",
                            type: "address",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "protocolId",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "pure",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "externalEuint32",
                            name: "inputEuint32",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes",
                            name: "inputProof",
                            type: "bytes",
                        },
                    ],
                    name: "submitSalary",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
            ],
            inheritedFunctions: {},
            deployedOnBlock: 9566190,
        },
        Voting: {
            address: "0x0f232c6229D32CbB9C944b575e4fe70F89E4809d",
            abi: [
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "_admin",
                            type: "address",
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "constructor",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                        {
                            indexed: false,
                            internalType: "string",
                            name: "title",
                            type: "string",
                        },
                        {
                            indexed: false,
                            internalType: "address",
                            name: "creator",
                            type: "address",
                        },
                    ],
                    name: "PollCreated",
                    type: "event",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                    ],
                    name: "PollDecrypted",
                    type: "event",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "voter",
                            type: "address",
                        },
                    ],
                    name: "VoteCast",
                    type: "event",
                },
                {
                    inputs: [],
                    name: "admin",
                    outputs: [
                        {
                            internalType: "address",
                            name: "",
                            type: "address",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                        {
                            internalType: "uint32",
                            name: "optionIndex",
                            type: "uint32",
                        },
                    ],
                    name: "allowAdminToDecrypt",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                        {
                            internalType: "uint32",
                            name: "optionIndex",
                            type: "uint32",
                        },
                        {
                            internalType: "externalEuint32",
                            name: "inputEuint32",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes",
                            name: "inputProof",
                            type: "bytes",
                        },
                    ],
                    name: "castVote",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "string",
                            name: "title",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "description",
                            type: "string",
                        },
                        {
                            internalType: "string[]",
                            name: "options",
                            type: "string[]",
                        },
                    ],
                    name: "createPoll",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                    ],
                    name: "deactivatePoll",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                        {
                            internalType: "uint32",
                            name: "optionIndex",
                            type: "uint32",
                        },
                    ],
                    name: "getEncryptedVoteCount",
                    outputs: [
                        {
                            internalType: "euint32",
                            name: "",
                            type: "bytes32",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                        {
                            internalType: "uint32",
                            name: "optionIndex",
                            type: "uint32",
                        },
                    ],
                    name: "getOptionDescription",
                    outputs: [
                        {
                            internalType: "string",
                            name: "",
                            type: "string",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                    ],
                    name: "getPollInfo",
                    outputs: [
                        {
                            internalType: "string",
                            name: "title",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "description",
                            type: "string",
                        },
                        {
                            internalType: "bool",
                            name: "active",
                            type: "bool",
                        },
                        {
                            internalType: "uint32",
                            name: "optionCount",
                            type: "uint32",
                        },
                        {
                            internalType: "uint32",
                            name: "totalVotes",
                            type: "uint32",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "pollId",
                            type: "uint256",
                        },
                        {
                            internalType: "address",
                            name: "voter",
                            type: "address",
                        },
                    ],
                    name: "hasVoted",
                    outputs: [
                        {
                            internalType: "bool",
                            name: "",
                            type: "bool",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "pollCount",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    name: "polls",
                    outputs: [
                        {
                            internalType: "string",
                            name: "title",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "description",
                            type: "string",
                        },
                        {
                            internalType: "bool",
                            name: "active",
                            type: "bool",
                        },
                        {
                            internalType: "uint32",
                            name: "optionCount",
                            type: "uint32",
                        },
                        {
                            internalType: "uint32",
                            name: "totalVotes",
                            type: "uint32",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "protocolId",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "pure",
                    type: "function",
                },
            ],
            inheritedFunctions: {},
            deployedOnBlock: 9570634,
        },
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
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "betId",
                            type: "uint256",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "player",
                            type: "address",
                        },
                    ],
                    name: "BetPlaced",
                    type: "event",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "betId",
                            type: "uint256",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "player",
                            type: "address",
                        },
                    ],
                    name: "BetSettled",
                    type: "event",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "betId",
                            type: "uint256",
                        },
                        {
                            internalType: "address",
                            name: "auditor",
                            type: "address",
                        },
                    ],
                    name: "allowAudit",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "betCount",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "betId",
                            type: "uint256",
                        },
                    ],
                    name: "betOwner",
                    outputs: [
                        {
                            internalType: "address",
                            name: "owner",
                            type: "address",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "betId",
                            type: "uint256",
                        },
                    ],
                    name: "getBetSummary",
                    outputs: [
                        {
                            internalType: "address",
                            name: "player",
                            type: "address",
                        },
                        {
                            internalType: "uint64",
                            name: "createdAt",
                            type: "uint64",
                        },
                        {
                            internalType: "uint8",
                            name: "state",
                            type: "uint8",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "betId",
                            type: "uint256",
                        },
                    ],
                    name: "getEncryptedBetDetails",
                    outputs: [
                        {
                            internalType: "bytes32",
                            name: "wager",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes32",
                            name: "guess",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes32",
                            name: "outcome",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes32",
                            name: "payout",
                            type: "bytes32",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "HOUSE",
                    outputs: [
                        {
                            internalType: "address",
                            name: "",
                            type: "address",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "bytes32",
                            name: "wagerHandle",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes",
                            name: "wagerProof",
                            type: "bytes",
                        },
                        {
                            internalType: "bytes32",
                            name: "guessHandle",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes",
                            name: "guessProof",
                            type: "bytes",
                        },
                    ],
                    name: "placeBet",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "betId",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "protocolId",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "pure",
                    type: "function",
                },
            ],
            inheritedFunctions: {},
            deployedOnBlock: 9584676,
        },
    },
};
exports.default = deployedContracts;
