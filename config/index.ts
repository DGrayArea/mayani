export const ONE_INCH_API_URL = "https://api.1inch.io/v4.0";
export const JUPITER_API_URL = "https://quote-api.jup.ag/v1";
export const exchangeProxyAbi = [
  {
    inputs: [
      { internalType: "address", name: "bootstrapper", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { stateMutability: "payable", type: "fallback" },
  {
    inputs: [{ internalType: "bytes4", name: "selector", type: "bytes4" }],
    name: "getFunctionImplementation",
    outputs: [{ internalType: "address", name: "impl", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];
