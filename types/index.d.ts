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
const moralisToken2 = [
  {
    chain_id: "0x1",
    token_address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
    token_name: "Maker",
    token_symbol: "MKR",
    token_logo: "string",
    price_usd: 1,
    token_age_in_days: 1,
    on_chain_strength_index: 1,
    security_score: 88,
    market_cap: 1351767630.85,
    fully_diluted_valuation: 1363915420.28,
    twitter_followers: 255217,
    holders_change: {
      "1h": 14,
      "1d": 14,
      "1w": 162,
      "1M": 162,
    },
    liquidity_change_usd: {
      "1h": 14,
      "1d": 14,
      "1w": 162,
      "1M": 162,
    },
    experienced_net_buyers_change: {
      "1h": 14,
      "1d": 14,
      "1w": 162,
      "1M": 162,
    },
    volume_change_usd: {
      "1h": 14,
      "1d": 14,
      "1w": 162,
      "1M": 162,
    },
    net_volume_change_usd: {
      "1h": 14,
      "1d": 14,
      "1w": 162,
      "1M": 162,
    },
    price_percent_change_usd: {
      "1h": 14,
      "1d": 14,
      "1w": 162,
      "1M": 162,
    },
  },
];
export type MoralisToken2 = typeof moralisToken2;
export type JupiterToken = {
  type: "moralis" | "jupiter";
  data: typeof JupToken | any;
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
  relationships: any;
};

export interface TrendingToken2 extends CGToken {
  tokenInfo: JupiterToken | MoralisToken | undefined;
}
export type MoralisToken = {
  type: "moralis" | "jupiter";
  data: typeof moralisToken;
};

const newPumpShotToken = {
  decimals: 9,
  deployedAt: "2025-02-19T08:02:47.856Z",
  mintAddress: "Hiz6hVCjiNoGoMFfbvZ8gk7WNdyfvvzAnVP5G1Sbpump",
  name: "BEATBTC",
  platform: "pumpfun",
  symbol: "BBTC",
  uri: "https://ipfs.io/ipfs/Qme95BJBpw46MsvXfeDdwyqY2uG61rm6WkM7pkpftTg5Mo",
  price: 0,
  change: 0,
  marketCap: 0,
  holders: 0,
};

export type PumpShot = typeof newPumpShotToken;

export interface Content {
  $schema: string;
  json_uri: string;
  files: any[];
  metadata: Record<string, any>;
  links: Record<string, any>;
}

export interface Compression {
  eligible: boolean;
  compressed: boolean;
  data_hash: string;
  creator_hash: string;
  asset_hash: string;
  tree: string;
  seq: number;
  leaf_id: number;
}

export interface Royalty {
  royalty_model: string;
  target: null | string;
  percent: number;
  basis_points: number;
  primary_sale_happened: boolean;
  locked: boolean;
}

export interface Ownership {
  frozen: boolean;
  delegated: boolean;
  delegate: null | string;
  ownership_model: string;
  owner: string;
}

export interface TokenInfo {
  symbol: string;
  balance: number;
  supply: number;
  decimals: number;
  token_program: string;
  associated_token_address: string;
  price_info: PriceInfo;
}

export interface PriceInfo {
  price_per_token: number;
  total_price: number;
  currency: string;
}

export interface FungibleToken {
  interface: string;
  id: string;
  content: Content;
  authorities: any[];
  compression: Compression;
  grouping: any[];
  royalty: Royalty;
  creators: any[];
  ownership: Ownership;
  supply: null | number;
  mutable: boolean;
  burnt: boolean;
  mint_extensions?: MintExtensions;
  token_info: TokenInfo;
}

const newListing = {
  address: "3DY3QCbmd3maUvdDm8mvvcS4z6akiTyhAiYT6nPvCray",
  symbol: "waffles",
  name: "waffles",
  decimals: 6,
  source: "raydium_launchlab",
  liquidityAddedAt: "2025-05-06T15:09:58",
  logoURI:
    "https://ipfs.io/ipfs/bafkreif4bj2h3gjqt6r6l6em5hytm4m5hrp2xtq2kjyezly7ddqtg5oxyu",
  liquidity: 14.216456722109454,
};

