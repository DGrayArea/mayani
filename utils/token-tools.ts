import { ethTokens } from "../config/eth";
import { solTokens } from "../config/sol";
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import axios from "axios";
import { chunk, keyBy } from "lodash";

export const useTokenLists = (currentChain) => {
  const [ethjsonList, setEthJsonList] = useState([]);
  const [soljsonList, setSolJsonList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenList = async () => {
      try {
        setLoading(true);
        //@ts-expect-error expect
        setEthJsonList(ethTokens);
        //@ts-expect-error expect
        setSolJsonList(solTokens);
      } catch (error) {
        console.error("Error loading token list:", error);
        //@ts-ignore
        Alert.alert("Error", "Failed to fetch token list.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenList();
  }, [currentChain]);

  return { ethjsonList, soljsonList, loading };
};

// Constants
const CHAIN_ID = "solana";
const MAX_TOKENS_PER_REQUEST = 30;
const MAX_REQUESTS_PER_MINUTE = 300;
const REQUEST_INTERVAL_MS = 200; // ~5 req/sec = 300/minute

// Main function

export const fetchDexData = async (
  tokens: { address: string }[]
): Promise<Record<string, any>> => {
  const chunks = chunk(tokens, 30); // Dexscreener allows 30 addresses per request
  const results: any[] = [];

  for (const group of chunks) {
    const addresses = group.map((t) => t.tokenAddress).join(",");
    try {
      const { data } = await axios.get(
        `https://api.dexscreener.com/tokens/v1/solana/${addresses}`
      );

      // Collect all returned pairs, ensuring each pair is typed correctly
      if (data) {
        results.push(...data); // Assuming 'data' is the array of pairs
      }
    } catch (error) {
      console.error("Dex fetch error:", error);
    }

    // Optional: delay here if you're worried about rate limits
    await new Promise((r) => setTimeout(r, 250)); // 4 requests/sec = 240/min
  }

  // Return as a record (map by pair address)
  return keyBy(results, (pair) => pair.pairAddress); // Ensure 'pairAddress' is the key
};

export const fetchDexDataMain = async (
  tokens: { address: string }[]
): Promise<Record<string, any>> => {
  const chunks = chunk(tokens, 30); // Dexscreener allows 30 addresses per request
  const results: any[] = [];

  for (const group of chunks) {
    const addresses = group.map((t) => t.address).join(",");
    try {
      const { data } = await axios.get(
        `https://api.dexscreener.com/tokens/v1/solana/${addresses}`
      );

      // Collect all returned pairs, ensuring each pair is typed correctly
      if (data) {
        results.push(...data); // Assuming 'data' is the array of pairs
      }
    } catch (error) {
      console.error("Dex fetch error:", error);
    }

    // Optional: delay here if you're worried about rate limits
    await new Promise((r) => setTimeout(r, 250)); // 4 requests/sec = 240/min
  }
  // Return as a record (map by pair address)
  return keyBy(results, (pair) => pair.pairAddress); // Ensure 'pairAddress' is the key
};
