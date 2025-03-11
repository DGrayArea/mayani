import { JUPITER_API_URL, ONE_INCH_API_URL } from "@/config";
import axios from "axios";

const buyToken = async (
  tokenIn: string,
  amount: number,
  tokenOut: string,
  chain: "eth" | "sol",
  decimals: number,
  fee: number
) => {
  if (chain === "eth") {
    // 1inch API for Ethereum
    const url = `${ONE_INCH_API_URL}/1/swap?fromTokenAddress=${tokenOut}&toTokenAddress=${tokenIn}&amount=${amount * 10 ** decimals}&fromAddress=YOUR_WALLET_ADDRESS&slippage=1&fee=${fee}`;
    const response = await axios.get(url);
    return response.data;
  } else if (chain === "sol") {
    // Jupiter API for Solana
    const url = `${JUPITER_API_URL}/quote?inputMint=${tokenOut}&outputMint=${tokenIn}&amount=${amount * 10 ** decimals}&slippage=1&fee=${fee}`;
    const response = await axios.get(url);
    return response.data;
  }
};

const sellToken = async (
  tokenIn: string,
  amount: number,
  tokenOut: string,
  chain: "eth" | "sol",
  decimals: number,
  fee: number
) => {
  if (chain === "eth") {
    // 1inch API for Ethereum
    const url = `${ONE_INCH_API_URL}/1/swap?fromTokenAddress=${tokenIn}&toTokenAddress=${tokenOut}&amount=${amount * 10 ** decimals}&fromAddress=YOUR_WALLET_ADDRESS&slippage=1&fee=${fee}`;
    const response = await axios.get(url);
    return response.data;
  } else if (chain === "sol") {
    // Jupiter API for Solana
    const url = `${JUPITER_API_URL}/quote?inputMint=${tokenIn}&outputMint=${tokenOut}&amount=${amount * 10 ** decimals}&slippage=1&fee=${fee}`;
    const response = await axios.get(url);
    return response.data;
  }
};

export { buyToken, sellToken };
