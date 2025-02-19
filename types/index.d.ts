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
