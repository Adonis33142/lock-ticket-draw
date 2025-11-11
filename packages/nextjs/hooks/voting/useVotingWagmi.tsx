"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDeployedContractInfo } from "../helper";
import { useWagmiEthers } from "../wagmi/useWagmiEthers";
import { FhevmInstance } from "@fhevm-sdk";
import {
  buildParamsFromAbi,
  getEncryptionMethod,
  useFHEDecrypt,
  useFHEEncryption,
  useInMemoryStorage,
} from "@fhevm-sdk";
import { ethers } from "ethers";
import type { Contract as EthersContract } from "ethers";
import type { Contract } from "~~/utils/helper/contract";
import type { AllowedChainIds } from "~~/utils/helper/networks";
import { useReadContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";

export interface PollInfo {
  title: string;
  description: string;
  active: boolean;
  optionCount: number;
  totalVotes: number;
}

export const useVotingWagmi = (parameters: {
  instance: FhevmInstance | undefined;
  initialMockChains?: Readonly<Record<number, string>>;
}) => {
  const { instance, initialMockChains } = parameters;
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();

  const { chainId, ethersReadonlyProvider, ethersSigner, accounts, isConnected } = useWagmiEthers(initialMockChains);
  const queryClient = useQueryClient();
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedPollId, setSelectedPollId] = useState<number | undefined>(undefined);
  const [forceUpdate, setForceUpdate] = useState(0);

  const allowedChainId = typeof chainId === "number" ? (chainId as AllowedChainIds) : undefined;
  const { data: votingContract, isLoading: isContractLoading } = useDeployedContractInfo({
    contractName: "Voting" as any,
    chainId: allowedChainId,
  });

  // Fallback: Get contract from deployedContracts directly if verification fails
  const contractsData = useMemo(() => {
    try {
      // Import deployedContracts directly
      const deployedContracts = require("~~/contracts/deployedContracts").default;
      
      if (!deployedContracts) {
        console.warn("[VotingHook] deployedContracts is null or undefined");
        return undefined;
      }
      
      const targetChainId = chainId || 31337;
      // Ensure chainId is a number (it might be a string in the object keys)
      const chainIdNum = typeof targetChainId === 'string' ? parseInt(targetChainId, 10) : targetChainId;
      
      console.log(`[VotingHook] Looking for contracts on chain ${chainIdNum} (original: ${targetChainId}, type: ${typeof targetChainId})`);
      console.log(`[VotingHook] Available chain IDs in deployedContracts:`, Object.keys(deployedContracts));
      console.log(`[VotingHook] Chain ID types:`, Object.keys(deployedContracts).map(k => `${k} (${typeof k})`));
      
      // Try both string and number keys
      let chainContracts = deployedContracts[chainIdNum];
      if (!chainContracts) {
        chainContracts = deployedContracts[String(chainIdNum)];
      }
      if (!chainContracts) {
        // Try the original chainId
        chainContracts = deployedContracts[targetChainId];
      }
      
      if (!chainContracts) {
        console.warn(`[VotingHook] Chain ${chainIdNum} not found in deployedContracts`);
        // List all available chains
        for (const [cid, contracts] of Object.entries(deployedContracts)) {
          console.log(`[VotingHook] Chain ${cid} (${typeof cid}) has contracts:`, Object.keys(contracts || {}));
        }
        return undefined;
      }
      
      const contractNames = Object.keys(chainContracts);
      console.log(`[VotingHook] Available contracts on chain ${targetChainId}:`, contractNames);
      console.log(`[VotingHook] Full chainContracts object keys:`, Object.keys(chainContracts));
      console.log(`[VotingHook] Contract details:`, contractNames.map(name => ({
        name,
        hasAddress: !!(chainContracts[name as keyof typeof chainContracts] as any)?.address,
        address: (chainContracts[name as keyof typeof chainContracts] as any)?.address,
      })));
      
      // Direct access - check if Voting exists
      console.log(`[VotingHook] Checking for Voting contract...`);
      console.log(`[VotingHook] chainContracts.Voting:`, (chainContracts as any).Voting);
      console.log(`[VotingHook] typeof chainContracts:`, typeof chainContracts);
      console.log(`[VotingHook] chainContracts has Voting property:`, 'Voting' in chainContracts);
      
      // Try different case variations and access methods
      const votingContract = (chainContracts as any).Voting || 
                            chainContracts['Voting'] ||
                            (chainContracts as any)['Voting'] ||
                            chainContracts.Voting;
      
      if (!votingContract) {
        console.warn(`[VotingHook] No Voting contract found on chain ${targetChainId}`);
        console.warn(`[VotingHook] Available contract names:`, contractNames);
        console.warn(`[VotingHook] Trying to find any contract with 'voting' in name...`);
        const votingLike = contractNames.find(name => name.toLowerCase().includes('voting'));
        if (votingLike) {
          console.log(`[VotingHook] Found contract with 'voting' in name:`, votingLike);
          const found = chainContracts[votingLike as keyof typeof chainContracts];
          if (found) {
            console.log(`[VotingHook] Using ${votingLike} as Voting contract`);
            return found as Contract<any>;
          }
        }
        return undefined;
      }
      
      if (!votingContract.address) {
        console.warn(`[VotingHook] Voting contract found but has no address`);
        return undefined;
      }
      
      console.log(`[VotingHook] ✅ Found Voting contract in fallback:`, votingContract.address);
      return votingContract as Contract<any>;
    } catch (e) {
      console.error("[VotingHook] Error loading contracts:", e);
      console.error("[VotingHook] Error stack:", (e as Error).stack);
      return undefined;
    }
  }, [chainId]);

  // Use verified contract if available, otherwise use fallback
  const finalVotingContract = votingContract || contractsData;

  type VotingInfo = Contract<any> & { chainId?: number };
  const hasContract = Boolean(finalVotingContract?.address && finalVotingContract?.abi);
  const hasProvider = Boolean(ethersReadonlyProvider);
  const hasSigner = Boolean(ethersSigner);

  // Debug logging
  useEffect(() => {
    console.log("[VotingHook] State:", {
      isContractLoading,
      hasVotingContract: !!votingContract,
      hasContractsData: !!contractsData,
      hasFinalContract: !!finalVotingContract,
      chainId,
      allowedChainId,
      votingContractAddress: votingContract?.address,
      contractsDataAddress: contractsData?.address,
      finalContractAddress: finalVotingContract?.address,
    });
    
    if (isContractLoading) {
      console.log("[VotingHook] Loading contract info...");
    } else if (votingContract?.address) {
      console.log("[VotingHook] ✅ Contract verified:", votingContract.address);
    } else if (contractsData?.address) {
      console.log("[VotingHook] ⚠️ Using fallback contract from config:", contractsData.address);
      console.log("[VotingHook] Chain ID:", chainId, "Allowed Chain ID:", allowedChainId);
    } else {
      console.error("[VotingHook] ❌ No contract found!", {
        chainId,
        allowedChainId,
        contractsData: contractsData ? "exists" : "null",
        votingContract: votingContract ? "exists" : "null",
      });
    }
  }, [votingContract, contractsData, finalVotingContract, isContractLoading, chainId, allowedChainId]);

  const getContract = (mode: "read" | "write") => {
    if (!hasContract || !finalVotingContract) return undefined;
    const providerOrSigner = mode === "read" ? ethersReadonlyProvider : ethersSigner;
    if (!providerOrSigner) return undefined;
    return new ethers.Contract(
      finalVotingContract.address,
      (finalVotingContract as VotingInfo).abi,
      providerOrSigner,
    ) as EthersContract;
  };

  // Read poll count
  const pollCountResult = useReadContract({
    address: (hasContract && finalVotingContract ? (finalVotingContract.address as unknown as `0x${string}`) : undefined) as `0x${string}` | undefined,
    abi: (hasContract && finalVotingContract ? ((finalVotingContract as VotingInfo).abi as any) : undefined) as any,
    functionName: "pollCount" as const,
    query: { 
      enabled: Boolean(hasContract && hasProvider && finalVotingContract), 
      refetchOnWindowFocus: true,
      refetchInterval: false,
    },
  });

  const pollCount = (pollCountResult.data as bigint | number | undefined) ?? 0n;
  
  // Debug: Log pollCount changes
  useEffect(() => {
    if (hasContract) {
      console.log("PollCount updated:", pollCount.toString(), "from data:", pollCountResult.data);
    }
  }, [pollCount, pollCountResult.data, hasContract]);

  // Read poll info for selected poll
  const pollInfoResult = useReadContract({
    address: (hasContract && finalVotingContract && selectedPollId !== undefined ? (finalVotingContract.address as unknown as `0x${string}`) : undefined) as `0x${string}` | undefined,
    abi: (hasContract && finalVotingContract ? ((finalVotingContract as VotingInfo).abi as any) : undefined) as any,
    functionName: "getPollInfo" as const,
    args: selectedPollId !== undefined ? [BigInt(selectedPollId)] : undefined,
    query: { 
      enabled: Boolean(hasContract && hasProvider && finalVotingContract && selectedPollId !== undefined), 
      refetchOnWindowFocus: true,
    },
  });

  const pollInfo: PollInfo | undefined = useMemo(() => {
    if (!pollInfoResult.data) return undefined;
    const data = pollInfoResult.data as any;
    return {
      title: data[0] as string,
      description: data[1] as string,
      active: data[2] as boolean,
      optionCount: Number(data[3] as bigint),
      totalVotes: Number(data[4] as bigint),
    };
  }, [pollInfoResult.data]);

  // Read admin address
  const adminResult = useReadContract({
    address: (hasContract && finalVotingContract ? (finalVotingContract.address as unknown as `0x${string}`) : undefined) as `0x${string}` | undefined,
    abi: (hasContract && finalVotingContract ? ((finalVotingContract as VotingInfo).abi as any) : undefined) as any,
    functionName: "admin" as const,
    query: { enabled: Boolean(hasContract && hasProvider && finalVotingContract), refetchOnWindowFocus: false },
  });

  const admin = (adminResult.data as string | undefined) ?? undefined;

  const isAdmin = useMemo(() => {
    if (!admin || !accounts || accounts.length === 0) return false;
    return admin.toLowerCase() === accounts[0]!.toLowerCase();
  }, [admin, accounts]);

  // Check if user has voted
  const hasVotedResult = useReadContract({
    address: (hasContract && finalVotingContract && selectedPollId !== undefined && accounts && accounts[0] 
      ? (finalVotingContract.address as unknown as `0x${string}`) : undefined) as `0x${string}` | undefined,
    abi: (hasContract && finalVotingContract ? ((finalVotingContract as VotingInfo).abi as any) : undefined) as any,
    functionName: "hasVoted" as const,
    args: selectedPollId !== undefined && accounts && accounts[0] 
      ? [BigInt(selectedPollId), accounts[0]] : undefined,
    query: { 
      enabled: Boolean(hasContract && hasProvider && finalVotingContract && selectedPollId !== undefined && accounts && accounts[0]), 
      refetchOnWindowFocus: true,
    },
  });

  const userHasVoted = hasVotedResult.data as boolean | undefined;

  // Get encrypted vote counts for all options
  const [encryptedCounts, setEncryptedCounts] = useState<Record<number, string>>({});
  const [decryptedCounts, setDecryptedCounts] = useState<Record<number, bigint | undefined>>({});
  const [optionDescriptions, setOptionDescriptions] = useState<Record<number, string>>({});

  // Decrypt vote counts
  const requests = useMemo(() => {
    if (!hasContract || !finalVotingContract || !pollInfo || selectedPollId === undefined) return undefined;
    const reqs: Array<{ handle: string; contractAddress: string }> = [];
    for (let i = 0; i < pollInfo.optionCount; i++) {
      const handle = encryptedCounts[i];
      if (handle && handle !== ethers.ZeroHash) {
        reqs.push({ handle, contractAddress: finalVotingContract.address });
      }
    }
    return reqs.length > 0 ? reqs : undefined;
  }, [hasContract, finalVotingContract, pollInfo, selectedPollId, encryptedCounts]);

  const { canDecrypt, decrypt, isDecrypting, message: decryptMsg, results } = useFHEDecrypt({
    instance,
    ethersSigner: ethersSigner as any,
    fhevmDecryptionSignatureStorage,
    chainId,
    requests: requests as any,
  });

  // Update decrypted counts from results
  useEffect(() => {
    if (!results || !pollInfo?.optionCount) return;
    
    setDecryptedCounts(prev => {
      const newDecrypted: Record<number, bigint | undefined> = {};
      let hasChanges = false;
      
      for (let i = 0; i < pollInfo.optionCount; i++) {
        const handle = encryptedCounts[i];
        if (handle) {
          const decryptedValue = results[handle] as bigint | undefined;
          newDecrypted[i] = decryptedValue;
          // Check if value changed from previous state
          if (prev[i] !== decryptedValue) {
            hasChanges = true;
          }
        } else {
          // Keep existing value if no handle
          newDecrypted[i] = prev[i];
        }
      }
      
      // Only return new object if there are actual changes
      return hasChanges ? newDecrypted : prev;
    });
  }, [results, encryptedCounts, pollInfo?.optionCount]); // Use functional update to avoid dependency on decryptedCounts

  // Refresh contract data
  const refreshContractData = useCallback(async () => {
    if (!hasContract || !hasProvider || !finalVotingContract?.address) return false;
    try {
      const contractAddress = finalVotingContract.address.toLowerCase();
      
      // Invalidate all queries for this contract
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          if (Array.isArray(key) && key.length > 0 && key[0] === "readContract") {
            const config = key[1] as any;
            return config?.address?.toLowerCase() === contractAddress;
          }
          return false;
        },
      });
      
      // Wait for invalidation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Force refetch all queries
      const refetchPromises = [
        pollCountResult.refetch().catch(err => {
          console.error("Error refetching pollCount:", err);
          return { data: null, error: err };
        }),
      ];
      
      if (selectedPollId !== undefined) {
        refetchPromises.push(
          pollInfoResult.refetch().catch(err => {
            console.error("Error refetching pollInfo:", err);
            return { data: null, error: err };
          }),
          hasVotedResult.refetch().catch(err => {
            console.error("Error refetching hasVoted:", err);
            return { data: null, error: err };
          })
        );
      }
      
      await Promise.all(refetchPromises);
      
      // Wait a bit more for React Query to update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return true;
    } catch (error) {
      console.error("Error refreshing contract data:", error);
      return false;
    }
  }, [hasContract, hasProvider, finalVotingContract?.address, queryClient, pollCountResult, pollInfoResult, hasVotedResult, selectedPollId]);

  // Encrypt vote
  const { encryptWith } = useFHEEncryption({ instance, ethersSigner: ethersSigner as any, contractAddress: finalVotingContract?.address });
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const getEncryptionMethodFor = (functionName: "castVote") => {
    const functionAbi = finalVotingContract?.abi.find((item: any) => item.type === "function" && item.name === functionName);
    if (!functionAbi) return { method: undefined as string | undefined, error: `Function ABI not found for ${functionName}` } as const;
    if (!functionAbi.inputs || functionAbi.inputs.length < 3)
      return { method: undefined as string | undefined, error: `Invalid inputs for ${functionName}` } as const;
    // castVote(uint256 pollId, uint32 optionIndex, externalEuint32 inputEuint32, bytes calldata inputProof)
    // The encrypted vote input is at index 2 (externalEuint32)
    const voteInput = functionAbi.inputs[2]!;
    return { method: getEncryptionMethod(voteInput.internalType), error: undefined } as const;
  };

  const createPoll = useCallback(
    async (title: string, description: string, options: string[]) => {
      if (isProcessing || !hasContract || !hasSigner) {
        if (!hasContract) {
          setMessage(`Contract not found. Please deploy Voting contract to ${chainId === 11155111 ? "Sepolia" : "localhost"} first.`);
        }
        return;
      }
      if (!title || options.length === 0 || options.length > 10) {
        setMessage("Invalid poll data");
        return;
      }
      if (!finalVotingContract?.address) {
        setMessage(`Contract address not available. Please deploy Voting contract to ${chainId === 11155111 ? "Sepolia" : "localhost"}.`);
        return;
      }
      
      setIsProcessing(true);
      setMessage("Creating poll...");
      try {
        // Verify contract exists before attempting to write
        if (ethersReadonlyProvider) {
          const code = await ethersReadonlyProvider.getCode(finalVotingContract.address);
          if (!code || code === "0x") {
            setMessage(`Contract not deployed at ${finalVotingContract.address}. Please deploy to ${chainId === 11155111 ? "Sepolia" : "localhost"} first.`);
            setIsProcessing(false);
            return;
          }
        }
        
        const write = getContract("write");
        if (!write) {
          setMessage("Contract or signer not available");
          setIsProcessing(false);
          return;
        }
        
        const tx = await write.createPoll(title, description, options);
        setMessage("Waiting for transaction...");
        const receipt = await tx.wait();
        
        if (!receipt || receipt.status !== 1) {
          setMessage("Transaction failed");
          setIsProcessing(false);
          return;
        }
        
        setMessage("Poll created successfully! Refreshing...");
        
        // Wait for block to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Directly read pollCount from contract to verify it was created
        let verifiedCount = 0n;
        try {
          const read = getContract("read");
          if (read && finalVotingContract?.address) {
            // Check if contract exists at this address
            const code = await ethersReadonlyProvider?.getCode(finalVotingContract.address);
            if (!code || code === "0x") {
              console.error(`[VotingHook] No contract found at address ${finalVotingContract.address}`);
              setMessage(`Contract not deployed. Please deploy to ${chainId === 11155111 ? "Sepolia" : "localhost"} first.`);
              return;
            }
            
            try {
              const newPollCount = await read.pollCount();
              verifiedCount = BigInt(newPollCount.toString());
              console.log("New poll count from contract:", verifiedCount.toString());
            } catch (readErr: any) {
              console.error("Error reading pollCount:", readErr);
              if (readErr?.code === "BAD_DATA" || readErr?.message?.includes("could not decode")) {
                setMessage(`Contract may not be deployed at ${finalVotingContract.address}. Please deploy to ${chainId === 11155111 ? "Sepolia" : "localhost"}.`);
                return;
              }
              throw readErr;
            }
          }
        } catch (err: any) {
          console.error("Error reading pollCount directly:", err);
          if (err?.code === "BAD_DATA" || err?.message?.includes("could not decode")) {
            setMessage(`Contract not found at address. Please deploy Voting contract to ${chainId === 11155111 ? "Sepolia" : "localhost"}.`);
            return;
          }
        }
        
        // Refresh poll count multiple times to ensure update
        // Note: verifiedCount might be 0n if pollCount is actually 0, so we check if we got a valid response
        // If we got a BAD_DATA error, verifiedCount will still be 0n but we shouldn't try to refresh
        if (verifiedCount >= 0n) {
          for (let i = 0; i < 5; i++) {
            await refreshContractData();
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Also check direct read again
            try {
              const read = getContract("read");
              if (read && finalVotingContract?.address) {
                const currentCount = await read.pollCount();
                const currentCountNum = BigInt(currentCount.toString());
                console.log(`Refresh attempt ${i + 1}, pollCount:`, currentCountNum.toString());
                if (currentCountNum >= verifiedCount) {
                  console.log("Poll count verified in hook!");
                  break;
                }
              }
            } catch (err: any) {
              console.error("Error reading pollCount during refresh:", err);
              // Don't break on BAD_DATA errors during refresh, just continue
              if (err?.code !== "BAD_DATA" && !err?.message?.includes("could not decode")) {
                throw err;
              }
            }
          }
        }
        
        // Force update to trigger UI refresh
        setRefreshKey(prev => prev + 1);
        setForceUpdate(prev => prev + 1);
        setMessage("Poll created successfully!");
      } catch (e) {
        console.error("Create poll error:", e);
        setMessage(e instanceof Error ? e.message : String(e));
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, hasContract, hasSigner, chainId, finalVotingContract, ethersReadonlyProvider, getContract, refreshContractData, pollCountResult],
  );

  const castVote = useCallback(
    async (pollId: number, optionIndex: number) => {
      if (isProcessing || !hasContract || !instance || !hasSigner || userHasVoted) return;
      if (selectedPollId !== pollId) {
        setSelectedPollId(pollId);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      setIsProcessing(true);
      setMessage(`Casting vote for option ${optionIndex + 1}...`);
      try {
        const { method, error } = getEncryptionMethodFor("castVote");
        if (!method) return setMessage(error ?? "Encryption method not found");

        // Encrypt vote value (1 for the selected option)
        let enc;
        try {
          setMessage("Encrypting vote...");
          enc = await encryptWith(builder => {
            (builder as any)[method](1);
          });
          if (!enc) {
            setMessage("Encryption failed. Please check FHEVM relayer connection.");
            setIsProcessing(false);
            return;
          }
        } catch (encryptError: any) {
          console.error("Encryption error:", encryptError);
          const errorMsg = encryptError?.message || String(encryptError);
          if (errorMsg.includes("relayer") || errorMsg.includes("backend") || errorMsg.includes("connection")) {
            const suggestion = chainId === 31337 
              ? "Make sure Hardhat node with FHEVM support is running." 
              : "This is a Sepolia relayer service issue. The Zama public relayer service may be temporarily unavailable. For testing, please switch to localhost (Chain ID: 31337).";
            setMessage(`FHEVM Relayer connection failed: ${errorMsg}. ${suggestion}`);
          } else {
            setMessage(`Encryption failed: ${errorMsg}`);
          }
          setIsProcessing(false);
          return;
        }

        const write = getContract("write");
        if (!write) {
          setMessage("Contract or signer not available");
          setIsProcessing(false);
          return;
        }
        
        // Build params manually: pollId, optionIndex, encrypted handle, proof
        // castVote(uint256 pollId, uint32 optionIndex, externalEuint32 inputEuint32, bytes calldata inputProof)
        const fullParams = [
          BigInt(pollId),
          optionIndex,
          enc.handles[0], // bytes32 for externalEuint32
          enc.inputProof // bytes
        ];
        
        setMessage("Sending transaction...");
        let tx;
        try {
          tx = await write.castVote(...fullParams);
        } catch (txError: any) {
          console.error("Transaction send error:", txError);
          const errorMsg = txError?.message || txError?.data?.message || String(txError);
          if (errorMsg.includes("relayer") || errorMsg.includes("backend") || errorMsg.includes("connection")) {
            setMessage(`FHEVM Relayer error: ${errorMsg}. ${chainId === 31337 ? "Ensure Hardhat node with FHEVM is running." : "Sepolia relayer issue."}`);
          } else {
            setMessage(`Transaction failed: ${errorMsg}`);
          }
          setIsProcessing(false);
          return;
        }
        
        setMessage("Waiting for transaction...");
        await tx.wait();
        
        setMessage("Vote cast successfully!");
        await new Promise(resolve => setTimeout(resolve, 2000));
        await refreshContractData();
        setRefreshKey(prev => prev + 1);
      } catch (e: any) {
        console.error("Cast vote error:", e);
        const errorMsg = e?.message || String(e);
        if (errorMsg.includes("relayer") || errorMsg.includes("backend") || errorMsg.includes("connection")) {
          setMessage(`FHEVM Relayer error: ${errorMsg}. ${chainId === 31337 ? "Make sure you're using 'npx hardhat node' (not regular hardhat node)." : "Sepolia relayer may be down."}`);
        } else {
          setMessage(errorMsg);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, hasContract, instance, hasSigner, userHasVoted, selectedPollId, encryptWith, finalVotingContract?.abi, getContract, refreshContractData, chainId],
  );

  // Load encrypted vote counts for selected poll
  const loadEncryptedCounts = useCallback(async () => {
    if (!hasContract || !pollInfo || selectedPollId === undefined) return;
    const read = getContract("read");
    if (!read) return;

    const counts: Record<number, string> = {};
    const descriptions: Record<number, string> = {};
    for (let i = 0; i < pollInfo.optionCount; i++) {
      try {
        const handle = await read.getEncryptedVoteCount(BigInt(selectedPollId), i);
        counts[i] = handle;
        const desc = await read.getOptionDescription(BigInt(selectedPollId), i);
        descriptions[i] = desc;
      } catch (e) {
        console.error(`Error loading data for option ${i}:`, e);
      }
    }
    setEncryptedCounts(counts);
    setOptionDescriptions(descriptions);
  }, [hasContract, pollInfo, selectedPollId, getContract]);

  const allowAdminToDecrypt = useCallback(async (pollId: number, optionIndex: number) => {
    if (!isAdmin) {
      setMessage("❌ Only admin can allow decryption");
      return;
    }
    if (isProcessing) return;

    // Validate parameters
    if (pollId === undefined || optionIndex === undefined) {
      setMessage("❌ Invalid poll ID or option index");
      return;
    }

    // Check if option index is within valid range
    if (pollInfo && optionIndex >= pollInfo.optionCount) {
      setMessage(`❌ Invalid option index. Valid range: 0-${pollInfo.optionCount - 1}`);
      return;
    }
    
    setIsProcessing(true);
    try {
      const write = getContract("write");
      if (!write) {
        setMessage("❌ Contract or signer not available");
        setIsProcessing(false);
        return;
      }

      // First check if option has voting data
      try {
        const read = getContract("read");
        if (read) {
          const handle = await read.getEncryptedVoteCount(BigInt(pollId), optionIndex);
          if (!handle || handle === "0x0000000000000000000000000000000000000000000000000000000000000000") {
            setMessage(`❌ Option ${optionIndex + 1} has no votes yet. Please wait for users to vote first.`);
            setIsProcessing(false);
            return;
          }
        }
      } catch (readError) {
        console.warn("Could not check option status:", readError);
      }
      
      setMessage(`Authorizing decryption for option ${optionIndex + 1}...`);

      // Use estimateGas to check if transaction will succeed first
      try {
        await write.allowAdminToDecrypt.estimateGas(BigInt(pollId), optionIndex);
      } catch (estimateError: any) {
        console.error("Gas estimation failed:", estimateError);
        let errorMsg = "Transaction would fail.";
        if (estimateError?.reason) {
          errorMsg = estimateError.reason;
        } else if (estimateError?.message) {
          errorMsg = estimateError.message;
        } else if (estimateError?.data) {
          errorMsg = "Option not initialized or invalid parameters";
        }
        setMessage(`❌ ${errorMsg} Possible reasons: Option has no votes yet, invalid parameters, or not admin.`);
        setIsProcessing(false);
        return;
      }
      
      const tx = await write.allowAdminToDecrypt(BigInt(pollId), optionIndex);
      setMessage("Waiting for transaction confirmation...");
      await tx.wait();
      setMessage(`✅ Option ${optionIndex + 1} decryption authorized. Please wait a moment, then click "Decrypt Results".`);
      
      // Wait a bit for the transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh contract data and reload encrypted counts
      await refreshContractData();
      await loadEncryptedCounts();
    } catch (e: any) {
      console.error("Allow decrypt error:", e);
      let errorMessage = "Unknown error";
      
      if (e?.reason) {
        errorMessage = e.reason;
      } else if (e?.message) {
        errorMessage = e.message;
      } else if (typeof e === "string") {
        errorMessage = e;
      }

      // Provide more user-friendly error messages
      if (errorMessage.includes("Only admin")) {
        setMessage("❌ Only admin can authorize decryption. Please switch to admin account.");
      } else if (errorMessage.includes("Option not initialized") || errorMessage.includes("no votes")) {
        setMessage(`❌ Option ${optionIndex + 1} has no votes yet. Please wait for users to vote first.`);
      } else if (errorMessage.includes("Invalid option")) {
        setMessage(`❌ Invalid option index. Please check the option number.`);
      } else {
        setMessage(`❌ Authorization failed: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, isProcessing, pollInfo, getContract, refreshContractData, loadEncryptedCounts]);

  useEffect(() => {
    if (selectedPollId !== undefined && pollInfo) {
      loadEncryptedCounts();
    }
  }, [selectedPollId, pollInfo, loadEncryptedCounts]);

  useEffect(() => {
    if (decryptMsg) setMessage(decryptMsg);
  }, [decryptMsg]);

  // Auto-refresh when refreshKey or forceUpdate changes
  useEffect(() => {
    if ((refreshKey > 0 || forceUpdate > 0) && hasContract && hasProvider) {
      const timer = setTimeout(() => {
        refreshContractData();
        // Also force refetch pollCount
        pollCountResult.refetch();
        if (selectedPollId !== undefined) {
          loadEncryptedCounts();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [refreshKey, forceUpdate, hasContract, hasProvider, refreshContractData, selectedPollId, loadEncryptedCounts, pollCountResult]);

  return {
    contractAddress: finalVotingContract?.address,
    isConnected,
    accounts,
    chainId,
    admin,
    isAdmin,
    pollCount: Number(pollCount),
    selectedPollId,
    setSelectedPollId,
    pollInfo,
    userHasVoted,
    encryptedCounts,
    decryptedCounts,
    optionDescriptions,
    canDecrypt,
    isDecrypting,
    decrypt,
    createPoll,
    castVote,
    allowAdminToDecrypt,
    isProcessing,
    message,
    setMessage,
    loadEncryptedCounts,
    refreshContractData,
  } as const;
};

