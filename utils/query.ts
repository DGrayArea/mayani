import { QueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "@/lib/appwrite";

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

export async function fetchTrending(): Promise<any | null> {
  try {
    const response = await axios.get(`${config.apiEndpoint}/trending`);

    return response.data;
  } catch (error) {
    console.log(error);
    return { eth: [], sol: [] };
  }
}

export const fetchPumpShots = async (): Promise<any> => {
  try {
    const response = await axios.get(`${config.apiEndpoint}/new`);

    return response.data;
  } catch (error) {
    console.log(error);
    return { eth: [], sol: [] };
  }
};
