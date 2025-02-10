import { QueryClient } from "@tanstack/react-query";
import movies from "@/assets/movies.json";
import axios from "axios";
import { config } from "@/lib/appwrite";

export interface Trendingtoken {
  url: string;
  chainId: string;
  tokenAddress: string;
  amount: number;
  totalAmount: number;
  icon: null | string;
  header: null | string;
  description: null | string;
  links: null | object[];
}

const JupToken = {
  address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  name: "Jupiter",
  symbol: "JUP",
  decimals: 6,
  logoURI: "https://static.jup.ag/jup/icon.png",
  tags: ["verified", "strict", "community", "birdeye-trending"],
  daily_volume: 79535977.0513354,
  created_at: "2024-04-26T10:56:58.893768Z",
  freeze_authority: null,
  mint_authority: null,
  permanent_delegate: null,
  minted_at: "2024-01-25T08:54:23Z",
  extensions: { coingeckoId: "jupiter-exchange-solana" },
};
const newJupToken = {
  mint: "penguin",
  created_at: "1733481083",
  metadata_updated_at: 1733481087,
  name: "cool penguin",
  symbol: "penguin",
  decimals: 6,
  logo_uri: "https://jup.ag",
  known_markets: ["market"],
  mint_authority: null,
  freeze_authority: null,
};
const taggedJupToken = {
  address: "jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v",
  name: "Jupiter Staked SOL",
  symbol: "JupSOL",
  decimals: 9,
  logoURI: "https://static.jup.ag/jupSOL/icon.png",
  tags: [
    "verified",
    "community",
    "strict",
    "lst",
    "token-2022",
    "moonshot",
    "pump",
  ],
  daily_volume: 24017778.687489692,
  created_at: "2024-04-26T10:57:45.759228Z",
  freeze_authority: null,
  mint_authority: "EMjuABxELpYWYEwjkKmQKBNCwdaFAy4QYAs6W9bDQDNw",
  permanent_delegate: null,
  minted_at: "2024-03-25T09:28:04Z",
  extensions: { coingeckoId: "jupiter-staked-sol" },
};
const moralisToken = {
  mint: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
  standard: "metaplex",
  name: "Serum",
  symbol: "SRM",
  logo: "https://d23exngyjlavgo.cloudfront.net/solana_SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
  decimals: "6",
  metaplex: {
    metadataUri: "",
    masterEdition: false,
    isMutable: true,
    sellerFeeBasisPoints: 0,
    updateAuthority: "AqH29mZfQFgRpfwaPoTMWSKJ5kqauoc1FwVBRksZyQrt",
    primarySaleHappened: 0,
  },
  fullyDilutedValue: "228707740.81",
  totalSupply: "9992473820817364",
  totalSupplyFormatted: "9992473820.817364",
  links: {
    medium: "https://projectserum.medium.com/",
    telegram: "https://t.me/ProjectSerum",
    twitter: "https://twitter.com/projectserum",
    website: "https://portal.projectserum.com/",
    github: "https://github.com/project-serum/serum-dex",
    reddit: "https://www.reddit.com",
    moralis:
      "https://moralis.com/chain/solana/token/price/SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
  },
  description: null,
};
export type JupiterToken = {
  type: "moralis" | "jupiter";
  data: typeof JupToken;
};
export type JupiterNewListing = typeof newJupToken;
export type Tag = (typeof taggedJupToken.tags)[number];
export type CGToken = {
  id: "string";
  type: "string";
  attributes: {
    name: "string";
    address: "string";
    base_token_price_usd: "string";
    quote_token_price_usd: "string";
    base_token_price_native_currency: "string";
    quote_token_price_native_currency: "string";
    base_token_price_quote_token: "string";
    quote_token_price_base_token: "string";
    pool_created_at: "string";
    reserve_in_usd: "string";
    fdv_usd: "string";
    market_cap_usd: "string";
    price_change_percentage: any;
    transactions: {};
    volume_usd: {};
  };
  relationships: {};
};
export type MoralisToken = {
  type: "moralis" | "jupiter";
  data: typeof moralisToken;
};
interface SolscanToken {
  address: string;
  decimal: number;
  name: string;
  symbol: string;
}
type SolscanTrending = SolscanToken[];

function delay(t: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, t);
  });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60, // 1 minute
      // cacheTimeMs: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export async function fetchTrending(): Promise<CGToken[] | null> {
  try {
    // Latest Boosted
    const response = await axios.get(
      `https://api.geckoterminal.com/api/v2/networks/trending_pools?page=10`
    );

    return response.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function fetchTrendingOnNetwork(
  network: "eth" | "solana"
): Promise<CGToken[] | null> {
  try {
    // Latest Boosted
    const response = await axios.get(
      `https://api.geckoterminal.com/api/v2/networks/${network}/trending_pools?page=10`
    );

    return response.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function fetchTopOnNetwork(
  network: "eth" | "solana"
): Promise<CGToken[] | null> {
  try {
    // Latest Boosted
    const response = await axios.get(
      `https://api.geckoterminal.com/api/v2/networks/${network}/pools?page=10`
    );

    return response.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function fetchNewOnNetwork(
  network: "eth" | "solana"
): Promise<CGToken[] | null> {
  try {
    // Latest Boosted
    const response = await axios.get(
      `https://api.geckoterminal.com/api/v2/networks/${network}/new_pools?page=10`
    );

    return response.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function fetchNewPools(): Promise<CGToken[] | null> {
  try {
    // Latest Boosted
    const response = await axios.get(
      `https://api.geckoterminal.com/api/v2/networks/new_pools?page=10`
    );

    return response.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function fetchSolScanMetadata(
  address: string
): Promise<SolscanTrending | null> {
  try {
    // Latest Boosted
    const response = await axios.get(
      `https://pro-api.solscan.io/v2.0/token/meta`,
      { params: { address: `${address}` } }
    );

    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function fetchTokenInfo(
  tokenAddress: string
): Promise<JupiterToken | MoralisToken | undefined> {
  try {
    const response = await axios.get(
      `https://solana-gateway.moralis.io/token/mainnet/${tokenAddress}/metadata`,
      {
        headers: {
          accept: "application/json",
          "X-API-Key": config.moralisKey,
        },
      }
    );

    return { type: "moralis", data: response.data };
  } catch (error) {
    console.log(error);
    try {
      const response = await axios.get(
        `https://api.jup.ag/tokens/v1/token/${tokenAddress}'`
      );

      return { type: "jupiter", data: response.data };
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
}

export async function fetchNewTokens(): Promise<JupiterNewListing | undefined> {
  try {
    const response = await axios.get(`https://api.jup.ag/tokens/v1/new'`);

    return response.data;
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

export async function fetchTaggedTokens(
  tag: Tag
): Promise<JupiterNewListing | undefined> {
  try {
    const response = await axios.get(
      `https://api.jup.ag/tokens/v1/tagged/${tag}`
    );

    return response.data;
  } catch (error) {
    console.log(error);
    return undefined;
  }
}
