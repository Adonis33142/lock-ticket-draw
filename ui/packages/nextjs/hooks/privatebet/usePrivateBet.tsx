"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FhevmInstance, toHex, useFHEDecrypt, useFHEEncryption, useInMemoryStorage } from "@fhevm-sdk";
import { ethers } from "ethers";
import type { Contract as EthersContract } from "ethers";
import { useReadContract } from "wagmi";
import { useDeployedContractInfo } from "../helper";
import { useWagmiEthers } from "../wagmi/useWagmiEthers";
import type { Contract } from "~~/utils/helper/contract";
import type { AllowedChainIds } from "~~/utils/helper/networks";

type BetHandles = {
  betId: bigint;
  player: string;
  createdAt: number;
  wager: `0x${string}`;
  guess: `0x${string}`;
  outcome: `0x${string}`;
  payout: `0x${string}`;
};

export type DecryptedBet = {
  betId: bigint;
  player: string;
  createdAt: number;
  wager: bigint;
  guess: number;
  outcome: number;
  payout: bigint;
  didWin: boolean;
};

type HookParams = {
  instance: FhevmInstance | undefined;
  initialMockChains?: Readonly<Record<number, string>>;
};

export const usePrivateBet = ({ instance, initialMockChains }: HookParams) => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();

  const { chainId, accounts, isConnected, ethersReadonlyProvider, ethersSigner } = useWagmiEthers(initialMockChains);
  const account = accounts?.[0];

  const allowedChainId = typeof chainId === "number" ? (chainId as AllowedChainIds) : undefined;
  const { data: contractInfo } = useDeployedContractInfo({ contractName: "PrivateBet", chainId: allowedChainId });

  type PrivateBetInfo = Contract<"PrivateBet"> & { chainId?: number };
  const hasContract = Boolean(contractInfo?.address && contractInfo?.abi);
  const contractAddress = hasContract ? (contractInfo!.address as `0x${string}`) : undefined;

  const [status, setStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeBet, setActiveBet] = useState<BetHandles | undefined>();
  const [history, setHistory] = useState<DecryptedBet[]>([]);

  const betCountResult = useReadContract({
    address: contractAddress,
    abi: (hasContract ? ((contractInfo as PrivateBetInfo).abi as any) : undefined) as any,
    functionName: "betCount" as const,
    query: {
      enabled: Boolean(hasContract && ethersReadonlyProvider),
      refetchOnWindowFocus: true,
      staleTime: 30_000,
    },
  });

  const betCount = useMemo(() => {
    const data = betCountResult.data as bigint | number | undefined;
    if (typeof data === "number") return BigInt(data);
    return data ?? 0n;
  }, [betCountResult.data]);

  const getContract = useCallback(
    (mode: "read" | "write") => {
      if (!hasContract) return undefined;
      const providerOrSigner =
        mode === "write"
          ? ethersSigner
          : // Prefer signer for read calls that rely on msg.sender-based access control.
            ethersSigner ?? ethersReadonlyProvider;
      if (!providerOrSigner) return undefined;
      return new ethers.Contract(
        contractInfo!.address,
        (contractInfo as PrivateBetInfo).abi,
        providerOrSigner,
      ) as EthersContract;
    },
    [contractInfo, ethersReadonlyProvider, ethersSigner, hasContract],
  );

  const fetchBet = useCallback(
    async (betId: bigint) => {
      if (!hasContract || !contractAddress) return;
      const readContract = getContract("read");
      if (!readContract) return;

      const [summary, encrypted] = await Promise.all([
        readContract.getBetSummary(betId),
        readContract.getEncryptedBetDetails(betId),
      ]);

      const handles: BetHandles = {
        betId,
        player: summary.player as string,
        createdAt: Number(summary.createdAt ?? 0),
        wager: encrypted[0] as `0x${string}`,
        guess: encrypted[1] as `0x${string}`,
        outcome: encrypted[2] as `0x${string}`,
        payout: encrypted[3] as `0x${string}`,
      };

      setActiveBet(handles);
      return handles;
    },
    [contractAddress, getContract, hasContract],
  );

  const decryptRequests = useMemo(() => {
    if (!activeBet || !contractAddress) return undefined;
    return [
      { handle: activeBet.wager, contractAddress },
      { handle: activeBet.guess, contractAddress },
      { handle: activeBet.outcome, contractAddress },
      { handle: activeBet.payout, contractAddress },
    ] as const;
  }, [activeBet, contractAddress]);

  const { canDecrypt, decrypt, isDecrypting, message: decryptMessage, results } = useFHEDecrypt({
    instance,
    ethersSigner: ethersSigner as any,
    fhevmDecryptionSignatureStorage,
    chainId,
    requests: decryptRequests,
  });

  useEffect(() => {
    if (decryptMessage) {
      setStatus(decryptMessage);
    }
  }, [decryptMessage]);

  useEffect(() => {
    if (!activeBet) return;
    const wager = results[activeBet.wager];
    const guess = results[activeBet.guess];
    const outcome = results[activeBet.outcome];
    const payout = results[activeBet.payout];
    if (
      typeof wager === "undefined" ||
      typeof guess === "undefined" ||
      typeof outcome === "undefined" ||
      typeof payout === "undefined"
    ) {
      return;
    }

    const decrypted: DecryptedBet = {
      betId: activeBet.betId,
      player: activeBet.player,
      createdAt: activeBet.createdAt,
      wager: BigInt(wager),
      guess: Number(guess),
      outcome: Number(outcome),
      payout: BigInt(payout),
      didWin: Number(outcome) === Number(guess),
    };
    setHistory(prev => {
      const filtered = prev.filter(entry => entry.betId !== decrypted.betId);
      return [decrypted, ...filtered].slice(0, 5);
    });
  }, [activeBet, results]);

  const { canEncrypt, encryptWith } = useFHEEncryption({
    instance,
    ethersSigner: ethersSigner as any,
    contractAddress,
  });

  const placeBet = useCallback(
    async ({ wager, guess }: { wager: number; guess: 0 | 1 }) => {
      if (!hasContract || !contractAddress) {
        setStatus("Contract not available on the current network.");
        return;
      }
      if (!instance || !canEncrypt || !ethersSigner) {
        setStatus("FHEVM or signer not ready.");
        return;
      }
      if (wager <= 0) {
        setStatus("Wager must be greater than zero.");
        return;
      }

      setIsProcessing(true);
      setStatus("Encrypting wager and guess...");

      try {
        const wagerEnc = await encryptWith(builder => {
          builder.add64(BigInt(wager));
        });
        if (!wagerEnc) {
          setStatus("Failed to encrypt wager.");
          setIsProcessing(false);
          return;
        }

        const guessEnc = await encryptWith(builder => {
          builder.add8(guess);
        });
        if (!guessEnc) {
          setStatus("Failed to encrypt guess.");
          setIsProcessing(false);
          return;
        }

        const writeContract = getContract("write");
        if (!writeContract) {
          setStatus("Unable to create signer connection.");
          setIsProcessing(false);
          return;
        }

        setStatus("Submitting encrypted bet...");
        const tx = await writeContract.placeBet(
          toHex(wagerEnc.handles[0]),
          toHex(wagerEnc.inputProof),
          toHex(guessEnc.handles[0]),
          toHex(guessEnc.inputProof),
        );

        setStatus("Waiting for confirmation...");
        await tx.wait();
        setStatus("Bet confirmed. Fetching encrypted results...");

        await betCountResult.refetch();

        const latestId = await writeContract.betCount();
        await fetchBet(BigInt(latestId));
        setStatus("Encrypted bet ready. You can now request decryption.");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(`Bet submission failed: ${message}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      betCountResult,
      canEncrypt,
      contractAddress,
      fetchBet,
      getContract,
      hasContract,
      instance,
      encryptWith,
      ethersSigner,
    ],
  );

  const loadBet = useCallback(
    async (betId: bigint) => {
      if (!hasContract || betId <= 0n) return;
      try {
        setStatus(`Loading bet #${betId.toString()}...`);
        await fetchBet(betId);
        setStatus("Encrypted bet loaded.");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(`Failed to load bet: ${message}`);
      }
    },
    [fetchBet, hasContract],
  );

  const allowAudit = useCallback(
    async (betId: bigint, auditor: string) => {
      if (!hasContract || !auditor) {
        setStatus("Auditor address required.");
        return;
      }
      const writeContract = getContract("write");
      if (!writeContract) {
        setStatus("Unable to create signer connection.");
        return;
      }
      try {
        setStatus("Authorizing auditor decryption...");
        const tx = await writeContract.allowAudit(betId, auditor);
        await tx.wait();
        setStatus("Auditor authorized successfully.");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(`Failed to authorize auditor: ${message}`);
      }
    },
    [getContract, hasContract],
  );

  const latestDecrypted = history.length > 0 ? history[0] : undefined;

  return {
    isConnected,
    account,
    chainId,
    betCount,
    status,
    isProcessing,
    canEncrypt,
    canDecrypt,
    isDecrypting,
    decryptActiveBet: decrypt,
    activeBet,
    latestDecrypted,
    history,
    placeBet,
    loadBet,
    allowAudit,
  } as const;
};
