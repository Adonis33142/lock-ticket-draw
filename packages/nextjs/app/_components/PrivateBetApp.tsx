"use client";

import { CSSProperties, FormEvent, useMemo, useState, type ReactElement } from "react";
import { useAccount } from "wagmi";
import { useFhevm } from "@fhevm-sdk";
import { usePrivateBet } from "~~/hooks/privatebet/usePrivateBet";
import { RainbowKitCustomConnectButton } from "~~/components/helper";

const initialMockChains = { 31337: "http://127.0.0.1:8545" } as const;

const spotlightCampaign = {
  title: "Weekend Cipher Clash",
  subtitle: "Encrypted parity duel · Apr 10 – Apr 12",
  highlight: "20,000 credits prize pool",
  sponsor: "Presented by Zama Labs",
  description:
    "Lock in your encrypted prediction, watch the homomorphic reveal, and climb the winners leaderboard. Every confirmed bet adds to the prize pool.",
};

const sampleWinners = [
  { handle: "0x5a4d…91ce", prize: 820, timestamp: "2 minutes ago" },
  { handle: "0x91ff…3d21", prize: 540, timestamp: "12 minutes ago" },
  { handle: "0xa45b…76fe", prize: 360, timestamp: "28 minutes ago" },
];

type GuessOption = {
  label: string;
  value: 0 | 1;
  description: string;
  Icon: (props: { className?: string }) => ReactElement;
};

const guessOptions: GuessOption[] = [
  {
    label: "Even",
    value: 0,
    description: "Predict that the hidden outcome is even.",
    Icon: EvenIcon,
  },
  {
    label: "Odd",
    value: 1,
    description: "Predict that the hidden outcome is odd.",
    Icon: OddIcon,
  },
];

const GRID_MASK_STYLE: CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, rgba(56, 189, 248, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.12) 1px, transparent 1px)",
  backgroundSize: "36px 36px",
  maskImage: "radial-gradient(circle at center, white, transparent 70%)",
  WebkitMaskImage: "radial-gradient(circle at center, white, transparent 70%)",
};

