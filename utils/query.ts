import { QueryClient } from "@tanstack/react-query";
import movies from "@/assets/movies.json";
import axios from "axios";

interface Trendingtoken {
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

export async function fetchTrending(): Promise<Trendingtoken[] | null> {
  try {
    // Latest Boosted
    const response = await axios.get(
      `https://api.dexscreener.com/token-boosts/latest/v1`
    );

    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function fetchActiceTrend(): Promise<Trendingtoken[] | null> {
  try {
    // Most Active
    const response = await axios.get(
      `https://api.dexscreener.com/token-boosts/top/v1`
    );

    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function fetchProfiles(): Promise<Trendingtoken[] | null> {
  try {
    // Most Active
    const response = await axios.get(
      `https://api.dexscreener.com/token-profiles/latest/v1`
    );

    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}
