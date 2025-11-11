"use client";

import { useEffect, useState } from "react";
import { InMemoryStorageProvider } from "@fhevm-sdk";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/helper";
import { getWagmiConfig } from "~~/services/web3/wagmiConfig";

// Create QueryClient instance - must be created outside component to avoid recreating on each render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const DappWrapperWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always render QueryClientProvider, WagmiProvider, and RainbowKitProvider to ensure hooks can access them
  // getWagmiConfig handles SSR internally (returns minimal config for SSR)
  const wagmiConfig = getWagmiConfig();

  if (!mounted) {
    return (
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <RainbowKitProvider
            avatar={BlockieAvatar}
            theme={lightTheme()}
          >
            <div className="flex flex-col min-h-screen items-center justify-center">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
            {/* Render children but hide it - ensures hooks can access all providers */}
            <div style={{ display: "none" }}>
              <InMemoryStorageProvider>{children}</InMemoryStorageProvider>
            </div>
          </RainbowKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={isDarkMode ? darkTheme() : lightTheme()}
        >
          <ProgressBar height="3px" color="#2299dd" />
          <div className={`flex flex-col min-h-screen`}>
            <Header />
            <main className="relative flex flex-col flex-1">
              <InMemoryStorageProvider>{children}</InMemoryStorageProvider>
            </main>
          </div>
          <Toaster />
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};
