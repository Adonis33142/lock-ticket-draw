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

export const useSalaryAggregatorWagmi = (parameters: {
  instance: FhevmInstance | undefined;
  initialMockChains?: Readonly<Record<number, string>>;
}) => {
  const { instance, initialMockChains } = parameters;
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();

  const { chainId, ethersReadonlyProvider, ethersSigner, accounts, isConnected } = useWagmiEthers(initialMockChains);
  const queryClient = useQueryClient();
  
  // Add refresh key to force re-fetch
  const [refreshKey, setRefreshKey] = useState(0);

  const allowedChainId = typeof chainId === "number" ? (chainId as AllowedChainIds) : undefined;
  const { data: salaryAgg } = useDeployedContractInfo({
    contractName: "SalaryAggregator" as any,
    chainId: allowedChainId,
  });

  type SalaryAggInfo = Contract<any> & { chainId?: number };
  const hasContract = Boolean(salaryAgg?.address && salaryAgg?.abi);
  const hasProvider = Boolean(ethersReadonlyProvider);
  const hasSigner = Boolean(ethersSigner);

  // Debug logging
  useEffect(() => {
    console.log("Contract debug:", {
      salaryAggAddress: salaryAgg?.address,
      hasContract,
      hasProvider,
      hasSigner,
      chainId,
      enabled: Boolean(hasContract && hasProvider),
    });
  }, [salaryAgg?.address, hasContract, hasProvider, hasSigner, chainId]);

  const getContract = (mode: "read" | "write") => {
    if (!hasContract) return undefined;
    const providerOrSigner = mode === "read" ? ethersReadonlyProvider : ethersSigner;
    if (!providerOrSigner) return undefined;
    return new ethers.Contract(salaryAgg!.address, (salaryAgg as SalaryAggInfo).abi, providerOrSigner) as EthersContract;
  };

  // Reads - use wagmi for initial load
  const countResult = useReadContract({
    address: (hasContract ? (salaryAgg!.address as unknown as `0x${string}`) : undefined) as `0x${string}` | undefined,
    abi: (hasContract ? ((salaryAgg as SalaryAggInfo).abi as any) : undefined) as any,
    functionName: "count" as const,
    query: { 
      enabled: Boolean(hasContract && hasProvider), 
      refetchOnWindowFocus: true,
      refetchInterval: false,
    },
  });

  const sumHandleResult = useReadContract({
    address: (hasContract ? (salaryAgg!.address as unknown as `0x${string}`) : undefined) as `0x${string}` | undefined,
    abi: (hasContract ? ((salaryAgg as SalaryAggInfo).abi as any) : undefined) as any,
    functionName: "getEncryptedSum" as const,
    query: {
      enabled: Boolean(hasContract && hasProvider),
      refetchOnWindowFocus: true,
      refetchInterval: false,
    },
  });

  // Function to manually refresh contract data
  const refreshContractData = useCallback(async () => {
    if (!hasContract || !hasProvider || !salaryAgg?.address) {
      console.warn("Cannot refresh: missing contract or provider");
      return false;
    }
    
    try {
      console.log("Refreshing contract data...");
      const contractAddress = salaryAgg.address as `0x${string}`;
      
      // Get current values before refresh
      const oldCount = countResult.data;
      const oldSumHandle = sumHandleResult.data;
      
      console.log("Before refresh - count:", oldCount, "sumHandle:", oldSumHandle ? "present" : "empty");
      
      // Invalidate all wagmi queries for this contract
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          if (Array.isArray(key) && key.length > 0 && key[0] === "readContract") {
            const config = key[1] as any;
            return config?.address?.toLowerCase() === contractAddress.toLowerCase();
          }
          return false;
        },
      });
      
      // Wait a bit for invalidation to take effect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force refetch and wait for results
      const [countRes, sumRes] = await Promise.all([
        countResult.refetch().catch(err => {
          console.error("Error refetching count:", err);
          return { data: null, error: err };
        }),
        sumHandleResult.refetch().catch(err => {
          console.error("Error refetching sumHandle:", err);
          return { data: null, error: err };
        }),
      ]);
      
      // Wait a bit for React Query to update its cache
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Get updated values from refetch results first, then cache
      const newCount = countRes?.data ?? countResult.data;
      const newSumHandle = sumRes?.data ?? sumHandleResult.data;
      
      console.log("After refresh - count:", newCount, "sumHandle:", newSumHandle ? "present" : "empty");
      console.log("Refetch results - count:", countRes?.data, "sumHandle:", sumRes?.data ? "present" : "empty");
      
      // Check if data actually changed
      const countChanged = oldCount !== newCount;
      const sumHandleChanged = oldSumHandle !== newSumHandle;
      
      console.log("Data changed:", { countChanged, sumHandleChanged });
      
      return countChanged || sumHandleChanged;
    } catch (error) {
      console.error("Error refreshing contract data:", error);
      return false;
    }
  }, [hasContract, hasProvider, salaryAgg?.address, queryClient, countResult, sumHandleResult]);

  // Use wagmi data directly - no local state needed
  const count = (countResult.data as number | bigint | undefined) ?? 0n;
  const sumHandle = (sumHandleResult.data as string | undefined) ?? undefined;

  // Auto-refresh when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0 && hasContract && hasProvider) {
      const timer = setTimeout(() => {
        refreshContractData();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [refreshKey, hasContract, hasProvider, refreshContractData]);

  const hrAdminResult = useReadContract({
    address: (hasContract ? (salaryAgg!.address as unknown as `0x${string}`) : undefined) as `0x${string}` | undefined,
    abi: (hasContract ? ((salaryAgg as SalaryAggInfo).abi as any) : undefined) as any,
    functionName: "hrAdmin" as const,
    query: { enabled: Boolean(hasContract && hasProvider), refetchOnWindowFocus: false },
  });

  const hrAdmin = (hrAdminResult.data as string | undefined) ?? undefined;

  const isHr = useMemo(() => {
    if (!hrAdmin || !accounts || accounts.length === 0) return false;
    return hrAdmin.toLowerCase() === accounts[0]!.toLowerCase();
  }, [hrAdmin, accounts]);

  // Decrypt sum
  const requests = useMemo(() => {
    if (!hasContract || !sumHandle || sumHandle === ethers.ZeroHash) return undefined;
    return [{ handle: sumHandle, contractAddress: salaryAgg!.address as `0x${string}` }] as const;
  }, [hasContract, salaryAgg?.address, sumHandle]);

  const { canDecrypt, decrypt, isDecrypting, message: decryptMsg, results } = useFHEDecrypt({
    instance,
    ethersSigner: ethersSigner as any,
    fhevmDecryptionSignatureStorage,
    chainId,
    requests,
  });

  const decryptedSum = useMemo(() => {
    if (!sumHandle) return undefined as unknown as bigint | undefined;
    if (sumHandle === ethers.ZeroHash) return 0n;
    const v = results[sumHandle];
    return typeof v === "undefined" ? undefined : (v as bigint);
  }, [sumHandle, results]);

  const average = useMemo(() => {
    const c = typeof count === "bigint" ? count : BigInt(count ?? 0);
    if (!decryptedSum || c === 0n) return undefined;
    return decryptedSum / c;
  }, [decryptedSum, count]);

  // Submit salary
  const { encryptWith } = useFHEEncryption({ instance, ethersSigner: ethersSigner as any, contractAddress: salaryAgg?.address });
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const getEncryptionMethodFor = (functionName: "submitSalary") => {
    const functionAbi = salaryAgg?.abi.find((item: any) => item.type === "function" && item.name === functionName);
    if (!functionAbi) return { method: undefined as string | undefined, error: `Function ABI not found for ${functionName}` } as const;
    if (!functionAbi.inputs || functionAbi.inputs.length === 0)
      return { method: undefined as string | undefined, error: `No inputs found for ${functionName}` } as const;
    const firstInput = functionAbi.inputs[0]!;
    return { method: getEncryptionMethod(firstInput.internalType), error: undefined } as const;
  };

  const submitSalary = useCallback(
    async (value: number) => {
      if (isProcessing || !hasContract || !instance || !hasSigner || value <= 0) return;
      setIsProcessing(true);
      setMessage(`Submitting salary ${value}...`);
      try {
        const { method, error } = getEncryptionMethodFor("submitSalary");
        if (!method) return setMessage(error ?? "Encryption method not found");

        const enc = await encryptWith(builder => {
          (builder as any)[method](value);
        });
        if (!enc) return setMessage("Encryption failed");

        console.log("Encryption successful, preparing transaction...");
        
        const write = getContract("write");
        if (!write) return setMessage("Contract or signer not available");
        
        const params = buildParamsFromAbi(enc, [...salaryAgg!.abi] as any[], "submitSalary");
        console.log("Transaction params prepared:", {
          handlesLength: enc.handles.length,
          proofLength: enc.inputProof.length,
          paramsLength: params.length,
        });
        
        setMessage("Sending transaction...");
        let tx;
        try {
          tx = await write.submitSalary(...params);
        } catch (txError: any) {
          console.error("Transaction send error:", txError);
          // Try to get more details from the error
          const errorMessage = txError?.data?.message || txError?.shortMessage || txError?.message || String(txError);
          setMessage(`Transaction failed: ${errorMessage}`);
          throw txError;
        }
        
        setMessage("Waiting for transaction...");
        const receipt = await tx.wait();
        
        if (!receipt || receipt.status !== 1) {
          setMessage("Transaction reverted or failed");
          return;
        }
        
        console.log("Transaction confirmed:", receipt.transactionHash);
        
        // Wait for node to process transaction
        setMessage("Transaction confirmed, refreshing data...");
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        // Multiple refresh attempts with delays until data changes
        let refreshed = false;
        for (let i = 0; i < 5; i++) {
          try {
            refreshed = await refreshContractData();
            if (refreshed) {
              console.log(`Data updated on attempt ${i + 1}`);
              break;
            }
            console.log(`Refresh attempt ${i + 1}: no change yet, waiting...`);
            await new Promise(resolve => setTimeout(resolve, 1500));
          } catch (err) {
            console.error(`Refresh attempt ${i + 1} failed:`, err);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // Force refresh by updating refreshKey (triggers useEffect)
        setRefreshKey(prev => prev + 1);
        
        if (refreshed) {
          setMessage(`Salary submitted successfully! Data updated.`);
        } else {
          setMessage(`Salary submitted successfully! If data doesn't update, please refresh the page.`);
        }
      } catch (e) {
        setMessage(e instanceof Error ? e.message : String(e));
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, hasContract, instance, hasSigner, encryptWith, salaryAgg?.abi, salaryAgg?.address, getContract, refreshContractData, setRefreshKey, countResult],
  );

  const allowHrToDecryptSum = useCallback(async () => {
    if (!isHr) return setMessage("Only HR can allow decryption");
    try {
      const write = getContract("write");
      if (!write) return setMessage("Contract or signer not available");
      const tx = await write.allowHrToDecryptSum();
      setMessage("Authorizing HR decryption...");
      await tx.wait();
      setMessage("HR authorized to decrypt sum");
      
      // Wait and refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
      setRefreshKey(prev => prev + 1);
      await refreshContractData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    }
  }, [isHr, getContract, refreshContractData, setRefreshKey]);

  useEffect(() => {
    if (decryptMsg) setMessage(decryptMsg);
  }, [decryptMsg]);

  return {
    contractAddress: salaryAgg?.address,
    isConnected,
    accounts,
    chainId,
    hrAdmin,
    isHr,
    count,
    sumHandle,
    decryptedSum,
    average,
    canDecrypt,
    isDecrypting,
    decrypt,
    submitSalary,
    allowHrToDecryptSum,
    isProcessing,
    message,
  } as const;
};


