import { wagmiConnectors } from "./wagmiConnectors";
import { Chain, createClient, fallback, http } from "viem";
import { hardhat, mainnet } from "viem/chains";
import { createConfig } from "wagmi";
import scaffoldConfig, { ScaffoldConfig } from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/helper";

const { targetNetworks } = scaffoldConfig;

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains = targetNetworks.find((network: Chain) => network.id === 1)
  ? targetNetworks
  : ([...targetNetworks, mainnet] as const);

let wagmiConfigInstance: ReturnType<typeof createConfig> | null = null;

// Lazy initialization to avoid SSR issues with QueryClient
export const getWagmiConfig = () => {
  if (typeof window === "undefined") {
    // Return a minimal config for SSR (no connectors to avoid QueryClient dependency)
    return createConfig({
      chains: enabledChains,
      connectors: [],
      ssr: true,
      client: ({ chain }) => {
        return createClient({
          chain,
          transport: http(),
        });
      },
    });
  }

  // Create config only on client side
  if (!wagmiConfigInstance) {
    wagmiConfigInstance = createConfig({
      chains: enabledChains,
      connectors: wagmiConnectors(),
      ssr: true,
      client: ({ chain }) => {
        let rpcFallbacks = [http()];
        const rpcOverrideUrl = (scaffoldConfig.rpcOverrides as ScaffoldConfig["rpcOverrides"])?.[chain.id];
        if (rpcOverrideUrl) {
          rpcFallbacks = [http(rpcOverrideUrl), http()];
        } else {
          const alchemyHttpUrl = getAlchemyHttpUrl(chain.id);
          if (alchemyHttpUrl) {
            rpcFallbacks = [http(alchemyHttpUrl), http()];
          }
        }
        return createClient({
          chain,
          transport: fallback(rpcFallbacks),
          ...(chain.id !== (hardhat as Chain).id ? { pollingInterval: scaffoldConfig.pollingInterval } : {}),
        });
      },
    });
  }

  return wagmiConfigInstance;
};
