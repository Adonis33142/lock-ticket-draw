"use client";

import { useMemo } from "react";
import { usePrivateBet } from "~~/hooks/privatebet/usePrivateBet";
import { useFhevm } from "@fhevm-sdk";

const initialMockChains = { 31337: "http://127.0.0.1:8545" } as const;

export const BettingStats = () => {
  const { instance: fhevmInstance } = useFhevm({
    provider: typeof window !== "undefined" ? (window as any).ethereum : undefined,
    chainId: 31337,
    initialMockChains,
    enabled: true,
  });

  const bet = usePrivateBet({
    instance: fhevmInstance,
    initialMockChains,
  });

  const stats = useMemo(() => {
    if (!bet.stats) return null;

    return {
      totalBets: bet.stats.totalBets || 0,
      settledBets: bet.stats.settledBets || 0,
      uniquePlayers: bet.stats.uniquePlayers || 0,
      totalVolume: bet.stats.totalVolume || 0,
    };
  }, [bet.stats]);

  if (!stats) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Platform Statistics</h3>
        <div className="text-center text-slate-400 py-8">
          Loading statistics...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Platform Statistics</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.totalBets}</div>
          <div className="text-sm text-slate-400">Total Bets</div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.settledBets}</div>
          <div className="text-sm text-slate-400">Settled Bets</div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.uniquePlayers}</div>
          <div className="text-sm text-slate-400">Unique Players</div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.totalVolume}</div>
          <div className="text-sm text-slate-400">Total Volume</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-500 text-center">
        Statistics are updated in real-time
      </div>
    </div>
  );
};