export const PrivateBetApp = () => {
  const { isConnected, chain } = useAccount();

  const provider = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return (window as any).ethereum;
  }, []);

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId: chain?.id,
    initialMockChains,
    enabled: true,
  });

  const [wagerInput, setWagerInput] = useState<string>("50");
  const [selectedGuess, setSelectedGuess] = useState<0 | 1>(0);

  const bet = usePrivateBet({
    instance: fhevmInstance,
    initialMockChains,
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const wager = Number(wagerInput);
    if (Number.isNaN(wager)) {
      setWagerInput("");
      return bet.placeBet({ wager: 0, guess: selectedGuess });
    }
    await bet.placeBet({ wager, guess: selectedGuess });
  };

  const canSubmit = isConnected && !bet.isProcessing && wagerInput.trim().length > 0;

  const winnersFeed = useMemo(() => {
    const dynamic = bet.history
      .filter(entry => entry.didWin)
      .map(entry => ({
        handle: `${entry.player.slice(0, 6)}…${entry.player.slice(-4)}`,
        prize: Number(entry.payout ?? 0n),
        timestamp: "moments ago",
      }));
    if (dynamic.length === 0) {
      return sampleWinners;
    }
    return [...dynamic, ...sampleWinners].slice(0, 5);
  }, [bet.history]);

  return (
    <div className="relative isolate overflow-hidden bg-slate-50 pb-24">
      <DecorativeBackdrop />

      <div className="relative mx-auto w-full max-w-6xl space-y-12 px-4 pt-16 lg:space-y-16">
        <EventBanner spotlight={spotlightCampaign} />

        <section className="grid gap-8 lg:grid-cols-[1.05fr_minmax(0,0.95fr)] lg:items-start">
          <div className="space-y-6 lg:pr-6">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1 text-sm font-medium text-sky-700">
                Shadow Cipher Clash · Private Bet Outcome
              </span>
              <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                Place encrypted wagers, keep your predictions secret, and decrypt transparent winnings on chain.
              </h1>
              <p className="text-base leading-7 text-slate-600">
                Shadow Cipher Clash demonstrates a closed-loop encrypted betting flow. Wagers and guesses are encrypted on
                the client, outcomes are generated and settled under FHE, and only the bettor decides who can decrypt the
                result.
              </p>
              {!isConnected && (
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.18),_transparent_70%)] blur-xl" />
                  <h2 className="mb-2 font-semibold text-slate-900">Connect to begin</h2>
                  <p className="mb-4 text-sm text-slate-600">
                    Wallet connection is required to encrypt values with the FHE coprocessor and to sign transactions. We
                    use RainbowKit with the Rainbow wallet adapter in the top-right corner.
                  </p>
                  <RainbowKitCustomConnectButton />
                </div>
              )}
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl">
              <div className="absolute inset-px pointer-events-none rounded-[calc(1.5rem-1px)] border border-white/60" />
              <div className="pointer-events-none absolute -top-16 -right-12 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(14,165,233,0.22),_transparent_65%)] blur-2xl" />

              <div className="space-y-6">
                <div>
                  <h2 className="mb-1 text-lg font-semibold text-slate-900">Encrypted Bet Setup</h2>
                  <p className="text-sm text-slate-600">
                    Choose a wager value and parity prediction. Both fields are encrypted before the contract receives
                    them.
                  </p>
                </div>
                <form className="space-y-5" onSubmit={onSubmit}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="wager">
                      Wager amount (virtual credits)
                    </label>
                    <input
                      id="wager"
                      name="wager"
                      type="number"
                      min={1}
                      step={1}
                      value={wagerInput}
                      onChange={event => setWagerInput(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      placeholder="Enter a positive number"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-slate-700">Parity guess</span>
                    <div className="grid grid-cols-2 gap-3">
                      {guessOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSelectedGuess(option.value)}
                          className={`group relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-4 text-left transition ${
                            selectedGuess === option.value
                              ? "border-sky-400 bg-sky-50 text-slate-900 shadow-lg shadow-sky-100"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-sky-50/40"
                          }`}
                        >
                          <span className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.18),_transparent_70%)] blur-lg transition group-hover:scale-110" />
                          <span className="relative inline-flex items-center gap-3">
                            <span
                              className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-lg font-semibold transition ${
                                selectedGuess === option.value
                                  ? "border-sky-400 bg-sky-500/10 text-sky-500"
                                  : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-sky-200 group-hover:text-sky-500"
                              }`}
                            >
                              <option.Icon className="h-6 w-6" />
                            </span>
                            <span className="text-base font-semibold">{option.label}</span>
                          </span>
                          <span className="text-sm text-slate-500">{option.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {bet.isProcessing ? "Encrypting & submitting..." : "Place encrypted bet"}
                  </button>
                </form>

                <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <span className="pointer-events-none absolute -left-10 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.18),_transparent_70%)] blur-lg" />
                  <p>
                    Wagers and guesses never leave the browser in plaintext. The contract generates its own encrypted
                    result, homomorphically evaluates the payout, and gives you the handles to decrypt.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <RecentWinners winners={winnersFeed} />
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg">
              <div className="absolute inset-px pointer-events-none rounded-[calc(1.5rem-1px)] border border-white/60" />
              <div className="pointer-events-none absolute -bottom-10 -right-14 h-36 w-36 rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.18),_transparent_70%)] blur-2xl" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Campaign details</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="relative pl-5">
                  <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-sky-400" />
                  <span className="font-semibold text-slate-900">Prize pool:</span> The more encrypted bets settle, the
                  higher the pool climbs. Daily boosters unlock at 50 wagers.
                </li>
                <li className="relative pl-5">
                  <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-sky-400" />
                  <span className="font-semibold text-slate-900">Sponsor perks:</span> Zama Labs drops bonus decrypt
                  passes to the top guessers each night.
                </li>
                <li className="relative pl-5">
                  <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-sky-400" />
                  <span className="font-semibold text-slate-900">Transparency:</span> Every outcome is available for
                  auditors via encrypted handles — privacy with integrity.
                </li>
              </ul>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <StatCard
            title="FHEVM status"
            value={fhevmStatus === "ready" ? "Connected" : fhevmStatus}
            description={fhevmError ? String(fhevmError) : "Rainbow wallet acts as the encryption gateway."}
            accent={fhevmStatus === "ready"}
            icon={<ShieldIcon className="h-6 w-6" />}
          />
          <StatCard
            title="Total encrypted bets"
            value={bet.betCount.toString()}
            description="This counter increases each time a bet is confirmed on-chain."
            icon={<CounterIcon className="h-6 w-6" />}
          />
        </section>

        <section className="grid gap-8 mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg">
            <div className="absolute inset-px pointer-events-none rounded-[calc(1.5rem-1px)] border border-white/60" />
            <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.18),_transparent_70%)] blur-2xl" />
            <div className="pointer-events-none absolute right-8 top-8 h-16 w-16 rounded-full bg-[conic-gradient(from_180deg,_rgba(14,165,233,0.25),_transparent_65%)] blur-xl" />

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Decrypt results</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Secure handles</span>
            </div>
            <p className="text-sm text-slate-600">
              Once your transaction confirms, request decryption to reveal the wager, guess, outcome, and payout. Only
              addresses you authorize receive the decryption capability.
            </p>
            <div className="relative space-y-3 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
              <span className="pointer-events-none absolute -right-6 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.18),_transparent_70%)] blur-lg" />
              <p>
                {bet.activeBet
                  ? `Encrypted handles loaded for bet #${bet.activeBet.betId.toString()}`
                  : "No encrypted bet loaded yet."}
              </p>
              <button
                type="button"
                disabled={!bet.canDecrypt || bet.isDecrypting}
                onClick={() => bet.decryptActiveBet()}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500"
              >
                {bet.isDecrypting ? "Decrypting..." : "Decrypt latest bet"}
              </button>
              {bet.latestDecrypted && (
                <div className="grid gap-2 text-sm">
                  <DetailRow label="Wager" value={`${bet.latestDecrypted.wager.toString()} credits`} />
                  <DetailRow label="Guess" value={bet.latestDecrypted.guess === 0 ? "Even" : "Odd"} />
                  <DetailRow label="Outcome" value={bet.latestDecrypted.outcome === 0 ? "Even" : "Odd"} />
                  <DetailRow label="Payout" value={`${bet.latestDecrypted.payout.toString()} credits`} />
                  <DetailRow label="Result" value={bet.latestDecrypted.didWin ? "Won" : "Lost"} highlight />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg">
          <div className="pointer-events-none absolute inset-0 opacity-60" style={GRID_MASK_STYLE} />
          <div className="absolute inset-px pointer-events-none rounded-[calc(1.5rem-1px)] border border-white/60" />
          <h2 className="text-lg font-semibold text-slate-900">Last decrypted bets</h2>
          {bet.history.length === 0 ? (
            <p className="text-sm text-slate-600">Decrypt a bet to see the anonymized audit trail.</p>
          ) : (
            <div className="space-y-4">
              {bet.history.map(entry => (
                <div
                  key={entry.betId.toString()}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Bet #{entry.betId.toString()} ·{" "}
                      <span className={entry.didWin ? "text-emerald-600" : "text-rose-500"}>{entry.didWin ? "Won" : "Lost"}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Player: {entry.player.slice(0, 6)}…{entry.player.slice(-4)} · Created at {entry.createdAt}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-700 md:grid-cols-4">
                    <DetailRow label="Wager" value={`${entry.wager.toString()} cr`} />
                    <DetailRow label="Guess" value={entry.guess === 0 ? "Even" : "Odd"} />
                    <DetailRow label="Outcome" value={entry.outcome === 0 ? "Even" : "Odd"} />
                    <DetailRow label="Payout" value={`${entry.payout.toString()} cr`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {bet.status && (
          <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-sky-50/90 p-5 text-sm text-slate-700 shadow-inner">
            <span className="pointer-events-none absolute -left-10 top-3 h-24 w-24 rounded-full bg-[radial-gradient(circle,_rgba(14,165,233,0.18),_transparent_70%)] blur-xl" />
            <strong className="mr-2 text-sky-700">Activity:</strong>
            {bet.status}
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="flex flex-col">
    <span className="text-[0.7rem] uppercase tracking-wide text-slate-500">{label}</span>
    <span className={`text-sm font-semibold ${highlight ? "text-slate-900" : "text-slate-700"}`}>{value}</span>
  </div>
);

const EventBanner = ({
  spotlight,
}: {
  spotlight: {
    title: string;
    subtitle: string;
    highlight: string;
    sponsor: string;
    description: string;
  };
}) => (
  <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-900 via-sky-700 to-sky-500 px-6 py-10 text-white shadow-lg">
    <div className="pointer-events-none absolute -right-10 top-6 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.35),_transparent_70%)] blur-3xl" />
    <div className="pointer-events-none absolute -left-10 -bottom-16 h-36 w-36 rounded-full bg-[radial-gradient(circle,_rgba(14,165,233,0.4),_transparent_70%)] blur-3xl" />
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle,_rgba(255,255,255,0.2)_0,_rgba(255,255,255,0)_65%)] blur-2xl lg:block" />

    <div className="relative z-10 max-w-3xl space-y-3">
      <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-wide">
        {spotlight.subtitle}
      </p>
      <h1 className="text-4xl font-bold leading-tight">{spotlight.title}</h1>
      <p className="text-lg text-sky-100">{spotlight.description}</p>
      <div className="flex flex-wrap items-center gap-4 pt-2 text-sm font-semibold uppercase tracking-wide text-sky-100">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2">{spotlight.highlight}</span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2">{spotlight.sponsor}</span>
      </div>
    </div>
  </section>
);

const RecentWinners = ({
  winners,
}: {
  winners: {
    handle: string;
    prize: number;
    timestamp: string;
  }[];
}) => (
  <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg">
    <div className="pointer-events-none absolute inset-0 opacity-50" style={GRID_MASK_STYLE} />
    <div className="absolute inset-px pointer-events-none rounded-[calc(1.5rem-1px)] border border-white/70" />

    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Recent winners</p>
        <p className="text-base font-semibold text-slate-900">Encrypted jackpots fulfilled in real time</p>
      </div>
      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">Live feed</span>
    </div>
    <ul className="mt-5 space-y-3">
      {winners.map(entry => (
        <li
          key={`${entry.handle}-${entry.timestamp}`}
          className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm shadow-sm transition hover:border-sky-100 hover:shadow-md"
        >
          <span className="pointer-events-none absolute -left-6 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.15),_transparent_70%)] blur-lg" />
          <div>
            <p className="flex items-center gap-2 font-semibold text-slate-900">
              <SparkleIcon className="h-4 w-4 text-sky-500" />
              {entry.handle}
            </p>
            <p className="text-xs text-slate-500">{entry.timestamp}</p>
          </div>
          <span className="text-sm font-semibold text-emerald-600">+{entry.prize.toLocaleString()} cr</span>
        </li>
      ))}
    </ul>
    <p className="mt-4 text-xs text-slate-500">
      Winners are encrypted by default. Public decrypt passes are granted to auditors each evening for full transparency.
    </p>
  </div>
);

const StatCard = ({
  title,
  value,
  description,
  accent,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  accent?: boolean;
  icon?: ReactElement;
}) => (
  <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg">
    <div className="absolute inset-px rounded-[calc(1.5rem-1px)] border border-white/60" />
    <div className="pointer-events-none absolute -top-10 right-0 h-28 w-28 rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.2),_transparent_70%)] blur-3xl" />
    <p className="text-sm font-medium text-slate-500">{title}</p>
    <div className="mt-3 flex items-center gap-3">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 shadow-sm">
        {icon}
      </span>
      <p className={`text-3xl font-semibold ${accent ? "text-emerald-500" : "text-slate-900"}`}>{value}</p>
    </div>
    <p className="mt-3 text-sm text-slate-600">{description}</p>
  </div>
);

const DecorativeBackdrop = () => (
  <>
    <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.28),_transparent_70%)] blur-[120px]" />
    <div className="pointer-events-none absolute top-40 -left-40 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(14,165,233,0.2),_transparent_70%)] blur-[140px]" />
    <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.22),_transparent_70%)] blur-[140px]" />
    <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_65%)] opacity-80" />
    <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(115deg,_rgba(148,163,184,0.1)_0%,_rgba(248,250,252,0.4)_40%,_rgba(248,250,252,0)_80%)] opacity-80 mix-blend-overlay" />
    <div className="pointer-events-none absolute inset-0 -z-10 opacity-40" style={GRID_MASK_STYLE} />
  </>
);

const SparkleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M10 2.5L11.2 7.3L16 8.5L11.2 9.7L10 14.5L8.8 9.7L4 8.5L8.8 7.3L10 2.5Z"
      fill="currentColor"
      opacity="0.9"
    />
  </svg>
);

function EvenIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="4" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4" y="14" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="14" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function OddIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="5" height="5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="5" width="5" height="5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="5" y="14" width="5" height="5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16.5 14.5L19.5 17.5L16.5 20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 3L19 6V11.4C19 16.05 15.97 19.92 12 21C8.03 19.92 5 16.05 5 11.4V6L12 3Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9.5 12.5L11.3 14.3L15 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const CounterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M9 9H15M9 12H13M9 15H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default PrivateBetApp;
