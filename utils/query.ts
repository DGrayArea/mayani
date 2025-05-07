import { QueryClient, DefaultOptions } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { config } from "@/lib/appwrite";
import { Platform } from "react-native";
import { BirdEyeNewListing, BirdEyeTopTokens, TrendingToken2 } from "@/types";

// Define response types
export interface TrendingToken extends TrendingToken2 {}

export interface APIResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Configure default query options
const defaultQueryOptions: DefaultOptions = {
  queries: {
    retry: (failureCount, error) => {
      const err = error as AxiosError;
      // Don't retry on 4xx errors
      if (
        err.response?.status &&
        err.response.status >= 400 &&
        err.response.status < 500
      ) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: Platform.OS === "web",
    refetchOnReconnect: true,
  },
  mutations: {
    retry: false,
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  },
};

export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});

// API request function with error handling
async function apiRequest<T>(url: string): Promise<T> {
  try {
    const response = await axios.get<T>(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `API Error (${url}):`,
        error.response?.data || error.message
      );

      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error("Authentication required. Please log in.");
      } else if (error.response?.status === 404) {
        throw new Error("Resource not found.");
      } else if (error.response?.status && error.response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      }
    }

    // Re-throw the error to be handled by React Query
    throw error;
  }
}

async function tokenRequest(): Promise<any> {
  try {
    const response = await axios.get(
      "https://api.dexscreener.com/token-profiles/latest/v1"
    );

    const response2 = await axios.get(`${config.apiEndpoint}newly-created`);
    return [response.data, response2.data];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`API Error (:`, error);
    }

    // Re-throw the error to be handled by React Query
    throw error;
  }
}

export async function fetchTrending(): Promise<{ data: BirdEyeTopTokens[] }> {
  return apiRequest<{ data: BirdEyeTopTokens[] }>(`${config.apiEndpoint}top`);
}

export async function fetchNew(): Promise<{ data: BirdEyeNewListing[] }> {
  return apiRequest<{ data: BirdEyeNewListing[] }>(
    `${config.apiEndpoint}newly-created`
  );
}

export const fetchPumpShots = async () => {
  return apiRequest<{ data: any[] }>(`${config.apiEndpoint}new`);
};

export async function fetchTokenDetails(
  tokenId: string,
  chain: "SOL" | "ETH"
): Promise<{ data: TrendingToken2 }> {
  return apiRequest<{ data: TrendingToken2 }>(
    `${config.apiEndpoint}/token/${chain.toLowerCase()}/${tokenId}`
  );
}

export async function fetchMarketData(
  timeframe: "24h" | "7d" | "30d" = "24h"
): Promise<APIResponse<any>> {
  return apiRequest<APIResponse<any>>(
    `${config.apiEndpoint}market?timeframe=${timeframe}`
  );
}

// Cache invalidation helper
export const invalidateQueries = (queryKey: string | string[]) => {
  const key = Array.isArray(queryKey) ? queryKey : [queryKey];
  return queryClient.invalidateQueries({ queryKey: key });
};

// Prefetch helper
export const prefetchQuery = async (
  queryKey: string | string[],
  queryFn: () => Promise<any>
) => {
  const key = Array.isArray(queryKey) ? queryKey : [queryKey];
  await queryClient.prefetchQuery({
    queryKey: key,
    queryFn,
  });
};