const topToken = {
  address: "7G8uzB472JBNjL83PAtYvCTRL8NAWiHfM5DMRwaEeVfV",
  logo_uri:
    "https://ipfs.io/ipfs/QmehLSZJ1GVno1fc2zeS3VNFPsdjkzxXyfFs5KUmebCckX",
  name: "Jeffy",
  symbol: "Alive",
  decimals: 6,
  extensions: null,
  market_cap: 853512.5692942592,
  fdv: 853512.5692942592,
  liquidity: 42776.613873309805,
  last_trade_unix_time: 1746543330,
  volume_1h_usd: 3.5131415547871367,
  volume_1h_change_percent: -99.04124648866832,
  volume_2h_usd: 147.52356462732018,
  volume_2h_change_percent: -90.65900879352962,
  volume_4h_usd: 2401.2759885923447,
  volume_4h_change_percent: null,
  volume_8h_usd: 2401.2759885923447,
  volume_8h_change_percent: null,
  volume_24h_usd: 2401.2759885923447,
  volume_24h_change_percent: null,
  trade_1h_count: 6,
  trade_2h_count: 10,
  trade_4h_count: 20,
  trade_8h_count: 20,
  trade_24h_count: 20,
  price: 0.0008574256374845203,
  price_change_1h_percent: 10329.282535675666,
  price_change_2h_percent: 5.071721637277095,
  price_change_4h_percent: 191.31763738155615,
  price_change_8h_percent: 191.31763738155615,
  price_change_24h_percent: 191.31763738155615,
  holder: 7,
  recent_listing_time: 1746532642,
};

const dexScreenerPair = {
  chainId: "solana",
  dexId: "raydium",
  url: "https://dexscreener.com/solana/8slbnzoa1cfnvmjlpfp98zlanfsycfapfjkmbixnlwxj",
  pairAddress: "8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj",
  labels: ["CLMM"],
  baseToken: {
    address: "So11111111111111111111111111111111111111112",
    name: "Wrapped SOL",
    symbol: "SOL",
  },
  quoteToken: {
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    name: "USD Coin",
    symbol: "USDC",
  },
  priceNative: "148.5008",
  priceUsd: "148.50",
  txns: {
    m5: {
      buys: 169,
      sells: 113,
    },
    h1: {
      buys: 3758,
      sells: 4129,
    },
    h6: {
      buys: 13208,
      sells: 14210,
    },
    h24: {
      buys: 58123,
      sells: 62996,
    },
  },
  volume: {
    h24: 37814626.06,
    h6: 8239517.72,
    h1: 2418307.14,
    m5: 99380.75,
  },
  priceChange: {
    m5: 0.05,
    h1: 0.8,
    h6: 1.71,
    h24: 0.03,
  },
  liquidity: {
    usd: 4142863.25,
    base: 23745,
    quote: 616573,
  },
  pairCreatedAt: 1723699294000,
  fdv: 4116.91,
  marketCap: 4116.91,
};

const dexTrending = {
  url: "https://dexscreener.com/solana/13szjhynmy9uxe8c2twnx1yaxgu8vqisbkzgvjavpmgf",
  chainId: "solana",
  tokenAddress: "13szJhynmy9uXe8C2TWNX1yaxGu8vQiSBkzgVJAvPMGF",
  icon: "https://dd.dexscreener.com/ds-data/tokens/solana/13szJhynmy9uXe8C2TWNX1yaxGu8vQiSBkzgVJAvPMGF.png",
  header:
    "https://dd.dexscreener.com/ds-data/tokens/solana/13szJhynmy9uXe8C2TWNX1yaxGu8vQiSBkzgVJAvPMGF/header.png",
  openGraph:
    "https://cdn.dexscreener.com/token-images/og/solana/13szJhynmy9uXe8C2TWNX1yaxGu8vQiSBkzgVJAvPMGF?timestamp=1746684000000",
  description:
    "Dive into the hilarious and community-driven world of $SHARTFA. We're all about the memes, the laughs, and the journey to the moon (and beyond!).\n\nExpect witty banter, fart-themed emojis, and a community that doesn't take itself too seriously. #SHARTFA #ToTheMoon\n\nEarn rewards in $SHART by purchasing $SHARTFA, and the infinite loop will be there.\n\n13szJhynmy9uXe8C2TWNX1yaxGu8vQiSBkzgVJAvPMGF",
  links: [
    {
      label: "Website",
      url: "https://apvuprqt.manus.space/",
    },
    {
      label: "HOLDERS",
      url: "https://solscan.io/token/13szJhynmy9uXe8C2TWNX1yaxGu8vQiSBkzgVJAvPMGF#holders",
    },
    {
      type: "twitter",
      url: "https://x.com/SHART__FART",
    },
    {
      type: "telegram",
      url: "https://t.me/shartfacommunity",
    },
  ],
};

export type BirdEyeNewListing = typeof newListing;
export type BirdEyeTopTokens = typeof topToken;
export type DexscreenerPair = typeof dexScreenerPair;
export type DexTrending = typeof dexTrending;
export type DexTrendingType = DexTrending & {
  dex: DexscreenerPair;
};

export type DexBirdeye = BirdEyeNewListing & {
  dex: DexscreenerPair;
};
